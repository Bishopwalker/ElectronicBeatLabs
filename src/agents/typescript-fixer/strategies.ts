/**
 * Advanced TypeScript Error Fix Strategies
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface FixContext {
  sourceFile: ts.SourceFile;
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  error: ts.Diagnostic;
}

export interface FixResult {
  success: boolean;
  newContent?: string;
  message?: string;
}

export abstract class FixStrategy {
  abstract canFix(diagnostic: ts.Diagnostic): boolean;
  abstract fix(context: FixContext): FixResult;
}

/**
 * Fix missing type annotations
 */
export class MissingTypeAnnotationFixer extends FixStrategy {
  canFix(diagnostic: ts.Diagnostic): boolean {
    return diagnostic.code === 7006 || // Parameter implicitly has 'any' type
           diagnostic.code === 7031;   // Binding element implicitly has 'any' type
  }

  fix(context: FixContext): FixResult {
    const { sourceFile, typeChecker, error } = context;

    if (!error.start) {
      return { success: false, message: 'Cannot locate error position' };
    }

    const node = this.findNodeAtPosition(sourceFile, error.start);
    if (!node) {
      return { success: false, message: 'Cannot find node at error position' };
    }

    let newContent = sourceFile.getText();

    if (ts.isParameter(node) || ts.isBindingElement(node)) {
      const type = this.inferType(node, typeChecker);
      const typeAnnotation = `: ${type}`;

      const insertPosition = node.name ? node.name.end : node.end;
      newContent = newContent.slice(0, insertPosition) + typeAnnotation + newContent.slice(insertPosition);

      return { success: true, newContent };
    }

    return { success: false, message: 'Unable to fix type annotation' };
  }

  private findNodeAtPosition(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
    function find(node: ts.Node): ts.Node | undefined {
      if (position >= node.getStart() && position < node.getEnd()) {
        return ts.forEachChild(node, find) || node;
      }
      return undefined;
    }
    return find(sourceFile);
  }

  private inferType(node: ts.Node, typeChecker: ts.TypeChecker): string {
    try {
      const type = typeChecker.getTypeAtLocation(node);
      const typeString = typeChecker.typeToString(type);

      // Simplify complex types
      if (typeString.length > 50 || typeString.includes('{')) {
        return 'any';
      }

      return typeString;
    } catch {
      return 'any';
    }
  }
}

/**
 * Fix missing properties in object literals
 */
export class MissingPropertyFixer extends FixStrategy {
  canFix(diagnostic: ts.Diagnostic): boolean {
    return diagnostic.code === 2741 || // Property is missing in type
           diagnostic.code === 2739;   // Type is missing properties
  }

  fix(context: FixContext): FixResult {
    const { sourceFile, error } = context;

    if (!error.start || !error.messageText) {
      return { success: false };
    }

    const messageText = typeof error.messageText === 'string'
      ? error.messageText
      : error.messageText.messageText;

    const propertyMatch = messageText.match(/Property '(\w+)' is missing/);
    if (!propertyMatch) {
      return { success: false };
    }

    const propertyName = propertyMatch[1];
    const node = this.findObjectLiteralAtPosition(sourceFile, error.start);

    if (!node) {
      return { success: false };
    }

    let newContent = sourceFile.getText();
    const objectText = node.getText();

    // Add the missing property with a default value
    let newObjectText: string;
    if (objectText.includes(',')) {
      newObjectText = objectText.replace(/}$/, `, ${propertyName}: undefined }`);
    } else if (objectText === '{}') {
      newObjectText = `{ ${propertyName}: undefined }`;
    } else {
      newObjectText = objectText.replace(/}$/, `, ${propertyName}: undefined }`);
    }

    newContent = newContent.replace(objectText, newObjectText);
    return { success: true, newContent };
  }

  private findObjectLiteralAtPosition(sourceFile: ts.SourceFile, position: number): ts.ObjectLiteralExpression | undefined {
    function find(node: ts.Node): ts.ObjectLiteralExpression | undefined {
      if (position >= node.getStart() && position < node.getEnd()) {
        if (ts.isObjectLiteralExpression(node)) {
          return node;
        }
        return ts.forEachChild(node, find);
      }
      return undefined;
    }
    return find(sourceFile);
  }
}

/**
 * Fix undefined/null access issues
 */
