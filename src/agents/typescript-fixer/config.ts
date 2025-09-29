/**
 * Configuration for TypeScript Fixer Agent
 */

export interface TypeScriptFixerConfig {
  // Paths to watch for TypeScript files
  watchPaths: string[];

  // File patterns to ignore
  ignorePaths: string[];

  // Enable automatic fixing (vs just reporting)
  autoFix: boolean;

  // Delay in ms before processing after file change
  debounceDelay: number;

  // Maximum number of fix attempts before giving up
  maxFixAttempts: number;

  // Enable verbose logging
  verbose: boolean;

  // Specific error codes to fix (empty = all)
  targetErrorCodes: string[];

  // Specific error codes to ignore
  ignoreErrorCodes: string[];

  // Enable safe mode (only apply conservative fixes)
  safeMode: boolean;

  // Create backup before fixing
  createBackup: boolean;

  // Maximum file history to keep
  maxHistorySize: number;
}

export const defaultConfig: TypeScriptFixerConfig = {
  watchPaths: [
    'src/**/*.ts',
    'src/**/*.tsx'
  ],
  ignorePaths: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/*.d.ts'
  ],
  autoFix: true,
  debounceDelay: 1000,
  maxFixAttempts: 3,
  verbose: false,
  targetErrorCodes: [],
  ignoreErrorCodes: [],
  safeMode: false,
  createBackup: true,
  maxHistorySize: 10
};

export const productionConfig: TypeScriptFixerConfig = {
  ...defaultConfig,
  safeMode: true,
  createBackup: true,
  verbose: true,
  maxFixAttempts: 1
};

export const developmentConfig: TypeScriptFixerConfig = {
  ...defaultConfig,
  autoFix: true,
  safeMode: false,
  verbose: true,
  debounceDelay: 500
};