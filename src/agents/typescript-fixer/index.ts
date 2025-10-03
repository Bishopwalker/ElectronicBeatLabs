/**
 * TypeScript Fixer Agent - Main Entry Point
 */

export { TypeScriptFixerAgent, typeScriptFixer } from './agent.js';
export {
  TypeScriptFixerConfig,
  defaultConfig,
  developmentConfig,
  productionConfig
} from './config.js';
export {
  FixStrategy,
  FixContext,
  FixResult,
  MissingTypeAnnotationFixer,
  MissingPropertyFixer,
  NullCheckFixer,
  MissingImportFixer,
  TypeAssertionFixer,
  StrategyManager,
  TypeScriptProgramManager
} from './strategies.js';

/**
 * Quick start function for immediate use
 */
export async function startTypeScriptFixer(options?: {
  watchPaths?: string[];
  verbose?: boolean;
  autoFix?: boolean;
  safeMode?: boolean;
}) {
  const { TypeScriptFixerAgent } = await import('./agent.js');

  const agent = new TypeScriptFixerAgent(
    options?.watchPaths || ['src/**/*.ts', 'src/**/*.tsx']
  );

  console.log('🚀 Starting TypeScript Fixer Agent...');

  try {
    await agent.start();
    console.log('✅ TypeScript Fixer Agent is running');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down TypeScript Fixer Agent...');
      await agent.stop();
      process.exit(0);
    });

    // Keep the process alive
    return agent;
  } catch (error) {
    console.error('❌ Failed to start TypeScript Fixer Agent:', error);
    throw error;
  }
}

/**
 * Run a single scan
 */
export async function scanTypeScriptErrors(fix: boolean = false) {
  const { TypeScriptFixerAgent } = await import('./agent.js');

  const agent = new TypeScriptFixerAgent(['src/**/*.ts', 'src/**/*.tsx']);

  console.log(`🔍 Scanning for TypeScript errors${fix ? ' and fixing them' : ''}...`);

  await agent.scanAndFix();

  const stats = agent.getStats();
  console.log(`📊 Results: ${stats.totalFixes} fixes in ${stats.fileCount} files`);

  return stats;
}