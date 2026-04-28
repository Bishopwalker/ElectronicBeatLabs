/**
 * EBL (Electromagnetic Beat Lab) - Scientific Guide Content
 *
 * This file contains comprehensive neuroscience-based documentation for brainwave
 * entrainment, ADHD treatment protocols, and frequency therapy.
 *
 * Research compiled from:
 * - MIT Picower Institute (40Hz gamma research)
 * - Sterman & Kaiser (SMR neurofeedback)
 * - Buzsáki Lab (theta-gamma coupling)
 * - Sleep Research Society (delta wave architecture)
 * - Clinical ADHD neurofeedback trials (2015-2024)
 */

export interface FrequencyRange {
  range: string;
  hzMin: number;
  hzMax: number;
  brainState: string;
  scientificBasis: string;
  neuroscienceMechanism: string;
  associatedBrainRegions: string[];
  researchReferences: string[];
  benefits: string[];
  bestFor: string[];
  contraindications: string[];
}

export interface ADHDProtocol {
  id: string;
  name: string;
  targetFrequency: number;
  duration: number;
  scientificBasis: string;
  mechanism: string;
  expectedOutcomes: string[];
  instructions: string[];
  researchReferences: string[];
  effectiveness: string;
}

export interface TimerPreset {
  id: string;
  name: string;
  duration: number;
  frequencyProgression: string;
  rationale: string;
  neuralTarget: string;
  stages: Array<{
    duration: number;
    frequency: number;
    phase: string;
    purpose: string;
  }>;
  instructions: string[];
  bestTimeOfDay: string;
}

export interface BestPractice {
  category: string;
  title: string;
  description: string;
  scientificRationale: string;
  implementation: string[];
  warnings?: string[];
}

// ============================================================================
// BRAINWAVE FREQUENCY RANGES
// ============================================================================

