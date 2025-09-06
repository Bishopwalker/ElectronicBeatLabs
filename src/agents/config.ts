/**
 * TypeScript Guardian Configuration
 * Configuration profiles for different project types and environments
 */

export interface GuardianRuleConfig {
  enabled: boolean;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  autoFix?: boolean;
  customMessage?: string;
}

export interface GuardianProjectConfig {
  name: string;
  rules: {
    // React-specific rules
    reactHookDependencies: GuardianRuleConfig;
    reactEventHandlerTypes: GuardianRuleConfig;
    reactStateInitialization: GuardianRuleConfig;
    reactMemoization: GuardianRuleConfig;
    reactRefTypes: GuardianRuleConfig;

    // Audio/WebAPI specific rules
    audioContextErrorHandling: GuardianRuleConfig;
    audioResourceCleanup: GuardianRuleConfig;
    audioNodeChaining: GuardianRuleConfig;
    audioCalculationPrecision: GuardianRuleConfig;
    webAudioCompatibility: GuardianRuleConfig;

    // TypeScript general rules
    strictNullChecks: GuardianRuleConfig;
    noImplicitAny: GuardianRuleConfig;
    propertyAccessSafety: GuardianRuleConfig;
    unionTypeNarrowing: GuardianRuleConfig;
    discriminatedUnions: GuardianRuleConfig;

    // Performance rules
    expensiveTypeAssertions: GuardianRuleConfig;
    renderLoopOptimization: GuardianRuleConfig;
    complexTypeInference: GuardianRuleConfig;
    unnecessaryRecomputation: GuardianRuleConfig;

    // State management rules
    stateUpdatePatterns: GuardianRuleConfig;
    immutabilityPatterns: GuardianRuleConfig;
    stateNormalization: GuardianRuleConfig;
  };
  ignorePatterns: string[];
  includePaths: string[];
  customChecks: string[];
}

// Preset configurations

export const AUDIO_APP_CONFIG: GuardianProjectConfig = {
  name: 'Audio/Visualization Application',
  rules: {
    // React rules - High priority for audio apps
    reactHookDependencies: { enabled: true, severity: 'High' },
    reactEventHandlerTypes: { enabled: true, severity: 'Medium' },
    reactStateInitialization: { enabled: true, severity: 'High' },
    reactMemoization: { enabled: true, severity: 'Medium' },
    reactRefTypes: { enabled: true, severity: 'Medium' },

    // Audio rules - Critical for audio applications
    audioContextErrorHandling: { enabled: true, severity: 'Critical' },
    audioResourceCleanup: { enabled: true, severity: 'High' },
    audioNodeChaining: { enabled: true, severity: 'High' },
    audioCalculationPrecision: { enabled: true, severity: 'High' },
    webAudioCompatibility: { enabled: true, severity: 'Critical' },

    // TypeScript rules - Standard strictness
    strictNullChecks: { enabled: true, severity: 'High' },
    noImplicitAny: { enabled: true, severity: 'Medium' },
    propertyAccessSafety: { enabled: true, severity: 'High' },
    unionTypeNarrowing: { enabled: true, severity: 'Medium' },
    discriminatedUnions: { enabled: true, severity: 'Medium' },

    // Performance rules - Important for real-time audio
    expensiveTypeAssertions: { enabled: true, severity: 'High' },
    renderLoopOptimization: { enabled: true, severity: 'High' },
    complexTypeInference: { enabled: true, severity: 'Medium' },
    unnecessaryRecomputation: { enabled: true, severity: 'Medium' },

    // State management rules - Important for complex audio state
    stateUpdatePatterns: { enabled: true, severity: 'Medium' },
    immutabilityPatterns: { enabled: true, severity: 'Medium' },
    stateNormalization: { enabled: true, severity: 'Low' }
  },
  ignorePatterns: [
    'node_modules/**',
    '**/*.test.ts',
    '**/*.test.tsx',
    'build/**',
    'dist/**',
    'coverage/**'
  ],
  includePaths: [
    'src/**/*.ts',
    'src/**/*.tsx'
  ],
  customChecks: [
    'electromagnetic-field-validation',
    'binaural-beat-frequency-validation',
    'audio-buffer-management'
  ]
};

