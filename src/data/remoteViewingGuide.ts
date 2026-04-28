/**
 * Remote Viewing Guide Content
 * Comprehensive documentation for RV, CRV, ARV, and Quantum Oracle features
 */

// ============ RV SESSIONS GUIDE ============

export interface RVSessionGuide {
  id: string;
  title: string;
  description: string;
  protocol: string;
  steps: string[];
  tips: string[];
  scientificBasis: string;
  frequencyRecommendation: {
    beatFrequency: number;
    brainState: string;
    rationale: string;
  };
}

export const RV_SESSIONS_GUIDE: RVSessionGuide = {
  id: 'rv-sessions',
  title: 'Remote Viewing Sessions',
  description: 'Double-blind protocol for practicing remote viewing with hidden targets. The system generates random coordinates linked to images you cannot see until after submitting your impressions.',
  protocol: 'Double-Blind Target Practice',
  steps: [
    'Click "Start Session" to receive a random target coordinate',
    'Focus on the coordinate - let impressions come naturally without forcing',
    'Record your primary impression (shapes, colors, textures, feelings)',
    'Add secondary details (movements, temperatures, sounds, spatial relationships)',
    'Set your confidence level based on how clear your impressions were',
    'Submit your impressions to reveal the actual target',
    'Review your score and compare impressions to the revealed target',
    'Track your progress in History and Stats tabs'
  ],
  tips: [
    'Don\'t try to guess what the target is - just describe what you perceive',
    'First impressions are often most accurate - don\'t second-guess yourself',
    'Use descriptive words rather than naming objects (e.g., "tall, vertical, rough texture" not "tree")',
    'Practice regularly - RV is a skill that improves with consistent training',
    'Keep a journal of your sessions to identify patterns in your perception',
    'Avoid analytical overlay (AOL) - set aside logical assumptions'
  ],
  scientificBasis: 'Remote viewing research originated at Stanford Research Institute (SRI) in the 1970s under the STARGATE program. Studies by Puthoff, Targ, and others demonstrated statistically significant results in controlled experiments. The protocol uses blind conditions to eliminate sensory leakage and confirmation bias. Modern research continues at institutions like IONS (Institute of Noetic Sciences).',
  frequencyRecommendation: {
    beatFrequency: 7.83,
    brainState: 'Theta-Alpha Border (Schumann Resonance)',
    rationale: 'The 7.83Hz Schumann resonance frequency promotes a relaxed, receptive state ideal for intuitive perception. This frequency bridges conscious awareness (alpha) with subconscious access (theta), facilitating the subtle information transfer theorized in RV.'
  }
};

// ============ CRV STAGES GUIDE ============

export interface CRVStageGuide {
  stage: number;
  name: string;
  objective: string;
  description: string;
  techniques: string[];
  whatToRecord: string[];
  commonMistakes: string[];
  frequencyRecommendation: {
    beatFrequency: number;
    brainState: string;
    rationale: string;
  };
  duration: string;
}

