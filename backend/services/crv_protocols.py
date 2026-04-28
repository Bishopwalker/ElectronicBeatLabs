"""
CRV (Controlled Remote Viewing) Protocols Service

Implements the 6-stage CRV methodology developed by Ingo Swann at Stanford
Research Institute. Provides stage definitions, progression tracking, and
optimal binaural frequency recommendations for each stage.

Research Sources:
- Ingo Swann's CRV methodology (Stanford Research Institute)
- Coordinate Remote Viewing training manual
- Optimal brainwave states for remote viewing (Theta 4-8Hz)

Key Principle: CRV is a structured progression through increasingly detailed
levels of information gathering, from major gestalts to 3D modeling.
"""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import logging

logger = logging.getLogger("ebl.crv_protocols")


# ============================================================================
# CRV Stage Definitions
# ============================================================================

class CRVStage(int, Enum):
    """CRV Stage numbers."""
    STAGE_1 = 1
    STAGE_2 = 2
    STAGE_3 = 3
    STAGE_4 = 4
    STAGE_5 = 5
    STAGE_6 = 6


class CRVStageDefinition(BaseModel):
    """
    Definition of a single CRV stage.

    Includes:
    - Stage metadata (name, description, purpose)
    - Data collection guidelines
    - Recommended time limits
    - Binaural frequency recommendations
    """
    stage_number: int = Field(..., ge=1, le=6)
    name: str
    description: str
    purpose: str
    data_types: List[str]  # What type of data to collect
    guidelines: List[str]  # Instructions for viewer
    recommended_duration_minutes: int
    max_duration_minutes: Optional[int] = None

    # Binaural frequency recommendations
    recommended_base_frequency: float  # Hz
    recommended_beat_frequency: float  # Hz
    brainwave_target: str  # "theta", "alpha", "delta", etc.

    # Progression
    can_skip: bool = False  # Can this stage be skipped?
    requires_previous: bool = True  # Must complete previous stage first?


# ============================================================================
# Stage Definitions Based on Ingo Swann's CRV Protocol
# ============================================================================