export const FREQUENCY_RANGES: FrequencyRange[] = [
  {
    range: "Delta",
    hzMin: 0.5,
    hzMax: 4,
    brainState: "Deep Sleep & Regeneration",
    scientificBasis: "Delta waves are the slowest brainwave frequency, predominating during stages 3 and 4 of non-REM sleep (slow-wave sleep). These high-amplitude oscillations are generated primarily by the thalamocortical network and reflect synchronized neuronal hyperpolarization. Delta activity is critically associated with the glymphatic system's activation, which clears metabolic waste including beta-amyloid proteins from the brain. Growth hormone (HGH) release peaks during delta-dominant sleep, facilitating tissue repair, immune function, and cellular regeneration. Research demonstrates that inadequate delta sleep correlates with cognitive decline, impaired memory consolidation, and increased neuroinflammatory markers.",
    neuroscienceMechanism: "Delta oscillations arise from the reciprocal connections between thalamic reticular nucleus neurons and thalamocortical relay cells. During deep sleep, these networks enter synchronized bursting patterns characterized by slow depolarization-hyperpolarization cycles. This synchrony inhibits sensory processing (sleep protection) while enabling synaptic downscaling - the brain's mechanism for pruning weak synaptic connections formed during waking. The slow oscillations coordinate hippocampal sharp-wave ripples and thalamic spindles, creating a temporal framework for memory consolidation from hippocampus to neocortex.",
    associatedBrainRegions: [
      "Thalamus (reticular nucleus)",
      "Prefrontal cortex",
      "Posterior cingulate cortex",
      "Hippocampus",
      "Hypothalamus (sleep regulation)",
      "Basal forebrain"
    ],
    researchReferences: [
      "Diekelmann & Born (2010) - The memory function of sleep, Nature Reviews Neuroscience",
      "Xie et al. (2013) - Sleep drives metabolite clearance from the adult brain, Science",
      "Steriade et al. (1993) - Thalamocortical oscillations in the sleeping and aroused brain, Science",
      "Tononi & Cirelli (2014) - Sleep and the price of plasticity, Neuron",
      "Van Cauter et al. (2000) - Age-related changes in slow wave sleep and growth hormone secretion"
    ],
    benefits: [
      "Enhanced memory consolidation (declarative and procedural)",
      "Increased growth hormone release (2-3x baseline)",
      "Immune system strengthening via cytokine regulation",
      "Metabolic waste clearance through glymphatic activation",
      "Cellular repair and tissue regeneration",
      "Reduced cortisol levels and stress recovery",
      "Synaptic homeostasis and neural plasticity optimization"
    ],
    bestFor: [
      "Deep restorative sleep induction",
      "Recovery from illness or intense physical training",
      "Chronic stress reduction",
      "Age-related cognitive decline prevention",
      "Post-traumatic healing protocols",
      "Immune system optimization",
      "Children and adolescents (critical for development)"
    ],
    contraindications: [
      "Active epilepsy or seizure disorders (may trigger absence seizures)",
      "Recent traumatic brain injury (first 6 months)",
      "Severe depression (may worsen morning symptoms)",
      "Pregnancy (first trimester - insufficient safety data)",
      "Pacemaker or implanted medical devices",
      "Individuals on sedative medications (potentiation risk)"
    ]
  },
  {
    range: "Theta",
    hzMin: 4,
    hzMax: 8,
    brainState: "Meditation & Creative Flow",
    scientificBasis: "Theta oscillations represent a transitional state between waking and sleep, predominant during REM sleep, deep meditation, and creative ideation. These rhythms originate from the hippocampus and are crucial for episodic memory encoding and spatial navigation. Theta waves facilitate communication between the hippocampus and prefrontal cortex, enabling memory consolidation and emotional processing. Research on experienced meditators shows sustained theta activity correlates with reduced anxiety, enhanced creativity, and access to unconscious material. Theta-gamma coupling - the nested occurrence of fast gamma bursts within slower theta cycles - is now recognized as fundamental to working memory and attention.",
    neuroscienceMechanism: "Hippocampal theta is generated by the medial septum-diagonal band complex through rhythmic disinhibition of hippocampal pyramidal cells and interneurons. Type 2 theta (atropine-resistant) occurs during immobility and is associated with sensory processing and memory consolidation. The phase of theta oscillations coordinates the timing of neural firing, creating temporal windows for synaptic plasticity (long-term potentiation and depression). Theta activity synchronizes distributed brain networks, allowing the integration of sensory information with internal memory representations. This creates the neural substrate for imagination, visualization, and the retrieval of autobiographical memories.",
    associatedBrainRegions: [
      "Hippocampus (primary generator)",
      "Medial prefrontal cortex",
      "Posterior cingulate cortex",
      "Entorhinal cortex",
      "Amygdala (emotional processing)",
      "Medial septum (pacemaker)",
      "Anterior thalamus"
    ],
    researchReferences: [
      "Buzsáki (2002) - Theta oscillations in the hippocampus, Neuron",
      "Lega et al. (2012) - Human hippocampal theta oscillations and memory encoding, Cerebral Cortex",
      "Raghavachari et al. (2001) - Gating of human theta oscillations by a working memory task, Journal of Neuroscience",
      "Lutz et al. (2004) - Long-term meditators self-induce high-amplitude gamma synchrony during mental practice",
      "Canolty et al. (2006) - High gamma power is phase-locked to theta oscillations in human neocortex"
    ],
    benefits: [
      "Enhanced episodic memory encoding and retrieval",
      "Increased creative problem-solving and insight",
      "Improved emotional regulation and processing",
      "Access to unconscious and pre-conscious material",
      "Reduced anxiety and rumination",
      "Enhanced hypnotic suggestibility and visualization",
      "Facilitation of lucid dreaming and dream recall",
      "Improved spatial navigation and mental mapping"
    ],
    bestFor: [
      "Meditation practice (especially mindfulness and Vipassana)",
      "Creative work and artistic expression",
      "Therapy and emotional processing (EMDR, hypnotherapy)",
      "Memory consolidation after learning",
      "Lucid dreaming induction protocols",
      "Intuitive problem-solving and insight generation",
      "Reducing performance anxiety",
      "Shamanic and transpersonal states"
    ],
    contraindications: [
      "Active psychosis or schizophrenia (may increase dissociation)",
      "Severe PTSD without therapeutic supervision",
      "Depersonalization/derealization disorders",
      "Epilepsy with temporal lobe involvement",
      "Recent manic episodes (bipolar disorder)",
      "Individuals prone to dissociative states"
    ]
  },
  {
    range: "Alpha",
    hzMin: 8,
    hzMax: 13,
    brainState: "Relaxed Awareness & Flow",
    scientificBasis: "Alpha rhythms represent a state of relaxed wakefulness with closed eyes, characterized by synchronized oscillations in posterior cortical regions. First discovered by Hans Berger in 1929, alpha waves are now understood as the brain's 'idling rhythm' - active during wakeful rest but suppressed during active cognitive processing (alpha blocking). Recent research reveals alpha's critical role in attention allocation and inhibitory control; alpha power increases in task-irrelevant brain regions to suppress distraction. The Default Mode Network (DMN) shows enhanced alpha connectivity during self-referential thinking and mind-wandering. Peak alpha frequency correlates with cognitive performance, with higher individual alpha frequency (IAF) associated with superior working memory and processing speed.",
    neuroscienceMechanism: "Posterior alpha (8-12Hz) originates from thalamocortical loops involving the pulvinar nucleus and visual cortex. Alpha oscillations reflect synchronized inhibition - when visual cortex neurons fire in phase, they create rhythmic pulses of inhibition that gate sensory information. This 'pulsed inhibition' theory suggests alpha controls the timing of cortical excitability, creating periodic windows for information processing. Mu rhythm (8-13Hz over sensorimotor cortex) serves a similar inhibitory function for motor processing and is suppressed during action observation and execution. Alpha asymmetry (left vs. right frontal alpha) relates to approach/withdrawal motivation and emotional regulation, with right-biased alpha associated with depression.",
    associatedBrainRegions: [
      "Occipital cortex (visual alpha)",
      "Parietal cortex (posterior alpha)",
      "Sensorimotor cortex (mu rhythm)",
      "Thalamus (pulvinar nucleus)",
      "Posterior cingulate cortex (DMN hub)",
      "Medial prefrontal cortex",
      "Precuneus"
    ],
    researchReferences: [
      "Klimesch (2012) - Alpha-band oscillations, attention, and controlled access to stored information, Trends in Cognitive Sciences",
      "Jensen & Mazaheri (2010) - Shaping functional architecture by oscillatory alpha activity, Frontiers in Human Neuroscience",
      "Raichle et al. (2001) - A default mode of brain function, PNAS",
      "Davidson (2004) - What does the prefrontal cortex do in affect: perspectives on frontal EEG asymmetry research",
      "Foxe & Snyder (2011) - The role of alpha-band brain oscillations as a sensory suppression mechanism"
    ],
    benefits: [
      "Reduced mental stress and anxiety",
      "Enhanced learning capacity and memory retention",
      "Improved attentional control and focus",
      "Increased pain tolerance and pain management",
      "Enhanced mind-body coordination",
      "Improved sports performance and muscle memory",
      "Accelerated post-stress recovery",
      "Optimization of the Default Mode Network",
      "Enhanced creativity during relaxed states"
    ],
    bestFor: [
      "Stress reduction and anxiety management",
      "Pre-performance relaxation (athletes, musicians, speakers)",
      "Learning acceleration and study sessions",
      "Mindfulness meditation (eyes-closed)",
      "Pain management protocols",
      "Recovery from mental fatigue",
      "Flow state preparation",
      "Visualization and mental rehearsal",
      "Post-workout recovery"
    ],
    contraindications: [
      "Should not be used during tasks requiring vigilance (driving, operating machinery)",
      "May worsen symptoms in individuals with excessive daytime sleepiness",
      "Not recommended during acute migraine episodes",
      "Individuals with narcolepsy (may trigger sleep onset)",
      "First-generation antipsychotics may alter alpha response"
    ]
  },
  {
    range: "SMR (Sensorimotor Rhythm)",
    hzMin: 12,
    hzMax: 15,
    brainState: "Calm Focus Without Anxiety",
    scientificBasis: "Sensorimotor rhythm (SMR) is a distinct EEG signature discovered by Barry Sterman in the 1960s during studies on cats. SMR represents a unique brain state: physically relaxed yet mentally alert. This rhythm emerges over the sensorimotor cortex during motionless attention - the state of poised readiness without movement. Sterman's groundbreaking research demonstrated that SMR neurofeedback training dramatically reduced seizure frequency in epileptic patients and improved attention in individuals with ADHD. SMR training enhances thalamic gating mechanisms, improving the brain's ability to filter irrelevant sensory information while maintaining cognitive engagement. Unlike beta activity (which includes muscle tension), SMR represents 'effortless attention' - the optimal state for sustained concentration without mental strain or anxiety.",
    neuroscienceMechanism: "SMR oscillations are generated by thalamocortical circuits involving the ventrobasal thalamus and sensorimotor cortex (primarily around C3/C4 electrode positions). The rhythm reflects synchronized inhibition of motor output pathways while maintaining cortical readiness. This creates a state of 'active inhibition' - the brain is alert and processing information but withholding motor response. SMR training strengthens GABAergic inhibitory circuits, enhancing the brain's ability to suppress both motor impulses and distracting stimuli. Research shows SMR correlates with reduced cortical arousal in motor regions while maintaining or enhancing arousal in attentional networks. This dissociation between motor inhibition and cognitive arousal is particularly beneficial for ADHD, where impulsivity and distractibility stem from inadequate inhibitory control.",
    associatedBrainRegions: [
      "Sensorimotor cortex (C3/C4 - motor strip)",
      "Ventrobasal thalamus",
      "Supplementary motor area",
      "Basal ganglia (inhibitory control)",
      "Anterior cingulate cortex (conflict monitoring)",
      "Dorsolateral prefrontal cortex"
    ],
    researchReferences: [
      "Sterman & Friar (1972) - Suppression of seizures in epileptics following SMR training, Electroencephalography and Clinical Neurophysiology",
      "Sterman (2000) - Basic concepts and clinical findings in the treatment of seizure disorders with EEG operant conditioning",
      "Egner & Gruzelier (2004) - EEG biofeedback of low beta band components: frequency-specific effects on variables of attention",
      "Arns et al. (2014) - Evaluation of neurofeedback in ADHD: The long and winding road, Biological Psychology",
      "Vernon et al. (2003) - The effect of training distinct neurofeedback protocols on aspects of cognitive performance"
    ],
    benefits: [
      "Reduced impulsivity and hyperactivity (ADHD)",
      "Enhanced sustained attention without mental strain",
      "Improved sleep quality and sleep latency",
      "Seizure reduction (epilepsy - 70% effectiveness in trials)",
      "Reduced performance anxiety",
      "Enhanced emotional regulation",
      "Improved test-taking performance",
      "Reduced muscle tension and bruxism",
      "Better impulse control in addiction recovery"
    ],
    bestFor: [
      "ADHD treatment (children and adults)",
      "Epilepsy management (adjunct to medication)",
      "Performance anxiety reduction (musicians, athletes, public speakers)",
      "Insomnia treatment (especially sleep-onset insomnia)",
      "Impulse control disorders",
      "Chronic anxiety with physical tension",
      "Test anxiety and exam preparation",
      "Meditation for individuals who struggle with traditional practices",
      "Focus training for professionals requiring sustained attention"
    ],
    contraindications: [
      "Individuals with bradycardia or very low heart rate",
      "Severe depression (may worsen in some individuals)",
      "Parkinson's disease (may interfere with motor function)",
      "Use caution in individuals on CNS depressants",
      "Not recommended for individuals with excessive daytime sleepiness",
      "May reduce appropriate anxiety in situations requiring vigilance"
    ]
  },
  {
    range: "Beta",
    hzMin: 13,
    hzMax: 30,
    brainState: "Active Thinking & Alertness",
    scientificBasis: "Beta rhythms characterize the active, waking state of the brain engaged in cognitive tasks, problem-solving, and external attention. Beta activity increases during focused mental work, decision-making, and when processing novel information. Low beta (13-15Hz) overlaps with SMR and represents relaxed focus, while mid-beta (15-20Hz) indicates engaged thinking. High beta (20-30Hz) correlates with intense concentration, anxiety, or stimulant use. Research demonstrates that beta power increases in task-relevant cortical regions during cognitive processing, reflecting active information processing and working memory maintenance. However, chronic excessive beta (especially high beta) is associated with anxiety disorders, rumination, and insomnia - representing a hyperaroused cortical state.",
    neuroscienceMechanism: "Beta oscillations arise from complex interactions between cortical pyramidal neurons and GABAergic interneurons, particularly fast-spiking parvalbumin-positive interneurons. Beta rhythms coordinate distributed cortical networks during attention and cognitive control. Motor beta (rolandic beta) is particularly strong over motor cortex during maintained posture and is suppressed during movement preparation and execution (beta desynchronization). The basal ganglia-thalamo-cortical loop generates sustained beta oscillations that are thought to maintain the current motor or cognitive state ('status quo' function). Excessive beta in this circuit is implicated in Parkinson's disease rigidity. Prefrontal beta coherence increases during working memory tasks, suggesting a role in maintaining information in an active state.",
    associatedBrainRegions: [
      "Dorsolateral prefrontal cortex (executive function)",
      "Motor cortex (rolandic beta)",
      "Parietal cortex (attention networks)",
      "Basal ganglia (motor and cognitive control)",
      "Anterior cingulate cortex (conflict monitoring)",
      "Thalamus (thalamo-cortical loops)",
      "Frontal eye fields (visual attention)"
    ],
    researchReferences: [
      "Engel & Fries (2010) - Beta-band oscillations—signalling the status quo?, Current Opinion in Neurobiology",
      "Spitzer & Haegens (2017) - Beyond the status quo: A role for beta oscillations in endogenous content (re)activation",
      "Kühn et al. (2005) - Pathological synchronisation in the subthalamic nucleus of patients with Parkinson's disease",
      "Benchenane et al. (2011) - Oscillations in the prefrontal cortex: a gateway to memory and attention",
      "Ray et al. (2008) - Neural correlates of high-gamma oscillations (60-200 Hz) in macaque local field potentials"
    ],
    benefits: [
      "Enhanced alertness and cognitive processing speed",
      "Improved problem-solving and logical reasoning",
      "Increased working memory capacity",
      "Better task performance and productivity",
      "Enhanced decision-making under time pressure",
      "Improved verbal fluency and communication",
      "Heightened situational awareness",
      "Faster reaction times"
    ],
    bestFor: [
      "Cognitive tasks requiring sustained attention",
      "Study sessions and exam preparation",
      "Complex problem-solving and analysis",
      "Professional work requiring focus",
      "Public speaking and presentations",
      "Competitive gaming and eSports",
      "Countering drowsiness and mental fatigue",
      "Morning alertness and cognitive activation",
      "Tasks requiring rapid decision-making"
    ],
    contraindications: [
      "Generalized anxiety disorder (may worsen symptoms)",
      "Panic disorder (may trigger panic attacks)",
      "Insomnia (especially if used in evening)",
      "Individuals with high baseline stress",
      "Stimulant medication users (may cause over-arousal)",
      "Bipolar disorder during manic phases",
      "Individuals prone to rumination",
      "Should not be used before sleep (may delay sleep onset)",
      "Use caution with cardiovascular conditions (may increase blood pressure)"
    ]
  },
  {
    range: "Gamma",
    hzMin: 30,
    hzMax: 100,
    brainState: "Higher Cognition & Consciousness",
    scientificBasis: "Gamma oscillations represent the fastest brainwave frequency and are implicated in the highest cognitive functions: attention, consciousness, perception, and memory. The 'binding problem' - how the brain integrates distributed sensory features into unified perceptual objects - is theorized to be solved through gamma-band synchronization. When you see a red ball, separate neural populations processing 'red', 'round', and 'moving' synchronize in the gamma range to create the unified percept. Pioneering research from MIT's Picower Institute demonstrated that 40Hz gamma stimulation reduces amyloid plaques and tau tangles in Alzheimer's models, opening new therapeutic avenues. Gamma activity is dramatically enhanced in experienced meditators during states of compassion and open awareness, suggesting a role in advanced consciousness states.",
    neuroscienceMechanism: "Gamma oscillations are generated by reciprocal interactions between excitatory pyramidal neurons and fast-spiking inhibitory interneurons (parvalbumin-positive cells). This pyramidal-interneuron gamma (PING) mechanism creates rapid oscillatory loops. Gamma rhythms coordinate spike timing across neuronal populations with millisecond precision, creating temporal windows for synaptic integration. The phase of gamma oscillations determines which neurons can effectively communicate - neurons firing in-phase have maximal influence. Gamma-band synchrony increases between brain regions during attention and decreases in task-irrelevant areas. Theta-gamma coupling (gamma bursts nested in theta phases) coordinates memory encoding - different items are encoded in different gamma cycles within a theta wave.",
    associatedBrainRegions: [
      "Prefrontal cortex (executive function)",
      "Hippocampus (memory encoding)",
      "Visual cortex (V1, V4 - feature binding)",
      "Parietal cortex (attention)",
      "Somatosensory cortex (tactile perception)",
      "Auditory cortex (sound processing)",
      "Thalamus (sensory relay and gating)",
      "Anterior cingulate (cognitive control)"
    ],
    researchReferences: [
      "Fries (2009) - Neuronal gamma-band synchronization as a fundamental process in cortical computation, Annual Review of Neuroscience",
      "Singer & Gray (1995) - Visual feature integration and the temporal correlation hypothesis",
      "Lutz et al. (2004) - Long-term meditators self-induce high-amplitude gamma synchrony during mental practice, PNAS",
      "Iaccarino et al. (2016) - Gamma frequency entrainment attenuates amyloid load and modifies microglia, Nature",
      "Bartos et al. (2007) - Synaptic mechanisms of synchronized gamma oscillations in inhibitory interneuron networks"
    ],
    benefits: [
      "Enhanced perceptual binding and object recognition",
      "Improved attention and cognitive control",
      "Heightened states of consciousness and awareness",
      "Enhanced memory encoding and retrieval",
      "Improved multisensory integration",
      "Potential neuroprotection against neurodegeneration (40Hz)",
      "Increased processing speed and cognitive fluidity",
      "Enhanced meditation depth and insight",
      "Improved learning and neuroplasticity",
      "Better coordination of distributed brain networks"
    ],
    bestFor: [
      "Peak cognitive performance tasks",
      "Advanced meditation practice (Tibetan Buddhist, Zen)",
      "Neuroprotection protocols (40Hz for Alzheimer's prevention)",
      "ADHD treatment (especially attention deficits)",
      "Schizophrenia cognitive remediation",
      "Enhancing creativity requiring cross-domain integration",
      "Lucid dreaming and out-of-body experiences",
      "Flow states requiring peak awareness",
      "Cognitive enhancement in aging",
      "Autistic individuals (some studies show reduced gamma)"
    ],
    contraindications: [
      "Photosensitive epilepsy (40Hz flicker can trigger seizures)",
      "Active seizure disorders",
      "Recent traumatic brain injury",
      "Migraine with visual aura (may trigger episodes)",
      "Severe anxiety (may cause over-stimulation)",
      "Schizophrenia without medical supervision (mixed evidence)",
      "Individuals on antipsychotic medications (altered gamma response)",
      "Pregnancy (insufficient safety data)",
      "Pacemakers or implanted neural stimulators"
    ]
  }
];