export const CRV_STAGES_GUIDE: CRVStageGuide[] = [
  {
    stage: 1,
    name: 'Ideogram',
    objective: 'Establish initial contact with the target through spontaneous ideograms',
    description: 'Stage 1 captures the first subconscious response to the target coordinate. You produce a quick, spontaneous mark (ideogram) that represents the basic gestalt of the target. This bypasses analytical thinking and accesses direct perception.',
    techniques: [
      'Write the coordinate, then immediately make a spontaneous pen stroke',
      'Don\'t think - let your hand move automatically',
      'Decode the ideogram into basic descriptors (A = motion, B = feeling, C = dimension, D = sound)',
      'Record the primary gestalt: land, water, structure, life form, energy, etc.'
    ],
    whatToRecord: [
      'The spontaneous ideogram stroke',
      'A component: Motion/movement quality',
      'B component: Sensory/feeling impression',
      'C component: Dimensional aspects',
      'D component: Sounds or AOL (Analytical Overlay)',
      'Primary gestalt category'
    ],
    commonMistakes: [
      'Thinking before making the ideogram',
      'Trying to draw something recognizable',
      'Spending too long on the stroke',
      'Ignoring weak or unclear impressions'
    ],
    frequencyRecommendation: {
      beatFrequency: 10,
      brainState: 'Alpha',
      rationale: 'Alpha waves promote relaxed alertness needed for spontaneous ideogram production without analytical interference.'
    },
    duration: '2-5 minutes'
  },
  {
    stage: 2,
    name: 'Sensory',
    objective: 'Expand sensory contact with detailed perceptions',
    description: 'Stage 2 develops the initial contact by systematically exploring sensory impressions. You probe for colors, textures, temperatures, sounds, smells, tastes, and dimensional data. This builds a richer perceptual foundation.',
    techniques: [
      'Use probing cues: "I am perceiving colors..." "I am perceiving textures..."',
      'Record ALL impressions, even if they seem contradictory',
      'Work quickly - don\'t analyze or try to make sense of data',
      'Declare AOL breaks when analytical thoughts intrude'
    ],
    whatToRecord: [
      'Colors (specific shades and qualities)',
      'Textures (rough, smooth, grainy, etc.)',
      'Temperatures (hot, cold, ambient)',
      'Sounds (natural, mechanical, voices)',
      'Smells and tastes if perceived',
      'Dimensional impressions (tall, wide, enclosed)',
      'Energetic qualities (active, calm, chaotic)'
    ],
    commonMistakes: [
      'Filtering impressions that don\'t "make sense"',
      'Not declaring AOL when analytical thoughts occur',
      'Trying to build a picture instead of just perceiving',
      'Rushing through without thorough probing'
    ],
    frequencyRecommendation: {
      beatFrequency: 8,
      brainState: 'Low Alpha',
      rationale: 'Low alpha supports detailed sensory awareness while maintaining the receptive state needed for accurate perception.'
    },
    duration: '5-10 minutes'
  },
  {
    stage: 3,
    name: 'Dimensional',
    objective: 'Sketch and map spatial relationships',
    description: 'Stage 3 focuses on the physical structure and spatial layout of the target. You create sketches showing shapes, positions, and dimensional relationships. This anchors perceptions in spatial reality.',
    techniques: [
      'Let your hand draw spontaneously - don\'t try to create art',
      'Sketch from different perspectives (overhead, side view)',
      'Note relative positions and distances',
      'Label dimensions (height, width, depth estimates)',
      'Connect sketches to Stage 2 sensory data'
    ],
    whatToRecord: [
      'Spontaneous sketches of shapes and forms',
      'Overhead/map view of layout',
      'Side elevation views',
      'Relative sizes and distances',
      'Spatial relationships between elements',
      'Movement patterns if applicable'
    ],
    commonMistakes: [
      'Trying to draw accurately instead of spontaneously',
      'Not labeling sketches with descriptors',
      'Ignoring the urge to sketch something',
      'Over-analyzing spatial data'
    ],
    frequencyRecommendation: {
      beatFrequency: 7,
      brainState: 'Theta-Alpha Border',
      rationale: 'The theta-alpha border facilitates visual-spatial processing while maintaining intuitive connection to the target.'
    },
    duration: '5-10 minutes'
  },
  {
    stage: 4,
    name: 'Emotional/Aesthetic',
    objective: 'Perceive emotional impact and aesthetic qualities',
    description: 'Stage 4 explores the emotional and aesthetic dimensions of the target. This includes the feelings evoked by the target, its purpose, significance, and intangible qualities that give meaning beyond physical description.',
    techniques: [
      'Ask: "How does this target make me feel?"',
      'Probe for purpose: "What is this for?" "Why does it exist?"',
      'Sense the emotional atmosphere of the location',
      'Note aesthetic qualities (beautiful, industrial, ancient, modern)',
      'Perceive human presence and activities'
    ],
    whatToRecord: [
      'Emotional impressions (peaceful, tense, joyful, sacred)',
      'Aesthetic qualities (natural beauty, man-made, artistic)',
      'Sense of purpose or function',
      'Human activities or presence',
      'Historical or temporal impressions',
      'Significance or importance of the target'
    ],
    commonMistakes: [
      'Skipping emotional data as "not factual"',
      'Projecting your own feelings onto the target',
      'Not distinguishing between target emotions and your reaction',
      'Ignoring subtle aesthetic impressions'
    ],
    frequencyRecommendation: {
      beatFrequency: 6,
      brainState: 'Theta',
      rationale: 'Theta waves access deeper emotional and intuitive processing, essential for perceiving the target\'s emotional/aesthetic qualities.'
    },
    duration: '5-10 minutes'
  },
  {
    stage: 5,
    name: 'Interrogatory',
    objective: 'Ask specific questions to refine understanding',
    description: 'Stage 5 uses directed questioning to fill gaps and clarify ambiguities. You formulate specific questions about the target and probe for answers. This refines the accumulated data into a coherent picture.',
    techniques: [
      'Review previous stages and identify gaps',
      'Formulate specific questions: "What is the primary function?"',
      'Use timeline probing: "What happened here?" "What will happen?"',
      'Probe for specific details mentioned in tasking',
      'Cross-reference new data with earlier impressions'
    ],
    whatToRecord: [
      'Questions asked and answers received',
      'Clarifications of ambiguous data',
      'New details not previously perceived',
      'Confirmations of earlier impressions',
      'Timeline information (past, present, future)',
      'Specific answers to tasking requirements'
    ],
    commonMistakes: [
      'Asking leading questions that assume answers',
      'Not recording "no response" when nothing comes',
      'Forcing answers when perception is unclear',
      'Skipping questions that seem too specific'
    ],
    frequencyRecommendation: {
      beatFrequency: 10,
      brainState: 'Alpha',
      rationale: 'Alpha waves support focused questioning while maintaining the receptive state needed for accurate responses.'
    },
    duration: '10-15 minutes'
  },
  {
    stage: 6,
    name: 'Modeling',
    objective: 'Create comprehensive model of the target',
    description: 'Stage 6 synthesizes all previous data into a comprehensive model. You may create 3D sketches, detailed maps, or written summaries. This is where the complete picture of the target emerges.',
    techniques: [
      'Review all data from Stages 1-5',
      'Create a comprehensive sketch or model',
      'Write a summary narrative of the target',
      'Identify high-confidence vs low-confidence data',
      'Note any remaining questions or ambiguities'
    ],
    whatToRecord: [
      'Comprehensive summary sketch',
      '3D model or multiple-view drawings',
      'Written narrative describing the target',
      'Confidence ratings for different aspects',
      'Final AOL declarations',
      'Session summary and key findings'
    ],
    commonMistakes: [
      'Creating the model before completing earlier stages',
      'Ignoring data that doesn\'t fit the emerging picture',
      'Over-committing to a single interpretation',
      'Not distinguishing between perception and analysis'
    ],
    frequencyRecommendation: {
      beatFrequency: 12,
      brainState: 'Low Beta',
      rationale: 'Low beta supports the analytical integration needed to synthesize data while maintaining connection to intuitive perceptions.'
    },
    duration: '10-20 minutes'
  }
];