STAGE_DEFINITIONS: Dict[int, CRVStageDefinition] = {
    1: CRVStageDefinition(
        stage_number=1,
        name="Initial Contact / Major Gestalts",
        description="Brief glimpse of the target's basic nature - first impressions and major gestalts.",
        purpose="Establish initial signal line contact and identify primary target characteristics.",
        data_types=[
            "ideogram",
            "gestalt_impression",
            "land_water_structure",
            "basic_nature"
        ],
        guidelines=[
            "Draw rapid ideogram without thinking",
            "Note first immediate impression (land, water, structure, energy)",
            "Record initial feelings about target's basic nature",
            "Don't analyze - just record first contact data",
            "Move quickly to Stage 2 after initial gestalt"
        ],
        recommended_duration_minutes=2,
        max_duration_minutes=5,
        recommended_base_frequency=140.0,  # 140 Hz carrier
        recommended_beat_frequency=6.0,    # 6 Hz theta (mid-theta for intuition)
        brainwave_target="theta",
        can_skip=False,
        requires_previous=False
    ),

    2: CRVStageDefinition(
        stage_number=2,
        name="Sensory Data Collection",
        description="Gather sensory impressions - colors, textures, sounds, smells, tastes, temperature.",
        purpose="Collect detailed sensory data as if physically present at the target site.",
        data_types=[
            "colors",
            "textures",
            "sounds",
            "smells",
            "tastes",
            "temperature",
            "energetics"
        ],
        guidelines=[
            "Record all five physical senses: sight, sound, smell, taste, touch",
            "Note temperature (hot/cold) and environmental ambiance",
            "Describe textures (smooth, rough, wet, dry, etc.)",
            "Record colors and qualities of light",
            "Note any energetics (magnetic, electrical, radioactive)",
            "Data comes in clusters - group by gestalt",
            "Move to Stage 3 as dimensional data emerges"
        ],
        recommended_duration_minutes=5,
        max_duration_minutes=15,
        recommended_base_frequency=140.0,
        recommended_beat_frequency=7.0,    # 7 Hz theta (upper theta for sensory clarity)
        brainwave_target="theta",
        can_skip=False,
        requires_previous=True
    ),

    3: CRVStageDefinition(
        stage_number=3,
        name="Dimensional Analysis",
        description="Perceive dimensions, shapes, and spatial characteristics of target.",
        purpose="Develop awareness of physical dimensions and spatial relationships.",
        data_types=[
            "height",
            "width",
            "depth",
            "shape",
            "volume",
            "mass",
            "spatial_relationships",
            "sketches"
        ],
        guidelines=[
            "Perceive height, width, depth of target elements",
            "Note shapes and volumes",
            "Describe mass and density",
            "Sketch target elements (even if not an artist)",
            "Record spatial relationships between elements",
            "Many sessions end here with sufficient data",
            "Proceed to Stage 4 only if deeper details needed"
        ],
        recommended_duration_minutes=10,
        max_duration_minutes=20,
        recommended_base_frequency=140.0,
        recommended_beat_frequency=7.83,   # 7.83 Hz (Schumann resonance - alpha/theta bridge)
        brainwave_target="alpha-theta",
        can_skip=False,
        requires_previous=True
    ),

    4: CRVStageDefinition(
        stage_number=4,
        name="Conceptual & Emotional Data",
        description="Access emotional impact, aesthetic qualities, and conceptual understanding.",
        purpose="Perceive abstract concepts, emotions, and complex meanings of the target.",
        data_types=[
            "emotional_impact",
            "aesthetic_qualities",
            "concepts",
            "purpose",
            "historical_context",
            "cultural_significance",
            "function"
        ],
        guidelines=[
            "Note emotional impressions (foreign, familiar, peaceful, chaotic)",
            "Describe aesthetic qualities (beautiful, stark, ornate, simple)",
            "Record conceptual data (tourist attraction, research facility, natural, man-made)",
            "Perceive purpose and function of target",
            "Note any historical or cultural impressions",
            "Stage 4 handles conceptually complex targets",
            "Use for sites requiring deeper understanding (crime scenes, facilities, etc.)"
        ],
        recommended_duration_minutes=15,
        max_duration_minutes=30,
        recommended_base_frequency=140.0,
        recommended_beat_frequency=8.0,    # 8 Hz alpha (lower alpha for conceptual access)
        brainwave_target="alpha",
        can_skip=True,
        requires_previous=True
    ),

    5: CRVStageDefinition(
        stage_number=5,
        name="Interrogation / Off-Signal Analysis",
        description="Deep interrogation of accumulated data - mining subconscious impressions.",
        purpose="Retrieve and analyze impressions already deposited in subconscious from earlier stages.",
        data_types=[
            "interrogation_responses",
            "subconscious_data",
            "associations",
            "connections",
            "refined_understanding"
        ],
        guidelines=[
            "This is OFF-SIGNAL mode - not processing new psychic data",
            "Mine accumulated impressions from subconscious",
            "Ask questions about earlier stage data",
            "Explore connections between elements",
            "Refine and deepen understanding",
            "Retrieve impressions already deposited but not yet accessed",
            "Integrate data from all previous stages"
        ],
        recommended_duration_minutes=15,
        max_duration_minutes=30,
        recommended_base_frequency=140.0,
        recommended_beat_frequency=6.0,    # 6 Hz theta (deep theta for subconscious access)
        brainwave_target="theta",
        can_skip=True,
        requires_previous=True
    ),

    6: CRVStageDefinition(
        stage_number=6,
        name="3D Modeling / Detailed Construction",
        description="Create three-dimensional model or detailed sketch of target.",
        purpose="Synthesize all data into comprehensive 3D representation of target.",
        data_types=[
            "3d_model_description",
            "detailed_sketch",
            "spatial_construction",
            "integrated_synthesis",
            "final_impressions"
        ],
        guidelines=[
            "Most impressive and interesting stage",
            "Create 3D model using clay, blocks, or other materials",
            "Combine conceptual access with dimensional accuracy",
            "Integrate all data from previous stages",
            "Build comprehensive understanding of target",
            "Similar to 'mashed potato scene' in Close Encounters",
            "Final synthesis of entire viewing session"
        ],
        recommended_duration_minutes=20,
        max_duration_minutes=45,
        recommended_base_frequency=140.0,
        recommended_beat_frequency=10.0,   # 10 Hz alpha (mid-alpha for focused construction)
        brainwave_target="alpha",
        can_skip=True,
        requires_previous=True
    )
}