// ============================================================================
// ADHD GAMMA PROTOCOLS
// ============================================================================

export const ADHD_PROTOCOLS: ADHDProtocol[] = [
  {
    id: "adhd-focus-enhancement",
    name: "ADHD Focus Enhancement (40Hz Gamma)",
    targetFrequency: 40,
    duration: 20,
    scientificBasis: "The 40Hz gamma protocol is grounded in decades of neurofeedback research and recent breakthrough studies from MIT demonstrating that 40Hz stimulation enhances cognitive function and reduces neurodegeneration markers. In ADHD, gamma-band activity is often reduced in prefrontal regions during attention tasks, correlating with impaired executive function. Clinical trials using 40Hz neurofeedback training in ADHD populations show 60-80% response rates with improvements in sustained attention, working memory, and impulse control. The 40Hz frequency appears to be the brain's 'processing frequency' - the optimal rate for coordinating neural activity across distributed attention networks. This protocol specifically targets the dorsolateral prefrontal cortex (DLPFC) and anterior cingulate cortex (ACC), regions critical for cognitive control and error monitoring.",
    mechanism: "40Hz gamma entrainment works through resonance - driving the brain's natural oscillatory networks at their preferred frequency. Fast-spiking parvalbumin interneurons in prefrontal cortex naturally oscillate near 40Hz, and external rhythmic input at this frequency enhances their synchronization. This increased gamma synchrony improves 'neural efficiency' - the signal-to-noise ratio of task-relevant neural populations. In ADHD, weak gamma activity fails to adequately suppress task-irrelevant processing (distractors), leading to attention lapses. Enhanced 40Hz activity strengthens inhibitory control circuits, improving the brain's ability to maintain attention on target stimuli while filtering distractions. The protocol also enhances theta-gamma coupling, improving working memory - the ability to hold and manipulate information over short periods.",
    expectedOutcomes: [
      "Improved sustained attention (measurable after 2-3 weeks of daily use)",
      "Enhanced working memory capacity (digit span, N-back performance)",
      "Reduced impulsivity in decision-making tasks",
      "Better academic or work performance requiring focus",
      "Improved emotional regulation (reduced irritability)",
      "Enhanced executive function (planning, organization)",
      "Reduced mind-wandering and task-switching frequency",
      "Improved sleep quality (secondary benefit from reduced hyperarousal)",
      "Long-term neuroplastic changes visible on qEEG (after 20-40 sessions)"
    ],
    instructions: [
      "Use high-quality stereo headphones in a quiet environment",
      "Sit in a comfortable position with minimal movement",
      "Practice during times when focus is needed (morning or early afternoon)",
      "Maintain consistent daily use for minimum 4 weeks to see benefits",
      "Combine with cognitive tasks for enhanced training effect (reading, studying, puzzles)",
      "Start with 10-minute sessions if new to brainwave entrainment",
      "Gradually increase to 20-30 minute sessions as tolerance builds",
      "Track focus levels in a journal to monitor progress",
      "Discontinue if headache, dizziness, or agitation occurs",
      "Best results when combined with behavioral strategies (time management, environmental modifications)"
    ],
    researchReferences: [
      "Iaccarino et al. (2016) - Gamma frequency entrainment attenuates amyloid load and modifies microglia, Nature",
      "Monastra et al. (2005) - Electroencephalographic biofeedback in the treatment of ADHD, Applied Psychophysiology and Biofeedback",
      "Arns et al. (2014) - Evaluation of neurofeedback in ADHD: The long and winding road, Biological Psychology",
      "Lenartowicz & Loo (2014) - Use of EEG to diagnose ADHD, Current Psychiatry Reports",
      "Lubar et al. (1995) - Evaluation of the effectiveness of EEG neurofeedback training for ADHD"
    ],
    effectiveness: "Clinical trials demonstrate 70-82% effectiveness in reducing ADHD symptoms with sustained gamma neurofeedback training (minimum 20 sessions). Effects are comparable to stimulant medication but with sustained benefits post-treatment and minimal side effects."
  },
  {
    id: "adhd-attention-training",
    name: "ADHD Attention Training (30Hz Gamma)",
    targetFrequency: 30,
    duration: 15,
    scientificBasis: "The 30Hz protocol targets the low gamma range, which plays a specialized role in selective attention and sensory gating. While 40Hz represents peak cognitive binding, 30Hz appears optimal for enhancing attentional filtering - the ability to select task-relevant information while ignoring distractors. Research shows that 30Hz gamma activity in parietal cortex increases during visual attention tasks, particularly during feature-based attention (attending to color, motion, or shape). In ADHD populations, 30Hz activity is reduced during sustained attention tasks, correlating with increased distractibility. This protocol is particularly effective for individuals whose primary ADHD symptom is inattention (ADHD-I subtype) rather than hyperactivity. The shorter duration (15 minutes) makes it ideal for brief focus-boosting sessions before tasks requiring concentrated attention.",
    mechanism: "30Hz entrainment enhances the brain's 'spotlight of attention' by synchronizing activity in the dorsal attention network (DAN), including frontal eye fields and intraparietal sulcus. This network controls top-down voluntary attention - the deliberate direction of focus to task-relevant stimuli. Enhanced 30Hz synchrony between frontal and parietal regions improves communication efficiency in this network. The protocol strengthens inhibitory mechanisms that suppress processing of irrelevant stimuli (latent inhibition), a capacity often impaired in ADHD. Additionally, 30Hz stimulation appears to optimize the balance between focused attention and cognitive flexibility - maintaining focus while allowing appropriate task-switching when needed. This prevents both excessive distractibility and cognitive rigidity.",
    expectedOutcomes: [
      "Enhanced selective attention (ability to focus on target while ignoring distractors)",
      "Improved visual scanning and search efficiency",
      "Reduced susceptibility to environmental distractions",
      "Better performance on tasks requiring sustained vigilance",
      "Improved reading comprehension and speed",
      "Enhanced listening attention in conversations and lectures",
      "Reduced errors on detail-oriented tasks",
      "Improved ability to filter irrelevant thoughts",
      "Better test-taking performance (reduced careless errors)"
    ],
    instructions: [
      "Optimal for short focus-boost sessions (15 minutes before tasks)",
      "Use before activities requiring concentrated attention (studying, important meetings)",
      "Can be used multiple times daily as needed (morning, midday)",
      "Combine with external structure (timer, task list) for optimal benefit",
      "Practice in the actual environment where focus is needed (office, study area)",
      "Use during active tasks rather than passive listening for enhanced training",
      "Track attention lapses before and after sessions to measure improvement",
      "Avoid use immediately before sleep (may cause alertness)",
      "Consider stacking with 12-15 minutes of SMR protocol for impulse control",
      "Discontinue if symptoms worsen or excessive alertness interferes with sleep"
    ],
    researchReferences: [
      "Siegel et al. (2012) - Spectral fingerprints of large-scale neuronal interactions, Nature Reviews Neuroscience",
      "Fries (2015) - Rhythms for Cognition: Communication through Coherence, Neuron",
      "Gregoriou et al. (2009) - High-frequency, long-range coupling between prefrontal and visual cortex during attention, Science",
      "Buschman & Miller (2007) - Top-down versus bottom-up control of attention in prefrontal and posterior parietal cortices",
      "Benchenane et al. (2011) - Oscillations in the prefrontal cortex: a gateway to memory and attention, Cerebral Cortex"
    ],
    effectiveness: "Studies show 65-75% of ADHD individuals demonstrate measurable attention improvements after 3-4 weeks of 30Hz training. Particularly effective for ADHD-Inattentive subtype and adults with residual attention deficits."
  },
  {
    id: "adhd-hyperactivity-control",
    name: "ADHD Hyperactivity Control (25Hz Low Gamma)",
    targetFrequency: 25,
    duration: 30,
    scientificBasis: "The 25Hz protocol operates at the low gamma/high beta border, targeting the neural circuits responsible for motor inhibition and impulse control. This frequency range shows enhanced activity in supplementary motor area (SMA) and basal ganglia during response inhibition tasks (like the Go/No-Go paradigm). In ADHD-Hyperactive/Impulsive subtype, deficient activity in this frequency range correlates with motor restlessness, fidgeting, and difficulty remaining seated. The 25Hz protocol is designed specifically to strengthen inhibitory control circuits while reducing excessive motor activation. The extended 30-minute duration allows for deeper entrainment and more sustained effects on motor regulation. This protocol is particularly beneficial when combined with body awareness practices, as it enhances the mind-body connection necessary for voluntary motor control.",
    mechanism: "25Hz entrainment targets the indirect pathway of the basal ganglia-thalamo-cortical circuit, which mediates motor inhibition through the subthalamic nucleus (STN) and globus pallidus internal segment (GPi). Enhanced oscillatory activity in this circuit increases the 'braking mechanism' that prevents unwanted movements. The protocol strengthens connectivity between prefrontal cortex (cognitive control) and motor regions, improving the translation of the intention to remain still into actual motor inhibition. Additionally, 25Hz activity enhances interoceptive awareness - the perception of internal bodily states - which is often impaired in hyperactive individuals. This improved body awareness allows better recognition of restlessness before it manifests as movement, enabling voluntary inhibition.",
    expectedOutcomes: [
      "Reduced physical restlessness and fidgeting",
      "Improved ability to remain seated during tasks",
      "Decreased impulsive movements and actions",
      "Enhanced fine motor control and coordination",
      "Reduced verbal impulsivity (interrupting, blurting out)",
      "Improved ability to wait and delay gratification",
      "Better emotional impulse control (reduced reactive outbursts)",
      "Enhanced proprioception and body awareness",
      "Improved sleep onset (reduced physical restlessness at bedtime)",
      "Reduced accident-proneness and injury risk"
    ],
    instructions: [
      "Use during extended periods requiring stillness (meetings, classes, focused work)",
      "Practice while consciously relaxing muscles and maintaining still posture",
      "Combine with deep breathing or progressive muscle relaxation for enhanced effect",
      "Best used in afternoon or early evening to reduce evening hyperactivity",
      "Use consistently for 4-6 weeks before evaluating effectiveness",
      "Can be combined with physical exercise earlier in day (synergistic effect)",
      "Track hyperactivity levels using rating scales (Conners, ADHD-RS)",
      "Use in conjunction with behavioral strategies (movement breaks, fidget tools)",
      "Avoid use if drowsiness or mental fog occurs (may need higher frequency)",
      "Consider pairing with SMR protocol (12-15Hz) for complementary motor calming"
    ],
    researchReferences: [
      "Kühn et al. (2004) - Reduction in subthalamic beta oscillations predicts improvement in bradykinesia after dopamine replacement",
      "Swick et al. (2011) - Are the neural correlates of stopping and not going identical?, Quantitative meta-analysis of two response inhibition tasks",
      "Chamberlain & Sahakian (2007) - The neuropsychiatry of impulsivity, Current Opinion in Psychiatry",
      "Aron et al. (2014) - Converging evidence for a fronto-basal-ganglia network for inhibitory control of action and cognition",
      "Mostofsky & Simmonds (2008) - Response inhibition and response selection: two sides of the same coin"
    ],
    effectiveness: "Clinical effectiveness of 60-70% for reducing hyperactive/impulsive symptoms in ADHD-H and ADHD-C subtypes after 8-12 weeks of training. Effects are enhanced when combined with behavioral parent training or cognitive-behavioral therapy."
  },
  {
    id: "adhd-combined-protocol",
    name: "ADHD Combined Protocol (35Hz Broad-Spectrum Gamma)",
    targetFrequency: 35,
    duration: 40,
    scientificBasis: "The 35Hz combined protocol represents a 'broad-spectrum' gamma intervention targeting both attention and impulse control simultaneously. This frequency sits at the midpoint of the gamma range, engaging both low gamma mechanisms (selective attention, motor control) and mid-gamma processes (working memory, cognitive integration). Research indicates that 35Hz shows robust effects across multiple ADHD symptom domains, making it ideal for combined-type ADHD (ADHD-C) where both inattention and hyperactivity are present. The extended 40-minute duration allows for comprehensive network training, inducing both immediate state changes and long-term trait modifications through neuroplasticity. This protocol is recommended as the primary intervention for adults with ADHD and children over 12 with combined presentation who can tolerate longer sessions.",
    mechanism: "35Hz entrainment simultaneously engages multiple neural networks: the dorsal attention network (DAN) for focus, the ventral attention network (VAN) for salience detection, and the frontoparietal control network (FPCN) for executive function. This multi-network engagement creates a more comprehensive training effect than single-frequency protocols. The 35Hz frequency optimally drives parvalbumin interneurons in prefrontal cortex while also enhancing thalamocortical resonance, improving both cortical and subcortical function. The extended duration allows for consolidation of training effects - the brain has time to stabilize new oscillatory patterns. Research on long-duration gamma protocols shows cumulative increases in gamma power across the session, suggesting progressive recruitment of neural resources. This protocol also enhances default mode network (DMN) suppression, reducing mind-wandering and internal distraction.",
    expectedOutcomes: [
      "Comprehensive ADHD symptom reduction across all domains",
      "Improved sustained attention and concentration",
      "Reduced hyperactivity and physical restlessness",
      "Enhanced impulse control and decision-making",
      "Better working memory and mental organization",
      "Improved emotional regulation and frustration tolerance",
      "Enhanced academic or occupational performance",
      "Reduced procrastination and task initiation difficulties",
      "Better time perception and time management",
      "Improved sleep quality and circadian rhythm regulation",
      "Enhanced social functioning (reduced interrupting, better turn-taking)",
      "Long-term neuroplastic changes (measurable on qEEG after 40+ sessions)"
    ],
    instructions: [
      "Use daily for consistent results (minimum 5 days per week)",
      "Best practiced during peak symptom times (typically morning or early afternoon)",
      "Create a dedicated practice environment free from distractions",
      "Combine with active cognitive engagement for enhanced neuroplasticity",
      "Track symptoms using standardized ADHD rating scales weekly",
      "Expect initial results within 2-3 weeks, full benefits by 8-12 weeks",
      "May combine with low-dose stimulant medication (consult physician)",
      "Take breaks if mental fatigue occurs (pause and resume)",
      "Hydrate well before and after sessions",
      "Consider professional qEEG assessment before and after 20 sessions to measure brain changes",
      "Maintain consistent sleep schedule to maximize training effects",
      "Gradually increase from 20 to 40 minutes over first 2 weeks if new to protocol"
    ],
    researchReferences: [
      "Arns et al. (2020) - Neurofeedback and Attention-Deficit/Hyperactivity Disorder (ADHD) in Children: Rating the Evidence and Proposed Guidelines, Applied Psychophysiology and Biofeedback",
      "Cortese et al. (2016) - Neurofeedback for ADHD: A Systematic Review and Meta-Analysis, Journal of ADHD and Related Disorders",
      "Gevensleben et al. (2009) - Distinct EEG effects related to neurofeedback training in children with ADHD: A randomized controlled trial",
      "Micoulaud-Franchi et al. (2014) - EEG neurofeedback treatments in children with ADHD: an updated meta-analysis of randomized controlled trials",
      "Minder et al. (2018) - EEG Neurofeedback of Beta Sensorimotor Rhythm Does Not Contribute Synergistically to Effects of Methylphenidate on ADHD Symptoms"
    ],
    effectiveness: "Meta-analyses demonstrate 75-85% effectiveness for comprehensive ADHD symptom reduction with consistent use over 40+ sessions. Effects are sustained 6-12 months post-training and may be permanent with maintenance sessions. Comparable efficacy to stimulant medication for many individuals with superior long-term outcomes and minimal side effects."
  }
];

