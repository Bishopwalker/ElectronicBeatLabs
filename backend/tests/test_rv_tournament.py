"""
Unit tests for RV Tournament Service

Tests the 12-hour cycle system with quantum entanglement at 3:33 mark.
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch, AsyncMock
from services.rv_tournament import (
    RVTournamentService,
    TournamentCycle,
    ENTANGLEMENT_OFFSET_SECONDS
)


class TestTournamentCycle:
    """Tests for TournamentCycle class."""

    def test_cycle_initialization(self):
        """Test cycle is initialized with correct times."""
        start_time = datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)
        cycle = TournamentCycle(start_time)

        assert cycle.start_time == start_time
        assert cycle.end_time == start_time + timedelta(hours=12)
        assert cycle.entanglement_time == start_time + timedelta(seconds=ENTANGLEMENT_OFFSET_SECONDS)
        assert cycle.cycle_id == "2024-01-15_00"

    def test_cycle_id_format(self):
        """Test cycle ID is correctly formatted."""
        # Midnight cycle
        midnight = datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)
        cycle1 = TournamentCycle(midnight)
        assert cycle1.cycle_id == "2024-01-15_00"

        # Noon cycle
        noon = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
        cycle2 = TournamentCycle(noon)
        assert cycle2.cycle_id == "2024-01-15_12"

    def test_entanglement_time_calculation(self):
        """Test entanglement time is exactly 3:33 after start."""
        start_time = datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)
        cycle = TournamentCycle(start_time)

        expected_entanglement = datetime(2024, 1, 15, 3, 33, 0, tzinfo=timezone.utc)
        assert cycle.entanglement_time == expected_entanglement

    def test_get_phase_pre_entanglement(self):
        """Test phase detection before entanglement."""
        start_time = datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)
        cycle = TournamentCycle(start_time)

        # 1 hour into cycle (before entanglement at 3:33)
        current = datetime(2024, 1, 15, 1, 0, 0, tzinfo=timezone.utc)
        assert cycle.get_phase(current) == "pre_entanglement"

    def test_get_phase_post_entanglement(self):
        """Test phase detection after entanglement but before reveal."""
        start_time = datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)
        cycle = TournamentCycle(start_time)

        # 6 hours into cycle (after entanglement, before reveal)
        current = datetime(2024, 1, 15, 6, 0, 0, tzinfo=timezone.utc)
        assert cycle.get_phase(current) == "post_entanglement"

    def test_get_phase_revealed(self):
        """Test phase detection after cycle end."""
        start_time = datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)
        cycle = TournamentCycle(start_time)

        # After 12 hours (cycle ended)
        current = datetime(2024, 1, 15, 13, 0, 0, tzinfo=timezone.utc)
        assert cycle.get_phase(current) == "revealed"

    def test_get_phase_future(self):
        """Test phase detection for future cycles."""
        start_time = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
        cycle = TournamentCycle(start_time)

        # Before cycle starts
        current = datetime(2024, 1, 15, 10, 0, 0, tzinfo=timezone.utc)
        assert cycle.get_phase(current) == "future"


class TestRVTournamentService:
    """Tests for RVTournamentService."""

    @pytest.fixture
    def service(self):
        """Create tournament service instance."""
        return RVTournamentService()

    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        return Mock()

    def test_get_current_cycle_midnight(self, service):
        """Test getting current cycle during midnight cycle (00:00-12:00)."""
        current_time = datetime(2024, 1, 15, 5, 30, 0, tzinfo=timezone.utc)
        cycle = service.get_current_cycle(current_time)

        assert cycle.cycle_id == "2024-01-15_00"
        assert cycle.start_time.hour == 0

    def test_get_current_cycle_noon(self, service):
        """Test getting current cycle during noon cycle (12:00-00:00)."""
        current_time = datetime(2024, 1, 15, 18, 45, 0, tzinfo=timezone.utc)
        cycle = service.get_current_cycle(current_time)

        assert cycle.cycle_id == "2024-01-15_12"
        assert cycle.start_time.hour == 12

    def test_get_cycle_by_id(self, service):
        """Test retrieving a specific cycle by ID."""
        cycle = service.get_cycle_by_id("2024-01-15_00")

        assert cycle.cycle_id == "2024-01-15_00"
        assert cycle.start_time == datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)

    def test_get_cycle_by_id_invalid_hour(self, service):
        """Test error when cycle ID has invalid hour."""
        with pytest.raises(ValueError, match="Invalid cycle hour"):
            service.get_cycle_by_id("2024-01-15_06")

    def test_validate_target_number_valid(self, service):
        """Test valid target number formatting."""
        # With hyphen
        result = service._validate_target_number("1234-5678")
        assert result == "1234-5678"

        # Without hyphen
        result = service._validate_target_number("12345678")
        assert result == "1234-5678"

        # With spaces
        result = service._validate_target_number("  1234-5678  ")
        assert result == "1234-5678"

    def test_validate_target_number_invalid_length(self, service):
        """Test error for invalid number length."""
        with pytest.raises(ValueError, match="must be 8 digits"):
            service._validate_target_number("123-456")

    def test_validate_target_number_invalid_characters(self, service):
        """Test error for non-digit characters."""
        with pytest.raises(ValueError, match="must contain only digits"):
            service._validate_target_number("12AB-5678")

    @pytest.mark.asyncio
    async def test_generate_tournament_target_at_entanglement(self, service, mock_db):
        """Test target generation at entanglement time."""
        cycle_id = "2024-01-15_00"

        # Mock database query to return no existing target
        mock_db.query.return_value.filter.return_value.first.return_value = None

        # Mock quantum oracle
        mock_quantum_result = {
            "target_number": "47298153",
            "raw_quantum_values": [12345, 23456, 34567, 45678, 56789, 67890, 78901, 89012],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "ANU_QRNG"
        }

        with patch("services.rv_tournament.quantum_oracle.generate_rv_target_number",
                   new_callable=AsyncMock, return_value=mock_quantum_result):

            result = await service.generate_tournament_target(
                mock_db,
                cycle_id,
                force=True  # Force generation for testing
            )

            assert result["target_number"] == "4729-8153"
            assert result["cycle_id"] == cycle_id
            assert result["status"] == "materialized"

    @pytest.mark.asyncio
    async def test_generate_tournament_target_duplicate(self, service, mock_db):
        """Test that duplicate targets are not created."""
        cycle_id = "2024-01-15_00"

        # Mock existing target
        mock_existing = Mock()
        mock_existing.target_number = "1234-5678"
        mock_existing.cycle_id = cycle_id
        mock_existing.entanglement_timestamp = datetime.now(timezone.utc)
        mock_existing.raw_quantum_values = "[1,2,3,4,5,6,7,8]"

        mock_db.query.return_value.filter.return_value.first.return_value = mock_existing

        result = await service.generate_tournament_target(mock_db, cycle_id)

        assert result["status"] == "already_exists"
        assert result["target_number"] == "1234-5678"

    @pytest.mark.asyncio
    async def test_submit_prediction_pre_entanglement(self, service, mock_db):
        """Test submitting prediction before entanglement."""
        cycle_id = "2024-01-15_00"
        user_id = "test_user"
        predicted = "1234-5678"

        # Mock no existing prediction
        mock_db.query.return_value.filter.return_value.first.return_value = None

        # Set current time to pre-entanglement phase
        current_time = datetime(2024, 1, 15, 2, 0, 0, tzinfo=timezone.utc)  # 2:00 AM

        with patch("services.rv_tournament.datetime") as mock_datetime:
            mock_datetime.now.return_value = current_time
            mock_datetime.side_effect = lambda *args, **kw: datetime(*args, **kw)

            result = await service.submit_prediction(
                mock_db,
                user_id,
                predicted,
                cycle_id=cycle_id
            )

            assert result["predicted_number"] == predicted
            assert result["is_pre_entanglement"] == True
            assert result["phase"] == "pre_entanglement"

    @pytest.mark.asyncio
    async def test_submit_prediction_duplicate(self, service, mock_db):
        """Test error when submitting duplicate prediction."""
        cycle_id = "2024-01-15_00"
        user_id = "test_user"

        # Mock existing prediction
        mock_existing = Mock()
        mock_existing.predicted_number = "9999-9999"

        mock_db.query.return_value.filter.return_value.first.return_value = mock_existing

        with pytest.raises(ValueError, match="already submitted"):
            await service.submit_prediction(
                mock_db,
                user_id,
                "1234-5678",
                cycle_id=cycle_id
            )

    def test_check_user_prediction_accuracy(self, service, mock_db):
        """Test checking prediction accuracy."""
        from database.models import RVTournamentPrediction, RVTournamentTarget

        cycle_id = "2024-01-15_00"
        user_id = "test_user"

        # Mock prediction
        mock_prediction = Mock(spec=RVTournamentPrediction)
        mock_prediction.id = "pred_123"
        mock_prediction.predicted_number = "1234-5678"
        mock_prediction.is_pre_entanglement = True
        mock_prediction.submitted_at = datetime.now(timezone.utc)
        mock_prediction.is_scored = False

        # Mock target
        mock_target = Mock(spec=RVTournamentTarget)
        mock_target.target_number = "1234-9999"  # 4 digits match
        mock_target.cycle_id = cycle_id

        # Setup query mocks
        def mock_query_side_effect(model):
            mock_query = Mock()
            if model == RVTournamentPrediction:
                mock_query.filter.return_value.first.return_value = mock_prediction
            elif model == RVTournamentTarget:
                mock_query.filter.return_value.first.return_value = mock_target
            return mock_query

        mock_db.query.side_effect = mock_query_side_effect

        # Mock cycle to be in revealed phase
        with patch.object(service, 'get_cycle_by_id') as mock_get_cycle:
            mock_cycle = Mock()
            mock_cycle.get_phase.return_value = "revealed"
            mock_get_cycle.return_value = mock_cycle

            result = service.check_user_prediction(mock_db, user_id, cycle_id)

            assert result["predicted_number"] == "1234-5678"
            assert result["actual_number"] == "1234-9999"
            assert result["correct_digits"] == 4
            assert result["is_correct"] == False
            assert result["accuracy_percent"] == 50.0

    def test_check_user_prediction_not_revealed(self, service, mock_db):
        """Test error when checking prediction before reveal."""
        cycle_id = "2024-01-15_00"
        user_id = "test_user"

        with patch.object(service, 'get_cycle_by_id') as mock_get_cycle:
            mock_cycle = Mock()
            mock_cycle.get_phase.return_value = "post_entanglement"
            mock_get_cycle.return_value = mock_cycle

            with pytest.raises(ValueError, match="Cannot check prediction until cycle is revealed"):
                service.check_user_prediction(mock_db, user_id, cycle_id)

    def test_get_leaderboard_all_time(self, service, mock_db):
        """Test getting all-time leaderboard."""
        # Mock query results
        mock_results = [
            Mock(
                user_identifier="user1",
                total_predictions=10,
                total_points=850,
                avg_accuracy=6.5,
                exact_matches=2
            ),
            Mock(
                user_identifier="user2",
                total_predictions=8,
                total_points=720,
                avg_accuracy=6.0,
                exact_matches=1
            )
        ]

        mock_query = Mock()
        mock_query.filter.return_value.group_by.return_value.order_by.return_value.limit.return_value.all.return_value = mock_results
        mock_db.query.return_value = mock_query

        result = service.get_leaderboard(mock_db, time_period="all_time", limit=100)

        assert result["time_period"] == "all_time"
        assert result["total_users"] == 2
        assert len(result["rankings"]) == 2

        # Check first place
        assert result["rankings"][0]["rank"] == 1
        assert result["rankings"][0]["user_identifier"] == "user1"
        assert result["rankings"][0]["total_points"] == 850

    def test_get_user_stats(self, service, mock_db):
        """Test getting user statistics."""
        from database.models import RVTournamentPrediction

        user_id = "test_user"

        # Mock predictions
        mock_predictions = [
            Mock(
                is_scored=True,
                points_awarded=150,
                correct_digits=7,
                is_correct=False,
                is_pre_entanglement=True,
                cycle_id="2024-01-15_00",
                predicted_number="1234-5678"
            ),
            Mock(
                is_scored=True,
                points_awarded=200,
                correct_digits=8,
                is_correct=True,
                is_pre_entanglement=False,
                cycle_id="2024-01-15_12",
                predicted_number="9999-9999"
            )
        ]

        mock_db.query.return_value.filter.return_value.all.return_value = mock_predictions

        result = service.get_user_stats(mock_db, user_id)

        assert result["total_predictions"] == 2
        assert result["scored_predictions"] == 2
        assert result["total_points"] == 350
        assert result["exact_matches"] == 1
        assert result["average_accuracy_percent"] == 93.75  # (7+8)/(2*8)*100

    def test_get_user_stats_no_predictions(self, service, mock_db):
        """Test getting stats for user with no predictions."""
        user_id = "new_user"

        mock_db.query.return_value.filter.return_value.all.return_value = []

        result = service.get_user_stats(mock_db, user_id)

        assert result["total_predictions"] == 0
        assert "message" in result

    def test_get_cycle_results(self, service, mock_db):
        """Test getting complete cycle results."""
        from database.models import RVTournamentPrediction, RVTournamentTarget

        cycle_id = "2024-01-15_00"

        # Mock target
        mock_target = Mock(spec=RVTournamentTarget)
        mock_target.target_number = "1234-5678"
        mock_target.cycle_id = cycle_id
        mock_target.entanglement_timestamp = datetime(2024, 1, 15, 3, 33, 0, tzinfo=timezone.utc)

        # Mock predictions
        mock_predictions = [
            Mock(
                user_identifier="user1",
                predicted_number="1234-5678",
                correct_digits=8,
                is_correct=True,
                points_awarded=200,
                is_pre_entanglement=True,
                submitted_at=datetime(2024, 1, 15, 1, 0, 0, tzinfo=timezone.utc)
            )
        ]

        # Setup query mocks
        def mock_query_side_effect(model):
            mock_query = Mock()
            if model == RVTournamentTarget:
                mock_query.filter.return_value.first.return_value = mock_target
            elif model == RVTournamentPrediction:
                mock_query.filter.return_value.order_by.return_value.all.return_value = mock_predictions
            return mock_query

        mock_db.query.side_effect = mock_query_side_effect

        # Mock cycle in revealed phase
        with patch.object(service, 'get_cycle_by_id') as mock_get_cycle:
            mock_cycle = Mock()
            mock_cycle.get_phase.return_value = "revealed"
            mock_cycle.start_time = datetime(2024, 1, 15, 0, 0, 0, tzinfo=timezone.utc)
            mock_cycle.end_time = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
            mock_get_cycle.return_value = mock_cycle

            result = service.get_cycle_results(mock_db, cycle_id)

            assert result["cycle_id"] == cycle_id
            assert result["target_number"] == "1234-5678"
            assert result["total_predictions"] == 1
            assert result["exact_matches"] == 1
            assert result["average_accuracy_percent"] == 100.0
