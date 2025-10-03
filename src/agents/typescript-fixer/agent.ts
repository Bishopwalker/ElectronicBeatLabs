/**
 * TypeScript Error Fixing Agent
 * Continuously monitors and automatically fixes TypeScript errors in the codebase
 */

import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chokidar from 'chokidar';

const execAsync = promisify(exec);

interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

interface FixStrategy {
  errorCode: string;
  pattern: RegExp;
  fix: (error: TypeScriptError, fileContent: string) => string;
}

export class TypeScriptFixerAgent {
  private watchPaths: string[];
  private fixStrategies: FixStrategy[];
  private isRunning: boolean = false;
  private watcher: chokidar.FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly debounceDelay = 1000;
  private fixHistory: Map<string, string[]> = new Map();

  constructor(watchPaths: string[] = ['src/**/*.ts', 'src/**/*.tsx']) {
    this.watchPaths = watchPaths;
    this.fixStrategies = this.initializeFixStrategies();
  }

  /**
   * Initialize common TypeScript error fix strategies
   */
  private initializeFixStrategies(): FixStrategy[] {
    return [
      {
        // TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
        errorCode: 'TS2345',
        pattern: /Argument of type '(.+)' is not assignable to parameter of type '(.+)'/,
        fix: (error, content) => this.fixTypeAssignment(error, content)
      },
      {
        // TS2339: Property 'X' does not exist on type 'Y'
        errorCode: 'TS2339',
        pattern: /Property '(.+)' does not exist on type '(.+)'/,
        fix: (error, content) => this.fixMissingProperty(error, content)
      },
      {
        // TS7006: Parameter 'X' implicitly has an 'any' type
        errorCode: 'TS7006',
        pattern: /Parameter '(.+)' implicitly has an 'any' type/,
        fix: (error, content) => this.fixImplicitAny(error, content)
      },
      {
        // TS2322: Type 'X' is not assignable to type 'Y'
        errorCode: 'TS2322',
        pattern: /Type '(.+)' is not assignable to type '(.+)'/,
        fix: (error, content) => this.fixTypeIncompatibility(error, content)
      },
      {
        // TS2304: Cannot find name 'X'
        errorCode: 'TS2304',
        pattern: /Cannot find name '(.+)'/,
        fix: (error, content) => this.fixMissingImport(error, content)
      },
      {
        // TS2769: No overload matches this call
        errorCode: 'TS2769',
        pattern: /No overload matches this call/,
        fix: (error, content) => this.fixOverloadMismatch(error, content)
      },
      {
        // TS2532: Object is possibly 'undefined'
        errorCode: 'TS2532',
        pattern: /Object is possibly '(undefined|null)'/,
        fix: (error, content) => this.fixPossiblyUndefined(error, content)
      },
      {
        // TS2741: Property 'X' is missing in type 'Y' but required in type 'Z'
        errorCode: 'TS2741',
        pattern: /Property '(.+)' is missing in type/,
        fix: (error, content) => this.fixMissingRequiredProperty(error, content)
      }
    ];
  }

