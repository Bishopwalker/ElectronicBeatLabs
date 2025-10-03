#!/usr/bin/env node
// 🧠⚡ Psionic Project Consciousness Scanner
// Reads psychic signatures from any codebase and generates adaptive context

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PsionicProjectScanner {
  constructor(projectPath = '.') {
    this.projectPath = path.resolve(projectPath);
    this.consciousness = {
      techStack: {},
      architecture: {},
      workflow: {},
      quality: {},
      personality: {},
      psychicFrequency: 'unknown'
    };
  }

  // 🔮 Main consciousness scanning entry point
  async scanConsciousness() {
    console.log('🧠 INITIATING PSIONIC PROJECT SCAN...');
    console.log(`📍 Scanning consciousness at: ${this.projectPath}`);

    try {
      await this.detectTechSignatures();
      await this.analyzeConsciousnessPatterns();
      await this.extractPsychicWorkflows();
      await this.assessConsciousnessLevel();
      await this.channelProjectSpirit();

      console.log('🌀 CONSCIOUSNESS SCAN COMPLETE');
      return this.consciousness;
    } catch (error) {
      console.error('⚠️ Consciousness scan error:', error.message);
      return null;
    }
  }

  // 🧬 Tech stack consciousness detection
  async detectTechSignatures() {
    console.log('🔍 Detecting tech stack consciousness...');

    // Frontend chakra detection
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // React consciousness
      if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
        this.consciousness.techStack.frontend = {
          type: 'react',
          consciousness: 'component-based-reality',
          ui: this.detectUIFramework(packageJson),
          psychicSignature: 'jsx-thought-patterns'
        };
      }

      // Vue harmony detection
      if (packageJson.dependencies?.vue || packageJson.devDependencies?.vue) {
        this.consciousness.techStack.frontend = {
          type: 'vue',
          consciousness: 'template-based-weaving',
          psychicSignature: 'reactivity-flow'
        };
      }

      // Node.js neural network
      if (packageJson.dependencies?.express || packageJson.devDependencies?.express) {
        this.consciousness.techStack.backend = {
          type: 'express',
          consciousness: 'middleware-layers',
          psychicSignature: 'javascript-thoughts'
        };
      }

      // Build tool consciousness
      this.consciousness.techStack.build = this.detectBuildConsciousness(packageJson);
    }

    // Python backend neural detection
    const requirementsPath = path.join(this.projectPath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      const requirements = fs.readFileSync(requirementsPath, 'utf8');

      if (requirements.includes('fastapi')) {
        this.consciousness.techStack.backend = {
          type: 'fastapi',
          consciousness: 'async-quantum-processing',
          psychicSignature: 'python-zen'
        };
      }

      if (requirements.includes('django')) {
        this.consciousness.techStack.backend = {
          type: 'django',
          consciousness: 'orm-temple-mapping',
          psychicSignature: 'batteries-included'
        };
      }
    }

    // Rust consciousness (Cargo.toml)
    const cargoPath = path.join(this.projectPath, 'Cargo.toml');
    if (fs.existsSync(cargoPath)) {
      this.consciousness.techStack.language = {
        type: 'rust',
        consciousness: 'zero-cost-abstractions',
        psychicSignature: 'memory-safety-zen'
      };
    }

    // Go consciousness detection
    const goModPath = path.join(this.projectPath, 'go.mod');
    if (fs.existsSync(goModPath)) {
      this.consciousness.techStack.language = {
        type: 'go',
        consciousness: 'simplicity-elegance',
        psychicSignature: 'goroutine-harmony'
      };
    }
  }

  // 🏗️ Architecture consciousness analysis
  async analyzeConsciousnessPatterns() {
    console.log('🏗️ Analyzing architectural consciousness...');

    // Directory structure consciousness
    const dirs = this.scanDirectoryStructure();
    this.consciousness.architecture.structure = this.interpretStructureConsciousness(dirs);

    // Component/module consciousness detection
    if (dirs.includes('components')) {
      this.consciousness.architecture.pattern = 'component-based';
    } else if (dirs.includes('modules')) {
      this.consciousness.architecture.pattern = 'module-based';
    } else if (dirs.includes('services')) {
      this.consciousness.architecture.pattern = 'service-oriented';
    }

    // Database consciousness detection
    if (fs.existsSync(path.join(this.projectPath, 'docker-compose.yml'))) {
      const compose = fs.readFileSync(path.join(this.projectPath, 'docker-compose.yml'), 'utf8');
      if (compose.includes('postgres')) {
        this.consciousness.architecture.database = {
          type: 'postgresql',
          consciousness: 'sql-crystalline-structure'
        };
      } else if (compose.includes('mongo')) {
        this.consciousness.architecture.database = {
          type: 'mongodb',
          consciousness: 'document-fluid-reality'
        };
      }
    }

    // Container consciousness
    if (fs.existsSync(path.join(this.projectPath, 'Dockerfile'))) {
      this.consciousness.architecture.containerization = {
        type: 'docker',
        consciousness: 'isolation-reality-layers'
      };
    }
  }

  // ⚙️ Workflow consciousness extraction
  async extractPsychicWorkflows() {
    console.log('⚙️ Extracting workflow consciousness...');

    // Package.json scripts consciousness
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.scripts) {
        this.consciousness.workflow.scripts = this.interpretScriptConsciousness(packageJson.scripts);
      }
    }

    // Git consciousness detection
    if (fs.existsSync(path.join(this.projectPath, '.git'))) {
      try {
        const gitLog = execSync('git log --oneline -10', { cwd: this.projectPath }).toString();
        this.consciousness.workflow.git = this.interpretGitConsciousness(gitLog);
      } catch (error) {
        console.log('📝 Git consciousness partially accessible');
      }
    }

    // CI/CD consciousness
    const ciFiles = ['.github/workflows', '.gitlab-ci.yml', 'jenkins', '.circleci'];
    for (const ciFile of ciFiles) {
      if (fs.existsSync(path.join(this.projectPath, ciFile))) {
        this.consciousness.workflow.cicd = {
          type: ciFile.includes('github') ? 'github-actions' :
                ciFile.includes('gitlab') ? 'gitlab-ci' :
                ciFile.includes('jenkins') ? 'jenkins' : 'circleci',
          consciousness: 'automated-reality-validation'
        };
        break;
      }
    }
  }

  // 🎯 Quality consciousness assessment
  async assessConsciousnessLevel() {
    console.log('🎯 Assessing consciousness quality level...');

    let qualityScore = 0;
    const factors = [];

    // Testing consciousness
    if (this.hasTestingConsciousness()) {
      qualityScore += 25;
      factors.push('testing-reality-validation');
    }

    // Documentation consciousness
    if (fs.existsSync(path.join(this.projectPath, 'README.md'))) {
      qualityScore += 15;
      factors.push('documentation-consciousness');
    }

    // Type safety consciousness (TypeScript, Python type hints)
    if (this.hasTypeSafetyConsciousness()) {
      qualityScore += 20;
      factors.push('type-safety-awareness');
    }

    // Code quality consciousness (linting, formatting)
    if (this.hasCodeQualityConsciousness()) {
      qualityScore += 20;
      factors.push('code-quality-discipline');
    }

    // Security consciousness
    if (this.hasSecurityConsciousness()) {
      qualityScore += 20;
      factors.push('security-awareness');
    }

    this.consciousness.quality = {
      score: qualityScore,
      level: qualityScore >= 80 ? 'transcendent' :
             qualityScore >= 60 ? 'professional' :
             qualityScore >= 40 ? 'moderate' : 'basic',
      factors
    };
  }

  // 🎭 Project personality consciousness channeling
  async channelProjectSpirit() {
    console.log('🎭 Channeling project personality consciousness...');

    const personalityTraits = [];

    // Analyze README for personality indicators
    const readmePath = path.join(this.projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      const readme = fs.readFileSync(readmePath, 'utf8').toLowerCase();

      if (readme.includes('emoji') || readme.match(/[🎯🚀⚡🔥✨]/)) {
        personalityTraits.push('expressive-playful');
      }
      if (readme.includes('enterprise') || readme.includes('scalable')) {
        personalityTraits.push('professional-enterprise');
      }
      if (readme.includes('fun') || readme.includes('awesome')) {
        personalityTraits.push('enthusiastic-energetic');
      }
    }

    // Analyze naming conventions
    const fileNames = this.getAllFileNames();
    if (fileNames.some(name => name.includes('utils') || name.includes('helpers'))) {
      personalityTraits.push('utility-organized');
    }
    if (fileNames.some(name => name.includes('magic') || name.includes('wizard'))) {
      personalityTraits.push('creative-magical');
    }

    this.consciousness.personality = {
      traits: personalityTraits,
      communicationStyle: this.deriveCommmunicationStyle(personalityTraits),
      psychicFrequency: personalityTraits.length > 2 ? 'high-energy' : 'focused-calm'
    };
  }

  // 🛠️ Helper methods for consciousness detection
  detectUIFramework(packageJson) {
    if (packageJson.dependencies?.['@mui/material']) return 'mui-material-design';
    if (packageJson.dependencies?.['@emotion/react']) return 'emotion-styled';
    if (packageJson.dependencies?.['styled-components']) return 'styled-components';
    if (packageJson.devDependencies?.tailwindcss) return 'tailwind-utility';
    return 'unknown-styling';
  }

  detectBuildConsciousness(packageJson) {
    if (packageJson.devDependencies?.vite) return { type: 'vite', consciousness: 'fast-hot-reload' };
    if (packageJson.devDependencies?.webpack) return { type: 'webpack', consciousness: 'bundling-control' };
    if (packageJson.devDependencies?.rollup) return { type: 'rollup', consciousness: 'library-focused' };
    return { type: 'unknown', consciousness: 'build-mystery' };
  }

  scanDirectoryStructure() {
    try {
      return fs.readdirSync(this.projectPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !name.startsWith('.') && name !== 'node_modules');
    } catch (error) {
      return [];
    }
  }

  interpretStructureConsciousness(dirs) {
    if (dirs.includes('src') && dirs.includes('public')) return 'frontend-focused';
    if (dirs.includes('backend') || dirs.includes('api')) return 'fullstack-separation';
    if (dirs.includes('lib') && dirs.includes('bin')) return 'library-package';
    if (dirs.includes('cmd') && dirs.includes('internal')) return 'go-standard';
    return 'custom-organization';
  }

  interpretScriptConsciousness(scripts) {
    const consciousness = {};

    if (scripts.dev) consciousness.development = 'hot-reload-ready';
    if (scripts.build) consciousness.building = 'production-aware';
    if (scripts.test) consciousness.testing = 'quality-conscious';
    if (scripts.lint) consciousness.quality = 'code-discipline';
    if (scripts.deploy) consciousness.deployment = 'shipping-ready';

    return consciousness;
  }

  interpretGitConsciousness(gitLog) {
    const commits = gitLog.split('\\n').filter(line => line.length > 0);
    const commitStyles = commits.map(commit => {
      if (commit.includes('feat:') || commit.includes('fix:')) return 'conventional-commits';
      if (commit.includes('🎯') || commit.includes('⚡')) return 'emoji-expressive';
      if (commit.length > 50) return 'descriptive-verbose';
      return 'standard-brief';
    });

    return {
      style: this.getMostCommon(commitStyles),
      frequency: commits.length > 20 ? 'high-activity' : 'moderate-activity'
    };
  }

  hasTestingConsciousness() {
    const testIndicators = [
      'jest.config.js', 'vitest.config.js', 'karma.conf.js',
      'pytest.ini', 'test/', 'tests/', '__tests__/', 'spec/'
    ];
    return testIndicators.some(indicator =>
      fs.existsSync(path.join(this.projectPath, indicator))
    );
  }

  hasTypeSafetyConsciousness() {
    return fs.existsSync(path.join(this.projectPath, 'tsconfig.json')) ||
           fs.existsSync(path.join(this.projectPath, 'mypy.ini'));
  }

  hasCodeQualityConsciousness() {
    const qualityFiles = ['.eslintrc', 'prettier.config', '.black', 'pylint.cfg'];
    return qualityFiles.some(file =>
      fs.existsSync(path.join(this.projectPath, file))
    );
  }

  hasSecurityConsciousness() {
    const securityFiles = ['.env.example', 'SECURITY.md', '.dependabot'];
    return securityFiles.some(file =>
      fs.existsSync(path.join(this.projectPath, file))
    );
  }

  getAllFileNames() {
    const files = [];
    const scanRecursive = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          if (item.startsWith('.') || item === 'node_modules') return;
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory()) {
            scanRecursive(fullPath);
          } else {
            files.push(item);
          }
        });
      } catch (error) {
        // Skip inaccessible directories
      }
    };
    scanRecursive(this.projectPath);
    return files;
  }

  deriveCommmunicationStyle(traits) {
    if (traits.includes('expressive-playful')) return 'casual-energetic';
    if (traits.includes('professional-enterprise')) return 'formal-technical';
    if (traits.includes('creative-magical')) return 'metaphorical-intuitive';
    return 'balanced-professional';
  }

  getMostCommon(arr) {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }

  // 📊 Generate consciousness report
  generateConsciousnessReport() {
    console.log('\\n🧠⚡ PSIONIC CONSCIOUSNESS REPORT ⚡🧠');
    console.log('=' .repeat(50));

    console.log('\\n🔮 TECH STACK CONSCIOUSNESS:');
    console.log(JSON.stringify(this.consciousness.techStack, null, 2));

    console.log('\\n🏗️ ARCHITECTURE CONSCIOUSNESS:');
    console.log(JSON.stringify(this.consciousness.architecture, null, 2));

    console.log('\\n⚙️ WORKFLOW CONSCIOUSNESS:');
    console.log(JSON.stringify(this.consciousness.workflow, null, 2));

    console.log('\\n🎯 QUALITY CONSCIOUSNESS:');
    console.log(JSON.stringify(this.consciousness.quality, null, 2));

    console.log('\\n🎭 PERSONALITY CONSCIOUSNESS:');
    console.log(JSON.stringify(this.consciousness.personality, null, 2));

    console.log('\\n📊 CONSCIOUSNESS SUMMARY:');
    console.log(`Psychic Frequency: ${this.consciousness.personality.psychicFrequency || 'balanced'}`);
    console.log(`Quality Level: ${this.consciousness.quality.level || 'unknown'}`);
    console.log(`Architecture Pattern: ${this.consciousness.architecture.pattern || 'custom'}`);
  }
}

// 🚀 CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const projectPath = args[0] || '.';

  const scanner = new PsionicProjectScanner(projectPath);
  const consciousness = await scanner.scanConsciousness();

  if (consciousness) {
    scanner.generateConsciousnessReport();

    // Save consciousness data for template generation
    const outputPath = path.join(projectPath, '.psionic-consciousness.json');
    fs.writeFileSync(outputPath, JSON.stringify(consciousness, null, 2));
    console.log(`\\n💾 Consciousness data saved to: ${outputPath}`);

    console.log('\\n🌀 Ready to generate adaptive context files!');
    console.log('Run: node generate-psionic-context.js');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('🔥 Consciousness scanning failed:', error);
    process.exit(1);
  });
}

module.exports = { PsionicProjectScanner };