// ============ ARV PREDICTIONS GUIDE ============

export interface ARVGuide {
  id: string;
  title: string;
  description: string;
  howItWorks: string;
  steps: string[];
  judgingCriteria: string[];
  bestPractices: string[];
  scientificBasis: string;
  applications: string[];
  frequencyRecommendation: {
    beatFrequency: number;
    brainState: string;
    rationale: string;
  };
}

export const ARV_GUIDE: ARVGuide = {
  id: 'arv-predictions',
  title: 'Associative Remote Viewing (ARV)',
  description: 'ARV is a practical application of remote viewing for making binary predictions about future events. Instead of viewing the event directly, you view one of two target images that have been randomly associated with each outcome.',
  howItWorks: 'Two target images are randomly assigned to two possible outcomes (A and B). You view a "blind" target without knowing which one it is. After recording your impressions, you compare them to both revealed targets and judge which one matches better. Your selection determines your prediction for the event.',
  steps: [
    'Create a prediction with a binary question (Team A wins vs Team B wins)',
    'The system assigns random target images to each outcome',
    'View the blind target and record your impressions',
    'Compare your impressions to both revealed target images',
    'Judge which target your impressions match better',
    'Your selection becomes your prediction',
    'After the event occurs, resolve the prediction to see if you were correct'
  ],
  judgingCriteria: [
    'Match specific visual elements (colors, shapes, textures)',
    'Compare emotional qualities perceived vs target content',
    'Look for spatial/dimensional matches',
    'Consider the overall gestalt of your impressions',
    'Don\'t force a match - sometimes neither target matches well',
    'Trust your first impression when comparing'
  ],
  bestPractices: [
    'Use clear, unambiguous binary questions',
    'Choose events with definite outcomes (not subjective)',
    'Allow enough time between viewing and event for judging',
    'Keep detailed records of all predictions',
    'Don\'t view if you have strong bias toward an outcome',
    'Practice with events you have no stake in first'
  ],
  scientificBasis: 'ARV was developed to make remote viewing practically applicable. Research at SRI and other institutions showed statistically significant prediction accuracy. The associative method avoids the problem of directly viewing future events by using the established RV skill of describing present targets. The random target assignment ensures the viewer cannot use normal inference.',
  applications: [
    'Sports event predictions',
    'Market direction forecasting',
    'Binary decision making',
    'Research into precognition',
    'Personal decision support'
  ],
  frequencyRecommendation: {
    beatFrequency: 7.83,
    brainState: 'Theta-Alpha (Schumann Resonance)',
    rationale: 'The Schumann resonance frequency promotes the receptive state optimal for perceiving target information across time.'
  }
};

// ============ QUANTUM ORACLE GUIDE ============

export interface QuantumOracleGuide {
  id: string;
  title: string;
  description: string;
  practiceMode: {
    description: string;
    steps: string[];
    tips: string[];
  };
  tournamentMode: {
    description: string;
    howItWorks: string;
  };
  scientificBasis: string;
  frequencyRecommendation: {
    beatFrequency: number;
    brainState: string;
    rationale: string;
  };
}