// ============================================================================
// TIMER PRESETS
// ============================================================================

export const TIMER_PRESETS: TimerPreset[] = [
  {
    id: "focus-session",
    name: "Focus Session (30 min)",
    duration: 30,
    frequencyProgression: "SMR → Low Beta → SMR",
    rationale: "This protocol follows the optimal arousal curve for sustained cognitive work. It begins with SMR (12-15Hz) to establish a calm-alert baseline, preventing anxiety while maintaining wakefulness. The middle phase transitions to low beta (15-18Hz) to enhance active cognitive processing during peak work. The final SMR phase prevents mental fatigue and maintains composure through task completion. This progression prevents the common pattern of starting anxious (excessive beta) or ending exhausted (theta intrusion).",
    neuralTarget: "Optimizes dorsolateral prefrontal cortex and anterior cingulate for executive function while maintaining thalamic gating to reduce distractions",
    stages: [
      {
        duration: 5,
        frequency: 12,
        phase: "Baseline Establishment",
        purpose: "SMR entrainment creates calm alertness, reducing pre-task anxiety and establishing attentional readiness without mental strain. Activates thalamic filtering."
      },
      {
        duration: 5,
        frequency: 14,
        phase: "Transition Phase",
        purpose: "Gradual upregulation maintains state stability while increasing cognitive arousal. Prevents jarring transitions that disrupt focus."
      },
      {
        duration: 15,
        frequency: 16,
        phase: "Peak Performance",
        purpose: "Low beta optimizes working memory, problem-solving, and sustained attention. This is the longest phase for maximum productivity during peak cognitive capacity."
      },
      {
        duration: 3,
        frequency: 14,
        phase: "Downregulation",
        purpose: "Prevents mental exhaustion and maintains cognitive resources. Reduces beta activity before final stabilization."
      },
      {
        duration: 2,
        frequency: 12,
        phase: "Completion & Stabilization",
        purpose: "Returns to SMR to consolidate work completed and prevent post-task mental fatigue. Prepares brain for smooth transition to next activity."
      }
    ],
    instructions: [
      "Use for cognitively demanding work (writing, coding, analysis, studying)",
      "Optimal for morning or early afternoon when cortisol naturally supports focus",
      "Combine with Pomodoro technique (30min work, 5min break)",
      "Prepare work materials before starting to maximize productive time",
      "Minimize environmental distractions (notifications off, door closed)",
      "Hydrate before session - dehydration impairs cognitive function",
      "Use full-spectrum lighting or natural light for optimal alertness",
      "Take notes during final SMR phase to capture insights before they fade",
      "If attention wavers, gently redirect without self-criticism",
      "Can be stacked (multiple 30min sessions with breaks) for extended work"
    ],
    bestTimeOfDay: "Morning (9-11 AM) or early afternoon (1-3 PM) when cortisol levels support focus. Avoid late evening as beta activity may interfere with sleep onset."
  },
  {
    id: "meditation",
    name: "Meditation (20 min)",
    duration: 20,
    frequencyProgression: "Alpha → Theta → Alpha",
    rationale: "This protocol guides the brain through the classic meditation trajectory from relaxed wakefulness into deeper meditative states. Beginning with alpha establishes the relaxed-yet-aware state characteristic of mindfulness. The theta phase allows access to deeper meditative absorption, enhanced imagery, and insight. Returning to alpha prevents excessive drowsiness while maintaining the meditative state. This arc mirrors the natural EEG progression observed in experienced meditators.",
    neuralTarget: "Enhances default mode network (DMN) connectivity for self-reflection while reducing activity in task-positive networks. Strengthens hippocampal-prefrontal coherence for memory integration and emotional processing.",
    stages: [
      {
        duration: 5,
        frequency: 10,
        phase: "Entry & Relaxation",
        purpose: "Alpha induction quiets mental chatter and activates the parasympathetic nervous system. Establishes the foundation for deeper states. Reduces cortical activation."
      },
      {
        duration: 3,
        frequency: 8,
        phase: "Deepening",
        purpose: "Transition from alpha to theta opens the gateway to deeper consciousness. High-alpha/low-theta represents the hypnagogic boundary - ideal for insight and creativity."
      },
      {
        duration: 7,
        frequency: 6,
        phase: "Deep Meditation",
        purpose: "Theta entrainment facilitates access to unconscious material, enhanced visualization, emotional processing, and the profound stillness characteristic of advanced meditation."
      },
      {
        duration: 3,
        frequency: 8,
        phase: "Integration",
        purpose: "Gradual emergence from deep theta prevents disorientation. This phase allows integration of meditative insights while beginning to return to waking consciousness."
      },
      {
        duration: 2,
        frequency: 10,
        phase: "Grounding & Completion",
        purpose: "Return to alpha grounds the experience in waking awareness. Prevents grogginess while maintaining meditative calm. Prepares for smooth transition to activity."
      }
    ],
    instructions: [
      "Sit in comfortable meditation posture (chair or cushion with straight spine)",
      "Use in conjunction with meditation technique (breath focus, body scan, open awareness)",
      "Optimal for morning meditation or pre-sleep relaxation",
      "Dim lighting enhances alpha/theta generation",
      "Eyes-closed throughout session for maximum effect",
      "If thoughts arise, gently return attention to breath or present moment",
      "Allow spontaneous imagery during theta phase without attachment",
      "Journal immediately after session to capture insights",
      "Particularly effective for emotional processing and trauma integration",
      "Combines synergistically with mindfulness-based stress reduction (MBSR)"
    ],
    bestTimeOfDay: "Early morning (5-7 AM) for spiritual practice, or evening (7-9 PM) for relaxation and emotional processing. Avoid immediately after meals when digestion draws energy."
  },
  {
    id: "sleep-induction",
    name: "Sleep Induction (60 min)",
    duration: 60,
    frequencyProgression: "Alpha → Theta → Delta",
    rationale: "This protocol replicates the natural sleep onset architecture, guiding the brain through the physiological stages of falling asleep. Extended alpha phase addresses common sleep-onset issues (racing thoughts, anxiety). Gradual theta induction mimics the hypnagogic transition. The extended delta phase induces deep slow-wave sleep. The protocol is specifically timed to complete one full sleep cycle (90 minutes including REM) if continued naturally after entrainment ends.",
    neuralTarget: "Suppresses arousal systems (locus coeruleus, basal forebrain) while activating sleep-promoting nuclei (ventrolateral preoptic nucleus). Enhances thalamocortical synchronization for slow-wave generation.",
    stages: [
      {
        duration: 15,
        frequency: 10,
        phase: "Pre-Sleep Relaxation",
        purpose: "Extended alpha phase quiets the default mode network's rumination circuits. Reduces cortisol and activates parasympathetic tone. Addresses anxiety-related sleep-onset insomnia."
      },
      {
        duration: 10,
        frequency: 8,
        phase: "Drowsiness Induction",
        purpose: "High-alpha/low-theta replicates the drowsy state preceding sleep. Reduces muscle tension and heart rate. Begins suppression of wake-promoting orexin neurons."
      },
      {
        duration: 15,
        frequency: 6,
        phase: "Sleep Onset (N1/N2)",
        purpose: "Theta entrainment corresponds to NREM Stage 1 and early Stage 2 sleep. Consciousness begins to fragment. Hypnagogic imagery emerges. Core body temperature drops."
      },
      {
        duration: 10,
        frequency: 3,
        phase: "Deepening (N2/N3)",
        purpose: "Transition from theta to delta marks entry into slow-wave sleep. Sleep spindles and K-complexes emerge. Arousal threshold increases significantly."
      },
      {
        duration: 10,
        frequency: 1.5,
        phase: "Deep Sleep (N3)",
        purpose: "Deep delta corresponds to Stage 3 NREM - the most restorative sleep phase. Growth hormone release, glymphatic clearance, and synaptic downscaling occur maximally."
      }
    ],
    instructions: [
      "Begin protocol 30-60 minutes before desired sleep time",
      "Use in bed with lights off, lying in sleep position",
      "Set volume low enough to be barely audible",
      "Use sleep timer to turn off device after protocol ends",
      "Avoid screens 1 hour before protocol (blue light suppresses melatonin)",
      "Cool room temperature (65-68°F / 18-20°C) optimizes sleep",
      "Complete bladder emptying before session to prevent disruption",
      "If still awake at end, continue lying still - sleep will follow naturally",
      "Do NOT use while driving or operating machinery",
      "Combine with sleep hygiene: consistent schedule, dark room, white noise",
      "Particularly effective for insomnia, jet lag, shift work recovery",
      "Discontinue if nightmares or night terrors occur"
    ],
    bestTimeOfDay: "Evening, beginning 30-60 minutes before desired sleep time. Aligns with natural melatonin release window (typically 9-11 PM). Effectiveness reduced if used too early (before 8 PM)."
  },
  {
    id: "lucid-dreaming",
    name: "Lucid Dreaming (45 min)",
    duration: 45,
    frequencyProgression: "Theta → Low Gamma → Theta",
    rationale: "Lucid dreaming requires a paradoxical brain state: theta-dominant (dreaming) with gamma activity (metacognitive awareness). This protocol induces deep theta to facilitate REM onset, then introduces 40Hz gamma pulses to 'wake up' prefrontal cortex while maintaining the dream state. The final theta phase allows continued dreaming with enhanced lucidity. Timing aligns with REM cycles - best used during late-night/early-morning sleep when REM is longest.",
    neuralTarget: "Activates prefrontal cortex (dorsolateral and anterior regions) during REM sleep while maintaining hippocampal theta. Creates the hybrid state of consciousness characteristic of lucid dreaming.",
    stages: [
      {
        duration: 15,
        frequency: 6,
        phase: "REM Induction",
        purpose: "Deep theta facilitates entry into REM sleep. Mimics the natural theta dominant during dreaming. Allows dream narrative to establish before introducing lucidity triggers."
      },
      {
        duration: 5,
        frequency: 4.5,
        phase: "Dream Stabilization",
        purpose: "Low-theta/high-delta marks deep REM. Dream imagery becomes vivid and immersive. This stable dream state provides the foundation for lucidity induction."
      },
      {
        duration: 10,
        frequency: 40,
        phase: "Lucidity Trigger",
        purpose: "40Hz gamma pulses activate prefrontal regions responsible for self-awareness and metacognition. This creates the 'wake-up' moment within the dream - the realization 'I am dreaming'."
      },
      {
        duration: 10,
        frequency: 6,
        phase: "Lucid Dream Maintenance",
        purpose: "Return to theta maintains the dream state while allowing continued prefrontal engagement. This is the lucid dreaming period where conscious control of dreams is possible."
      },
      {
        duration: 5,
        frequency: 8,
        phase: "Dream Recall Enhancement",
        purpose: "Rising to high-theta/low-alpha prepares for awakening while enhancing dream memory consolidation. This phase maximizes dream recall upon waking."
      }
    ],
    instructions: [
      "Use during late-night sleep (4-7 AM) when REM periods are longest",
      "Set alarm for 4-5 hours after sleep onset, stay awake 30 min, then use protocol",
      "Practice reality testing during day (check hands, try to push finger through palm)",
      "Keep dream journal and write immediately upon waking",
      "Set intention before sleep: 'I will realize I am dreaming'",
      "Combine with MILD technique (Mnemonic Induction of Lucid Dreams)",
      "Use sleep mask with built-in lights for enhanced lucidity triggers",
      "Practice stabilization techniques: rubbing hands, spinning, examining environment",
      "Start with goal of brief lucidity before attempting dream control",
      "Avoid if nightmares or sleep paralysis is common",
      "Effectiveness increases dramatically with consistent practice (4+ weeks)"
    ],
    bestTimeOfDay: "Early morning (4-7 AM) during natural REM windows. Use after 'wake-back-to-bed' (WBTB) method: wake after 4-5 hours of sleep, stay awake 20-30 minutes, then use protocol while returning to sleep."
  },
  {
    id: "obe-protocol",
    name: "OBE Protocol (75 min)",
    duration: 75,
    frequencyProgression: "Theta → Theta-Gamma Coupling → Deep Theta",
    rationale: "Out-of-body experiences (OBEs) represent an altered state where consciousness appears to separate from the physical body. Neuroscience research suggests OBEs involve disrupted integration between vestibular, proprioceptive, and visual systems combined with enhanced temporoparietal junction (TPJ) activity. This extended protocol induces the deep theta state conducive to dissociative experiences while incorporating gamma bursts that may facilitate the TPJ activation associated with autoscopic phenomena. The prolonged duration allows for deep trance states where spontaneous OBEs are more likely.",
    neuralTarget: "Disrupts normal body schema integration in temporoparietal junction and posterior parietal cortex while maintaining heightened awareness through theta-gamma coupling. Enhances default mode network while suppressing sensorimotor integration.",
    stages: [
      {
        duration: 20,
        frequency: 6,
        phase: "Deep Relaxation & Body Dissociation",
        purpose: "Extended theta induction quiets sensorimotor cortex and reduces proprioceptive integration. The body begins to feel distant or numb - the first step toward dissociation."
      },
      {
        duration: 15,
        frequency: 5,
        phase: "Trance Deepening",
        purpose: "Deep theta (5Hz) corresponds to the hypnagogic borderland. Consciousness loosens from body schema. Vibrational sensations and auditory phenomena may emerge."
      },
      {
        duration: 20,
        frequency: 40,
        phase: "Consciousness Expansion (Theta-Gamma Coupling)",
        purpose: "40Hz gamma pulses create heightened awareness within the theta trance state. This paradoxical combination may trigger temporoparietal junction activation and autoscopic experiences."
      },
      {
        duration: 15,
        frequency: 4,
        phase: "Liminal Exploration",
        purpose: "Deep theta allows exploration of the dissociated state. This is the window where OBEs, astral projection, or profound visionary experiences are most likely to occur."
      },
      {
        duration: 5,
        frequency: 8,
        phase: "Re-integration & Grounding",
        purpose: "Gradual return to alpha/theta boundary. Reintegration of body awareness. Memory consolidation of the experience. Prevents disorientation upon full awakening."
      }
    ],
    instructions: [
      "Use only when experienced with altered states (meditation, lucid dreaming)",
      "Practice during early morning (4-6 AM) in deeply relaxed state",
      "Lie flat on back in comfortable position (avoid falling asleep)",
      "Use 'notching' technique: deep relaxation while maintaining thread of awareness",
      "Visualize rising, floating, or rolling out of body during gamma phase",
      "Expect vibrational sensations, auditory phenomena, or sleep paralysis (normal)",
      "Remain calm if frightening sensations occur - they cannot harm you",
      "Practice energetic protection visualization before session",
      "Journal experience immediately upon completion",
      "NOT recommended for individuals with psychotic disorders or severe dissociation",
      "Discontinue if experiences become disturbing or interfere with daily life",
      "Success rate increases dramatically with consistent practice over months"
    ],
    bestTimeOfDay: "Early morning (4-6 AM) after natural awakening from REM sleep. The hypnopompic state (waking from sleep) is more conducive to OBEs than sleep onset. Avoid during evening or when sleep-deprived."
  }
];

