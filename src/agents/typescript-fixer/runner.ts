#!/usr/bin/env node

/**
 * CLI Runner for TypeScript Fixer Agent
 */

import { TypeScriptFixerAgent } from './agent';
import { defaultConfig, developmentConfig, productionConfig, TypeScriptFixerConfig } from './config';
import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';

// Load configuration
function loadConfig(configPath?: string): TypeScriptFixerConfig {
  if (configPath && fs.existsSync(configPath)) {
    const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return { ...defaultConfig, ...customConfig };
  }

  const env = process.env.NODE_ENV || 'development';
  switch (env) {
    case 'production':
      return productionConfig;
    case 'development':
      return developmentConfig;
    default:
      return defaultConfig;
  }
}

// Main CLI program
program
  .name('typescript-fixer')
  .description('TypeScript Error Fixing Agent - Automatically detects and fixes TypeScript errors')
  .version('1.0.0');

program
  .command('start')
  .description('Start the TypeScript fixer agent')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-w, --watch <paths...>', 'Paths to watch (overrides config)')
  .option('-i, --ignore <patterns...>', 'Patterns to ignore')
  .option('--no-auto-fix', 'Disable automatic fixing (only report errors)')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--safe', 'Enable safe mode (conservative fixes only)')
  .action(async (options) => {
    console.log('🚀 Starting TypeScript Fixer Agent...\n');

    const config = loadConfig(options.config);

    // Override config with CLI options
    if (options.watch) {
      config.watchPaths = options.watch;
    }
    if (options.ignore) {
      config.ignorePaths = options.ignore;
    }
    if (!options.autoFix) {
      config.autoFix = false;
    }
    if (options.verbose) {
      config.verbose = true;
    }
    if (options.safe) {
      config.safeMode = true;
    }

    const agent = new TypeScriptFixerAgent(config.watchPaths);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down TypeScript Fixer Agent...');
      await agent.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await agent.stop();
      process.exit(0);
    });

    try {
      await agent.start();
      console.log('✅ Agent is running. Press Ctrl+C to stop.\n');
    } catch (error) {
      console.error('❌ Failed to start agent:', error);
      process.exit(1);
    }
  });

program
  .command('scan')
  .description('Run a single scan for TypeScript errors')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-f, --fix', 'Attempt to fix errors')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    console.log('🔍 Scanning for TypeScript errors...\n');

    const config = loadConfig(options.config);
    if (options.verbose) {
      config.verbose = true;
    }

    const agent = new TypeScriptFixerAgent(config.watchPaths);

    try {
      await agent.scanAndFix();
      const stats = agent.getStats();
      console.log(`\n📊 Statistics:`);
      console.log(`   Total fixes applied: ${stats.totalFixes}`);
      console.log(`   Files modified: ${stats.fileCount}`);
    } catch (error) {
      console.error('❌ Scan failed:', error);
      process.exit(1);
    }
  });

program
  .command('rollback <file>')
  .description('Rollback the last fix for a specific file')
  .action(async (file) => {
    const agent = new TypeScriptFixerAgent();
    const filePath = path.resolve(file);

    if (agent.rollbackFix(filePath)) {
      console.log(`✅ Successfully rolled back fix for ${file}`);
    } else {
      console.error(`❌ Could not rollback fix for ${file}`);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Show statistics about fixes')
  .action(async () => {
    const agent = new TypeScriptFixerAgent();
    const stats = agent.getStats();

    console.log('📊 TypeScript Fixer Statistics\n');
    console.log(`Total fixes applied: ${stats.totalFixes}`);
    console.log(`Files modified: ${stats.fileCount}`);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}