export const STRICT_CONFIG: GuardianProjectConfig = {
  name: 'Strict TypeScript',
  rules: {
    // All React rules enabled with high severity
    reactHookDependencies: { enabled: true, severity: 'Critical' },
    reactEventHandlerTypes: { enabled: true, severity: 'High' },
    reactStateInitialization: { enabled: true, severity: 'Critical' },
    reactMemoization: { enabled: true, severity: 'High' },
    reactRefTypes: { enabled: true, severity: 'High' },

    // All audio rules enabled with critical severity
    audioContextErrorHandling: { enabled: true, severity: 'Critical' },
    audioResourceCleanup: { enabled: true, severity: 'Critical' },
    audioNodeChaining: { enabled: true, severity: 'Critical' },
    audioCalculationPrecision: { enabled: true, severity: 'Critical' },
    webAudioCompatibility: { enabled: true, severity: 'Critical' },

    // Strict TypeScript rules
    strictNullChecks: { enabled: true, severity: 'Critical' },
    noImplicitAny: { enabled: true, severity: 'Critical' },
    propertyAccessSafety: { enabled: true, severity: 'Critical' },
    unionTypeNarrowing: { enabled: true, severity: 'High' },
    discriminatedUnions: { enabled: true, severity: 'High' },

    // Strict performance rules
    expensiveTypeAssertions: { enabled: true, severity: 'Critical' },
    renderLoopOptimization: { enabled: true, severity: 'Critical' },
    complexTypeInference: { enabled: true, severity: 'High' },
    unnecessaryRecomputation: { enabled: true, severity: 'High' },

    // Strict state management rules
    stateUpdatePatterns: { enabled: true, severity: 'High' },
    immutabilityPatterns: { enabled: true, severity: 'High' },
    stateNormalization: { enabled: true, severity: 'Medium' }
  },
  ignorePatterns: [
    'node_modules/**'
  ],
  includePaths: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '**/*.test.ts',
    '**/*.test.tsx'
  ],
  customChecks: []
};

export const DEVELOPMENT_CONFIG: GuardianProjectConfig = {
  name: 'Development Friendly',
  rules: {
    // Relaxed React rules for development
    reactHookDependencies: { enabled: true, severity: 'Medium' },
    reactEventHandlerTypes: { enabled: true, severity: 'Low' },
    reactStateInitialization: { enabled: true, severity: 'Medium' },
    reactMemoization: { enabled: false, severity: 'Low' },
    reactRefTypes: { enabled: true, severity: 'Low' },

    // Audio rules still important but less strict
    audioContextErrorHandling: { enabled: true, severity: 'High' },
    audioResourceCleanup: { enabled: true, severity: 'Medium' },
    audioNodeChaining: { enabled: true, severity: 'Medium' },
    audioCalculationPrecision: { enabled: true, severity: 'Medium' },
    webAudioCompatibility: { enabled: true, severity: 'High' },

    // Relaxed TypeScript rules
    strictNullChecks: { enabled: true, severity: 'Medium' },
    noImplicitAny: { enabled: false, severity: 'Low' },
    propertyAccessSafety: { enabled: true, severity: 'Medium' },
    unionTypeNarrowing: { enabled: true, severity: 'Low' },
    discriminatedUnions: { enabled: true, severity: 'Low' },

    // Performance rules less strict during development
    expensiveTypeAssertions: { enabled: true, severity: 'Low' },
    renderLoopOptimization: { enabled: false, severity: 'Low' },
    complexTypeInference: { enabled: false, severity: 'Low' },
    unnecessaryRecomputation: { enabled: false, severity: 'Low' },

    // Relaxed state management rules
    stateUpdatePatterns: { enabled: true, severity: 'Low' },
    immutabilityPatterns: { enabled: false, severity: 'Low' },
    stateNormalization: { enabled: false, severity: 'Low' }
  },
  ignorePatterns: [
    'node_modules/**',
    '**/*.test.ts',
    '**/*.test.tsx',
    'build/**',
    'dist/**',
    'coverage/**',
    '**/*.stories.ts',
    '**/*.stories.tsx'
  ],
  includePaths: [
    'src/**/*.ts',
    'src/**/*.tsx'
  ],
  customChecks: []
};