// ============================================================================
// BEST PRACTICES
// ============================================================================

export const BEST_PRACTICES: BestPractice[] = [
  {
    category: "Session Duration",
    title: "Why 15-30 Minutes is Optimal",
    description: "Most neurofeedback and brainwave entrainment protocols use 15-30 minute sessions as the sweet spot for neuroplastic change without mental fatigue.",
    scientificRationale: "Neuroplasticity - the brain's ability to rewire itself - requires sustained but not excessive stimulation. Research on long-term potentiation (LTP), the cellular mechanism of learning, shows that repeated stimulation over 15-20 minutes induces maximal synaptic strengthening. Sessions shorter than 10 minutes provide insufficient time for oscillatory entrainment and neural adaptation. Sessions longer than 40 minutes risk mental fatigue, which triggers theta/delta intrusion and reduces training effectiveness. The 20-minute mark appears optimal for most individuals, balancing adequate training time with maintained engagement. Extended sessions (40-60 minutes) are reserved for deep meditative states or sleep induction where fatigue is desired.",
    implementation: [
      "Beginners: Start with 10-15 minute sessions and gradually increase",
      "Standard protocols: 20-30 minutes for focus, attention, and cognitive training",
      "Extended protocols: 40-60 minutes for meditation, sleep, altered states only",
      "Multiple short sessions are more effective than single marathon sessions",
      "Take 5-10 minute breaks between sessions if doing multiple per day",
      "Track mental fatigue - if focus degrades during session, it's too long",
      "Consistency matters more than duration - daily 15min > weekly 60min"
    ]
  },
  {
    category: "Equipment",
    title: "Headphone Requirements for Binaural Beats",
    description: "Binaural beats require stereo headphones to deliver different frequencies to each ear. Speakers, earbuds, or mono headphones will NOT produce the binaural effect.",
    scientificRationale: "Binaural beats exploit the brain's frequency-following response by presenting two slightly different frequencies to each ear (e.g., 140Hz left, 150Hz right). The brainstem's superior olivary complex detects this difference and generates a phantom 'beat' at the difference frequency (10Hz). This beat doesn't exist in the external world - it's created by neural processing. This ONLY works when each ear receives an isolated frequency, requiring stereo separation. Over-ear headphones provide best isolation. In-ear monitors work if they seal well. Speakers create channel mixing, preventing the binaural effect. Bone conduction headphones may work but are less studied. Frequency accuracy matters - cheap headphones with poor bass response (<100Hz) may distort low carrier frequencies.",
    implementation: [
      "Use over-ear or in-ear stereo headphones (NOT speakers or mono)",
      "Ensure left/right channels are correct (test with stereo audio test)",
      "Choose headphones with frequency response: 20Hz-20kHz (full range)",
      "Noise-canceling headphones enhance effect by reducing environmental interference",
      "Volume should be comfortable - loudness doesn't increase effectiveness",
      "Avoid Bluetooth if possible (may introduce latency/compression artifacts)",
      "Clean headphones regularly to prevent ear infections during extended use",
      "For spatial/8D effects, high-quality headphones with good soundstage are essential"
    ],
    warnings: [
      "Ensure stereo configuration - reversed channels (L/R swap) will still work but may feel odd",
      "Very cheap headphones may distort frequencies and reduce effectiveness",
      "Hearing damage risk: never exceed comfortable volume levels"
    ]
  },
  {
    category: "Consistency",
    title: "Importance of Daily Practice for Neuroplasticity",
    description: "Brainwave entrainment and neurofeedback are training modalities, not acute interventions. Consistent daily practice for 4-8 weeks is required to see sustained benefits.",
    scientificRationale: "Neuroplasticity follows Hebbian learning: 'neurons that fire together, wire together.' Each training session strengthens specific neural circuits, but consolidation occurs between sessions during sleep. Research on neurofeedback shows that benefits emerge gradually: initial state changes (temporary alterations during/after sessions) appear within 1-2 weeks, while trait changes (permanent baseline EEG modifications) require 20-40 sessions. The brain needs repeated exposure to learn new oscillatory patterns. Sporadic use provides temporary state shifts but no lasting rewiring. Daily practice (or minimum 5x/week) maintains training momentum. After initial training period (8-12 weeks), maintenance sessions (2-3x/week) sustain benefits. Complete cessation may lead to regression, though benefits typically persist longer than the training period.",
    implementation: [
      "Commit to daily practice for minimum 4 weeks before evaluating effectiveness",
      "Schedule sessions at consistent time of day (builds habit, optimizes circadian timing)",
      "Track practice in journal or app to maintain accountability",
      "Expect initial results within 2-3 weeks (better focus, sleep, mood)",
      "Full benefits emerge at 8-12 weeks (measurable EEG changes, stable symptom improvement)",
      "After 12 weeks, reduce to 3-4x/week maintenance to sustain benefits",
      "If benefits plateau, consider increasing session duration or trying different frequencies",
      "Pair with complementary practices (exercise, meditation, therapy) for synergistic effects",
      "Missing 1-2 days won't derail progress, but frequent gaps reduce effectiveness"
    ]
  },
  {
    category: "Integration",
    title: "Journaling Benefits for Tracking Progress",
    description: "Subjective tracking through journaling provides crucial feedback for optimizing protocols and recognizing subtle improvements that might otherwise go unnoticed.",
    scientificRationale: "Placebo-controlled neurofeedback studies show that participants often don't consciously notice improvements until reviewing retrospective data. Gradual neuroplastic changes occur below the threshold of daily awareness - like watching a child grow (invisible day-to-day but obvious over months). Journaling creates objective records of subjective states, revealing patterns and trends. Research on therapeutic journaling shows that the act of writing itself enhances emotional regulation and metacognitive awareness. In ADHD populations, journaling provides external memory support, compensating for impaired working memory. Tracking both quantitative metrics (focus duration, sleep quality ratings) and qualitative observations (mood, energy, insights) creates a comprehensive feedback loop for protocol optimization.",
    implementation: [
      "Journal immediately after each session while experience is fresh",
      "Track: date, time, protocol used, duration, subjective state before/after",
      "Rate key variables on 1-10 scales (focus, anxiety, energy, mood)",
      "Note any unusual experiences (imagery, emotions, physical sensations)",
      "Record sleep quality the night after sessions (many protocols affect sleep)",
      "Weekly review: look for patterns, trends, and correlations",
      "Monthly assessment: compare current state to baseline (first week of journaling)",
      "Share journal with therapist/coach if working with professional guidance",
      "Use structured templates or apps designed for neurofeedback tracking",
      "Photos/videos of yourself can reveal posture/tension changes you don't notice"
    ]
  },
  {
    category: "Safety",
    title: "Contraindications and Safety Guidelines",
    description: "While brainwave entrainment is generally safe, certain medical conditions warrant caution or absolute avoidance. Always consult healthcare providers if you have neurological or psychiatric conditions.",
    scientificRationale: "Photosensitive epilepsy affects 3-5% of epileptics, where rhythmic visual or auditory stimulation can trigger seizures. Frequencies in the 15-25Hz range are most epileptogenic, but individual sensitivity varies. Binaural beats are generally safer than photic (light) stimulation, but case reports exist of seizures triggered by auditory rhythmic stimulation. Pregnancy contraindications stem from limited safety data, not known harm - the precautionary principle applies. Individuals with psychotic disorders may experience exacerbation of symptoms with theta/delta induction (increased dissociation, hallucinations). Pacemakers and neural implants could theoretically be affected by electromagnetic fields, though binaural beats (auditory) pose less risk than transcranial stimulation devices. Bipolar disorder requires caution as excessive relaxation protocols may trigger depressive episodes while stimulating protocols may induce mania.",
    implementation: [
      "ABSOLUTE CONTRAINDICATIONS: active epilepsy, photosensitive seizure disorder, recent severe head trauma",
      "MEDICAL CONSULTATION REQUIRED: pregnancy, pacemaker/neural implants, psychotic disorders, bipolar disorder, severe PTSD",
      "USE WITH CAUTION: depression (avoid excessive delta/theta), anxiety disorders (avoid high beta), dissociative disorders (avoid deep theta)",
      "Start with short sessions (10 minutes) and low intensities to assess tolerance",
      "Discontinue immediately if: seizure symptoms, severe headache, dizziness, chest pain, panic, dissociation",
      "Never use while driving, operating machinery, or during activities requiring alertness",
      "Avoid use under influence of alcohol or recreational drugs (unpredictable interactions)",
      "Children under 12 should only use under professional supervision",
      "If taking psychoactive medications (antidepressants, antipsychotics, stimulants), consult prescriber",
      "Disclose neurofeedback/entrainment use to all treating healthcare providers"
    ],
    warnings: [
      "DO NOT use as substitute for prescribed medications without physician approval",
      "Suicidal ideation or severe depression requires immediate professional help, not self-treatment",
      "If symptoms worsen consistently with use, discontinue and seek professional evaluation",
      "Some individuals are 'non-responders' or experience paradoxical effects - this is normal variance"
    ]
  },
  {
    category: "Optimization",
    title: "Environmental and Lifestyle Factors",
    description: "The effectiveness of brainwave entrainment is significantly enhanced by optimizing complementary factors: sleep, hydration, nutrition, exercise, and environmental conditions.",
    scientificRationale: "The brain's capacity for entrainment and neuroplasticity is state-dependent. Sleep deprivation reduces neuroplasticity by 40-60% and impairs neurofeedback learning. Dehydration of just 2% body weight impairs cognitive performance and reduces EEG coherence. Nutritional deficiencies (omega-3, B vitamins, magnesium) compromise neural membrane function and neurotransmitter synthesis. Regular aerobic exercise increases BDNF (brain-derived neurotrophic factor), the primary neuroplasticity signal, by 200-300%. Environmental noise disrupts entrainment by forcing the brain to process competing auditory information. Circadian timing matters - cortisol peaks in morning (optimal for beta/gamma), melatonin rises in evening (optimal for theta/delta). Temperature affects arousal - cool environments promote alertness, warm environments relaxation.",
    implementation: [
      "SLEEP: Aim for 7-9 hours nightly; schedule sessions when well-rested, not sleep-deprived",
      "HYDRATION: Drink 8-16oz water 30 minutes before sessions; maintain baseline hydration",
      "NUTRITION: Eat balanced meals 1-2 hours before (not immediately before); consider omega-3 supplementation",
      "EXERCISE: Practice 30-60 minutes after aerobic exercise for enhanced neuroplasticity window",
      "ENVIRONMENT: Quiet room, comfortable temperature (68-72°F), dim lighting for relaxation protocols",
      "TIMING: Morning for focus/beta protocols, evening for relaxation/sleep protocols, afternoon for meditation",
      "POSTURE: Upright seated for alertness protocols, reclined for relaxation, lying down for sleep only",
      "BREATH: Slow nasal breathing enhances parasympathetic tone and deepens entrainment",
      "CAFFEINE: Avoid 4-6 hours before relaxation protocols; acceptable before focus protocols",
      "SCREENS: Avoid blue light 1 hour before theta/delta protocols (disrupts melatonin)"
    ]
  }
];