# ============================================================================
# Frequency Protocol Recommendations
# ============================================================================

class FrequencyProtocol(BaseModel):
    """Binaural frequency protocol for RV/CRV sessions."""
    name: str
    description: str
    base_frequency: float
    beat_frequency: float
    brainwave_state: str
    use_cases: List[str]


FREQUENCY_PROTOCOLS: Dict[str, FrequencyProtocol] = {
    "deep_theta": FrequencyProtocol(
        name="Deep Theta",
        description="Deep theta state for intuition and subconscious access (4-6 Hz).",
        base_frequency=140.0,
        beat_frequency=5.0,
        brainwave_state="theta",
        use_cases=[
            "Stage 1 (initial contact)",
            "Stage 5 (subconscious interrogation)",
            "Deep intuitive access",
            "Subconscious mind exploration"
        ]
    ),
    "mid_theta": FrequencyProtocol(
        name="Mid Theta",
        description="Mid-range theta for sensory clarity and visualization (6-8 Hz).",
        base_frequency=140.0,
        beat_frequency=7.0,
        brainwave_state="theta",
        use_cases=[
            "Stage 2 (sensory data)",
            "Stage 3 (dimensional data)",
            "Visual recall",
            "Creativity and imagery"
        ]
    ),
    "alpha_theta_bridge": FrequencyProtocol(
        name="Alpha-Theta Bridge",
        description="Schumann resonance frequency for non-linear visionary images (7.83 Hz).",
        base_frequency=140.0,
        beat_frequency=7.83,
        brainwave_state="alpha-theta",
        use_cases=[
            "Stage 3 (dimensional analysis)",
            "Hemispheric synchronization",
            "Vivid visual imagery",
            "Hypnagogic states"
        ]
    ),
    "low_alpha": FrequencyProtocol(
        name="Low Alpha",
        description="Lower alpha range for conceptual understanding (8-10 Hz).",
        base_frequency=140.0,
        beat_frequency=8.0,
        brainwave_state="alpha",
        use_cases=[
            "Stage 4 (conceptual data)",
            "Abstract thinking",
            "Pattern recognition",
            "Conceptual integration"
        ]
    ),
    "mid_alpha": FrequencyProtocol(
        name="Mid Alpha",
        description="Mid-range alpha for focused construction and synthesis (10-12 Hz).",
        base_frequency=140.0,
        beat_frequency=10.0,
        brainwave_state="alpha",
        use_cases=[
            "Stage 6 (3D modeling)",
            "Focused attention",
            "Creative synthesis",
            "Detailed construction"
        ]
    )
}


# ============================================================================
# CRV Protocol Service
# ============================================================================

