#!/usr/bin/env node
// 🧠⚡ Psionic Tech Stack Advisor
// Channels consciousness patterns to suggest optimal technology combinations

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class PsionicTechAdvisor {
  constructor() {
    this.techConsciousness = {
      frontend: {
        'react': {
          consciousness: 'component-based-reality',
          psychicSignature: 'jsx-thought-patterns',
          complexity: 'moderate',
          learningCurve: 'gentle',
          ecosystem: 'vast-collective',
          bestFor: ['interactive-ui', 'complex-state', 'team-development'],
          pairsWell: ['typescript', 'vite', 'material-ui', 'styled-components']
        },
        'vue': {
          consciousness: 'template-based-weaving',
          psychicSignature: 'progressive-enhancement',
          complexity: 'simple',
          learningCurve: 'easy',
          ecosystem: 'growing-harmony',
          bestFor: ['rapid-prototyping', 'gentle-learning', 'progressive-apps'],
          pairsWell: ['typescript', 'vite', 'vuetify', 'pinia']
        },
        'angular': {
          consciousness: 'enterprise-framework-mind',
          psychicSignature: 'dependency-injection-flow',
          complexity: 'high',
          learningCurve: 'steep',
          ecosystem: 'enterprise-grade',
          bestFor: ['large-apps', 'enterprise-development', 'typed-architecture'],
          pairsWell: ['typescript', 'rxjs', 'angular-material', 'ngrx']
        },
        'svelte': {
          consciousness: 'compile-time-magic',
          psychicSignature: 'disappearing-framework',
          complexity: 'low',
          learningCurve: 'gentle',
          ecosystem: 'boutique-quality',
          bestFor: ['performance-critical', 'small-bundles', 'modern-syntax'],
          pairsWell: ['typescript', 'sveltekit', 'tailwindcss']
        },
        'vanilla': {
          consciousness: 'pure-web-essence',
          psychicSignature: 'direct-dom-manipulation',
          complexity: 'variable',
          learningCurve: 'foundation-building',
          ecosystem: 'web-standards',
          bestFor: ['learning-fundamentals', 'performance-obsessed', 'simple-sites'],
          pairsWell: ['typescript', 'web-components', 'lit']
        }
      },

      backend: {
        'fastapi': {
          consciousness: 'async-quantum-processing',
          psychicSignature: 'python-zen-speed',
          complexity: 'moderate',
          learningCurve: 'gentle',
          ecosystem: 'modern-python',
          bestFor: ['api-development', 'async-processing', 'data-science-integration'],
          pairsWell: ['uvicorn', 'pydantic', 'sqlalchemy', 'postgresql']
        },
        'express': {
          consciousness: 'middleware-layer-flow',
          psychicSignature: 'javascript-everywhere',
          complexity: 'simple',
          learningCurve: 'easy',
          ecosystem: 'npm-universe',
          bestFor: ['rapid-development', 'javascript-teams', 'microservices'],
          pairsWell: ['typescript', 'prisma', 'mongodb', 'redis']
        },
        'nestjs': {
          consciousness: 'angular-inspired-backend',
          psychicSignature: 'decorator-driven-architecture',
          complexity: 'high',
          learningCurve: 'moderate',
          ecosystem: 'enterprise-node',
          bestFor: ['enterprise-apis', 'scalable-architecture', 'typescript-native'],
          pairsWell: ['typescript', 'prisma', 'graphql', 'postgresql']
        },
        'django': {
          consciousness: 'batteries-included-temple',
          psychicSignature: 'python-productivity',
          complexity: 'moderate',
          learningCurve: 'gentle',
          ecosystem: 'mature-python',
          bestFor: ['rapid-development', 'admin-interfaces', 'content-management'],
          pairsWell: ['postgresql', 'redis', 'celery', 'django-rest-framework']
        },
        'spring': {
          consciousness: 'enterprise-java-fortress',
          psychicSignature: 'dependency-injection-mastery',
          complexity: 'high',
          learningCurve: 'steep',
          ecosystem: 'enterprise-java',
          bestFor: ['enterprise-applications', 'complex-business-logic', 'microservices'],
          pairsWell: ['postgresql', 'redis', 'kafka', 'docker']
        },
        'go-fiber': {
          consciousness: 'performance-minimalism',
          psychicSignature: 'concurrent-simplicity',
          complexity: 'moderate',
          learningCurve: 'moderate',
          ecosystem: 'go-ecosystem',
          bestFor: ['high-performance', 'microservices', 'system-programming'],
          pairsWell: ['postgresql', 'redis', 'docker', 'kubernetes']
        },
        'rust-axum': {
          consciousness: 'memory-safe-performance',
          psychicSignature: 'zero-cost-abstractions',
          complexity: 'high',
          learningCurve: 'steep',
          ecosystem: 'rust-performance',
          bestFor: ['extreme-performance', 'memory-critical', 'system-level'],
          pairsWell: ['postgresql', 'redis', 'tokio', 'serde']
        }
      },

      database: {
        'postgresql': {
          consciousness: 'relational-excellence',
          psychicSignature: 'sql-mastery-acid',
          complexity: 'moderate',
          ecosystem: 'enterprise-ready',
          bestFor: ['complex-relationships', 'data-integrity', 'scalable-queries'],
          pairsWell: ['prisma', 'sqlalchemy', 'pgbouncer']
        },
        'mongodb': {
          consciousness: 'document-flexibility',
          psychicSignature: 'schemaless-freedom',
          complexity: 'simple',
          ecosystem: 'nosql-leader',
          bestFor: ['flexible-schemas', 'rapid-iteration', 'json-like-data'],
          pairsWell: ['mongoose', 'compass', 'atlas']
        },
        'redis': {
          consciousness: 'memory-speed-cache',
          psychicSignature: 'key-value-lightning',
          complexity: 'simple',
          ecosystem: 'caching-champion',
          bestFor: ['caching', 'sessions', 'real-time-features'],
          pairsWell: ['redis-cluster', 'redis-sentinel']
        },
        'sqlite': {
          consciousness: 'embedded-simplicity',
          psychicSignature: 'file-based-database',
          complexity: 'minimal',
          ecosystem: 'embedded-everywhere',
          bestFor: ['development', 'small-apps', 'embedded-systems'],
          pairsWell: ['prisma', 'sqlalchemy']
        }
      },

      deployment: {
        'docker': {
          consciousness: 'containerization-reality',
          psychicSignature: 'isolation-consistency',
          complexity: 'moderate',
          ecosystem: 'container-standard',
          bestFor: ['consistency', 'microservices', 'cloud-deployment'],
          pairsWell: ['docker-compose', 'kubernetes', 'nginx']
        },
        'kubernetes': {
          consciousness: 'orchestration-mastery',
          psychicSignature: 'container-symphony',
          complexity: 'high',
          ecosystem: 'cloud-native',
          bestFor: ['scalability', 'high-availability', 'enterprise-deployment'],
          pairsWell: ['docker', 'helm', 'prometheus']
        },
        'vercel': {
          consciousness: 'frontend-deployment-zen',
          psychicSignature: 'git-push-deploy',
          complexity: 'minimal',
          ecosystem: 'jamstack-focused',
          bestFor: ['frontend-apps', 'serverless-functions', 'edge-computing'],
          pairsWell: ['nextjs', 'react', 'typescript']
        },
        'netlify': {
          consciousness: 'jamstack-simplicity',
          psychicSignature: 'continuous-deployment',
          complexity: 'minimal',
          ecosystem: 'static-site-champion',
          bestFor: ['static-sites', 'jamstack-apps', 'form-handling'],
          pairsWell: ['gatsby', 'hugo', 'eleventy']
        },
        'aws': {
          consciousness: 'cloud-everything-platform',
          psychicSignature: 'infinite-scalability',
          complexity: 'very-high',
          ecosystem: 'cloud-dominant',
          bestFor: ['enterprise-scale', 'complex-infrastructure', 'global-deployment'],
          pairsWell: ['terraform', 'docker', 'kubernetes']
        }
      },

      testing: {
        'jest': {
          consciousness: 'javascript-testing-standard',
          psychicSignature: 'snapshot-driven',
          ecosystem: 'react-native',
          bestFor: ['unit-testing', 'integration-testing', 'mocking']
        },
        'vitest': {
          consciousness: 'vite-native-speed',
          psychicSignature: 'hot-reload-testing',
          ecosystem: 'modern-frontend',
          bestFor: ['fast-feedback', 'vite-projects', 'typescript-native']
        },
        'pytest': {
          consciousness: 'python-testing-zen',
          psychicSignature: 'fixture-parametrization',
          ecosystem: 'python-standard',
          bestFor: ['python-backends', 'data-testing', 'complex-fixtures']
        },
        'cypress': {
          consciousness: 'e2e-user-simulation',
          psychicSignature: 'real-browser-testing',
          ecosystem: 'frontend-e2e',
          bestFor: ['user-journeys', 'integration-testing', 'visual-testing']
        }
      },

      styling: {
        'tailwindcss': {
          consciousness: 'utility-first-philosophy',
          psychicSignature: 'atomic-css-classes',
          ecosystem: 'design-system-ready',
          bestFor: ['rapid-ui-development', 'consistent-design', 'responsive-design']
        },
        'styled-components': {
          consciousness: 'css-in-js-power',
          psychicSignature: 'component-scoped-styles',
          ecosystem: 'react-ecosystem',
          bestFor: ['dynamic-styling', 'theme-switching', 'component-libraries']
        },
        'material-ui': {
          consciousness: 'google-design-system',
          psychicSignature: 'material-design-language',
          ecosystem: 'react-focused',
          bestFor: ['professional-ui', 'consistent-components', 'accessibility']
        },
        'scss': {
          consciousness: 'css-enhanced-power',
          psychicSignature: 'nested-variables-mixins',
          ecosystem: 'css-preprocessor',
          bestFor: ['traditional-css-approach', 'legacy-projects', 'design-flexibility']
        }
      }
    };

    this.projectTypes = {
      'web-app': {
        typical: {
          frontend: ['react', 'vue'],
          backend: ['fastapi', 'express', 'nestjs'],
          database: ['postgresql', 'mongodb'],
          deployment: ['vercel', 'netlify', 'docker'],
          testing: ['jest', 'vitest', 'cypress'],
          styling: ['tailwindcss', 'styled-components', 'material-ui']
        }
      },
      'api-service': {
        typical: {
          backend: ['fastapi', 'express', 'nestjs', 'go-fiber'],
          database: ['postgresql', 'mongodb', 'redis'],
          deployment: ['docker', 'kubernetes', 'aws'],
          testing: ['pytest', 'jest']
        }
      },
      'mobile-app': {
        typical: {
          frontend: ['react-native', 'expo'],
          backend: ['fastapi', 'express', 'firebase'],
          database: ['mongodb', 'firebase'],
          deployment: ['app-store', 'play-store'],
          testing: ['jest', 'detox']
        }
      },
      'desktop-app': {
        typical: {
          frontend: ['electron', 'tauri'],
          backend: ['express', 'rust-tauri'],
          database: ['sqlite', 'postgresql'],
          deployment: ['github-releases', 'app-stores'],
          testing: ['jest', 'playwright']
        }
      },
      'data-science': {
        typical: {
          backend: ['fastapi', 'django'],
          database: ['postgresql', 'mongodb'],
          tools: ['jupyter', 'pandas', 'scikit-learn'],
          deployment: ['docker', 'aws-sagemaker'],
          testing: ['pytest']
        }
      }
    };
  }

  // 🧠 Main consciousness-driven tech advice
  async provideGuidedAdvice() {
    console.log('🧠⚡ PSIONIC TECH STACK ADVISOR ⚡🧠');
    console.log('====================================');
    console.log('\\nChanneling optimal technology consciousness for your project...');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      const requirements = await this.gatherConsciousnessRequirements(rl);
      const recommendations = this.channelTechRecommendations(requirements);

      this.presentRecommendations(recommendations);

      const shouldGenerate = await this.askYesNo(rl, '\\n🌀 Generate adaptive context files based on these recommendations?');
      if (shouldGenerate) {
        await this.generateContextFromRecommendations(recommendations);
      }

    } finally {
      rl.close();
    }
  }

  // 🔮 Gather project consciousness requirements
  async gatherConsciousnessRequirements(rl) {
    const requirements = {};

    console.log('\\n🔮 CONSCIOUSNESS SCANNING QUESTIONS:');

    // Project type consciousness
    console.log('\\n1. 🎯 What reality are you manifesting?');
    console.log('   a) Web Application (user interfaces, dashboards)');
    console.log('   b) API Service (backend services, microservices)');
    console.log('   c) Mobile App (iOS/Android applications)');
    console.log('   d) Desktop App (cross-platform desktop software)');
    console.log('   e) Data Science Project (ML, analytics, research)');
    console.log('   f) Other (describe your vision)');

    const projectType = await this.askQuestion(rl, 'Enter your choice (a-f): ');
    requirements.projectType = this.parseProjectType(projectType);

    // Scale consciousness
    console.log('\\n2. ⚡ What consciousness scale resonates?');
    console.log('   a) Personal (learning, experimentation, small projects)');
    console.log('   b) Team (collaborative development, shared codebase)');
    console.log('   c) Enterprise (scalable, production-ready, business-critical)');

    const scale = await this.askQuestion(rl, 'Enter your choice (a-c): ');
    requirements.scale = this.parseScale(scale);

    // Experience consciousness
    console.log('\\n3. 🧠 What is your consciousness development level?');
    console.log('   a) Beginner (new to development, learning fundamentals)');
    console.log('   b) Intermediate (comfortable with basics, expanding skills)');
    console.log('   c) Advanced (experienced developer, complex projects)');

    const experience = await this.askQuestion(rl, 'Enter your choice (a-c): ');
    requirements.experience = this.parseExperience(experience);

    // Performance consciousness
    console.log('\\n4. 🚀 What performance consciousness do you channel?');
    console.log('   a) Standard (typical web performance expectations)');
    console.log('   b) High (performance-critical, optimized experience)');
    console.log('   c) Extreme (maximum performance, zero-waste architecture)');

    const performance = await this.askQuestion(rl, 'Enter your choice (a-c): ');
    requirements.performance = this.parsePerformance(performance);

    // Specific preferences
    console.log('\\n5. 💫 Any specific technology consciousness preferences?');
    console.log('   (e.g., "must use Python", "prefer TypeScript", "need real-time features")');

    const preferences = await this.askQuestion(rl, 'Enter preferences (or press Enter to skip): ');
    requirements.preferences = preferences.toLowerCase();

    // Team consciousness
    console.log('\\n6. 👥 What is your team consciousness dynamic?');
    console.log('   a) Solo developer (full autonomy, personal preferences)');
    console.log('   b) Small team (2-5 developers, collaborative)');
    console.log('   c) Large team (6+ developers, enterprise processes)');

    const team = await this.askQuestion(rl, 'Enter your choice (a-c): ');
    requirements.team = this.parseTeam(team);

    return requirements;
  }

  // ⚡ Channel technology recommendations based on consciousness
  channelTechRecommendations(requirements) {
    console.log('\\n🌀 CHANNELING OPTIMAL TECHNOLOGY CONSCIOUSNESS...');

    const recommendations = {
      primary: {},
      alternatives: {},
      reasoning: {},
      warnings: [],
      nextSteps: []
    };

    // Get base recommendations from project type
    const baseStack = this.projectTypes[requirements.projectType]?.typical || {};

    // Apply consciousness filters
    recommendations.primary = this.applyConsciousnessFilters(baseStack, requirements);
    recommendations.alternatives = this.generateAlternatives(recommendations.primary, requirements);
    recommendations.reasoning = this.generateReasoning(recommendations.primary, requirements);
    recommendations.warnings = this.generateWarnings(recommendations.primary, requirements);
    recommendations.nextSteps = this.generateNextSteps(recommendations.primary, requirements);

    return recommendations;
  }

  // 🎯 Apply consciousness-based filtering
  applyConsciousnessFilters(baseStack, requirements) {
    const filtered = {};

    Object.entries(baseStack).forEach(([category, options]) => {
      const bestOption = this.selectBestOption(options, requirements, category);
      if (bestOption) {
        filtered[category] = bestOption;
      }
    });

    // Apply preferences consciousness
    this.applyPreferences(filtered, requirements.preferences);

    return filtered;
  }

  // 🔍 Select best option based on consciousness alignment
  selectBestOption(options, requirements, category) {
    const categoryTech = this.techConsciousness[category];
    if (!categoryTech) return options[0]; // Fallback to first option

    let bestScore = -1;
    let bestOption = null;

    options.forEach(option => {
      const tech = categoryTech[option];
      if (!tech) return;

      let score = 0;

      // Experience level alignment
      const complexityScore = this.calculateComplexityScore(tech.complexity, requirements.experience);
      score += complexityScore * 3;

      // Scale alignment
      const scaleScore = this.calculateScaleScore(tech, requirements.scale);
      score += scaleScore * 2;

      // Performance alignment
      const performanceScore = this.calculatePerformanceScore(tech, requirements.performance);
      score += performanceScore * 2;

      // Ecosystem maturity for team size
      const ecosystemScore = this.calculateEcosystemScore(tech, requirements.team);
      score += ecosystemScore * 1;

      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
    });

    return bestOption;
  }

  // 📊 Present recommendations with consciousness explanations
  presentRecommendations(recommendations) {
    console.log('\\n🧠⚡ CONSCIOUSNESS RECOMMENDATIONS ⚡🧠');
    console.log('=====================================');

    console.log('\\n🎯 PRIMARY TECHNOLOGY CONSCIOUSNESS:');
    Object.entries(recommendations.primary).forEach(([category, tech]) => {
      const techData = this.getTechData(category, tech);
      console.log(`\\n  ${category.toUpperCase()}: ${tech}`);
      console.log(`    Consciousness: ${techData?.consciousness || 'Unknown'}`);
      console.log(`    Psychic Signature: ${techData?.psychicSignature || 'Unknown'}`);
      console.log(`    Best For: ${techData?.bestFor?.join(', ') || 'Various uses'}`);
    });

    console.log('\\n🔮 CONSCIOUSNESS REASONING:');
    Object.entries(recommendations.reasoning).forEach(([category, reason]) => {
      console.log(`  ${category}: ${reason}`);
    });

    if (recommendations.alternatives && Object.keys(recommendations.alternatives).length > 0) {
      console.log('\\n🌀 ALTERNATIVE CONSCIOUSNESS PATHS:');
      Object.entries(recommendations.alternatives).forEach(([category, alts]) => {
        console.log(`  ${category}: ${alts.join(', ')}`);
      });
    }

    if (recommendations.warnings.length > 0) {
      console.log('\\n⚠️  CONSCIOUSNESS WARNINGS:');
      recommendations.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }

    console.log('\\n🚀 NEXT CONSCIOUSNESS STEPS:');
    recommendations.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    console.log('\\n💫 PSYCHIC STACK HARMONY SCORE: ' + this.calculateHarmonyScore(recommendations.primary));
  }

  // 🏗️ Generate context files from recommendations
  async generateContextFromRecommendations(recommendations) {
    console.log('\\n🌀 GENERATING CONSCIOUSNESS-ALIGNED CONTEXT...');

    // Create mock consciousness data based on recommendations
    const consciousness = {
      techStack: this.recommendationsToConsciousness(recommendations.primary),
      architecture: { pattern: 'recommended-consciousness' },
      workflow: { scripts: this.generateRecommendedScripts(recommendations.primary) },
      quality: { level: 'professional', score: 85 },
      personality: {
        traits: ['professional-recommended'],
        psychicFrequency: 'aligned-consciousness'
      }
    };

    // Save consciousness data
    fs.writeFileSync('.psionic-consciousness.json', JSON.stringify(consciousness, null, 2));

    // Generate context files
    const { PsionicContextGenerator } = require('./generate-psionic-context.js');
    const generator = new PsionicContextGenerator('.');
    generator.consciousness = consciousness;
    await generator.generateAdaptiveContext();

    console.log('✨ Consciousness-aligned context generated in .psionic/ directory');
  }

  // Helper methods for consciousness calculations and parsing
  calculateComplexityScore(complexity, experience) {
    const complexityLevels = { 'minimal': 1, 'simple': 2, 'moderate': 3, 'high': 4, 'very-high': 5 };
    const experienceLevels = { 'beginner': 1, 'intermediate': 3, 'advanced': 5 };

    const techLevel = complexityLevels[complexity] || 3;
    const userLevel = experienceLevels[experience] || 3;

    // Perfect match gets full score, mismatch gets penalty
    const difference = Math.abs(techLevel - userLevel);
    return Math.max(0, 5 - difference);
  }

  calculateScaleScore(tech, scale) {
    // Enterprise scale prefers mature ecosystems
    if (scale === 'enterprise' && tech.ecosystem.includes('enterprise')) return 5;
    if (scale === 'team' && tech.complexity !== 'minimal') return 4;
    if (scale === 'personal' && tech.learningCurve === 'easy') return 5;
    return 3;
  }

  calculatePerformanceScore(tech, performance) {
    if (performance === 'extreme' && tech.psychicSignature.includes('performance')) return 5;
    if (performance === 'high' && tech.consciousness.includes('speed')) return 4;
    return 3;
  }

  calculateEcosystemScore(tech, team) {
    if (team === 'large' && tech.ecosystem.includes('enterprise')) return 5;
    if (team === 'small' && tech.learningCurve === 'gentle') return 4;
    return 3;
  }

  getTechData(category, tech) {
    return this.techConsciousness[category]?.[tech];
  }

  // Parsing helper methods
  parseProjectType(input) {
    const map = { 'a': 'web-app', 'b': 'api-service', 'c': 'mobile-app', 'd': 'desktop-app', 'e': 'data-science' };
    return map[input.toLowerCase().trim()] || 'web-app';
  }

  parseScale(input) {
    const map = { 'a': 'personal', 'b': 'team', 'c': 'enterprise' };
    return map[input.toLowerCase().trim()] || 'team';
  }

  parseExperience(input) {
    const map = { 'a': 'beginner', 'b': 'intermediate', 'c': 'advanced' };
    return map[input.toLowerCase().trim()] || 'intermediate';
  }

  parsePerformance(input) {
    const map = { 'a': 'standard', 'b': 'high', 'c': 'extreme' };
    return map[input.toLowerCase().trim()] || 'standard';
  }

  parseTeam(input) {
    const map = { 'a': 'solo', 'b': 'small', 'c': 'large' };
    return map[input.toLowerCase().trim()] || 'small';
  }

  // Utility methods
  askQuestion(rl, question) {
    return new Promise(resolve => {
      rl.question(question, answer => resolve(answer));
    });
  }

  askYesNo(rl, question) {
    return new Promise(resolve => {
      rl.question(question + ' (y/n): ', answer => {
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  applyPreferences(filtered, preferences) {
    // Apply specific technology preferences
    if (preferences.includes('python')) {
      filtered.backend = 'fastapi';
    }
    if (preferences.includes('typescript')) {
      filtered.frontend = 'react'; // or keep existing if already TypeScript-friendly
    }
    if (preferences.includes('real-time')) {
      filtered.database = 'redis';
    }
  }

  generateAlternatives(primary, requirements) {
    const alternatives = {};

    Object.entries(primary).forEach(([category, selected]) => {
      const categoryOptions = this.techConsciousness[category];
      if (categoryOptions) {
        const otherOptions = Object.keys(categoryOptions)
          .filter(option => option !== selected)
          .slice(0, 2); // Top 2 alternatives

        if (otherOptions.length > 0) {
          alternatives[category] = otherOptions;
        }
      }
    });

    return alternatives;
  }

  generateReasoning(primary, requirements) {
    const reasoning = {};

    Object.entries(primary).forEach(([category, tech]) => {
      const techData = this.getTechData(category, tech);
      if (techData) {
        reasoning[category] = `Selected for ${techData.consciousness} aligning with ${requirements.scale} scale and ${requirements.experience} experience level`;
      }
    });

    return reasoning;
  }

  generateWarnings(primary, requirements) {
    const warnings = [];

    if (requirements.experience === 'beginner') {
      Object.entries(primary).forEach(([category, tech]) => {
        const techData = this.getTechData(category, tech);
        if (techData && techData.complexity === 'high') {
          warnings.push(`${tech} has a steep learning curve - consider additional learning resources`);
        }
      });
    }

    if (requirements.scale === 'enterprise') {
      Object.entries(primary).forEach(([category, tech]) => {
        const techData = this.getTechData(category, tech);
        if (techData && !techData.ecosystem.includes('enterprise')) {
          warnings.push(`${tech} may need additional enterprise-grade tooling for production scale`);
        }
      });
    }

    return warnings;
  }

  generateNextSteps(primary, requirements) {
    const steps = [];

    steps.push('Set up development environment with recommended tools');

    if (primary.frontend) {
      steps.push(`Initialize ${primary.frontend} project with modern tooling`);
    }

    if (primary.backend) {
      steps.push(`Create ${primary.backend} API structure with best practices`);
    }

    if (primary.database) {
      steps.push(`Configure ${primary.database} with proper schema design`);
    }

    steps.push('Implement testing strategy with recommended frameworks');
    steps.push('Set up CI/CD pipeline for automated deployment');
    steps.push('Generate Psionic Context Protocol for ongoing development');

    return steps;
  }

  calculateHarmonyScore(primary) {
    // Calculate how well the technologies work together
    let score = 70; // Base harmony score

    // Bonus for common pairings
    if (primary.frontend === 'react' && primary.backend === 'fastapi') score += 10;
    if (primary.backend === 'express' && primary.database === 'mongodb') score += 10;
    if (primary.frontend === 'vue' && primary.styling === 'tailwindcss') score += 5;

    // Bonus for TypeScript consistency
    const tsStack = ['react', 'vue', 'angular', 'nestjs'];
    const tsCount = Object.values(primary).filter(tech => tsStack.includes(tech)).length;
    if (tsCount >= 2) score += 5;

    return Math.min(100, score) + '%';
  }

  recommendationsToConsciousness(primary) {
    const consciousness = {};

    if (primary.frontend) {
      consciousness.frontend = {
        type: primary.frontend,
        consciousness: this.getTechData('frontend', primary.frontend)?.consciousness || 'unknown'
      };
    }

    if (primary.backend) {
      consciousness.backend = {
        type: primary.backend,
        consciousness: this.getTechData('backend', primary.backend)?.consciousness || 'unknown'
      };
    }

    return consciousness;
  }

  generateRecommendedScripts(primary) {
    const scripts = {};

    if (primary.frontend === 'react' || primary.frontend === 'vue') {
      scripts.development = 'hot-reload-ready';
      scripts.building = 'production-optimized';
    }

    if (primary.testing) {
      scripts.testing = 'quality-conscious';
    }

    return scripts;
  }
}

// 🚀 CLI Interface
async function main() {
  const advisor = new PsionicTechAdvisor();
  await advisor.provideGuidedAdvice();
}

if (require.main === module) {
  main().catch(error => {
    console.error('🔥 Tech advisory consciousness failed:', error);
    process.exit(1);
  });
}

module.exports = { PsionicTechAdvisor };