export class NullCheckFixer extends FixStrategy {
  canFix(diagnostic: ts.Diagnostic): boolean {
    return diagnostic.code === 2532 || // Object is possibly 'undefined'
           diagnostic.code === 2533 || // Object is possibly 'null'
           diagnostic.code === 18048;  // Object is possibly 'undefined' or 'null'
  }

  fix(context: FixContext): FixResult {
    const { sourceFile, error } = context;

    if (!error.start) {
      return { success: false };
    }

    const node = this.findPropertyAccessAtPosition(sourceFile, error.start);
    if (!node) {
      return { success: false };
    }

    let newContent = sourceFile.getText();
    const nodeText = node.getText();

    // Add optional chaining
    const newNodeText = this.addOptionalChaining(nodeText);

    if (newNodeText !== nodeText) {
      newContent = newContent.replace(nodeText, newNodeText);
      return { success: true, newContent };
    }

    return { success: false };
  }

  private findPropertyAccessAtPosition(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
    function find(node: ts.Node): ts.Node | undefined {
      if (position >= node.getStart() && position < node.getEnd()) {
        if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
          return node;
        }
        return ts.forEachChild(node, find);
      }
      return undefined;
    }
    return find(sourceFile);
  }

  private addOptionalChaining(text: string): string {
    // Replace . with ?. if not already optional
    if (!text.includes('?.')) {
      return text.replace(/(\w+)\.(\w+)/, '$1?.$2');
    }
    return text;
  }
}

/**
 * Fix missing imports
 */
export class MissingImportFixer extends FixStrategy {
  private commonImports = new Map<string, string>([
    ['useState', 'react'],
    ['useEffect', 'react'],
    ['useCallback', 'react'],
    ['useMemo', 'react'],
    ['useRef', 'react'],
    ['useContext', 'react'],
    ['FC', 'react'],
    ['ReactNode', 'react'],
    ['MouseEvent', 'react'],
    ['ChangeEvent', 'react'],
    ['FormEvent', 'react'],
    ['AudioState', '../types/audio.types'],
    ['FrequencyState', '../types/audio.types'],
    ['PatternMode', '../types/audio.types'],
    ['SessionState', '../types/audio.types'],
    ['AudioConfig', '../types/audio.types'],
    ['WebSocketMessage', '../types/audio.types'],
  ]);

  canFix(diagnostic: ts.Diagnostic): boolean {
    return diagnostic.code === 2304 || // Cannot find name
           diagnostic.code === 2552;   // Cannot find name. Did you mean?
  }

  fix(context: FixContext): FixResult {
    const { sourceFile, error } = context;

    if (!error.messageText) {
      return { success: false };
    }

    const messageText = typeof error.messageText === 'string'
      ? error.messageText
      : error.messageText.messageText;

    const nameMatch = messageText.match(/Cannot find name '(\w+)'/);
    if (!nameMatch) {
      return { success: false };
    }

    const missingName = nameMatch[1];
    const importPath = this.commonImports.get(missingName);

    if (!importPath) {
      return { success: false, message: `Unknown import for ${missingName}` };
    }

    let newContent = sourceFile.getText();
    const importStatement = this.createImportStatement(missingName, importPath);

    // Find the best position to insert the import
    const insertPosition = this.findImportInsertPosition(sourceFile);
    newContent = newContent.slice(0, insertPosition) + importStatement + '\n' + newContent.slice(insertPosition);

    return { success: true, newContent };
  }

  private createImportStatement(name: string, module: string): string {
    if (module === 'react') {
      return `import { ${name} } from '${module}';`;
    }
    return `import type { ${name} } from '${module}';`;
  }

  private findImportInsertPosition(sourceFile: ts.SourceFile): number {
    // Find the last import statement
    let lastImportEnd = 0;

    ts.forEachChild(sourceFile, node => {
      if (ts.isImportDeclaration(node)) {
        lastImportEnd = Math.max(lastImportEnd, node.end);
      }
    });

    return lastImportEnd > 0 ? lastImportEnd : 0;
  }
}

/**
 * Fix type incompatibility with type assertions
 */
export class TypeAssertionFixer extends FixStrategy {
  canFix(diagnostic: ts.Diagnostic): boolean {
    return diagnostic.code === 2322 || // Type not assignable
           diagnostic.code === 2345 || // Argument type not assignable
           diagnostic.code === 2769;   // No overload matches
  }

