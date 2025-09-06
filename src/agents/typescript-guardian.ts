/**
 * TypeScript Guardian Agent
 * Real-time error detection and fixes for React 18+ audio/visualization applications
 * 
 * Specialized for electromagnetic beat lab applications with:
 * - Audio processing and Web Audio API
 * - Complex state management
 * - Real-time data streaming
 * - Binaural beat generation
 * - Pattern visualization systems
 */

import * as ts from 'typescript';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface TypeScriptIssue {
  file: string;
  line: number;
  column: number;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  fix: string;
  explanation: string;
  prevention: string;
  category: 'React' | 'Audio' | 'Types' | 'Performance' | 'WebAPI' | 'Hooks' | 'State';
}

export interface GuardianConfig {
  projectRoot: string;
  tsconfigPath: string;
  audioSpecific: boolean;
  reactVersion: string;
  strictMode: boolean;
}

export class TypeScriptGuardian {
  private program: ts.Program;
  private checker: ts.TypeChecker;
  private config: GuardianConfig;
  private issues: TypeScriptIssue[] = [];

  // Audio/Visualization specific type patterns
  private readonly AUDIO_TYPES = [
    'AudioContext', 'AudioNode', 'OscillatorNode', 'GainNode', 'BiquadFilterNode',
    'AudioBuffer', 'AudioParam', 'AudioWorklet', 'MediaStreamAudioSourceNode'
  ];

  private readonly VISUALIZATION_TYPES = [
    'CanvasRenderingContext2D', 'WebGLRenderingContext', 'WebGL2RenderingContext',
    'HTMLCanvasElement', 'ImageData', 'Path2D'
  ];

  private readonly REACT_HOOKS = [
    'useState', 'useEffect', 'useCallback', 'useMemo', 'useContext', 'useReducer',
    'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue'
  ];

  constructor(config: GuardianConfig) {
    this.config = config;
    this.initializeProgram();
  }

  private initializeProgram(): void {
    const configFile = ts.readConfigFile(this.config.tsconfigPath, ts.sys.readFile);
    const compilerOptions = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      this.config.projectRoot
    );

    this.program = ts.createProgram({
      rootNames: compilerOptions.fileNames,
      options: compilerOptions.options
    });

