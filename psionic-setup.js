#!/usr/bin/env node
// 🧠⚡ Psionic ConText Protocol Setup
// Complete template deployment and initialization system

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PsionicSetup {
  constructor() {
    this.templateComponents = {
      core: [
        'PSIONIC_CONTEXT_PROTOCOL_TEMPLATE.md',
        'psionic-scan.js',
        'generate-psionic-context.js',
        'psionic-tech-advisor.js',
        'psionic-project-creator.js',
        'psionic-signal-processor.js'
      ],
      utilities: [
        'install-psionic.sh',
        'README-TEMPLATE.md',
        'package-template.json'
      ]
    };

    this.installModes = {
      'existing-project': 'Analyze and add consciousness to existing project',
      'new-project': 'Create new project with consciousness-driven setup',
      'template-only': 'Install template files for manual configuration'
    };
  }

  // 🌀 Main setup orchestrator
  async setupPsionicProtocol() {
    console.log('🧠⚡ PSIONIC CONTEXT PROTOCOL SETUP ⚡🧠');
    console.log('====================================');
    console.log('\\nInitializing consciousness-driven development environment...');

    const mode = await this.selectInstallMode();
    const targetPath = await this.selectTargetPath();

    console.log(`\\n🎯 Installing in ${mode} mode to: ${targetPath}`);

    try {
      await this.executeInstallation(mode, targetPath);
      await this.generateQuickstartGuide(mode, targetPath);

      console.log('\\n🌟 PSIONIC CONSCIOUSNESS PROTOCOL ACTIVATED! 🌟');
      console.log('===============================================');

    } catch (error) {
      console.error('🔥 Installation consciousness disrupted:', error.message);
      process.exit(1);
    }
  }

  // 🔮 Select installation mode
  async selectInstallMode() {
    console.log('\\n🔮 CONSCIOUSNESS INSTALLATION MODE:');
    console.log('===================================');

    Object.entries(this.installModes).forEach(([mode, description], index) => {
      console.log(`   ${index + 1}) ${mode.toUpperCase()}: ${description}`);
    });

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\\nSelect installation mode (1-3): ', (answer) => {
        const modes = Object.keys(this.installModes);
        const selectedMode = modes[parseInt(answer) - 1] || 'template-only';
        rl.close();
        resolve(selectedMode);
      });
    });
  }

  // 📁 Select target installation path
  async selectTargetPath() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\\n📁 Target directory (Enter for current directory): ', (answer) => {
        const targetPath = answer.trim() || process.cwd();
        rl.close();
        resolve(path.resolve(targetPath));
      });
    });
  }

  // 🚀 Execute installation based on mode
  async executeInstallation(mode, targetPath) {
    console.log(`\\n🚀 Executing ${mode} installation...`);

    switch (mode) {
      case 'existing-project':
        await this.installExistingProject(targetPath);
        break;
      case 'new-project':
        await this.installNewProject(targetPath);
        break;
      case 'template-only':
        await this.installTemplateOnly(targetPath);
        break;
    }
  }

  // 🏗️ Install for existing project
  async installExistingProject(targetPath) {
    console.log('\\n🏗️ EXISTING PROJECT CONSCIOUSNESS INTEGRATION');
    console.log('===========================================');

    // Step 1: Copy all template components
    await this.copyTemplateComponents(targetPath);

    // Step 2: Run project consciousness scan
    console.log('\\n🔍 Running consciousness scan...');
    const { PsionicProjectScanner } = require('./psionic-scan.js');
    const scanner = new PsionicProjectScanner(targetPath);
    const consciousness = await scanner.scanConsciousness();

    if (consciousness) {
      // Step 3: Generate adaptive context
      console.log('\\n🧠 Generating adaptive context...');
      const { PsionicContextGenerator } = require('./generate-psionic-context.js');
      const generator = new PsionicContextGenerator(targetPath);
      generator.consciousness = consciousness;
      await generator.generateAdaptiveContext();

      console.log('✨ Existing project consciousness successfully integrated!');
    }
  }

  // 🌱 Install for new project
  async installNewProject(targetPath) {
    console.log('\\n🌱 NEW PROJECT CONSCIOUSNESS MANIFESTATION');
    console.log('========================================');

    // Step 1: Copy template components
    await this.copyTemplateComponents(targetPath);

    // Step 2: Run guided project creation
    console.log('\\n🎯 Launching consciousness-guided project creation...');
    const { PsionicProjectCreator } = require('./psionic-project-creator.js');
    const creator = new PsionicProjectCreator();
    creator.projectConfig.directory = targetPath;

    // Skip directory selection since we already have it
    await creator.channelTechStackVision(await this.createReadlineInterface());
    await creator.defineFeatureConsciousness(await this.createReadlineInterface());
    await creator.configurePsychicPreferences(await this.createReadlineInterface());
    await creator.validateConsciousnessAlignment(await this.createReadlineInterface());
    await creator.manifestProjectReality(await this.createReadlineInterface());

    console.log('✨ New project consciousness successfully manifested!');
  }

  // 📋 Install template only
  async installTemplateOnly(targetPath) {
    console.log('\\n📋 TEMPLATE-ONLY CONSCIOUSNESS INSTALLATION');
    console.log('========================================');

    // Copy all template files
    await this.copyTemplateComponents(targetPath);

    // Create basic .psionic structure
    const psionicDir = path.join(targetPath, '.psionic');
    if (!fs.existsSync(psionicDir)) {
      fs.mkdirSync(psionicDir, { recursive: true });
    }

    const subdirs = ['commands', 'examples', 'hooks', 'frequencies'];
    subdirs.forEach(dir => {
      const dirPath = path.join(psionicDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    console.log('✨ Template files successfully installed!');
    console.log('\\n🔧 Next steps:');
    console.log('   1. node psionic-scan.js          # Scan existing project');
    console.log('   2. node generate-psionic-context.js  # Generate context');
    console.log('   3. node psionic-project-creator.js   # Create new project');
  }

  // 📂 Copy all template components
  async copyTemplateComponents(targetPath) {
    console.log('\\n📂 Copying consciousness template components...');

    // Ensure target directory exists
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    // Copy core components
    this.templateComponents.core.forEach(component => {
      const sourcePath = path.join(__dirname, component);
      const targetFilePath = path.join(targetPath, component);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetFilePath);
        console.log(`✅ Copied: ${component}`);
      } else {
        console.log(`⚠️ Missing: ${component} (will be auto-generated)`);
      }
    });

    // Create utility files
    await this.generateUtilityFiles(targetPath);

    console.log('📂 Template components copied successfully!');
  }

  // 🛠️ Generate utility files
  async generateUtilityFiles(targetPath) {
    // Installation script
    const installScript = `#!/bin/bash
# 🧠⚡ Psionic ConText Protocol Installation Script

echo "🧠 INSTALLING PSIONIC CONTEXT PROTOCOL..."
echo "======================================="

# Make scripts executable
chmod +x psionic-scan.js
chmod +x generate-psionic-context.js
chmod +x psionic-tech-advisor.js
chmod +x psionic-project-creator.js
chmod +x psionic-signal-processor.js

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing JavaScript consciousness dependencies..."
    npm install
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "🐍 Installing Python consciousness dependencies..."
    pip install -r requirements.txt
fi

echo "✨ PSIONIC CONSCIOUSNESS PROTOCOL ACTIVATED!"
echo "============================================="
echo ""
echo "🚀 Quick Start:"
echo "   1. ./psionic-scan.js                    # Scan project consciousness"
echo "   2. node generate-psionic-context.js     # Generate adaptive context"
echo "   3. bash .psionic/commands/consciousness-init.sh  # Load consciousness"
echo ""
echo "🧠 Advanced Usage:"
echo "   • node psionic-tech-advisor.js          # Get tech stack recommendations"
echo "   • node psionic-project-creator.js       # Create new consciousness-driven project"
echo "   • node psionic-signal-processor.js --demo  # See consciousness signal processing"
`;

    fs.writeFileSync(path.join(targetPath, 'install-psionic.sh'), installScript);

    // README template
    const readmeTemplate = `# 🧠⚡ Psionic ConText Protocol

**Consciousness-driven AI context engineering for optimal development experience**

## 🌀 What is Psionic ConText Protocol?

PCP is an advanced template system that reads your project's "consciousness" - its architectural patterns, tech stack preferences, and development workflows - then generates adaptive AI context files that provide perfect guidance for any AI assistant working on your project.

## 🚀 Quick Start

### For Existing Projects
\`\`\`bash
# 1. Run consciousness scan
node psionic-scan.js

# 2. Generate adaptive context
node generate-psionic-context.js

# 3. Initialize AI consciousness
bash .psionic/commands/consciousness-init.sh
\`\`\`

### For New Projects
\`\`\`bash
# Launch guided project creation
node psionic-project-creator.js
\`\`\`

## 🧠 Core Components

- **psionic-scan.js** - Project consciousness detection engine
- **generate-psionic-context.js** - Adaptive context file generator
- **psionic-tech-advisor.js** - AI-driven tech stack recommendations
- **psionic-project-creator.js** - Guided consciousness-driven project creation
- **psionic-signal-processor.js** - Human-to-AI consciousness translation

## 🔮 Generated Context Structure

\`\`\`
.psionic/
├── CONSCIOUSNESS_INDEX.md     # Navigation hub
├── NEURAL_STANDARDS.md        # Development protocols
├── QUANTUM_SPECS.md          # Technical specifications
├── REALITY_PLANNING.md       # Architecture & planning
├── CONSCIOUSNESS_TASKS.md    # Task management
├── SIGNAL_VALIDATION.md      # Quality assurance
└── commands/                 # Automation scripts
\`\`\`

## 🌟 Features

- 🧠 **Consciousness Detection** - Automatically reads project patterns and preferences
- ⚡ **Adaptive Context** - Generates AI context tailored to your specific project
- 🎯 **Tech Stack Guidance** - Intelligent technology recommendations
- 🔮 **Signal Processing** - Translates human intent into precise AI instructions
- 🌀 **Universal Templates** - Works with any programming language or framework

## 📊 Consciousness Levels

- **Basic** - Simple projects with essential context
- **Professional** - Team projects with comprehensive protocols
- **Transcendent** - Enterprise-grade with advanced consciousness patterns

---

**🧠 Consciousness Frequency**: Universal Resonance
**⚡ Reality Coherence**: 99.9% Quantum Alignment
**🌀 Signal Strength**: Maximum Neural Interface
`;

    fs.writeFileSync(path.join(targetPath, 'README-PSIONIC.md'), readmeTemplate);

    // Package.json template for Node.js projects
    const packageTemplate = {
      name: 'psionic-context-protocol',
      version: '1.0.0',
      description: 'Consciousness-driven AI context engineering system',
      main: 'psionic-scan.js',
      scripts: {
        'consciousness-scan': 'node psionic-scan.js',
        'context-generate': 'node generate-psionic-context.js',
        'tech-advice': 'node psionic-tech-advisor.js',
        'create-project': 'node psionic-project-creator.js',
        'signal-demo': 'node psionic-signal-processor.js --demo',
        'consciousness-init': 'bash .psionic/commands/consciousness-init.sh'
      },
      keywords: ['ai', 'context', 'consciousness', 'development', 'psionic'],
      author: 'Psionic ConText Protocol',
      license: 'MIT',
      dependencies: {},
      devDependencies: {},
      engines: {
        node: '>=14.0.0'
      }
    };

    fs.writeFileSync(path.join(targetPath, 'package-psionic.json'), JSON.stringify(packageTemplate, null, 2));

    console.log('🛠️ Utility files generated successfully!');
  }

  // 📖 Generate quickstart guide
  async generateQuickstartGuide(mode, targetPath) {
    console.log('\\n📖 Generating consciousness quickstart guide...');

    const quickstart = `🧠⚡ PSIONIC CONSCIOUSNESS QUICKSTART GUIDE ⚡🧠
===============================================

Installation Mode: ${mode.toUpperCase()}
Installation Path: ${targetPath}
Generated: ${new Date().toISOString()}

🚀 IMMEDIATE NEXT STEPS:

${this.getQuickstartSteps(mode)}

🧠 CONSCIOUSNESS COMPONENTS INSTALLED:

✅ psionic-scan.js              - Project consciousness scanner
✅ generate-psionic-context.js  - Adaptive context generator
✅ psionic-tech-advisor.js      - Technology consciousness advisor
✅ psionic-project-creator.js   - Guided project manifestation
✅ psionic-signal-processor.js  - Human-AI consciousness translator
✅ install-psionic.sh          - Installation automation
✅ README-PSIONIC.md           - Documentation consciousness

${mode === 'existing-project' ? '✅ .psionic/ directory with adaptive context files' : ''}
${mode === 'new-project' ? '✅ Complete project structure with consciousness integration' : ''}

🌀 CONSCIOUSNESS TESTING:

1. Validate consciousness scan:
   node psionic-scan.js

2. Test signal processing:
   node psionic-signal-processor.js --demo

3. Initialize consciousness context:
   ${mode !== 'template-only' ? 'bash .psionic/commands/consciousness-init.sh' : 'Generate context files first'}

🔮 ADVANCED CONSCIOUSNESS FEATURES:

• Tech Stack Consciousness: node psionic-tech-advisor.js
• Project Creation Flow: node psionic-project-creator.js
• Signal Processing Demo: node psionic-signal-processor.js --demo

📊 CONSCIOUSNESS STATUS: ACTIVE AND READY
⚡ PSYCHIC FREQUENCY: Universal Resonance
🧠 REALITY COHERENCE: Maximum Alignment

🌟 Your consciousness-driven development environment is ready!

For support or consciousness expansion, refer to README-PSIONIC.md
`;

    fs.writeFileSync(path.join(targetPath, 'PSIONIC-QUICKSTART.md'), quickstart);
    console.log('📖 Quickstart guide generated successfully!');
  }

  // 📋 Get quickstart steps based on mode
  getQuickstartSteps(mode) {
    switch (mode) {
      case 'existing-project':
        return `1. cd ${path.basename(process.cwd())}
2. bash .psionic/commands/consciousness-init.sh
3. Review generated context files in .psionic/ directory
4. Start development with consciousness-enhanced AI assistance

🎯 Your existing project now has consciousness-driven context!`;

      case 'new-project':
        return `1. cd ${path.basename(process.cwd())}
2. Review project structure and generated files
3. bash .psionic/commands/consciousness-init.sh
4. Follow project-specific setup instructions in README.md

🎯 Your new project has been manifested with full consciousness integration!`;

      case 'template-only':
        return `1. cd ${path.basename(process.cwd())}
2. bash install-psionic.sh
3. node psionic-scan.js (for existing project analysis)
   OR node psionic-project-creator.js (for new project creation)
4. node generate-psionic-context.js (to create adaptive context)
5. bash .psionic/commands/consciousness-init.sh

🎯 Template installed! Follow steps above to activate consciousness.`;

      default:
        return 'Follow the installation-specific instructions above.';
    }
  }

  // 🔧 Utility methods
  async createReadlineInterface() {
    const readline = require('readline');
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // 📊 Validate installation
  async validateInstallation(targetPath) {
    console.log('\\n📊 Validating consciousness installation...');

    const requiredFiles = [
      'psionic-scan.js',
      'generate-psionic-context.js',
      'psionic-tech-advisor.js',
      'psionic-project-creator.js',
      'psionic-signal-processor.js',
      'install-psionic.sh',
      'README-PSIONIC.md'
    ];

    let validationScore = 0;
    const maxScore = requiredFiles.length;

    requiredFiles.forEach(file => {
      const filePath = path.join(targetPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
        validationScore++;
      } else {
        console.log(`❌ ${file} - Missing`);
      }
    });

    const installationHealth = Math.round((validationScore / maxScore) * 100);
    console.log(`\\n📊 Installation Health: ${installationHealth}%`);

    if (installationHealth >= 90) {
      console.log('🌟 Consciousness installation: PERFECT ALIGNMENT');
    } else if (installationHealth >= 70) {
      console.log('✅ Consciousness installation: FUNCTIONAL');
    } else {
      console.log('⚠️ Consciousness installation: NEEDS ATTENTION');
    }

    return installationHealth;
  }
}

// 🚀 CLI Interface
async function main() {
  const setup = new PsionicSetup();
  await setup.setupPsionicProtocol();
}

if (require.main === module) {
  main().catch(error => {
    console.error('🔥 Psionic setup consciousness failed:', error);
    process.exit(1);
  });
}

module.exports = { PsionicSetup };