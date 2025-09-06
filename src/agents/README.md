# TypeScript Guardian Agent 🛡️

Real-time error detection and fixes for React 18+ audio/visualization applications.

## Overview

TypeScript Guardian is an intelligent agent designed specifically for complex React applications that work with audio processing, binaural beats, electromagnetic field calculations, and real-time visualizations. It provides advanced TypeScript error detection, React pattern analysis, and domain-specific validation for audio/visualization codebases.

## Features

### Core Capabilities
- **TypeScript 5.x strict mode compliance**
- **React 18+ pattern analysis** - Hooks, state management, event handlers
- **Audio/Web Audio API type validation** - AudioContext, audio nodes, buffer management
- **Performance-critical code optimization** - Type assertion optimization, render loop analysis
- **Real-time monitoring** - Watch mode with debouncing
- **Interactive fixing** - Guided issue resolution with explanations

### Domain-Specific Expertise
- **Electromagnetic field calculations** - Type safety for frequency and phase calculations
- **Binaural beat generation** - Frequency range validation and audio processing
- **Pattern visualization systems** - Canvas and WebGL type checking
- **Timer control systems** - State transition type validation
- **Custom preset creation** - Complex object type management

## Installation

The agent is already integrated into your project. Dependencies are installed via:

```bash
npm install --save-dev typescript commander chalk inquirer chokidar
```

## Quick Start

### 1. Basic Project Scan
```bash
npx ts-node src/agents/cli.ts scan
```

### 2. Watch Mode (Continuous Monitoring)
```bash
npx ts-node src/agents/cli.ts watch
```

### 3. Interactive Fix Mode
```bash
npx ts-node src/agents/cli.ts fix
```

### 4. Scan Specific File
```bash
npx ts-node src/agents/cli.ts scan --file src/components/ElectromagneticBeatLab.tsx
```

## Configuration Profiles

### Audio Application Profile (Default)
```typescript
import { createAudioAppGuardian } from './agents/typescript-guardian';

const guardian = createAudioAppGuardian(process.cwd());
const issues = guardian.scanProject();
```

### Custom Configuration
```typescript
import { getConfig } from './agents/config';

// Available profiles: 'audio', 'strict', 'development', 'production'
const config = getConfig('production');
```

## Issue Categories

### 1. React Issues
- **useState with complex types** - Proper initialization of audio/electromagnetic state
- **useEffect dependency arrays** - Audio context and WebSocket dependencies
- **Event handler types** - Audio control button handlers
- **Ref typing** - Canvas and audio element references
- **Component prop interfaces** - Complex audio engine props

### 2. Audio/WebAPI Issues
- **AudioContext usage** - Browser compatibility and error handling
- **Audio node chaining** - Proper connection and disconnection
- **Resource cleanup** - Memory leak prevention in audio processing
- **Frequency calculations** - Type safety for binaural beat math
- **Buffer management** - AudioBuffer lifecycle management

### 3. Performance Issues
- **Type assertions in render loops** - Performance impact analysis
- **Missing memoization** - React.memo and useMemo opportunities
- **Complex type inference** - Compiler performance optimization
- **Union type narrowing** - Runtime performance improvements

### 4. State Management Issues
- **Discriminated unions** - Pattern-based state transitions
- **Immutability patterns** - Redux-style state updates
- **State normalization** - Complex nested state structures

## Output Format

```
FILE: src/components/ElectromagneticBeatLab.tsx:295
ISSUE: Type assertion in section lookup without proper type guard
SEVERITY: Medium
FIX: Create proper type guard function or define section interface
EXPLANATION: Type assertions can hide runtime errors and impact performance
PREVENTION: Use discriminated unions or proper interface definitions
CATEGORY: Types
```

## Command Line Options

### Scan Command
```bash
npx ts-node src/agents/cli.ts scan [options]

Options:
  -f, --file <path>        Scan specific file
  -p, --project <path>     Project root path (default: current directory)
  --severity <level>       Minimum severity: Critical|High|Medium|Low
  --category <type>        Filter by category: React|Audio|Types|Performance|WebAPI|Hooks|State
  --format <type>          Output format: table|json|detailed
```

### Watch Command
```bash
npx ts-node src/agents/cli.ts watch [options]

Options:
  -p, --project <path>     Project root path
  --debounce <ms>          Debounce delay in milliseconds (default: 500)
```

### Fix Command
```bash
npx ts-node src/agents/cli.ts fix [options]

Options:
  -f, --file <path>        Fix issues in specific file
  -p, --project <path>     Project root path
```

## Integration Examples

### 1. Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx ts-node src/agents/integration.ts pre-commit"
    }
  }
}
```

### 2. CI/CD Pipeline
```yaml
# .gitlab-ci.yml
typescript_guardian:
  script:
    - npx ts-node src/agents/integration.ts ci-cd
    - echo "TypeScript Guardian check completed"
  artifacts:
    reports:
      junit: typescript-guardian-report.xml
```

### 3. VS Code Integration
```javascript
// In VS Code extension
const { VSCodeIntegration } = require('./agents/integration');
const integration = new VSCodeIntegration(workspaceRoot);
const diagnostics = await integration.getFileDiagnostics(document.uri.fsPath);
```

### 4. Watch Mode Integration
```typescript
import { GuardianIntegration } from './agents/integration';

