/**
 * TypeScript Guardian Integration
 * Integration hooks for development workflow, CI/CD, and IDE support
 */

import { watch } from 'chokidar';
import { resolve } from 'path';
import { createAudioAppGuardian, TypeScriptIssue } from './typescript-guardian';
import { getConfig, GuardianProjectConfig } from './config';

export interface IntegrationConfig {
  projectRoot: string;
  config: GuardianProjectConfig;
  watchMode: boolean;
  debounceMs: number;
  outputFile?: string;
  webhookUrl?: string;
  slackChannel?: string;
}

export interface IntegrationHooks {
  onIssuesFound?: (issues: TypeScriptIssue[]) => void;
  onIssuesResolved?: (resolvedIssues: TypeScriptIssue[]) => void;
  onCriticalIssue?: (issue: TypeScriptIssue) => void;
  onScanComplete?: (summary: ScanSummary) => void;
}

export interface ScanSummary {
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  categorySummary: Record<string, number>;
  filesScanned: number;
  scanDuration: number;
}

export class GuardianIntegration {
  private guardian: ReturnType<typeof createAudioAppGuardian>;
  private config: IntegrationConfig;
  private hooks: IntegrationHooks;
  private lastScanResults: TypeScriptIssue[] = [];
  private watcher?: ReturnType<typeof watch>;

  constructor(config: IntegrationConfig, hooks: IntegrationHooks = {}) {
    this.config = config;
    this.hooks = hooks;
    this.guardian = createAudioAppGuardian(config.projectRoot);
  }

  /**
   * Start continuous monitoring
   */
  public startWatch(): void {
    if (this.watcher) {
      console.warn('Guardian is already watching');
      return;
    }

    console.log('🛡️ Starting TypeScript Guardian watch mode...');
    
    this.watcher = watch(['src/**/*.ts', 'src/**/*.tsx'], {
      cwd: this.config.projectRoot,
      ignored: /node_modules/,
      persistent: true
    });

    let scanTimeout: NodeJS.Timeout | null = null;

    this.watcher.on('change', (path) => {
      console.log(`📝 File changed: ${path}`);
      
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
      
      scanTimeout = setTimeout(() => {
        this.performScan();
      }, this.config.debounceMs);
    });

    // Initial scan
    this.performScan();
  }

  /**
   * Stop watching
   */
  public stopWatch(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
      console.log('👋 Stopped TypeScript Guardian watch mode');
    }
  }

  /**
   * Perform a single scan
   */
  public async performScan(): Promise<ScanSummary> {
    const startTime = Date.now();
    console.log('🔍 Starting TypeScript scan...');

    try {
      const issues = this.guardian.scanProject();
      const scanDuration = Date.now() - startTime;

      const summary = this.generateSummary(issues, scanDuration);
      
      // Check for newly resolved issues
      const resolvedIssues = this.findResolvedIssues(this.lastScanResults, issues);
      if (resolvedIssues.length > 0 && this.hooks.onIssuesResolved) {
        this.hooks.onIssuesResolved(resolvedIssues);
      }

      // Check for critical issues
      const criticalIssues = issues.filter(i => i.severity === 'Critical');
      criticalIssues.forEach(issue => {
        if (this.hooks.onCriticalIssue) {
          this.hooks.onCriticalIssue(issue);
        }
      });

      // Call hooks
      if (this.hooks.onIssuesFound) {
        this.hooks.onIssuesFound(issues);
      }
      
      if (this.hooks.onScanComplete) {
        this.hooks.onScanComplete(summary);
      }

      // Save results
      this.lastScanResults = issues;

      // Write to file if configured
      if (this.config.outputFile) {
        await this.writeResultsToFile(issues, summary);
      }

      // Send to webhook if configured
      if (this.config.webhookUrl) {
        await this.sendToWebhook(summary, criticalIssues);
      }

      console.log(`✅ Scan completed in ${scanDuration}ms: ${issues.length} issues found`);
      return summary;

    } catch (error) {
      console.error(`❌ Scan failed: ${error.message}`);
      throw error;
    }
  }

  private generateSummary(issues: TypeScriptIssue[], scanDuration: number): ScanSummary {
    const bySeverity = issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      timestamp: new Date(),
      totalIssues: issues.length,
      criticalIssues: bySeverity['Critical'] || 0,
      highIssues: bySeverity['High'] || 0,
      mediumIssues: bySeverity['Medium'] || 0,
      lowIssues: bySeverity['Low'] || 0,
      categorySummary: byCategory,
      filesScanned: new Set(issues.map(i => i.file)).size,
      scanDuration
    };
  }

  private findResolvedIssues(previous: TypeScriptIssue[], current: TypeScriptIssue[]): TypeScriptIssue[] {
    return previous.filter(prevIssue => 
      !current.some(currIssue => 
        currIssue.file === prevIssue.file &&
        currIssue.line === prevIssue.line &&
        currIssue.issue === prevIssue.issue
      )
    );
  }

  private async writeResultsToFile(issues: TypeScriptIssue[], summary: ScanSummary): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const output = {
      summary,
      issues,
      generatedAt: new Date().toISOString(),
      guardianVersion: '1.0.0'
    };

    await fs.writeFile(this.config.outputFile!, JSON.stringify(output, null, 2));
  }

  private async sendToWebhook(summary: ScanSummary, criticalIssues: TypeScriptIssue[]): Promise<void> {
    try {
      const payload = {
        text: `TypeScript Guardian Report`,
        attachments: [{
          color: criticalIssues.length > 0 ? 'danger' : summary.totalIssues > 0 ? 'warning' : 'good',
          fields: [
            { title: 'Total Issues', value: summary.totalIssues.toString(), short: true },
            { title: 'Critical', value: summary.criticalIssues.toString(), short: true },
            { title: 'High Priority', value: summary.highIssues.toString(), short: true },
            { title: 'Files Scanned', value: summary.filesScanned.toString(), short: true }
          ],
          footer: 'TypeScript Guardian',
          ts: Math.floor(summary.timestamp.getTime() / 1000)
        }]
      };

      // This would need actual HTTP client implementation
      console.log('📡 Sending webhook notification...', payload);
    } catch (error) {
      console.error('Failed to send webhook:', error.message);
    }
  }
}