  fix(context: FixContext): FixResult {
    const { sourceFile, error } = context;

    if (!error.start) {
      return { success: false };
    }

    const node = this.findExpressionAtPosition(sourceFile, error.start);
    if (!node) {
      return { success: false };
    }

    let newContent = sourceFile.getText();
    const nodeText = node.getText();

    // Add type assertion - use 'as unknown as any' for more complex cases
    let assertedText: string;
    if (nodeText.includes('as')) {
      // Already has assertion, make it more permissive
      assertedText = `(${nodeText} as unknown as any)`;
    } else {
      assertedText = `(${nodeText} as any)`;
    }

    newContent = newContent.replace(nodeText, assertedText);
    return { success: true, newContent };
  }

  private findExpressionAtPosition(sourceFile: ts.SourceFile, position: number): ts.Expression | undefined {
    function find(node: ts.Node): ts.Expression | undefined {
      if (position >= node.getStart() && position < node.getEnd()) {
        if (ts.isExpression(node) && !ts.isStringLiteral(node) && !ts.isNumericLiteral(node)) {
          const child = ts.forEachChild(node, find);
          return child || node;
        }
        return ts.forEachChild(node, find);
      }
      return undefined;
    }
    return find(sourceFile);
  }
}

/**
 * Strategy manager for coordinating fixes
 */
export class StrategyManager {
  private strategies: FixStrategy[] = [
    new MissingTypeAnnotationFixer(),
    new MissingPropertyFixer(),
    new NullCheckFixer(),
    new MissingImportFixer(),
    new TypeAssertionFixer()
  ];

  async fixDiagnostic(
    diagnostic: ts.Diagnostic,
    program: ts.Program,
    sourceFile: ts.SourceFile
  ): Promise<FixResult> {
    const typeChecker = program.getTypeChecker();
    const context: FixContext = {
      sourceFile,
      program,
      typeChecker,
      error: diagnostic
    };

    for (const strategy of this.strategies) {
      if (strategy.canFix(diagnostic)) {
        try {
          const result = strategy.fix(context);
          if (result.success) {
            return result;
          }
        } catch (error) {
          console.error(`Strategy ${strategy.constructor.name} failed:`, error);
        }
      }
    }

    return {
      success: false,
      message: `No strategy available for error code ${diagnostic.code}`
    };
  }
}

/**
 * TypeScript program manager for advanced fixing
 */
export class TypeScriptProgramManager {
  private program: ts.Program | null = null;
  private configPath: string;

  constructor(configPath: string = 'tsconfig.json') {
    this.configPath = configPath;
  }

  loadProgram(): ts.Program {
    const configFile = ts.readConfigFile(this.configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(this.configPath)
    );

    this.program = ts.createProgram(
      parsedConfig.fileNames,
      parsedConfig.options
    );

    return this.program;
  }

  getDiagnostics(): ts.Diagnostic[] {
    if (!this.program) {
      this.loadProgram();
    }

    const diagnostics: ts.Diagnostic[] = [];
    const sourceFiles = this.program!.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      // Skip node_modules and declaration files
      if (sourceFile.fileName.includes('node_modules') || sourceFile.fileName.endsWith('.d.ts')) {
        continue;
      }

      const fileDiagnostics = [
        ...this.program!.getSemanticDiagnostics(sourceFile),
        ...this.program!.getSyntacticDiagnostics(sourceFile)
      ];

      diagnostics.push(...fileDiagnostics);
    }

    return diagnostics;
  }

  async fixAllDiagnostics(): Promise<Map<string, string>> {
    const fixes = new Map<string, string>();
    const diagnostics = this.getDiagnostics();
    const strategyManager = new StrategyManager();

    // Group diagnostics by file
    const diagnosticsByFile = new Map<string, ts.Diagnostic[]>();
    for (const diagnostic of diagnostics) {
      if (diagnostic.file) {
        const fileName = diagnostic.file.fileName;
        if (!diagnosticsByFile.has(fileName)) {
          diagnosticsByFile.set(fileName, []);
        }
        diagnosticsByFile.get(fileName)!.push(diagnostic);
      }
    }

    // Fix each file
    for (const [fileName, fileDiagnostics] of diagnosticsByFile) {
      const sourceFile = this.program!.getSourceFile(fileName);
      if (!sourceFile) continue;

      let currentContent = sourceFile.getText();
      let hasChanges = false;

      for (const diagnostic of fileDiagnostics) {
        const result = await strategyManager.fixDiagnostic(
          diagnostic,
          this.program!,
          sourceFile
        );

        if (result.success && result.newContent) {
          currentContent = result.newContent;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        fixes.set(fileName, currentContent);
      }
    }

    return fixes;
  }
}