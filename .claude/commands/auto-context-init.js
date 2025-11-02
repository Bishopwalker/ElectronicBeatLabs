#!/usr/bin/env node
/**
 * Auto Context Initialization Script
 * Ensures mandatory context files are read in proper order
 * Prevents time waste from missing context foundation
 */

const fs = require('fs');
const path = require('path');

class ContextInitializer {
  constructor() {
    this.projectRoot = process.cwd();
    this.requiredFiles = [
      { path: '.claude/INDEX.md', name: 'Navigation Guide', required: true },
      { path: '.claude/CLAUDE.md', name: 'Development Standards', required: true },
      { path: '.claude/INITIAL.md', name: 'Technical Specifications', required: true },
      { path: 'PLANNING.md', name: 'Architecture & Workflow', required: true },
      { path: 'TASK.md', name: 'Current Sprint Work', required: true }
    ];
  }

  async initialize() {
    
    let contextData = {
      timestamp: new Date().toISOString(),
      files: {},
      summary: {},
      errors: []
    };

    for (let i = 0; i < this.requiredFiles.length; i++) {
      const fileInfo = this.requiredFiles[i];
      const filePath = path.join(this.projectRoot, fileInfo.path);

      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          contextData.files[fileInfo.path] = {
            name: fileInfo.name,
            content: content,
            length: content.length,
            lines: content.split('\n').length,
            lastModified: fs.statSync(filePath).mtime
          };
          
          // Extract key summary info
          contextData.summary[fileInfo.path] = this.extractSummary(fileInfo.path, content);
          
        } else {
          const error = `❌ FILE NOT FOUND: ${fileInfo.path}`;
          contextData.errors.push(error);
          
          if (fileInfo.required) {
            throw new Error(`Required context file missing: ${fileInfo.path}`);
          }
        }
      } catch (error) {
        const errorMsg = `Error reading ${fileInfo.path}: ${error.message}`;
        contextData.errors.push(errorMsg);
      }
      
    }

    // Generate context summary
    this.generateContextSummary(contextData);
    
    // Save context snapshot for debugging
    const contextFile = path.join(this.projectRoot, '.claude', 'last-context-init.json');
    fs.writeFileSync(contextFile, JSON.stringify(contextData, null, 2));

    return contextData;
  }

  extractSummary(filePath, content) {
    const summary = { key_points: [], warnings: [], tasks: [] };
    
    switch (filePath) {
      case 'TASK.md':
        // Extract current tasks
        const taskLines = content.split('\n').filter(line => 
          line.includes('[ ]') || line.includes('[x]') || line.includes('In Progress')
        );
        summary.tasks = taskLines.slice(0, 5); // Top 5 tasks
        break;
        
      case '.claude/CLAUDE.md':
        // Extract critical rules
        const criticalLines = content.split('\n').filter(line =>
          line.includes('CRITICAL') || line.includes('MANDATORY') || line.includes('NEVER')
        );
        summary.key_points = criticalLines.slice(0, 3);
        break;
        
      case '.claude/INITIAL.md':
        // Extract key protocols
        const protocolLines = content.split('\n').filter(line =>
          line.includes('Hz') || line.includes('Protocol') || line.includes('ADHD')
        );
        summary.key_points = protocolLines.slice(0, 5);
        break;
        
      case 'PLANNING.md':
        // Extract architecture info
        const archLines = content.split('\n').filter(line =>
          line.includes('Stack') || line.includes('Framework') || line.includes('Architecture')
        );
        summary.key_points = archLines.slice(0, 5);
        break;
        
      default:
        summary.key_points = content.split('\n').slice(0, 3);
    }
    
    return summary;
  }

  generateContextSummary(contextData) {
    
    if (contextData.errors.length > 0) {
      contextData.errors.forEach(error => console.log(`   ${error}`));
    }
    
    // Show current tasks
    if (contextData.summary['TASK.md'] && contextData.summary['TASK.md'].tasks.length > 0) {
      contextData.summary['TASK.md'].tasks.forEach(task => console.log(`   ${task.trim()}`));
    }
    
  }
}

// Run if called directly
if (require.main === module) {
  const initializer = new ContextInitializer();
  initializer.initialize()
    .then(() => process.exit(0))
    .catch(error => {
      process.exit(1);
    });
}

module.exports = ContextInitializer;