const integration = new GuardianIntegration({
  projectRoot: process.cwd(),
  config: getConfig('audio'),
  watchMode: true,
  debounceMs: 500
}, {
  onCriticalIssue: (issue) => {
    console.error(`🚨 Critical issue: ${issue.issue}`);
    // Send to Slack, email, etc.
  },
  onScanComplete: (summary) => {
    console.log(`✅ Scan complete: ${summary.totalIssues} issues`);
  }
});

integration.startWatch();
```

## Common Issues and Fixes

### 1. Audio Context Creation
**Issue**: AudioContext created without error handling
```typescript
// ❌ Problematic
const audioContext = new AudioContext();

// ✅ Fixed
const createAudioContext = (): AudioContext | null => {
  try {
    return new AudioContext();
  } catch (error) {
    console.error('AudioContext not supported:', error);
    return null;
  }
};
```

### 2. React Hook Dependencies
**Issue**: useEffect missing audio dependencies
```typescript
// ❌ Problematic
useEffect(() => {
  audioContext.resume();
}, []); // Missing audioContext dependency

// ✅ Fixed
useEffect(() => {
  if (audioContext) {
    audioContext.resume();
  }
}, [audioContext]);
```

### 3. Complex State Initialization
**Issue**: Complex audio state not properly initialized
```typescript
// ❌ Problematic
const [audioState, setAudioState] = useState<AudioEngineState>();

// ✅ Fixed
const [audioState, setAudioState] = useState<AudioEngineState>({
  isPlaying: false,
  volume: 0.7,
  leftFreq: 440,
  rightFreq: 440,
  beatFreq: 0,
  waveform: 'sine',
  gainL: null,
  gainR: null,
  oscillatorL: null,
  oscillatorR: null,
  context: null
});
```

### 4. Type Assertions in Performance-Critical Code
**Issue**: Type assertions in render loops
```typescript
// ❌ Problematic
return patterns.map(pattern => (
  <PatternCard key={pattern.id} pattern={pattern as PatternConfig} />
));

// ✅ Fixed
const isPatternConfig = (pattern: unknown): pattern is PatternConfig => {
  return typeof pattern === 'object' && pattern !== null && 'id' in pattern;
};

return patterns.filter(isPatternConfig).map(pattern => (
  <PatternCard key={pattern.id} pattern={pattern} />
));
```

## Development Workflow Integration

### Package.json Scripts
Add these scripts to your package.json:

```json
{
  "scripts": {
    "ts:check": "npx ts-node src/agents/cli.ts scan",
    "ts:watch": "npx ts-node src/agents/cli.ts watch",
    "ts:fix": "npx ts-node src/agents/cli.ts fix",
    "ts:strict": "npx ts-node src/agents/cli.ts scan --severity Critical"
  }
}
```

### IDE Integration
For VS Code, create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "TypeScript Guardian Scan",
      "type": "shell",
      "command": "npx ts-node src/agents/cli.ts scan",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

## Advanced Configuration

### Custom Rules
```typescript
import { CUSTOM_RULES } from './agents/config';

// Add electromagnetic field validation
CUSTOM_RULES.push({
  name: 'custom-frequency-validation',
  description: 'Validate frequency ranges for safety',
  category: 'Audio',
  severity: 'Critical',
  pattern: /frequency.*>.*1000/, // Frequencies over 1kHz
  fix: 'Add frequency range validation (20-1000Hz for binaural beats)',
  explanation: 'High frequencies can be unsafe for binaural beat applications',
  prevention: 'Use branded number types with built-in validation'
});
```

### Environment-Specific Configs
```typescript
// Development
const devGuardian = new GuardianIntegration({
  projectRoot: process.cwd(),
  config: getConfig('development'),
  watchMode: true,
  debounceMs: 1000 // Longer debounce for development
});

// Production
const prodGuardian = new GuardianIntegration({
  projectRoot: process.cwd(),
  config: getConfig('production'),
  watchMode: false,
  debounceMs: 0
});
```

## Troubleshooting

### Common Issues

1. **"Cannot find module 'typescript'"**
   ```bash
   npm install --save-dev typescript
   ```

2. **"Program initialization failed"**
   - Check tsconfig.json exists and is valid
   - Verify project root path is correct

3. **"No files to analyze"**
   - Check include/exclude patterns in config
   - Verify TypeScript files exist in src/ directory

4. **Performance issues with large projects**
   - Use file-specific scanning: `--file path/to/file.tsx`
   - Adjust debounce timing: `--debounce 1000`

### Debug Mode
```bash
DEBUG=typescript-guardian npx ts-node src/agents/cli.ts scan
```

## Contributing

The TypeScript Guardian is designed to be extensible. To add new rules:

1. **Add rule definition** in `src/agents/config.ts`
2. **Implement pattern matching** in `typescript-guardian.ts`
3. **Add tests** in `test-guardian.ts`
4. **Update documentation** in this README

## Performance Considerations

- **Incremental compilation**: Uses TypeScript's program reuse
- **File watching**: Debounced scanning to avoid excessive work
- **Pattern caching**: Regex patterns are compiled once
- **Selective scanning**: Can target specific files or categories

## Version History

- **v1.0.0**: Initial release with React 18+ and Web Audio API support
- Focus on electromagnetic beat lab applications
- Real-time monitoring and interactive fixing
- CI/CD and IDE integration support

---

**Pro Tip**: Run `npm run ts:watch` during development for real-time TypeScript quality monitoring! 🚀