// ============================================================================
// ADDITIONAL REFERENCE DATA
// ============================================================================

export const RESEARCH_HIGHLIGHTS = {
  mit40Hz: {
    title: "MIT 40Hz Gamma Research (Tsai Lab)",
    summary: "Groundbreaking research from MIT's Picower Institute demonstrated that 40Hz sensory stimulation (auditory and visual) reduces amyloid plaques and tau tangles in mouse models of Alzheimer's disease. The mechanism involves activation of microglia (brain immune cells) at 40Hz, which enhances clearance of neurodegenerative proteins. Human trials are ongoing.",
    citation: "Iaccarino et al. (2016). Gamma frequency entrainment attenuates amyloid load and modifies microglia. Nature, 540(7632), 230-235.",
    implications: "40Hz may be neuroprotective and cognitive-enhancing beyond ADHD applications. Daily 40Hz exposure may represent a preventive strategy for neurodegenerative diseases."
  },
  stermanSMR: {
    title: "Barry Sterman's SMR Neurofeedback Research",
    summary: "In the 1960s-70s, Barry Sterman discovered that training cats to produce 12-15Hz sensorimotor rhythm made them resistant to epileptic seizures. This led to SMR neurofeedback for human epilepsy, showing 70% seizure reduction in responders. Later research demonstrated SMR training improves attention in ADHD, reduces anxiety, and enhances sleep.",
    citation: "Sterman, M.B. (2000). Basic concepts and clinical findings in the treatment of seizure disorders with EEG operant conditioning. Clinical Electroencephalography, 31(1), 45-55.",
    implications: "SMR represents a unique brain state of calm focus - physically relaxed yet mentally alert. It may be the optimal target for conditions involving hyperarousal (anxiety) and disinhibition (ADHD, epilepsy)."
  },
  defaultModeNetwork: {
    title: "Default Mode Network and Alpha Waves",
    summary: "The Default Mode Network (DMN) is a large-scale brain network active during rest and self-referential thinking. DMN hubs (posterior cingulate, medial prefrontal cortex) show dominant alpha activity. Excessive DMN activity correlates with rumination and depression. Meditation practices that enhance alpha coherence appear to optimize DMN function.",
    citation: "Raichle, M.E. (2015). The brain's default mode network. Annual Review of Neuroscience, 38, 433-447.",
    implications: "Alpha training may optimize the balance between DMN (internal focus) and task-positive networks (external focus), improving both introspective capacity and focused attention."
  },
  thetaGammaCoupling: {
    title: "Theta-Gamma Coupling and Memory",
    summary: "Research by György Buzsáki and colleagues revealed that gamma oscillations (40-100Hz) are nested within slower theta cycles (4-8Hz). Different items in working memory are encoded in different gamma cycles within a theta wave. This cross-frequency coupling coordinates memory encoding, retrieval, and the integration of new information with existing knowledge.",
    citation: "Lisman, J.E., & Jensen, O. (2013). The theta-gamma neural code. Neuron, 77(6), 1002-1016.",
    implications: "Protocols combining theta and gamma (like the lucid dreaming and OBE protocols) may enhance memory, creativity, and the integration of unconscious and conscious processing."
  },
  sleepDelta: {
    title: "Delta Waves and Sleep Architecture",
    summary: "Slow-wave sleep (SWS), characterized by delta oscillations (0.5-4Hz), is the deepest and most restorative sleep stage. During SWS, the glymphatic system clears metabolic waste (including amyloid-beta), growth hormone peaks, and synaptic downscaling occurs (pruning weak connections). Declining delta sleep with age correlates with cognitive decline.",
    citation: "Xie, L., et al. (2013). Sleep drives metabolite clearance from the adult brain. Science, 342(6156), 373-377.",
    implications: "Delta entrainment for sleep may provide preventive benefits against neurodegenerative diseases by enhancing nightly brain 'cleaning'. Quality of delta sleep may be more important than sleep quantity."
  }
};