class CRVProtocolService:
    """
    Service for managing CRV stage protocols and sessions.

    Provides:
    - Stage definitions and metadata
    - Stage progression logic
    - Frequency recommendations
    - Session guidance
    """

    def __init__(self):
        """Initialize CRV protocol service."""
        self.stage_definitions = STAGE_DEFINITIONS
        self.frequency_protocols = FREQUENCY_PROTOCOLS

    def get_all_stages(self) -> List[Dict[str, Any]]:
        """
        Get all CRV stage definitions.

        Returns:
            List of stage definition dictionaries
        """
        return [stage.model_dump() for stage in self.stage_definitions.values()]

    def get_stage(self, stage_number: int) -> Optional[CRVStageDefinition]:
        """
        Get definition for specific stage.

        Args:
            stage_number: Stage number (1-6)

        Returns:
            Stage definition or None if invalid
        """
        return self.stage_definitions.get(stage_number)

    def get_next_stage(self, current_stage: int) -> Optional[int]:
        """
        Get next stage number.

        Args:
            current_stage: Current stage number

        Returns:
            Next stage number or None if at final stage
        """
        if current_stage >= 6:
            return None
        return current_stage + 1

    def can_progress_to_stage(
        self,
        target_stage: int,
        completed_stages: List[int]
    ) -> tuple[bool, Optional[str]]:
        """
        Check if viewer can progress to target stage.

        Args:
            target_stage: Stage to progress to
            completed_stages: List of completed stage numbers

        Returns:
            Tuple of (can_progress: bool, reason: Optional[str])
        """
        # Check if stage exists
        if target_stage not in self.stage_definitions:
            return False, f"Invalid stage number: {target_stage}"

        stage_def = self.stage_definitions[target_stage]

        # Check if stage can be skipped
        if not stage_def.requires_previous:
            return True, None

        # Check if previous stage is completed
        if target_stage > 1:
            previous_stage = target_stage - 1
            if previous_stage not in completed_stages:
                return False, f"Must complete Stage {previous_stage} first"

        return True, None

    def get_frequency_recommendation(self, stage_number: int) -> Dict[str, Any]:
        """
        Get binaural frequency recommendation for stage.

        Args:
            stage_number: Stage number (1-6)

        Returns:
            Dictionary with frequency parameters
        """
        stage = self.get_stage(stage_number)

        if not stage:
            # Default to mid-theta if stage not found
            return {
                "base_frequency": 140.0,
                "beat_frequency": 7.0,
                "brainwave_target": "theta",
                "description": "Default mid-theta protocol"
            }

        return {
            "base_frequency": stage.recommended_base_frequency,
            "beat_frequency": stage.recommended_beat_frequency,
            "brainwave_target": stage.brainwave_target,
            "description": f"Optimal frequency for {stage.name}"
        }

    def get_all_frequency_protocols(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all available frequency protocols.

        Returns:
            Dictionary of protocol name -> protocol data
        """
        return {
            name: protocol.model_dump()
            for name, protocol in self.frequency_protocols.items()
        }

    def get_stage_guidance(self, stage_number: int) -> Dict[str, Any]:
        """
        Get comprehensive guidance for a stage.

        Args:
            stage_number: Stage number (1-6)

        Returns:
            Dictionary with stage guidance, instructions, and frequencies
        """
        stage = self.get_stage(stage_number)

        if not stage:
            return {
                "error": f"Invalid stage number: {stage_number}",
                "valid_stages": [1, 2, 3, 4, 5, 6]
            }

        freq_rec = self.get_frequency_recommendation(stage_number)

        return {
            "stage": stage.model_dump(),
            "frequency_recommendation": freq_rec,
            "next_stage": self.get_next_stage(stage_number),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def validate_stage_data(
        self,
        stage_number: int,
        data: Dict[str, Any]
    ) -> tuple[bool, Optional[str]]:
        """
        Validate that submitted data is appropriate for stage.

        Args:
            stage_number: Stage number
            data: Data submitted by viewer

        Returns:
            Tuple of (is_valid: bool, error_message: Optional[str])
        """
        stage = self.get_stage(stage_number)

        if not stage:
            return False, f"Invalid stage number: {stage_number}"

        # Check if data is present
        if not data:
            return False, "Stage data cannot be empty"

        # Basic validation - ensure at least one data type is present
        expected_types = stage.data_types
        has_relevant_data = any(
            key in data for key in expected_types
        )

        if not has_relevant_data:
            return False, f"Data must include at least one of: {', '.join(expected_types)}"

        return True, None


# Singleton instance
crv_protocol_service = CRVProtocolService()