export const PRODUCTION_CONFIG: GuardianProjectConfig = {
  name: 'Production Ready',
  rules: {
    // Production React rules - very strict
    reactHookDependencies: { enabled: true, severity: 'Critical' },
    reactEventHandlerTypes: { enabled: true, severity: 'High' },
    reactStateInitialization: { enabled: true, severity: 'Critical' },
    reactMemoization: { enabled: true, severity: 'High' },
    reactRefTypes: { enabled: true, severity: 'High' },

    // Production audio rules - critical
    audioContextErrorHandling: { enabled: true, severity: 'Critical' },
    audioResourceCleanup: { enabled: true, severity: 'Critical' },
    audioNodeChaining: { enabled: true, severity: 'Critical' },
    audioCalculationPrecision: { enabled: true, severity: 'Critical' },
    webAudioCompatibility: { enabled: true, severity: 'Critical' },

    // Production TypeScript rules
    strictNullChecks: { enabled: true, severity: 'Critical' },
    noImplicitAny: { enabled: true, severity: 'High' },
    propertyAccessSafety: { enabled: true, severity: 'Critical' },
    unionTypeNarrowing: { enabled: true, severity: 'High' },
    discriminatedUnions: { enabled: true, severity: 'High' },

    // Production performance rules - critical
    expensiveTypeAssertions: { enabled: true, severity: 'Critical' },
    renderLoopOptimization: { enabled: true, severity: 'Critical' },
    complexTypeInference: { enabled: true, severity: 'High' },
    unnecessaryRecomputation: { enabled: true, severity: 'Critical' },

    // Production state management rules
    stateUpdatePatterns: { enabled: true, severity: 'High' },
    immutabilityPatterns: { enabled: true, severity: 'High' },
    stateNormalization: { enabled: true, severity: 'Medium' }
  },
  ignorePatterns: [
    'node_modules/**',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.stories.ts',
    '**/*.stories.tsx'
  ],
  includePaths: [
    'src/**/*.ts',
    'src/**/*.tsx'
  ],
  customChecks: [
    'production-audio-validation',
    'performance-critical-paths',
    'error-boundary-coverage',
    'accessibility-compliance'
  ]
};

/**
 * Get configuration by name or return default
 */
export function getConfig(configName?: string): GuardianProjectConfig {
  switch (configName?.toLowerCase()) {
    case 'strict':
      return STRICT_CONFIG;
    case 'development':
    case 'dev':
      return DEVELOPMENT_CONFIG;
    case 'production':
    case 'prod':
      return PRODUCTION_CONFIG;
    case 'audio':
    default:
      return AUDIO_APP_CONFIG;
  }
}

/**
 * Custom rule definitions for domain-specific checks
 */
export interface CustomRuleDefinition {
  name: string;
  description: string;
  category: 'React' | 'Audio' | 'Types' | 'Performance' | 'WebAPI' | 'Hooks' | 'State';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  pattern: RegExp | string;
  fix: string;
  explanation: string;
  prevention: string;
}

export const CUSTOM_RULES: CustomRuleDefinition[] = [
  {
    name: 'electromagnetic-field-validation',
    description: 'Validate electromagnetic field calculations have proper type safety',
    category: 'Audio',
    severity: 'High',
    pattern: /ElectromagneticField.*frequency.*number/,
    fix: 'Ensure frequency values are within valid range (0.1-100Hz) with proper type guards',
    explanation: 'Electromagnetic field calculations require precise frequency validation for safety',
    prevention: 'Use branded types or refined number types for frequency values'
  },
  {
    name: 'binaural-beat-frequency-validation',
    description: 'Validate binaural beat frequencies are within hearing range',
    category: 'Audio',
    severity: 'High',
    pattern: /BinauralBeatConfig.*frequency/,
    fix: 'Add frequency range validation (20Hz - 20kHz) and binaural beat difference limits',
    explanation: 'Binaural beats require precise frequency control within human hearing range',
    prevention: 'Create frequency types with built-in validation ranges'
  },
  {
    name: 'audio-buffer-management',
    description: 'Ensure proper audio buffer lifecycle management',
    category: 'Audio',
    severity: 'Critical',
    pattern: /AudioBuffer.*create|AudioContext.*decode/,
    fix: 'Implement proper buffer cleanup and memory management patterns',
    explanation: 'Audio buffers consume significant memory and need careful lifecycle management',
    prevention: 'Use resource management patterns with automatic cleanup'
  },
  {
    name: 'production-audio-validation',
    description: 'Production-level audio validation and error handling',
    category: 'Audio',
    severity: 'Critical',
    pattern: /AudioContext|createOscillator|createGain/,
    fix: 'Add comprehensive error handling, fallbacks, and user feedback for audio failures',
    explanation: 'Production audio applications need robust error handling for various browser/device scenarios',
    prevention: 'Implement audio capability detection and graceful degradation'
  },
  {
    name: 'performance-critical-paths',
    description: 'Identify performance-critical code paths needing optimization',
    category: 'Performance',
    severity: 'High',
    pattern: /requestAnimationFrame|setInterval.*audio|WebAudio.*loop/,
    fix: 'Optimize hot paths with proper type annotations and avoid unnecessary allocations',
    explanation: 'Audio processing code runs in tight loops and needs optimal performance',
    prevention: 'Profile and optimize TypeScript compilation for performance-critical sections'
  }
];

export default {
  AUDIO_APP_CONFIG,
  STRICT_CONFIG,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG,
  getConfig,
  CUSTOM_RULES
};