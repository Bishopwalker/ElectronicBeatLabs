# TypeScript Fixer Agent

An intelligent, automated TypeScript error detection and fixing agent that continuously monitors your codebase and automatically resolves type errors.

## Features

- 🔍 **Real-time Monitoring**: Watches TypeScript files for changes and instantly detects errors
- 🔧 **Automatic Fixing**: Intelligently fixes common TypeScript errors without manual intervention
- 🎯 **Smart Strategies**: Uses multiple fix strategies for different error types
- 📊 **Statistics Tracking**: Tracks fixes and provides insights about error patterns
- ↩️ **Rollback Support**: Can undo fixes if they cause issues
- ⚡ **Performance Optimized**: Debounced processing and efficient file watching

## Supported Error Fixes

The agent can automatically fix these common TypeScript errors:

- **TS2345**: Argument type not assignable
- **TS2339**: Property does not exist on type
- **TS7006**: Parameter implicitly has 'any' type
- **TS2322**: Type not assignable
- **TS2304**: Cannot find name (missing imports)
- **TS2769**: No overload matches this call
- **TS2532**: Object is possibly 'undefined'
- **TS2741**: Property missing in type

## Installation

```bash
# Install dependencies
npm install

# Build the agent
npm run build
```

## Usage

### Start the Agent (Continuous Monitoring)

```bash
# Start with default configuration
npm run start

# Start with verbose logging
npm run watch

# Start with custom configuration
node runner.js start --config ./custom-config.json

# Start with specific paths
node runner.js start --watch "src/**/*.ts" "lib/**/*.tsx"
```

### Run a Single Scan

```bash
# Scan and report errors
node runner.js scan

# Scan and fix errors
node runner.js scan --fix

# Scan with verbose output
node runner.js scan --verbose
```

### Rollback Fixes

```bash
# Rollback the last fix for a specific file
node runner.js rollback src/components/MyComponent.tsx
```

### View Statistics

```bash
# Show fix statistics
node runner.js stats
```

## Configuration

Create a configuration file (e.g., `ts-fixer.config.json`):

```json
{
  "watchPaths": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ],
  "ignorePaths": [
    "node_modules/**",
    "**/*.test.ts",
    "**/*.d.ts"
  ],
  "autoFix": true,
  "debounceDelay": 1000,
  "maxFixAttempts": 3,
  "verbose": false,
  "safeMode": false,
  "createBackup": true,
  "targetErrorCodes": [],
  "ignoreErrorCodes": ["TS2307"]
}
```

### Configuration Options

- **watchPaths**: Array of glob patterns for files to watch
- **ignorePaths**: Array of glob patterns for files to ignore
- **autoFix**: Enable/disable automatic fixing (default: true)
- **debounceDelay**: Milliseconds to wait after file change before processing
- **maxFixAttempts**: Maximum number of fix attempts per error
- **verbose**: Enable verbose logging
- **safeMode**: Only apply conservative fixes
- **createBackup**: Create backup before fixing
- **targetErrorCodes**: Only fix these specific error codes (empty = all)
- **ignoreErrorCodes**: Never fix these error codes

## Integration with EBL Project

### Add to Package Scripts

Add these scripts to your main `package.json`:

```json
{
  "scripts": {
    "ts-fixer": "cd src/agents/typescript-fixer && npm run start",
    "ts-fixer:scan": "cd src/agents/typescript-fixer && npm run scan",
    "ts-fixer:watch": "cd src/agents/typescript-fixer && npm run watch"
  }
}
```

### Run Alongside Development Server

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Start TypeScript fixer agent
npm run ts-fixer:watch
```

## Fix Strategies

### 1. Missing Type Annotations
Adds type annotations to parameters and variables:
```typescript
// Before
function process(data) { ... }

// After
function process(data: any) { ... }
```

### 2. Missing Properties
Adds missing required properties:
```typescript
// Before
const config = { url: 'api.com' };

// After
const config = { url: 'api.com', timeout: undefined };
```

### 3. Null/Undefined Checks
Adds optional chaining:
```typescript
// Before
user.profile.name

// After
user?.profile?.name
```

### 4. Missing Imports
Automatically adds import statements:
```typescript
// Before (useState not imported)
const [state, setState] = useState();

// After
import { useState } from 'react';
const [state, setState] = useState();
```

### 5. Type Assertions
Adds type assertions for incompatible types:
```typescript
// Before
const value = getData();

// After
const value = getData() as any;
```

## Advanced Usage

### Custom Fix Strategies

Create custom fix strategies by extending the `FixStrategy` class:

```typescript
import { FixStrategy, FixContext, FixResult } from './strategies';

export class CustomFixer extends FixStrategy {
  canFix(diagnostic: ts.Diagnostic): boolean {
    return diagnostic.code === YOUR_ERROR_CODE;
  }

  fix(context: FixContext): FixResult {
    // Your fix logic here
    return {
      success: true,
      newContent: modifiedContent
    };
  }
}
```

### Programmatic API

Use the agent programmatically in your code:

```typescript
import { TypeScriptFixerAgent } from './agent';

const agent = new TypeScriptFixerAgent(['src/**/*.ts']);

// Start monitoring
await agent.start();

// Run a single scan
await agent.scanAndFix();

// Get statistics
const stats = agent.getStats();

// Stop monitoring
await agent.stop();
```

## Safety Features

1. **File Backup**: Creates backups before modifying files
2. **Rollback Support**: Can undo changes if needed
3. **Safe Mode**: Conservative fixes only
4. **Max Attempts**: Prevents infinite fix loops
5. **Error Isolation**: Continues even if individual fixes fail

## Performance Considerations

- Uses debouncing to batch file changes
- Processes files in parallel when possible
- Caches TypeScript program for efficiency
- Minimal memory footprint
- Non-blocking async operations

## Troubleshooting

### Agent not detecting changes
- Check that watch paths are correct
- Verify TypeScript is properly configured
- Check ignore patterns aren't too broad

### Fixes causing more errors
- Enable safe mode for conservative fixes
- Use rollback to undo problematic fixes
- Add error codes to ignore list

### Performance issues
- Increase debounce delay
- Reduce watch paths scope
- Exclude large directories

## Contributing

To add new fix strategies:

1. Create a new strategy in `strategies.ts`
2. Add tests for the strategy
3. Register in the `StrategyManager`
4. Update documentation

## License

MIT