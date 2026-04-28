"""
Remote Viewing Target Service - Double-Blind Target Management

Implements proper remote viewing protocols:
- Double-blind target generation (no one knows the target until reveal)
- Alphanumeric coordinate IDs (e.g., "8A3F-9B2C")
- Target pools with categories (locations, objects, events)
- Daily targets (tournament mode) + practice targets
- Viewer impression submission and feedback management

Key Principle: The target coordinate is just a random ID - it doesn't
encode any information about the target. True double-blind protocol.

References:
- CIA Remote Viewing Program (Star Gate)
- Controlled Remote Viewing (CRV) methodology
- Coordinate Remote Viewing protocols
"""

import secrets
import string
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

logger = logging.getLogger("ebl.rv_targets")

# Target coordinate format: "XXXX-YYYY" (8 alphanumeric characters)
COORDINATE_LENGTH = 8
COORDINATE_FORMAT = "XXXX-YYYY"

# Daily reveal time (Midnight UTC - same as quantum oracle)
DAILY_REVEAL_HOUR_UTC = 0

# Target categories based on RV research
TARGET_CATEGORIES = {
    "locations": [
        "Natural landmarks",
        "Historical sites",
        "Urban locations",
        "Geographic features",
        "Remote wilderness"
    ],
    "structures": [
        "Ancient monuments",
        "Modern buildings",
        "Bridges and infrastructure",
        "Religious sites",
        "Archaeological sites"
    ],
    "objects": [
        "Art pieces",
        "Historical artifacts",
        "Technology",
        "Natural objects",
        "Symbolic items"
    ],
    "events": [
        "Historical moments",
        "Natural phenomena",
        "Human activities",
        "Astronomical events",
        "Cultural ceremonies"
    ],
    "concepts": [
        "Abstract ideas",
        "Emotional states",
        "Future scenarios",
        "Hypothetical situations",
        "Symbolic representations"
    ]
}

# Pre-defined target pool for practice and daily targets
# In production, this would come from a curated database
TARGET_POOL = {
    "locations": [
        {
            "name": "Machu Picchu",
            "description": "Ancient Incan city in the Peruvian Andes",
            "category": "locations",
            "subcategory": "Historical sites",
            "difficulty": "medium",
            "feedback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/1280px-Machu_Picchu%2C_Peru.jpg",
            "tags": ["ancient", "mountains", "ruins", "stone structures"]
        },
        {
            "name": "Great Barrier Reef",
            "description": "World's largest coral reef system off Queensland, Australia",
            "category": "locations",
            "subcategory": "Natural landmarks",
            "difficulty": "easy",
            "feedback_url": "https://example.com/gbr.jpg",
            "tags": ["ocean", "coral", "underwater", "colorful", "living"]
        },
        {
            "name": "Stonehenge",
            "description": "Prehistoric monument in Wiltshire, England",
            "category": "structures",
            "subcategory": "Ancient monuments",
            "difficulty": "medium",
            "feedback_url": "https://example.com/stonehenge.jpg",
            "tags": ["stones", "circle", "ancient", "mystery", "megalithic"]
        },
        {
            "name": "Golden Gate Bridge",
            "description": "Iconic suspension bridge in San Francisco",
            "category": "structures",
            "subcategory": "Bridges and infrastructure",
            "difficulty": "easy",
            "feedback_url": "https://example.com/ggb.jpg",
            "tags": ["red", "bridge", "suspension", "water", "modern"]
        },
        {
            "name": "Mount Everest Summit",
            "description": "Highest point on Earth at 8,849 meters",
            "category": "locations",
            "subcategory": "Geographic features",
            "difficulty": "hard",
            "feedback_url": "https://example.com/everest.jpg",
            "tags": ["mountain", "snow", "peak", "extreme", "cold"]
        }
    ],
    "objects": [
        {
            "name": "The Mona Lisa",
            "description": "Leonardo da Vinci's famous portrait painting",
            "category": "objects",
            "subcategory": "Art pieces",
            "difficulty": "easy",
            "feedback_url": "https://example.com/monalisa.jpg",
            "tags": ["painting", "portrait", "woman", "smile", "renaissance"]
        },
        {
            "name": "Space Shuttle",
            "description": "NASA's reusable orbital spacecraft",
            "category": "objects",
            "subcategory": "Technology",
            "difficulty": "medium",
            "feedback_url": "https://example.com/shuttle.jpg",
            "tags": ["spacecraft", "white", "wings", "rocket", "space"]
        }
    ],
    "events": [
        {
            "name": "Moon Landing 1969",
            "description": "Apollo 11 astronauts first steps on the Moon",
            "category": "events",
            "subcategory": "Historical moments",
            "difficulty": "medium",
            "feedback_url": "https://example.com/moonlanding.jpg",
            "tags": ["space", "astronaut", "moon", "flag", "historic"]
        },
        {
            "name": "Aurora Borealis",
            "description": "Natural light display in polar regions",
            "category": "events",
            "subcategory": "Natural phenomena",
            "difficulty": "easy",
            "feedback_url": "https://example.com/aurora.jpg",
            "tags": ["lights", "green", "sky", "dancing", "night"]
        }
    ]
}


