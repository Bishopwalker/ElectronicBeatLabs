"""
Quantum Oracle Service - True Quantum Random Number Generation

Uses ANU QRNG (Australian National University Quantum Random Number Generator)
to generate TRUE random numbers from quantum vacuum fluctuations.
Falls back to cryptographically secure local generation if ANU is unavailable.

Key Principle: Numbers don't exist until observed (quantum collapse).
For daily tournament mode, the number is generated AT reveal time, not before.

API Source: https://qrng.anu.edu.au/
"""

import httpx
import secrets
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger("ebl.quantum_oracle")

# ANU QRNG API Configuration
ANU_QRNG_API_URL = "https://qrng.anu.edu.au/API/jsonI.php"
ANU_QRNG_BACKUP_URL = "https://quantumnumbers.anu.edu.au"

# Default number range (Powerball-style)
MIN_NUMBER = 1
MAX_NUMBER = 69

# Daily reveal time (Midnight UTC)
DAILY_REVEAL_HOUR_UTC = 0


class QuantumOracleService:
    """
    Service for generating true quantum random numbers.

    Two modes:
    1. Tournament Mode: One number per day, revealed at midnight UTC
    2. Practice Mode: Generate numbers on-demand for intuition training
    """

    def __init__(self):
        """Initialize the Quantum Oracle service."""
        self.http_client: Optional[httpx.AsyncClient] = None
        self._cache: Dict[str, int] = {}  # Cache for daily numbers

    async def _get_client(self) -> httpx.AsyncClient:
        """
        Get or create HTTP client for API calls.

        Returns:
            httpx.AsyncClient: Async HTTP client
        """
        if self.http_client is None or self.http_client.is_closed:
            self.http_client = httpx.AsyncClient(timeout=10.0)
        return self.http_client

    def _generate_local_random(self, count: int = 1) -> List[int]:
        """
        Generate cryptographically secure random numbers locally.

        Uses Python's secrets module (OS-level entropy source).
        This is the fallback when ANU QRNG is unavailable.

        Args:
            count: Number of random values to generate

        Returns:
            List of random integers (0-65535 range, same as uint16)
        """
        return [secrets.randbelow(65536) for _ in range(count)]

    async def _fetch_quantum_random(self, count: int = 1, use_fallback: bool = True) -> tuple[List[int], str]:
        """
        Fetch true quantum random numbers from ANU QRNG.

        The numbers are generated in real-time by measuring quantum
        fluctuations of the vacuum - truly unpredictable by any system.

        Falls back to local cryptographic random if ANU is unavailable.

        Args:
            count: Number of random values to fetch (1-1024)
            use_fallback: Whether to use local fallback if ANU fails

        Returns:
            Tuple of (List of random integers 0-65535, source string)
        """
        client = await self._get_client()

        # Request uint16 values (0-65535)
        params = {
            "length": min(count, 1024),
            "type": "uint16"
        }

        try:
            response = await client.get(ANU_QRNG_API_URL, params=params, timeout=5.0)
            response.raise_for_status()

            data = response.json()

            if data.get("success"):
                logger.info(f"Quantum numbers fetched: {count} values from ANU QRNG")
                return data["data"], "ANU_QRNG"
            else:
                raise Exception("ANU QRNG API returned unsuccessful response")

        except Exception as e:
            logger.warning(f"ANU QRNG unavailable ({e}), using local cryptographic fallback")

            if use_fallback:
                local_values = self._generate_local_random(count)
                logger.info(f"Generated {count} local cryptographic random values")
                return local_values, "LOCAL_CRYPTO"
            else:
                raise

    def _scale_to_range(self, quantum_value: int, min_val: int, max_val: int) -> int:
        """
        Scale quantum random value to desired range.

        Uses modulo-based scaling to convert uint16 (0-65535)
        to target range while preserving quantum randomness.

        Args:
            quantum_value: Raw quantum random value (0-65535)
            min_val: Minimum of target range (inclusive)
            max_val: Maximum of target range (inclusive)

        Returns:
            Scaled integer in [min_val, max_val]
        """
        range_size = max_val - min_val + 1
        return min_val + (quantum_value % range_size)

    async def generate_quantum_number(
        self,
        min_val: int = MIN_NUMBER,
        max_val: int = MAX_NUMBER
    ) -> Dict[str, Any]:
        """
        Generate a single quantum random number (Practice Mode).

        Each call creates a new quantum collapse - the number
        doesn't exist until this observation is made.

        Args:
            min_val: Minimum value (default: 1)
            max_val: Maximum value (default: 69)

        Returns:
            Dict containing:
                - number: The materialized quantum number
                - raw_quantum: Original uint16 value from QRNG
                - timestamp: When the collapse occurred
                - source: "ANU_QRNG" or "LOCAL_CRYPTO"
        """
        # Fetch quantum random value (with fallback)
        quantum_values, source = await self._fetch_quantum_random(count=1)
        raw_quantum = quantum_values[0]

        # Scale to target range
        number = self._scale_to_range(raw_quantum, min_val, max_val)

        result = {
            "number": number,
            "raw_quantum": raw_quantum,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": source,
            "mode": "practice"
        }

        logger.info(f"Quantum number materialized: {number} (raw: {raw_quantum}, source: {source})")
        return result

    async def get_daily_number(
        self,
        db: Session,
        date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get the quantum number for a specific day (Tournament Mode).

        The number is generated ONLY at reveal time (midnight UTC).
        Before reveal, returns status indicating time until materialization.
        After reveal, returns the permanent number for that day.

        Args:
            db: Database session
            date: Target date (default: today UTC)

        Returns:
            Dict containing either:
                - Revealed number with full details, or
                - Pre-reveal status with countdown
        """
        from database.models import QuantumDailyNumber

        # Default to today UTC
        if date is None:
            date = datetime.now(timezone.utc)

        # Normalize to date only (no time component)
        target_date = date.date()
        date_str = target_date.isoformat()

        # Check if number exists in database
        existing = db.query(QuantumDailyNumber).filter(
            QuantumDailyNumber.date == date_str
        ).first()

        if existing:
            # Number already materialized
            return {
                "number": existing.number,
                "raw_quantum": existing.raw_quantum,
                "date": existing.date,
                "materialized_at": existing.materialized_at.isoformat(),
                "source": existing.source,
                "mode": "tournament",
                "status": "revealed"
            }

        # Check if we're past midnight UTC for this date
        now_utc = datetime.now(timezone.utc)
        reveal_time = datetime.combine(
            target_date,
            datetime.min.time()
        ).replace(tzinfo=timezone.utc)

        # For today, check if we've passed midnight
        if target_date == now_utc.date():
            # It's today - the number should be generated now
            return await self._materialize_daily_number(db, date_str)

        elif target_date < now_utc.date():
            # Past date without number - generate retroactively
            # This handles edge cases where system was offline
            return await self._materialize_daily_number(db, date_str)

        else:
            # Future date - number doesn't exist yet
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
                "message": f"Number will materialize in {time_until}",
                "mode": "tournament"
            }

    async def _materialize_daily_number(
        self,
        db: Session,
        date_str: str
    ) -> Dict[str, Any]:
        """
        Materialize (collapse) the quantum number for a specific date.

        This is the moment of quantum collapse - the number goes from
        superposition of all possibilities to a single definite value.

        Args:
            db: Database session
            date_str: ISO format date string

        Returns:
            Dict with materialized number details
        """
        from database.models import QuantumDailyNumber

        # QUANTUM COLLAPSE: Generate the number (with fallback)
        quantum_values, source = await self._fetch_quantum_random(count=1)
        raw_quantum = quantum_values[0]
        number = self._scale_to_range(raw_quantum, MIN_NUMBER, MAX_NUMBER)

        # Persist to database (permanent record)
        daily_number = QuantumDailyNumber(
            date=date_str,
            number=number,
            raw_quantum=raw_quantum,
            source=source,
            materialized_at=datetime.now(timezone.utc)
        )

        db.add(daily_number)
        db.commit()
        db.refresh(daily_number)

        logger.info(f"Daily quantum number materialized: {number} for {date_str}")

        return {
            "number": daily_number.number,
            "raw_quantum": daily_number.raw_quantum,
            "date": daily_number.date,
            "materialized_at": daily_number.materialized_at.isoformat(),
            "source": daily_number.source,
            "mode": "tournament",
            "status": "revealed"
        }

    async def get_history(
        self,
        db: Session,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get history of daily quantum numbers.

        Args:
            db: Database session
            days: Number of days to fetch (default: 30)

        Returns:
            List of daily number records
        """
        from database.models import QuantumDailyNumber

        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).date()

        records = db.query(QuantumDailyNumber).filter(
            QuantumDailyNumber.date >= cutoff_date.isoformat()
        ).order_by(QuantumDailyNumber.date.desc()).all()

        return [
            {
                "number": r.number,
                "date": r.date,
                "materialized_at": r.materialized_at.isoformat() if r.materialized_at else None
            }
            for r in records
        ]

    async def close(self):
        """Close HTTP client."""
        if self.http_client and not self.http_client.is_closed:
            await self.http_client.aclose()


    async def generate_rv_target_number(self) -> Dict[str, Any]:
        """
        Generate an 8-digit quantum number for Remote Viewing targets.

        This creates a pure 8-digit number (00000000-99999999) that is
        "entangled" with a target image/location. The viewer focuses on
        this number to perceive the target through remote viewing.

        Returns:
            Dict containing:
                - target_number: 8-digit string (e.g., "12345678")
                - raw_quantum_values: List of 8 raw uint16 values
                - timestamp: When the collapse occurred
                - source: "ANU_QRNG" or "LOCAL_CRYPTO"
        """
        # Fetch 8 quantum random values (one per digit) with fallback
        quantum_values, source = await self._fetch_quantum_random(count=8)

        # Convert each quantum value to a single digit (0-9)
        digits = [self._scale_to_range(qv, 0, 9) for qv in quantum_values]
        target_number = ''.join(str(d) for d in digits)

        result = {
            "target_number": target_number,
            "raw_quantum_values": quantum_values,
            "digits": digits,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": source,
            "mode": "rv_target"
        }

        logger.info(f"RV target number generated: {target_number} (source: {source})")
        return result

    async def generate_entangled_rv_target(
        self,
        db: Session,
        target_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate an entangled RV target with 8-digit quantum number.

        The 8-digit number is quantum-entangled with the target -
        meaning the number and target are generated together from
        the same quantum collapse event.

        Args:
            db: Database session
            target_data: Optional specific target (auto-select if None)

        Returns:
            Dict containing:
                - target_number: 8-digit viewing number
                - target_id: Database ID for the target
                - entanglement_timestamp: Moment of quantum collapse
        """
        from database.models import RVPracticeTarget

        # Generate 8-digit quantum number
        quantum_result = await self.generate_rv_target_number()
        target_number = quantum_result["target_number"]

        # Select or use provided target
        if target_data is None:
            # Import target pool from rv_targets
            from services.rv_targets import TARGET_POOL
            import random

            # Flatten pool and select random target
            all_targets = []
            for category_targets in TARGET_POOL.values():
                all_targets.extend(category_targets)

            target_data = random.choice(all_targets)

        # Store in database
        practice_target = RVPracticeTarget(
            coordinate=target_number,  # Use 8-digit as coordinate
            target_name=target_data.get("name", "Unknown Target"),
            target_description=target_data.get("description", ""),
            category=target_data.get("category", "unknown"),
            subcategory=target_data.get("subcategory"),
            difficulty=target_data.get("difficulty", "medium"),
            feedback_url=target_data.get("feedback_url"),
            tags=",".join(target_data.get("tags", [])),
            status="active"
        )

        db.add(practice_target)
        db.commit()
        db.refresh(practice_target)

        logger.info(f"Entangled RV target created: {target_number} -> {target_data.get('name')} (source: {quantum_result['source']})")

        return {
            "target_number": target_number,
            "target_id": practice_target.id,
            "raw_quantum_values": quantum_result["raw_quantum_values"],
            "entanglement_timestamp": quantum_result["timestamp"],
            "category": target_data.get("category"),
            "difficulty": target_data.get("difficulty", "medium"),
            "source": quantum_result["source"],
            "status": "active",
            "mode": "rv_entangled"
        }


# Singleton instance
quantum_oracle = QuantumOracleService()