    this.checker = this.program.getTypeChecker();
  }

  /**
   * Scan all TypeScript files for issues
   */
  public scanProject(): TypeScriptIssue[] {
    this.issues = [];
    const sourceFiles = this.program.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      if (!sourceFile.fileName.includes('node_modules')) {
        this.scanFile(sourceFile);
      }
    }

    return this.sortIssuesBySeverity(this.issues);
  }

  /**
   * Scan a specific file for TypeScript issues
   */
  public scanFile(sourceFile: ts.SourceFile): TypeScriptIssue[] {
    const fileIssues: TypeScriptIssue[] = [];

    // Get TypeScript compiler diagnostics
    const diagnostics = [
      ...this.program.getSemanticDiagnostics(sourceFile),
      ...this.program.getSyntacticDiagnostics(sourceFile)
    ];

    // Process compiler diagnostics
    for (const diagnostic of diagnostics) {
      const issue = this.convertDiagnosticToIssue(diagnostic, sourceFile);
      if (issue) {
        fileIssues.push(issue);
      }
    }

    // Custom analysis for React/Audio patterns
    this.analyzeReactPatterns(sourceFile, fileIssues);
    this.analyzeAudioPatterns(sourceFile, fileIssues);
    this.analyzePerformancePatterns(sourceFile, fileIssues);
    this.analyzeStateManagementPatterns(sourceFile, fileIssues);

    this.issues.push(...fileIssues);
    return fileIssues;
  }

  private convertDiagnosticToIssue(
    diagnostic: ts.Diagnostic,
    sourceFile: ts.SourceFile
  ): TypeScriptIssue | null {
    if (!diagnostic.start) return null;

    const { line, character } = sourceFile.getLineAndCharacterOfPosition(diagnostic.start);
    const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

    return {
      file: sourceFile.fileName,
      line: line + 1,
      column: character + 1,
      issue: messageText,
      severity: this.getSeverityFromDiagnostic(diagnostic),
      fix: this.generateFixForDiagnostic(diagnostic, sourceFile),
      explanation: this.explainDiagnostic(diagnostic),
      prevention: this.getPreventionTip(diagnostic),
      category: this.categorizeDiagnostic(diagnostic, messageText)
    };
  }

  /**
   * Analyze React-specific patterns and common issues
   */
  private analyzeReactPatterns(sourceFile: ts.SourceFile, issues: TypeScriptIssue[]): void {
    const sourceText = sourceFile.getFullText();

    // Check for useState with complex types
    this.checkUseStatePatterns(sourceFile, sourceText, issues);
    
    // Check for useEffect dependency arrays
    this.checkUseEffectPatterns(sourceFile, sourceText, issues);
    
    // Check for event handler types
    this.checkEventHandlerTypes(sourceFile, sourceText, issues);
    
    // Check for ref typing issues
    this.checkRefTyping(sourceFile, sourceText, issues);
    
    // Check for component prop interfaces
    this.checkComponentProps(sourceFile, sourceText, issues);
  }

  /**
   * Analyze Audio/Web Audio API specific patterns
   */
  private analyzeAudioPatterns(sourceFile: ts.SourceFile, issues: TypeScriptIssue[]): void {
    const sourceText = sourceFile.getFullText();

    // Check AudioContext usage
    this.checkAudioContextUsage(sourceFile, sourceText, issues);
    
    // Check AudioNode chaining
    this.checkAudioNodeChaining(sourceFile, sourceText, issues);
    
    // Check for proper cleanup of audio resources
    this.checkAudioResourceCleanup(sourceFile, sourceText, issues);
    
    // Check frequency/timing calculations
    this.checkAudioCalculations(sourceFile, sourceText, issues);
  }

  /**
   * Analyze performance-critical type patterns
   */
  private analyzePerformancePatterns(sourceFile: ts.SourceFile, issues: TypeScriptIssue[]): void {
    const sourceText = sourceFile.getFullText();

    // Check for expensive type assertions in render loops
    this.checkExpensiveTypeAssertions(sourceFile, sourceText, issues);
    
    // Check for missing React.memo/useMemo opportunities
    this.checkMemoizationOpportunities(sourceFile, sourceText, issues);
    
    // Check for union type narrowing issues
    this.checkUnionTypeNarrowing(sourceFile, sourceText, issues);
  }

  /**
   * Analyze state management patterns
   */
  private analyzeStateManagementPatterns(sourceFile: ts.SourceFile, issues: TypeScriptIssue[]): void {
    const sourceText = sourceFile.getFullText();

    // Check for proper discriminated unions
    this.checkDiscriminatedUnions(sourceFile, sourceText, issues);
    
    // Check for state update patterns
    this.checkStateUpdatePatterns(sourceFile, sourceText, issues);
  }

  // Individual pattern analysis methods

  private checkUseStatePatterns(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    const useStateRegex = /useState<([^>]+)>\(([^)]*)\)/g;
    let match;

    while ((match = useStateRegex.exec(sourceText)) !== null) {
      const type = match[1];
      const initialValue = match[2];
      const position = sourceFile.getPositionOfLineAndCharacter(
        sourceFile.getLineAndCharacterOfPosition(match.index).line,
        sourceFile.getLineAndCharacterOfPosition(match.index).character
      );

      // Check for complex types without proper initialization
      if (type.includes('AudioEngine') || type.includes('ElectromagneticField')) {
        if (!initialValue || initialValue.trim() === '') {
          issues.push({
            file: sourceFile.fileName,
            line: sourceFile.getLineAndCharacterOfPosition(position).line + 1,
            column: sourceFile.getLineAndCharacterOfPosition(position).character + 1,
            issue: `Complex audio/electromagnetic state initialized without proper default values`,
            severity: 'High',
            fix: `Provide proper initialization: useState<${type}>({ /* proper default values */ })`,
            explanation: 'Complex audio states need proper initialization to prevent undefined behavior in audio processing',
            prevention: 'Always provide complete default objects for complex audio/visualization states',
            category: 'Audio'
          });
        }
      }
    }
  }

  private checkUseEffectPatterns(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    const useEffectRegex = /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\},\s*\[([^\]]*)\]/g;
    let match;

    while ((match = useEffectRegex.exec(sourceText)) !== null) {
      const dependencies = match[1];
      const position = match.index;

      // Check for missing audio context dependencies
      if (sourceText.slice(match.index, match.index + 500).includes('audioContext') && 
          !dependencies.includes('audioContext')) {
        issues.push({
          file: sourceFile.fileName,
          line: sourceFile.getLineAndCharacterOfPosition(position).line + 1,
          column: sourceFile.getLineAndCharacterOfPosition(position).character + 1,
          issue: 'useEffect accessing audioContext without including it in dependencies',
          severity: 'Medium',
          fix: 'Add audioContext to dependency array: [audioContext, ...]',
          explanation: 'Audio contexts should be tracked in useEffect dependencies to ensure proper cleanup and re-initialization',
          prevention: 'Always include audio-related objects in useEffect dependency arrays',
          category: 'React'
        });
      }
    }
  }

  private checkEventHandlerTypes(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    const handlerRegex = /(onChange|onClick|onSubmit|onPlay|onStop)\s*:\s*\([^)]*\)\s*=>/g;
    let match;

    while ((match = handlerRegex.exec(sourceText)) !== null) {
      const handlerName = match[1];
      const position = match.index;

      // Check for missing event type in audio control handlers
      if ((handlerName === 'onPlay' || handlerName === 'onStop') && !match[0].includes('React.')) {
        issues.push({
          file: sourceFile.fileName,
          line: sourceFile.getLineAndCharacterOfPosition(position).line + 1,
          column: sourceFile.getLineAndCharacterOfPosition(position).character + 1,
          issue: `Audio control handler ${handlerName} missing proper event typing`,
          severity: 'Low',
          fix: `${handlerName}: (event: React.MouseEvent<HTMLButtonElement>) => void`,
          explanation: 'Audio control handlers should have explicit event types for better type safety',
          prevention: 'Always type event handlers explicitly, especially for audio controls',
          category: 'React'
        });
      }
    }
  }

  private checkAudioContextUsage(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    if (sourceText.includes('new AudioContext()')) {
      const match = sourceText.indexOf('new AudioContext()');
      const position = sourceFile.getPositionOfLineAndCharacter(
        sourceFile.getLineAndCharacterOfPosition(match).line,
        sourceFile.getLineAndCharacterOfPosition(match).character
      );

      // Check if there's proper error handling
      const contextBlock = sourceText.slice(Math.max(0, match - 200), match + 200);
      if (!contextBlock.includes('try') && !contextBlock.includes('catch')) {
        issues.push({
          file: sourceFile.fileName,
          line: sourceFile.getLineAndCharacterOfPosition(position).line + 1,
          column: sourceFile.getLineAndCharacterOfPosition(position).character + 1,
          issue: 'AudioContext creation without error handling',
          severity: 'High',
          fix: 'Wrap AudioContext creation in try-catch block for browser compatibility',
          explanation: 'AudioContext creation can fail in some browsers or contexts, especially with autoplay policies',
          prevention: 'Always wrap Web Audio API calls in proper error handling',
          category: 'Audio'
        });
      }
    }
  }

  private checkAudioResourceCleanup(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    const audioNodeRegex = /(oscillator|gainNode|filter|audioBuffer)\.(disconnect|stop)/g;
    let match;
    const cleanupFound = new Set<string>();

    while ((match = audioNodeRegex.exec(sourceText)) !== null) {
      cleanupFound.add(match[1]);
    }

    // Check if audio nodes are created but not cleaned up
    const audioCreationRegex = /(createOscillator|createGain|createBiquadFilter)\(\)/g;
    while ((match = audioCreationRegex.exec(sourceText)) !== null) {
      const nodeType = match[1].replace('create', '').toLowerCase();
      if (!cleanupFound.has(nodeType + 'Node') && !cleanupFound.has(nodeType)) {
        issues.push({
          file: sourceFile.fileName,
          line: sourceFile.getLineAndCharacterOfPosition(match.index).line + 1,
          column: sourceFile.getLineAndCharacterOfPosition(match.index).character + 1,
          issue: `Audio node created without proper cleanup: ${match[1]}`,
          severity: 'Medium',
          fix: 'Add cleanup in useEffect return function: () => { audioNode.disconnect(); }',
          explanation: 'Audio nodes should be properly disconnected to prevent memory leaks and audio artifacts',
          prevention: 'Always pair audio node creation with cleanup in useEffect or component unmount',
          category: 'Audio'
        });
      }
    }
  }

  private checkExpensiveTypeAssertions(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    const assertionRegex = /as\s+(AudioContext|ElectromagneticField|PatternConfig)/g;
    let match;

    while ((match = assertionRegex.exec(sourceText)) !== null) {
      const surroundingCode = sourceText.slice(Math.max(0, match.index - 100), match.index + 100);
      
      // Check if assertion is inside a render function or loop
      if (surroundingCode.includes('map(') || surroundingCode.includes('return (')) {
        issues.push({
          file: sourceFile.fileName,
          line: sourceFile.getLineAndCharacterOfPosition(match.index).line + 1,
          column: sourceFile.getLineAndCharacterOfPosition(match.index).character + 1,
          issue: `Type assertion in render loop may impact performance: ${match[0]}`,
          severity: 'Medium',
          fix: 'Move type assertion outside render or use type guards instead',
          explanation: 'Type assertions in render loops can cause unnecessary re-computations',
          prevention: 'Use type guards or move expensive type operations outside render cycles',
          category: 'Performance'
        });
      }
    }
  }

  private getSeverityFromDiagnostic(diagnostic: ts.Diagnostic): 'Critical' | 'High' | 'Medium' | 'Low' {
    switch (diagnostic.category) {
      case ts.DiagnosticCategory.Error:
        return 'Critical';
      case ts.DiagnosticCategory.Warning:
        return 'High';
      case ts.DiagnosticCategory.Suggestion:
        return 'Medium';
      default:
        return 'Low';
    }
  }

  private generateFixForDiagnostic(diagnostic: ts.Diagnostic, sourceFile: ts.SourceFile): string {
    const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    
    // Common fixes for audio/React applications
    if (messageText.includes('Property') && messageText.includes('does not exist')) {
      return 'Check interface definition or add optional property with ?:';
    }
    
    if (messageText.includes('Type') && messageText.includes('is not assignable')) {
      return 'Use type assertion or proper type guards to narrow the type';
    }
    
    if (messageText.includes('Argument of type')) {
      return 'Ensure argument matches expected parameter type or use type conversion';
    }

    return 'Review TypeScript error message and adjust types accordingly';
  }

  private explainDiagnostic(diagnostic: ts.Diagnostic): string {
    const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    
    if (messageText.includes('AudioContext')) {
      return 'AudioContext types require proper initialization and browser compatibility checks';
    }
    
    if (messageText.includes('useEffect') || messageText.includes('useState')) {
      return 'React hooks require proper typing for state management and effect dependencies';
    }
    
    return 'TypeScript strictness helps catch potential runtime errors early in development';
  }

  private getPreventionTip(diagnostic: ts.Diagnostic): string {
    const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    
    if (messageText.includes('AudioContext') || messageText.includes('AudioNode')) {
      return 'Use Web Audio API type definitions and check browser compatibility';
    }
    
    if (messageText.includes('React')) {
      return 'Import React types and use proper component typing patterns';
    }
    
    return 'Enable strict mode and use TypeScript ESLint rules for consistent code quality';
  }

  private categorizeDiagnostic(diagnostic: ts.Diagnostic, messageText: string): TypeScriptIssue['category'] {
    if (messageText.includes('Audio') || messageText.includes('Oscillator') || messageText.includes('Gain')) {
      return 'Audio';
    }
    
    if (messageText.includes('useState') || messageText.includes('useEffect') || messageText.includes('React')) {
      return 'React';
    }
    
    if (messageText.includes('Canvas') || messageText.includes('WebGL')) {
      return 'WebAPI';
    }
    
    if (messageText.includes('State') || messageText.includes('AppState')) {
      return 'State';
    }
    
    if (messageText.includes('Hook')) {
      return 'Hooks';
    }
    
    return 'Types';
  }

  // Placeholder methods for additional pattern checks
  private checkRefTyping(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for ref typing issues
  }

  private checkComponentProps(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for component prop interface issues
  }

  private checkAudioNodeChaining(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for audio node chaining issues
  }

  private checkAudioCalculations(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for frequency/timing calculation issues
  }

  private checkMemoizationOpportunities(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for missing memoization opportunities
  }

  private checkUnionTypeNarrowing(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for union type narrowing issues
  }

  private checkDiscriminatedUnions(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for discriminated union pattern issues
  }

  private checkStateUpdatePatterns(sourceFile: ts.SourceFile, sourceText: string, issues: TypeScriptIssue[]): void {
    // Implementation for state update pattern issues
  }

  private sortIssuesBySeverity(issues: TypeScriptIssue[]): TypeScriptIssue[] {
    const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    return issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  /**
   * Format issues for output
   */
  public formatIssues(issues: TypeScriptIssue[]): string {
    let output = '';
    
    for (const issue of issues) {
      output += `FILE: ${issue.file}:${issue.line}\n`;
      output += `ISSUE: ${issue.issue}\n`;
      output += `SEVERITY: ${issue.severity}\n`;
      output += `FIX: ${issue.fix}\n`;
      output += `EXPLANATION: ${issue.explanation}\n`;
      output += `PREVENTION: ${issue.prevention}\n`;
      output += `CATEGORY: ${issue.category}\n\n`;
    }
    
    return output;
  }
}

/**
 * Factory function to create TypeScript Guardian for audio/visualization apps
 */
export function createAudioAppGuardian(projectRoot: string): TypeScriptGuardian {
  return new TypeScriptGuardian({
    projectRoot,
    tsconfigPath: resolve(projectRoot, 'tsconfig.json'),
    audioSpecific: true,
    reactVersion: '18+',
    strictMode: true
  });
}

/**
 * Quick scan utility for immediate feedback
 */
export function quickScan(filePath: string, projectRoot: string): TypeScriptIssue[] {
  const guardian = createAudioAppGuardian(projectRoot);
  const program = guardian['program'];
  const sourceFile = program.getSourceFile(filePath);
  
  if (!sourceFile) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  return guardian.scanFile(sourceFile);
}