/**
 * VS Code Extension Integration
 * Provides language server protocol support for real-time error highlighting
 */
export class VSCodeIntegration {
  private guardian: ReturnType<typeof createAudioAppGuardian>;

  constructor(projectRoot: string) {
    this.guardian = createAudioAppGuardian(projectRoot);
  }

  /**
   * Get diagnostics for a specific file (for VS Code)
   */
  public async getFileDiagnostics(filePath: string): Promise<any[]> {
    try {
      const program = this.guardian['program'];
      const sourceFile = program.getSourceFile(filePath);
      
      if (!sourceFile) {
        return [];
      }

      const issues = this.guardian.scanFile(sourceFile);
      
      // Convert to VS Code diagnostic format
      return issues.map(issue => ({
        range: {
          start: { line: issue.line - 1, character: issue.column - 1 },
          end: { line: issue.line - 1, character: issue.column + 10 }
        },
        severity: this.severityToVSCode(issue.severity),
        source: 'typescript-guardian',
        message: issue.issue,
        code: issue.category.toLowerCase(),
        codeDescription: {
          href: `https://typescript-guardian.docs/issues/${issue.category.toLowerCase()}`
        },
        data: {
          fix: issue.fix,
          explanation: issue.explanation,
          prevention: issue.prevention
        }
      }));
    } catch (error) {
      console.error(`Failed to get diagnostics for ${filePath}:`, error);
      return [];
    }
  }

  private severityToVSCode(severity: string): number {
    switch (severity) {
      case 'Critical': return 1; // Error
      case 'High': return 1;     // Error
      case 'Medium': return 2;   // Warning
      case 'Low': return 3;      // Information
      default: return 3;
    }
  }
}

/**
 * Pre-commit Hook Integration
 * Blocks commits if critical TypeScript issues are found
 */
export async function preCommitHook(projectRoot: string): Promise<boolean> {
  console.log('🛡️ Running TypeScript Guardian pre-commit check...');
  
  const guardian = createAudioAppGuardian(projectRoot);
  const issues = guardian.scanProject();
  
  const criticalIssues = issues.filter(i => i.severity === 'Critical');
  const highIssues = issues.filter(i => i.severity === 'High');

  if (criticalIssues.length > 0) {
    console.error(`❌ Found ${criticalIssues.length} critical TypeScript issues - blocking commit:`);
    criticalIssues.slice(0, 5).forEach(issue => {
      console.error(`   • ${issue.file}:${issue.line} - ${issue.issue}`);
    });
    return false;
  }

  if (highIssues.length > 10) {
    console.error(`❌ Found ${highIssues.length} high-priority issues - consider fixing before commit`);
    return false;
  }

  console.log(`✅ TypeScript Guardian check passed (${issues.length} total issues, none critical)`);
  return true;
}

/**
 * CI/CD Pipeline Integration
 * Generates reports for build systems
 */
export async function cicdIntegration(projectRoot: string): Promise<void> {
  const guardian = createAudioAppGuardian(projectRoot);
  const issues = guardian.scanProject();
  
  const summary = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    criticalIssues: issues.filter(i => i.severity === 'Critical').length,
    highIssues: issues.filter(i => i.severity === 'High').length
  };

  // Write JUnit XML format for CI systems
  const junitXml = generateJUnitReport(issues);
  const fs = await import('fs').then(m => m.promises);
  await fs.writeFile('typescript-guardian-report.xml', junitXml);
  
  // Write JSON summary
  await fs.writeFile('typescript-guardian-summary.json', JSON.stringify(summary, null, 2));
  
  console.log(`📊 Generated CI/CD reports: ${issues.length} issues found`);
  
  // Fail CI if critical issues exist
  if (summary.criticalIssues > 0) {
    process.exit(1);
  }
}

function generateJUnitReport(issues: TypeScriptIssue[]): string {
  const testCases = issues.map(issue => `
    <testcase classname="TypeScriptGuardian.${issue.category}" name="${issue.file}:${issue.line}">
      <failure message="${issue.issue}" type="${issue.severity}">
        ${issue.explanation}
        
        Fix: ${issue.fix}
        Prevention: ${issue.prevention}
      </failure>
    </testcase>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="TypeScript Guardian" tests="${issues.length}" failures="${issues.length}" time="0">
  ${testCases}
</testsuite>`;
}

export default {
  GuardianIntegration,
  VSCodeIntegration,
  preCommitHook,
  cicdIntegration
};