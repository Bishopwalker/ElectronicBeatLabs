#!/usr/bin/env node

/**
 * TypeScript Guardian CLI
 * Command-line interface for real-time TypeScript error detection and fixes
 */

import { Command } from 'commander';
import { resolve, relative } from 'path';
import { existsSync, readFileSync } from 'fs';
import chalk from 'chalk';
import { createAudioAppGuardian, quickScan, TypeScriptIssue } from './typescript-guardian';

const program = new Command();

program
  .name('ts-guardian')
  .description('TypeScript Guardian - Real-time error detection and fixes for React 18+ audio/visualization applications')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan project or specific files for TypeScript issues')
  .option('-f, --file <path>', 'Scan specific file')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('--severity <level>', 'Minimum severity level (Critical|High|Medium|Low)', 'Medium')
  .option('--category <type>', 'Filter by category (React|Audio|Types|Performance|WebAPI|Hooks|State)')
  .option('--format <type>', 'Output format (table|json|detailed)', 'table')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🛡️ TypeScript Guardian - Scanning for issues...\n'));

      const projectRoot = resolve(options.project);
      
      if (!existsSync(projectRoot)) {
        console.error(chalk.red(`❌ Project path does not exist: ${projectRoot}`));
        process.exit(1);
      }

      let issues: TypeScriptIssue[] = [];

      if (options.file) {
        // Scan specific file
        const filePath = resolve(options.file);
        if (!existsSync(filePath)) {
          console.error(chalk.red(`❌ File does not exist: ${filePath}`));
          process.exit(1);
        }

        console.log(chalk.blue(`📁 Scanning file: ${relative(projectRoot, filePath)}`));
        issues = quickScan(filePath, projectRoot);
      } else {
        // Scan entire project
        console.log(chalk.blue(`📁 Scanning project: ${projectRoot}`));
        const guardian = createAudioAppGuardian(projectRoot);
        issues = guardian.scanProject();
      }

      // Apply filters
      if (options.severity) {
        issues = filterBySeverity(issues, options.severity);
      }

      if (options.category) {
        issues = filterByCategory(issues, options.category);
      }

      // Display results
      displayResults(issues, options.format, projectRoot);

    } catch (error) {
      console.error(chalk.red(`❌ Error during scan: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch for file changes and continuously scan')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .option('--debounce <ms>', 'Debounce delay in milliseconds', '500')
  .action(async (options) => {
    console.log(chalk.cyan('👀 TypeScript Guardian - Watch mode enabled'));
    console.log(chalk.gray('Watching for changes... (Press Ctrl+C to stop)\n'));

    const chokidar = await import('chokidar');
    const projectRoot = resolve(options.project);
    const debounceMs = parseInt(options.debounce);

    let scanTimeout: NodeJS.Timeout | null = null;

    const watcher = chokidar.watch(['src/**/*.ts', 'src/**/*.tsx'], {
      cwd: projectRoot,
      ignored: /node_modules/,
      persistent: true
    });

    const performScan = () => {
      try {
        const guardian = createAudioAppGuardian(projectRoot);
        const issues = guardian.scanProject();
        
        console.clear();
        console.log(chalk.cyan('🛡️ TypeScript Guardian - Watch Mode\n'));
        displayResults(issues, 'table', projectRoot);
        
        if (issues.length === 0) {
          console.log(chalk.green('✅ No issues found! Your code is clean.\n'));
        }
        
        console.log(chalk.gray(`Last scan: ${new Date().toLocaleTimeString()}`));
        console.log(chalk.gray('Watching for changes...\n'));
      } catch (error) {
        console.error(chalk.red(`❌ Scan error: ${error.message}`));
      }
    };

    watcher.on('change', (path) => {
      console.log(chalk.yellow(`📝 File changed: ${path}`));
      
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
      
      scanTimeout = setTimeout(performScan, debounceMs);
    });

    // Initial scan
    performScan();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.cyan('\n👋 Stopping TypeScript Guardian...'));
      watcher.close();
      process.exit(0);
    });
  });

program
  .command('fix')
  .description('Interactive fix mode - guided issue resolution')
  .option('-f, --file <path>', 'Fix issues in specific file')
  .option('-p, --project <path>', 'Project root path', process.cwd())
  .action(async (options) => {
    console.log(chalk.cyan('🔧 TypeScript Guardian - Interactive Fix Mode\n'));

    const inquirer = await import('inquirer');
    const projectRoot = resolve(options.project);

    let issues: TypeScriptIssue[] = [];

    if (options.file) {
      const filePath = resolve(options.file);
      issues = quickScan(filePath, projectRoot);
    } else {
      const guardian = createAudioAppGuardian(projectRoot);
      issues = guardian.scanProject();
    }

    if (issues.length === 0) {
      console.log(chalk.green('✅ No issues found! Your code is clean.'));
      return;
    }

    console.log(chalk.yellow(`Found ${issues.length} issues to review:\n`));

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      
      console.log(chalk.cyan(`\n📋 Issue ${i + 1}/${issues.length}`));
      displayIssueDetails(issue, projectRoot);

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🔧 View detailed fix instructions', value: 'fix' },
            { name: '📖 Learn more about this pattern', value: 'learn' },
            { name: '⏭️ Skip this issue', value: 'skip' },
            { name: '🚪 Exit fix mode', value: 'exit' }
          ]
        }
      ]);

      switch (action) {
        case 'fix':
          displayFixInstructions(issue);
          break;
        case 'learn':
          displayLearningResources(issue);
          break;
        case 'skip':
          console.log(chalk.gray('Skipping issue...'));
          break;
        case 'exit':
          console.log(chalk.cyan('👋 Exiting fix mode.'));
          return;
      }
    }

    console.log(chalk.green('\n✅ Completed reviewing all issues!'));
  });

function filterBySeverity(issues: TypeScriptIssue[], minSeverity: string): TypeScriptIssue[] {
  const severityLevels = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  const minLevel = severityLevels[minSeverity as keyof typeof severityLevels] ?? 2;
  
  return issues.filter(issue => severityLevels[issue.severity] <= minLevel);
}

function filterByCategory(issues: TypeScriptIssue[], category: string): TypeScriptIssue[] {
  return issues.filter(issue => issue.category.toLowerCase() === category.toLowerCase());
}

function displayResults(issues: TypeScriptIssue[], format: string, projectRoot: string): void {
  if (issues.length === 0) {
    console.log(chalk.green('✅ No TypeScript issues found!'));
    return;
  }

  switch (format) {
    case 'json':
      console.log(JSON.stringify(issues, null, 2));
      break;
    case 'detailed':
      displayDetailedResults(issues, projectRoot);
      break;
    default:
      displayTableResults(issues, projectRoot);
  }
}

function displayTableResults(issues: TypeScriptIssue[], projectRoot: string): void {
  console.log(chalk.yellow(`\n📊 Found ${issues.length} TypeScript issues:\n`));

  // Group by severity
  const bySeverity = issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) acc[issue.severity] = [];
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, TypeScriptIssue[]>);

  const severityColors = {
    'Critical': chalk.red,
    'High': chalk.magenta,
    'Medium': chalk.yellow,
    'Low': chalk.blue
  };

  for (const [severity, severityIssues] of Object.entries(bySeverity)) {
    const color = severityColors[severity as keyof typeof severityColors] || chalk.white;
    console.log(color(`\n${severity.toUpperCase()} ISSUES (${severityIssues.length}):`));
    
    severityIssues.forEach((issue, index) => {
      const relativePath = relative(projectRoot, issue.file);
      console.log(color(`  ${index + 1}. ${relativePath}:${issue.line}`));
      console.log(chalk.gray(`     ${issue.issue}`));
      console.log(chalk.dim(`     Category: ${issue.category}`));
    });
  }

  console.log(chalk.cyan(`\n💡 Run with --format detailed for more information`));
  console.log(chalk.cyan(`💡 Use 'ts-guardian fix' for guided resolution\n`));
}

function displayDetailedResults(issues: TypeScriptIssue[], projectRoot: string): void {
  console.log(chalk.yellow(`\n📋 Detailed TypeScript Issues Report:\n`));

  issues.forEach((issue, index) => {
    console.log(chalk.cyan(`\n${index + 1}. ${chalk.bold(relative(projectRoot, issue.file))}:${issue.line}`));
    console.log(chalk.red(`   ISSUE: ${issue.issue}`));
    console.log(chalk.yellow(`   SEVERITY: ${issue.severity}`));
    console.log(chalk.blue(`   CATEGORY: ${issue.category}`));
    console.log(chalk.green(`   FIX: ${issue.fix}`));
    console.log(chalk.dim(`   EXPLANATION: ${issue.explanation}`));
    console.log(chalk.dim(`   PREVENTION: ${issue.prevention}`));
  });
}

function displayIssueDetails(issue: TypeScriptIssue, projectRoot: string): void {
  const relativePath = relative(projectRoot, issue.file);
  
  console.log(chalk.yellow(`📍 ${relativePath}:${issue.line}:${issue.column}`));
  console.log(chalk.red(`🚨 ${issue.issue}`));
  console.log(chalk.blue(`📂 Category: ${issue.category}`));
  console.log(chalk.yellow(`⚠️  Severity: ${issue.severity}`));
}

function displayFixInstructions(issue: TypeScriptIssue): void {
  console.log(chalk.green('\n🔧 FIX INSTRUCTIONS:'));
  console.log(chalk.white(`   ${issue.fix}`));
  console.log(chalk.cyan('\n💡 EXPLANATION:'));
  console.log(chalk.white(`   ${issue.explanation}`));
  console.log(chalk.blue('\n🛡️  PREVENTION:'));
  console.log(chalk.white(`   ${issue.prevention}`));
  
  console.log(chalk.dim('\nPress Enter to continue...'));
  process.stdin.setRawMode(true);
  process.stdin.once('data', () => {
    process.stdin.setRawMode(false);
  });
}

function displayLearningResources(issue: TypeScriptIssue): void {
  console.log(chalk.cyan('\n📚 LEARNING RESOURCES:'));
  
  const resources = {
    'React': [
      'React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/',
      'React Hook Types: https://react-hooks-typescript.netlify.app/',
    ],
    'Audio': [
      'Web Audio API MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
      'TypeScript Audio Types: https://github.com/microsoft/TypeScript/blob/main/lib/lib.dom.d.ts',
    ],
    'Types': [
      'TypeScript Handbook: https://www.typescriptlang.org/docs/',
      'Advanced Types: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html',
    ],
    'Performance': [
      'React Performance: https://react.dev/learn/render-and-commit',
      'TypeScript Performance: https://github.com/microsoft/TypeScript/wiki/Performance',
    ]
  };

  const categoryResources = resources[issue.category as keyof typeof resources];
  if (categoryResources) {
    categoryResources.forEach(resource => {
      console.log(chalk.white(`   • ${resource}`));
    });
  } else {
    console.log(chalk.white('   • Check TypeScript documentation for more information'));
  }
  
  console.log(chalk.dim('\nPress Enter to continue...'));
  process.stdin.setRawMode(true);
  process.stdin.once('data', () => {
    process.stdin.setRawMode(false);
  });
}

// Add global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n💥 Unexpected error occurred:'));
  console.error(chalk.red(error.message));
  console.error(chalk.dim(error.stack));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n💥 Unhandled promise rejection:'));
  console.error(chalk.red(reason));
  process.exit(1);
});

program.parse(process.argv);

export { program as cli };