class RVTargetService:
    """
    Service for Remote Viewing target management.

    Implements proper double-blind protocols:
    1. Target coordinates are randomly generated (no info encoded)
    2. Target selection is random from pool
    3. Target details revealed only after viewer submission
    4. Daily targets materialize at reveal time (like quantum oracle)
    """

    def __init__(self):
        """Initialize the RV Target service."""
        self._target_pool = TARGET_POOL

    def _generate_coordinate(self) -> str:
        """
        Generate random alphanumeric target coordinate.

        Format: "XXXX-YYYY" (e.g., "8A3F-9B2C")
        Uses cryptographically secure random generation.

        Returns:
            String coordinate in format XXXX-YYYY
        """
        # Generate 8 random alphanumeric characters (uppercase)
        chars = string.ascii_uppercase + string.digits
        part1 = ''.join(secrets.choice(chars) for _ in range(4))
        part2 = ''.join(secrets.choice(chars) for _ in range(4))

        coordinate = f"{part1}-{part2}"
        logger.debug(f"Generated target coordinate: {coordinate}")
        return coordinate

    def _select_random_target(self, category: Optional[str] = None) -> Dict[str, Any]:
        """
        Select a random target from the pool.

        Args:
            category: Optional category filter (locations, objects, events)

        Returns:
            Dict containing target details
        """
        import random

        # Filter by category if specified
        if category and category in self._target_pool:
            pool = self._target_pool[category]
        else:
            # Combine all categories
            pool = []
            for cat_targets in self._target_pool.values():
                pool.extend(cat_targets)

        if not pool:
            raise ValueError("Target pool is empty")

        # Select random target
        target = random.choice(pool)
        logger.info(f"Selected target: {target['name']} (category: {target['category']})")
        return target

    async def create_practice_target(
        self,
        db: Session,
        user_identifier: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new practice target (on-demand).

        Practice targets are generated immediately for intuition training.
        Each request creates a new target-coordinate pair.

        Args:
            db: Database session
            user_identifier: Optional user/session identifier
            category: Optional target category filter

        Returns:
            Dict containing coordinate and creation info (NOT target details)
        """
        from database.models import RVPracticeTarget

        # Generate coordinate
        coordinate = self._generate_coordinate()

        # Select random target
        target_data = self._select_random_target(category)

        # Store in database
        practice_target = RVPracticeTarget(
            coordinate=coordinate,
            target_name=target_data["name"],
            target_description=target_data["description"],
            category=target_data["category"],
            subcategory=target_data.get("subcategory"),
            difficulty=target_data.get("difficulty", "medium"),
            feedback_url=target_data.get("feedback_url"),
            tags=",".join(target_data.get("tags", [])),
            user_identifier=user_identifier,
            status="active"  # Not yet revealed
        )

        db.add(practice_target)
        db.commit()
        db.refresh(practice_target)

        logger.info(f"Practice target created: {coordinate} for user: {user_identifier}")

        # Return ONLY coordinate - maintain double-blind
        return {
            "coordinate": coordinate,
            "target_id": practice_target.id,
            "category": target_data["category"],
            "difficulty": target_data.get("difficulty", "medium"),
            "created_at": practice_target.created_at.isoformat(),
            "status": "active",
            "mode": "practice",
            "message": "Target coordinate generated. Begin your remote viewing session."
        }

    async def get_daily_target(
        self,
        db: Session,
        date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get the remote viewing target for a specific day (Tournament Mode).

        Similar to quantum oracle, the target materializes at reveal time.
        Before reveal: Returns coordinate only
        After reveal: Returns full target details

        Args:
            db: Database session
            date: Target date (default: today UTC)

        Returns:
            Dict containing either coordinate (pre-reveal) or full target (post-reveal)
        """
        from database.models import RVDailyTarget

        # Default to today UTC
        if date is None:
            date = datetime.now(timezone.utc)

        # Normalize to date only
        target_date = date.date()
        date_str = target_date.isoformat()

        # Check if target exists
        existing = db.query(RVDailyTarget).filter(
            RVDailyTarget.date == date_str
        ).first()

        if existing:
            # Target already exists
            return self._format_daily_target_response(existing)

        # Check if we should generate the target
        now_utc = datetime.now(timezone.utc)

        if target_date == now_utc.date():
            # It's today - generate the target
            return await self._materialize_daily_target(db, date_str)
        elif target_date < now_utc.date():
            # Past date - generate retroactively
            return await self._materialize_daily_target(db, date_str)
        else:
            # Future date - return pending status
            next_reveal = datetime.combine(
                target_date,
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)

            time_until = next_reveal - now_utc

            return {
                "status": "pending",
                "date": date_str,
                "reveal_time": next_reveal.isoformat(),
                "seconds_until_reveal": int(time_until.total_seconds()),
                "message": f"Daily target will be available in {time_until}",
                "mode": "tournament"
            }

    async def _materialize_daily_target(
        self,
        db: Session,
        date_str: str
    ) -> Dict[str, Any]:
        """
        Materialize (create) the daily target for a specific date.

        This creates the target-coordinate pair for the day.

        Args:
            db: Database session
            date_str: ISO format date string

        Returns:
            Dict with target coordinate and details
        """
        from database.models import RVDailyTarget

        # Generate coordinate
        coordinate = self._generate_coordinate()

        # Select random target (no category filter for daily targets)
        target_data = self._select_random_target()

        # Store in database
        daily_target = RVDailyTarget(
            date=date_str,
            coordinate=coordinate,
            target_name=target_data["name"],
            target_description=target_data["description"],
            category=target_data["category"],
            subcategory=target_data.get("subcategory"),
            difficulty=target_data.get("difficulty", "medium"),
            feedback_url=target_data.get("feedback_url"),
            tags=",".join(target_data.get("tags", [])),
            status="active",
            materialized_at=datetime.now(timezone.utc)
        )

        db.add(daily_target)
        db.commit()
        db.refresh(daily_target)

        logger.info(f"Daily target materialized: {coordinate} for {date_str}")

        return self._format_daily_target_response(daily_target)

    def _format_daily_target_response(self, target) -> Dict[str, Any]:
        """
        Format daily target for API response.

        Args:
            target: RVDailyTarget database object

        Returns:
            Dict with formatted target data
        """
        return {
            "coordinate": target.coordinate,
            "target_id": target.id,
            "date": target.date,
            "category": target.category,
            "difficulty": target.difficulty,
            "materialized_at": target.materialized_at.isoformat() if target.materialized_at else None,
            "status": target.status,
            "mode": "tournament",
            "message": "Daily target available. Begin your remote viewing session."
        }

    async def submit_impression(
        self,
        db: Session,
        target_id: str,
        impression_data: Dict[str, Any],
        mode: str = "practice"
    ) -> Dict[str, Any]:
        """
        Submit a remote viewing impression for a target.

        Args:
            db: Database session
            target_id: Target ID
            impression_data: Viewer's impression (sketches, notes, descriptors)
            mode: "practice" or "tournament"

        Returns:
            Dict with submission confirmation (no feedback yet)
        """
        from database.models import RVImpression, RVPracticeTarget, RVDailyTarget

        # Validate target exists and is active
        if mode == "practice":
            target = db.query(RVPracticeTarget).filter(
                RVPracticeTarget.id == target_id
            ).first()
        else:
            target = db.query(RVDailyTarget).filter(
                RVDailyTarget.id == target_id
            ).first()

        if not target:
            raise ValueError(f"Target not found: {target_id}")

        if target.status == "revealed":
            raise ValueError("Cannot submit impression after viewing feedback")

        # Store impression
        impression = RVImpression(
            target_id=target_id,
            mode=mode,
            descriptors=impression_data.get("descriptors", ""),
            sketches_data=impression_data.get("sketches", ""),
            notes=impression_data.get("notes", ""),
            confidence=impression_data.get("confidence", 0.5),
            session_duration_minutes=impression_data.get("duration_minutes", 0)
        )

        db.add(impression)
        db.commit()
        db.refresh(impression)

        logger.info(f"Impression submitted for target {target_id} (mode: {mode})")

        return {
            "status": "submitted",
            "impression_id": impression.id,
            "target_id": target_id,
            "coordinate": target.coordinate,
            "submitted_at": impression.created_at.isoformat(),
            "message": "Impression recorded. Request feedback to see target details."
        }

    async def get_feedback(
        self,
        db: Session,
        target_id: str,
        mode: str = "practice"
    ) -> Dict[str, Any]:
        """
        Reveal the target feedback (after impression submission).

        This breaks the double-blind - viewer can now see the actual target.

        Args:
            db: Database session
            target_id: Target ID
            mode: "practice" or "tournament"

        Returns:
            Dict with full target details and feedback
        """
        from database.models import RVPracticeTarget, RVDailyTarget, RVImpression

        # Get target
        if mode == "practice":
            target = db.query(RVPracticeTarget).filter(
                RVPracticeTarget.id == target_id
            ).first()
        else:
            target = db.query(RVDailyTarget).filter(
                RVDailyTarget.id == target_id
            ).first()

        if not target:
            raise ValueError(f"Target not found: {target_id}")

        # Check if impression was submitted
        impression = db.query(RVImpression).filter(
            RVImpression.target_id == target_id
        ).first()

        if not impression:
            return {
                "error": "Must submit impression before viewing feedback",
                "status": "locked",
                "message": "Double-blind protocol requires impression submission first"
            }

        # Update target status to revealed
        target.status = "revealed"
        target.revealed_at = datetime.now(timezone.utc)
        db.commit()

        # Return full target details
        tags = target.tags.split(",") if target.tags else []

        logger.info(f"Feedback revealed for target {target_id}")

        return {
            "status": "revealed",
            "target_id": target_id,
            "coordinate": target.coordinate,
            "target": {
                "name": target.target_name,
                "description": target.target_description,
                "category": target.category,
                "subcategory": target.subcategory,
                "tags": tags,
                "feedback_url": target.feedback_url
            },
            "your_impression": {
                "descriptors": impression.descriptors,
                "notes": impression.notes,
                "confidence": impression.confidence,
                "submitted_at": impression.created_at.isoformat()
            },
            "revealed_at": target.revealed_at.isoformat() if target.revealed_at else None,
            "message": "Target feedback revealed. Compare with your impression."
        }

    async def get_history(
        self,
        db: Session,
        mode: str = "practice",
        user_identifier: Optional[str] = None,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get history of remote viewing targets.

        Args:
            db: Database session
            mode: "practice" or "tournament"
            user_identifier: Optional user filter (practice mode only)
            days: Number of days to fetch

        Returns:
            List of target records
        """
        from database.models import RVPracticeTarget, RVDailyTarget

        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).date()

        if mode == "practice":
            query = db.query(RVPracticeTarget)
            if user_identifier:
                query = query.filter(RVPracticeTarget.user_identifier == user_identifier)
            records = query.filter(
                func.date(RVPracticeTarget.created_at) >= cutoff_date
            ).order_by(RVPracticeTarget.created_at.desc()).all()
        else:
            records = db.query(RVDailyTarget).filter(
                RVDailyTarget.date >= cutoff_date.isoformat()
            ).order_by(RVDailyTarget.date.desc()).all()

        return [
            {
                "target_id": r.id,
                "coordinate": r.coordinate,
                "category": r.category,
                "status": r.status,
                "created_at": r.created_at.isoformat() if hasattr(r, 'created_at') else None,
                "date": r.date if hasattr(r, 'date') else None
            }
            for r in records
        ]

    def get_categories(self) -> Dict[str, List[str]]:
        """
        Get available target categories.

        Returns:
            Dict of categories and their subcategories
        """
        return TARGET_CATEGORIES


# Singleton instance
rv_target_service = RVTargetService()