export const QUANTUM_ORACLE_GUIDE: QuantumOracleGuide = {
  id: 'quantum-oracle',
  title: 'Quantum Oracle',
  description: 'The Quantum Oracle generates true random numbers using quantum processes and challenges you to predict them through intuitive perception. An 8-digit entanglement code is displayed while the actual number remains hidden until you submit your guess.',
  practiceMode: {
    description: 'Practice predicting quantum-generated numbers (1-99) by focusing on an 8-digit entanglement code that is quantum-correlated with the hidden number.',
    steps: [
      'Select guess mode: Multiple Choice (3 options) or Free Entry (no hints)',
      'Click "Generate Quantum Number" to create a new entangled pair',
      'Focus on the 8-digit code displayed on the black screen',
      'Let impressions of the hidden number arise naturally',
      'When ready, click to proceed to guessing',
      'Enter your guess (or select from multiple choice)',
      'The actual number is revealed with your result'
    ],
    tips: [
      'Don\'t overthink - first impressions are often best',
      'The code and number are "entangled" - focus on the code as a window to the number',
      'In free entry mode, just type what comes to mind',
      'Multiple choice mode is easier for building confidence',
      'Track your accuracy over many sessions to see improvement',
      'Use binaural beats at theta frequency for enhanced intuition'
    ]
  },
  tournamentMode: {
    description: 'Daily quantum numbers are generated and revealed at midnight UTC. Predict the number before revelation for tournament scoring.',
    howItWorks: 'Each day, a quantum number is generated but not revealed until midnight UTC. You can submit predictions throughout the day. After revelation, predictions are scored and leaderboards updated.'
  },
  scientificBasis: 'Quantum random number generators (QRNGs) use quantum mechanical processes like photon beam splitting to generate truly random numbers, unlike pseudo-random algorithms. Some researchers theorize that consciousness may interact with quantum systems at the moment of measurement (quantum mind hypothesis). The Oracle provides a platform to test intuitive prediction abilities against true quantum randomness.',
  frequencyRecommendation: {
    beatFrequency: 6,
    brainState: 'Theta',
    rationale: 'Theta waves (4-8Hz) are associated with intuition, creativity, and access to subconscious information. This state may enhance the subtle perception needed for quantum number prediction.'
  }
};

// ============ GENERAL RV TIPS ============

export interface RVTip {
  category: string;
  title: string;
  description: string;
  details: string[];
}

export const RV_GENERAL_TIPS: RVTip[] = [
  {
    category: 'Preparation',
    title: 'Pre-Session Preparation',
    description: 'How to prepare yourself for optimal remote viewing sessions',
    details: [
      'Find a quiet, comfortable space free from distractions',
      'Turn off phone notifications and minimize interruptions',
      'Use binaural beats for 5-10 minutes before starting',
      'Do a brief meditation or breathing exercise to clear your mind',
      'Have paper and pen ready for sketches and notes',
      'Set a clear intention to perceive the target accurately',
      'Avoid caffeine or stimulants that increase mental noise'
    ]
  },
  {
    category: 'During Session',
    title: 'Session Best Practices',
    description: 'Guidelines for maintaining accuracy during RV sessions',
    details: [
      'Record ALL impressions, even if they seem irrelevant',
      'Don\'t try to identify the target - just describe what you perceive',
      'Declare AOL (Analytical Overlay) when you catch yourself guessing',
      'Take breaks if you feel mental fatigue',
      'Trust your first impressions over later "corrections"',
      'Describe rather than name (e.g., "tall, brown, rough texture" not "tree")',
      'Keep your eyes open or closed based on what works best for you'
    ]
  },
  {
    category: 'Common Challenges',
    title: 'Overcoming Common Challenges',
    description: 'Solutions for typical remote viewing difficulties',
    details: [
      'Mental noise: Use longer binaural beat preparation, try theta frequencies',
      'Analytical overlay: Practice immediate declaration, don\'t judge yourself',
      'Blank mind: Use probing cues like "I am perceiving colors..."',
      'Doubt: Record impressions anyway - review accuracy over many sessions',
      'Inconsistent results: Maintain regular practice schedule',
      'Fatigue: Keep sessions to 30-45 minutes maximum',
      'Expectation: Don\'t have preconceptions about what the target should be'
    ]
  },
  {
    category: 'Progress Tracking',
    title: 'Tracking Your Development',
    description: 'How to measure and improve your RV abilities over time',
    details: [
      'Keep a detailed log of all sessions with dates and conditions',
      'Rate your confidence level before seeing feedback',
      'Note physical and mental state during each session',
      'Track hit rate over blocks of 20+ sessions (avoid small sample conclusions)',
      'Identify patterns in your accurate vs inaccurate sessions',
      'Review which types of targets you perceive best',
      'Celebrate progress but don\'t get discouraged by misses'
    ]
  }
];

// Export types for use in GuideTab
export type { RVSessionGuide, CRVStageGuide, ARVGuide, QuantumOracleGuide, RVTip };
