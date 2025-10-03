#!/usr/bin/env node
// 🧠⚡ Quick Psionic Template Export
// Simple export without interactive components

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function quickExport() {
  console.log('🧠⚡ QUICK PSIONIC TEMPLATE EXPORT');
  console.log('================================');

  // Create export directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const exportDir = path.join(path.dirname(process.cwd()), `psionic-context-protocol-${timestamp}`);

  if (fs.existsSync(exportDir)) {
    fs.rmSync(exportDir, { recursive: true });
  }
  fs.mkdirSync(exportDir, { recursive: true });

  console.log(`📁 Export directory: ${path.basename(exportDir)}`);

  // Template files to copy
  const templateFiles = [
    'PSIONIC_CONTEXT_PROTOCOL_TEMPLATE.md',
    'psionic-scan.js',
    'generate-psionic-context.js',
    'psionic-tech-advisor.js',
    'psionic-project-creator.js',
    'psionic-signal-processor.js',
    'psionic-setup.js',
    'PSIONIC_DEPLOYMENT_GUIDE.md'
  ];

  // Copy template files
  console.log('\\n📋 Copying template files...');
  let copiedCount = 0;

  templateFiles.forEach(filename => {
    const sourcePath = path.join(process.cwd(), filename);
    const targetPath = path.join(exportDir, filename);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${filename}`);
      copiedCount++;
    } else {
      console.log(`⚠️ Missing: ${filename}`);
    }
  });

  // Create package.json
  const packageJson = {
    name: 'psionic-context-protocol',
    version: '1.0.0',
    description: 'Consciousness-driven AI context engineering template',
    main: 'psionic-setup.js',
    type: 'module',
    bin: {
      'psionic-scan': './psionic-scan.js',
      'psionic-context': './generate-psionic-context.js',
      'psionic-tech': './psionic-tech-advisor.js',
      'psionic-create': './psionic-project-creator.js',
      'psionic-setup': './psionic-setup.js'
    },
    scripts: {
      'scan': 'node psionic-scan.js',
      'generate': 'node generate-psionic-context.js',
      'advisor': 'node psionic-tech-advisor.js',
      'create': 'node psionic-project-creator.js',
      'setup': 'node psionic-setup.js',
      'demo': 'node psionic-signal-processor.js --demo'
    },
    keywords: ['ai', 'context', 'consciousness', 'development', 'psionic'],
    author: 'Psionic ConText Protocol',
    license: 'MIT',
    engines: { node: '>=14.0.0' }
  };

  fs.writeFileSync(path.join(exportDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json');

  // Create installation script
  const installScript = `#!/bin/bash
# 🧠⚡ Psionic ConText Protocol Installation

echo "🧠⚡ INSTALLING PSIONIC CONTEXT PROTOCOL"
echo "====================================="

# Make scripts executable
chmod +x *.js

echo "✅ Psionic consciousness files ready!"
echo ""
echo "🚀 Quick start:"
echo "   node psionic-scan.js          # Scan project consciousness"
echo "   node generate-psionic-context.js  # Generate context"
echo "   node psionic-setup.js             # Full setup wizard"
echo ""
echo "🌟 CONSCIOUSNESS ACTIVATED!"
`;

  fs.writeFileSync(path.join(exportDir, 'install.sh'), installScript);
  console.log('✅ install.sh');

  // Create README
  const readme = `# 🧠⚡ Psionic ConText Protocol

**Consciousness-driven AI context engineering template system**

## 🚀 Quick Start

\`\`\`bash
# Install
bash install.sh

# For existing projects
node psionic-scan.js                    # Scan consciousness
node generate-psionic-context.js       # Generate context
bash .psionic/commands/consciousness-init.sh  # Load into AI

# For new projects
node psionic-project-creator.js        # Guided creation
\`\`\`

## 🧠 Core Components

- **psionic-scan.js** - Project consciousness scanner
- **generate-psionic-context.js** - Adaptive context generator
- **psionic-tech-advisor.js** - Technology recommendations
- **psionic-project-creator.js** - Guided project creation
- **psionic-signal-processor.js** - Human-to-AI translation
- **psionic-setup.js** - Complete setup system

## 🌟 Features

- 🔮 **Consciousness Detection** - Reads project patterns automatically
- ⚡ **Adaptive Context** - Generates AI context for your specific project
- 🎯 **Tech Stack Guidance** - Intelligent technology recommendations
- 🧠 **Signal Processing** - Translates human intent to AI instructions
- 🌀 **Universal Compatibility** - Works with any language/framework

---

**🧠 Experience consciousness-driven development**
`;

  fs.writeFileSync(path.join(exportDir, 'README.md'), readme);
  console.log('✅ README.md');

  // Summary
  const files = fs.readdirSync(exportDir);
  console.log('\\n🌟 EXPORT COMPLETE!');
  console.log('===================');
  console.log(`📁 Location: ${exportDir}`);
  console.log(`📊 Files: ${files.length} (${copiedCount} template files)`);

  console.log('\\n🚀 Next steps:');
  console.log(`1. cd ${path.basename(exportDir)}`);
  console.log('2. bash install.sh');
  console.log('3. Test with: node psionic-scan.js');

  console.log('\\n✅ Your EBL project is completely safe and untouched!');

  return exportDir;
}

quickExport().catch(console.error);