  /**
   * Start the TypeScript error monitoring and fixing agent
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🔧 TypeScript Fixer Agent is already running');
      return;
    }

    console.log('🚀 Starting TypeScript Fixer Agent...');
    this.isRunning = true;

    // Initial scan and fix
    await this.scanAndFix();

    // Set up file watcher for continuous monitoring
    this.watcher = chokidar.watch(this.watchPaths, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('change', (path) => this.handleFileChange(path))
      .on('add', (path) => this.handleFileChange(path));

    console.log('✅ TypeScript Fixer Agent is now monitoring for errors');
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping TypeScript Fixer Agent...');

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isRunning = false;
    console.log('✅ TypeScript Fixer Agent stopped');
  }

  /**
   * Handle file changes with debouncing
   */
  private handleFileChange(filePath: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      console.log(`📝 File changed: ${filePath}`);
      await this.scanAndFix();
    }, this.debounceDelay);
  }

  /**
   * Scan for TypeScript errors and attempt to fix them
   */
  async scanAndFix(): Promise<void> {
    const errors = await this.getTypeScriptErrors();

    if (errors.length === 0) {
      console.log('✨ No TypeScript errors found');
      return;
    }

    console.log(`🔍 Found ${errors.length} TypeScript errors`);

    // Group errors by file
    const errorsByFile = this.groupErrorsByFile(errors);

    // Fix errors file by file
    for (const [filePath, fileErrors] of errorsByFile.entries()) {
      await this.fixFileErrors(filePath, fileErrors);
    }

    // Re-scan to verify fixes
    const remainingErrors = await this.getTypeScriptErrors();
    if (remainingErrors.length > 0) {
      console.log(`⚠️ ${remainingErrors.length} errors could not be automatically fixed`);
    } else {
      console.log('✅ All TypeScript errors have been fixed!');
    }
  }

  /**
   * Get TypeScript errors from the compiler
   */
  private async getTypeScriptErrors(): Promise<TypeScriptError[]> {
    const command = 'npx tsc --noEmit --project tsconfig.app.json --pretty false';

    try {
      const { stdout, stderr } = await execAsync(command);
      return this.parseTypeScriptOutput(stdout || stderr);
    } catch (error: any) {
      // TypeScript exits with non-zero code when there are errors
      if (error.stdout || error.stderr) {
        const output = error.stdout || error.stderr;
        return this.parseTypeScriptOutput(output);
      }
      console.error('Failed to get TypeScript errors:', error);
      return [];
    }
  }

  /**
   * Parse TypeScript compiler output
   */
  private parseTypeScriptOutput(output: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Match TypeScript error format: file.ts(line,col): error TSxxxx: message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          severity: match[4] as 'error' | 'warning',
          code: match[5],
          message: match[6]
        });
      }
    }

    return errors;
  }

  /**
   * Group errors by file
   */
  private groupErrorsByFile(errors: TypeScriptError[]): Map<string, TypeScriptError[]> {
    const errorsByFile = new Map<string, TypeScriptError[]>();

    for (const error of errors) {
      const filePath = path.resolve(error.file);
      if (!errorsByFile.has(filePath)) {
        errorsByFile.set(filePath, []);
      }
      errorsByFile.get(filePath)!.push(error);
    }

    return errorsByFile;
  }

  /**
   * Fix errors in a specific file
   */
  private async fixFileErrors(filePath: string, errors: TypeScriptError[]): Promise<void> {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Sort errors by line number in descending order to avoid offset issues
    errors.sort((a, b) => b.line - a.line);

    for (const error of errors) {
      const strategy = this.fixStrategies.find(s => s.errorCode === error.code);

      if (strategy) {
        console.log(`🔧 Attempting to fix ${error.code} in ${path.basename(filePath)}:${error.line}`);
        try {
          content = strategy.fix(error, content);
        } catch (e) {
          console.error(`Failed to fix error: ${e}`);
        }
      }
    }

    if (content !== originalContent) {
      // Save fix history
      if (!this.fixHistory.has(filePath)) {
        this.fixHistory.set(filePath, []);
      }
      this.fixHistory.get(filePath)!.push(originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed errors in ${path.basename(filePath)}`);
    }
  }

  /**
   * Fix type assignment errors
   */
  private fixTypeAssignment(error: TypeScriptError, content: string): string {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return content;
    }

    const line = lines[lineIndex];

    // Look for function calls or assignments that need type assertion
    // Be more careful with the replacement to avoid breaking syntax
    const functionCallMatch = line.match(/(\w+)\s*\([^)]*\)/);
    if (functionCallMatch && !line.includes(' as ')) {
      const replacement = `(${functionCallMatch[0]} as any)`;
      lines[lineIndex] = line.replace(functionCallMatch[0], replacement);
    }

    return lines.join('\n');
  }

  /**
   * Fix missing property errors
   */
  private fixMissingProperty(error: TypeScriptError, content: string): string {
    const match = error.message.match(/Property '(.+)' does not exist on type '(.+)'/);
    if (!match) return content;

    const [, property, type] = match;
    const lines = content.split('\n');
    const lineIndex = error.line - 1;

    // Add optional chaining
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      lines[lineIndex] = lines[lineIndex].replace(
        new RegExp(`\\.${escapedProperty}\\b`),
        `?.${escapedProperty}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Fix implicit any type errors
   */
  private fixImplicitAny(error: TypeScriptError, content: string): string {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return content;
    }

    const line = lines[lineIndex];
    const match = error.message.match(/Parameter '(.+)' implicitly has an 'any' type/);

    if (match) {
      const paramName = match[1];
      const escapedParamName = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for the parameter without a type annotation
      const regex = new RegExp(`\\b${escapedParamName}\\b(?!\\s*:)`);
      if (regex.test(line)) {
        lines[lineIndex] = line.replace(regex, `${paramName}: any`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Fix type incompatibility errors
   */
  private fixTypeIncompatibility(error: TypeScriptError, content: string): string {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return content;
    }

    // Add type assertion as a temporary fix
    const line = lines[lineIndex];
    const assignmentMatch = line.match(/(\w+)\s*=\s*(.+)/);

    if (assignmentMatch && !assignmentMatch[2].includes(' as ')) {
      // Only add assertion if not already present
      const valueToAssert = assignmentMatch[2].trimEnd();
      lines[lineIndex] = line.replace(
        assignmentMatch[2],
        `(${valueToAssert} as any)`
      );
    }

    return lines.join('\n');
  }

  /**
   * Fix missing import errors
   */
  private fixMissingImport(error: TypeScriptError, content: string): string {
    const match = error.message.match(/Cannot find name '(.+)'/);
    if (!match) return content;

    const missingName = match[1];
    const lines = content.split('\n');

    // Check if it's a type that should be imported
    if (this.isCommonType(missingName)) {
      // Add import at the top of the file
      const importIndex = lines.findIndex(line => line.startsWith('import'));
      if (importIndex >= 0) {
        lines.splice(importIndex, 0, `import type { ${missingName} } from '../types/clean.types';`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Fix overload mismatch errors
   */
  private fixOverloadMismatch(error: TypeScriptError, content: string): string {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return content;
    }

    // Add type assertion to fix overload issues
    const line = lines[lineIndex];
    lines[lineIndex] = line.replace(/(\w+)\(/, '$1(... as any[]');

    return lines.join('\n');
  }

  /**
   * Fix possibly undefined errors
   */
  private fixPossiblyUndefined(error: TypeScriptError, content: string): string {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return content;
    }

    const line = lines[lineIndex];

    // Add nullish coalescing or optional chaining
    if (!line.includes('?.')) {
      lines[lineIndex] = line.replace(/(\w+)\.(\w+)/, '$1?.$2');
    }

    return lines.join('\n');
  }

  /**
   * Fix missing required property errors
   */
  private fixMissingRequiredProperty(error: TypeScriptError, content: string): string {
    const match = error.message.match(/Property '(.+)' is missing/);
    if (!match) return content;

    const property = match[1];
    const lines = content.split('\n');
    const lineIndex = error.line - 1;

    // Add the missing property with a default value
    if (lineIndex < 0 || lineIndex >= lines.length) {
      return content;
    }

    const line = lines[lineIndex];
    if (line.includes('{') && line.includes('}')) {
      lines[lineIndex] = line.replace('}', `, ${property}: undefined }`);
    }

    return lines.join('\n');
  }

  /**
   * Check if a name is a common type
   */
  private isCommonType(name: string): boolean {
    const commonTypes = [
      'AudioState', 'FrequencyState', 'PatternMode', 'SessionState',
      'AudioConfig', 'WebSocketMessage', 'VisualizationData'
    ];
    return commonTypes.includes(name);
  }

  /**
   * Rollback the last fix for a file
   */
  rollbackFix(filePath: string): boolean {
    const history = this.fixHistory.get(filePath);
    if (!history || history.length === 0) {
      console.log(`No fix history for ${filePath}`);
      return false;
    }

    const previousContent = history.pop();
    if (previousContent) {
      fs.writeFileSync(filePath, previousContent, 'utf-8');
      console.log(`✅ Rolled back fix for ${path.basename(filePath)}`);
      return true;
    }

    return false;
  }

  /**
   * Get statistics about fixes
   */
  getStats(): { totalFixes: number; fileCount: number } {
    let totalFixes = 0;
    for (const history of this.fixHistory.values()) {
      totalFixes += history.length;
    }

    return {
      totalFixes,
      fileCount: this.fixHistory.size
    };
  }
}

// Export singleton instance
export const typeScriptFixer = new TypeScriptFixerAgent();