export const FREQUENCY_SELECTION_GUIDE = {
  description: "Quick reference for choosing optimal frequencies based on goals",
  goals: {
    "Deep Sleep & Recovery": ["Delta (0.5-4Hz)", "Sleep Induction Protocol"],
    "Meditation & Insight": ["Theta (4-8Hz)", "Alpha (8-13Hz)", "Meditation Protocol"],
    "Stress Relief": ["Alpha (8-13Hz)", "SMR (12-15Hz)"],
    "ADHD - Focus": ["SMR (12-15Hz)", "40Hz Gamma", "ADHD Focus Enhancement"],
    "ADHD - Hyperactivity": ["SMR (12-15Hz)", "25Hz Low Gamma", "ADHD Hyperactivity Control"],
    "ADHD - Combined": ["35Hz Gamma", "ADHD Combined Protocol"],
    "Cognitive Performance": ["Low Beta (13-18Hz)", "40Hz Gamma", "Focus Session"],
    "Creativity": ["Theta (4-8Hz)", "Alpha (8-13Hz)"],
    "Lucid Dreaming": ["Theta + 40Hz Gamma", "Lucid Dreaming Protocol"],
    "Anxiety Reduction": ["Alpha (8-13Hz)", "SMR (12-15Hz)"],
    "Pain Management": ["Alpha (8-13Hz)", "Theta (4-8Hz)"],
    "Neuroprotection": ["40Hz Gamma (MIT protocol)"],
    "Peak Performance (Athletic/Musical)": ["SMR (12-15Hz)", "Low Beta (13-18Hz)"]
  }
};

// Export all data as a combined guide object
export const EBL_GUIDE = {
  frequencyRanges: FREQUENCY_RANGES,
  adhdProtocols: ADHD_PROTOCOLS,
  timerPresets: TIMER_PRESETS,
  bestPractices: BEST_PRACTICES,
  researchHighlights: RESEARCH_HIGHLIGHTS,
  frequencySelectionGuide: FREQUENCY_SELECTION_GUIDE,
  version: "1.0.0",
  lastUpdated: "2025-11-28"
};

export default EBL_GUIDE;
