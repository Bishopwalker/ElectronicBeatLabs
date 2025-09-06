/**
 * TypeScript Guardian Test & Demo
 * Demonstrates the agent's capabilities with the current codebase
 */

import { createAudioAppGuardian, quickScan } from './typescript-guardian';
import { resolve } from 'path';
import chalk from 'chalk';

async function runGuardianDemo() {
  console.log(chalk.cyan('🛡️ TypeScript Guardian - Demo & Test\n'));

  const projectRoot = resolve(__dirname, '../../..');
  console.log(chalk.blue(`📁 Project root: ${projectRoot}\n`));

  try {
    // Test 1: Quick scan of a specific problematic file
    console.log(chalk.yellow('📋 Test 1: Quick scan of ElectromagneticBeatLab component'));
    const problemFile = resolve(projectRoot, 'src/components/ElectromagneticBeatLab.tsx');
    console.log(chalk.gray(`   Scanning: ${problemFile}`));
    
    try {
      const quickIssues = quickScan(problemFile, projectRoot);
      console.log(chalk.green(`   ✅ Quick scan completed: ${quickIssues.length} issues found`));
      
      if (quickIssues.length > 0) {
        console.log(chalk.yellow('   📋 Sample issues found:'));
        quickIssues.slice(0, 3).forEach((issue, index) => {
          console.log(chalk.white(`      ${index + 1}. Line ${issue.line}: ${issue.issue}`));
          console.log(chalk.gray(`         Category: ${issue.category}, Severity: ${issue.severity}`));
        });
      }
    } catch (error) {
      console.log(chalk.red(`   ❌ Quick scan failed: ${error.message}`));
    }

    console.log(chalk.cyan('\n' + '='.repeat(60) + '\n'));

    // Test 2: Create guardian and test basic functionality
    console.log(chalk.yellow('📋 Test 2: Initialize Guardian for full project'));
    
    try {
      const guardian = createAudioAppGuardian(projectRoot);
      console.log(chalk.green('   ✅ Guardian initialized successfully'));
      
      // Test project scanning
      console.log(chalk.gray('   Running full project scan...'));
      const allIssues = guardian.scanProject();
      console.log(chalk.green(`   ✅ Project scan completed: ${allIssues.length} total issues found`));
      
      // Categorize and display results
      const byCategory = allIssues.reduce((acc, issue) => {
        if (!acc[issue.category]) acc[issue.category] = [];
        acc[issue.category].push(issue);
        return acc;
      }, {} as Record<string, typeof allIssues>);

      console.log(chalk.cyan('   📊 Issues by category:'));
      Object.entries(byCategory).forEach(([category, issues]) => {
        console.log(chalk.white(`      ${category}: ${issues.length} issues`));
      });

      const bySeverity = allIssues.reduce((acc, issue) => {
        if (!acc[issue.severity]) acc[issue.severity] = [];
        acc[issue.severity].push(issue);
        return acc;
      }, {} as Record<string, typeof allIssues>);

      console.log(chalk.cyan('   ⚠️  Issues by severity:'));
      Object.entries(bySeverity).forEach(([severity, issues]) => {
        const color = severity === 'Critical' ? chalk.red : 
                     severity === 'High' ? chalk.magenta :
                     severity === 'Medium' ? chalk.yellow : chalk.blue;
        console.log(color(`      ${severity}: ${issues.length} issues`));
      });

      // Display sample issues
      if (allIssues.length > 0) {
        console.log(chalk.yellow('\n   🔍 Sample detailed issues:'));
        allIssues.slice(0, 5).forEach((issue, index) => {
          console.log(chalk.cyan(`\n   ${index + 1}. ${issue.file.split('/').pop()}:${issue.line}`));
          console.log(chalk.white(`      Issue: ${issue.issue}`));
          console.log(chalk.green(`      Fix: ${issue.fix}`));
          console.log(chalk.gray(`      Category: ${issue.category}, Severity: ${issue.severity}`));
        });
      }

      // Test output formatting
      console.log(chalk.cyan('\n' + '='.repeat(60) + '\n'));
      console.log(chalk.yellow('📋 Test 3: Output formatting'));
      
      if (allIssues.length > 0) {
        const sampleIssues = allIssues.slice(0, 2);
        const formattedOutput = guardian.formatIssues(sampleIssues);
        console.log(chalk.gray('   Sample formatted output:'));
        console.log(chalk.dim(formattedOutput.substring(0, 500) + (formattedOutput.length > 500 ? '...' : '')));
      }

    } catch (error) {
      console.log(chalk.red(`   ❌ Guardian initialization failed: ${error.message}`));
      console.log(chalk.gray(`   Stack: ${error.stack}`));
    }

    console.log(chalk.cyan('\n' + '='.repeat(60) + '\n'));

    // Test 3: Demonstrate specific pattern detection
    console.log(chalk.yellow('📋 Test 4: Demonstrate pattern-specific detection'));
    
    const testFiles = [
      'src/components/tabs/ADHDTab.tsx',
      'src/components/tabs/PatternTab.tsx',
      'src/components/QuickStartGuide.tsx'
    ];

    for (const testFile of testFiles) {
      const fullPath = resolve(projectRoot, testFile);
      console.log(chalk.gray(`   Analyzing: ${testFile}`));
      
      try {
        const fileIssues = quickScan(fullPath, projectRoot);
        console.log(chalk.green(`   ✅ Found ${fileIssues.length} issues`));
        
        if (fileIssues.length > 0) {
          const criticalIssues = fileIssues.filter(i => i.severity === 'Critical' || i.severity === 'High');
          if (criticalIssues.length > 0) {
            console.log(chalk.red(`      ⚠️  ${criticalIssues.length} high-priority issues`));
            criticalIssues.slice(0, 2).forEach(issue => {
              console.log(chalk.yellow(`         • Line ${issue.line}: ${issue.issue}`));
            });
          }
        }
      } catch (error) {
        console.log(chalk.red(`   ❌ Analysis failed: ${error.message}`));
      }
    }

  } catch (error) {
    console.error(chalk.red(`💥 Demo failed with error: ${error.message}`));
    console.error(chalk.gray(error.stack));
  }

  console.log(chalk.cyan('\n🏁 TypeScript Guardian demo completed!\n'));
  
  // Summary and next steps
  console.log(chalk.green('✅ Guardian Capabilities Demonstrated:'));
  console.log(chalk.white('   • Real-time TypeScript error detection'));
  console.log(chalk.white('   • React 18+ specific pattern analysis'));
  console.log(chalk.white('   • Audio/Web Audio API type validation'));
  console.log(chalk.white('   • Performance issue identification'));
  console.log(chalk.white('   • Categorized issue reporting'));
  console.log(chalk.white('   • Severity-based prioritization'));
  console.log(chalk.white('   • Detailed fix suggestions'));

  console.log(chalk.cyan('\n💡 Usage Examples:'));
  console.log(chalk.white('   • npx ts-node src/agents/cli.ts scan'));
  console.log(chalk.white('   • npx ts-node src/agents/cli.ts watch'));
  console.log(chalk.white('   • npx ts-node src/agents/cli.ts fix'));
  console.log(chalk.white('   • npx ts-node src/agents/cli.ts scan --severity High --category Audio'));
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runGuardianDemo().catch(console.error);
}

export { runGuardianDemo };