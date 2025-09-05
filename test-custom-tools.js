#!/usr/bin/env node

/**
 * Simple validation script for custom tools configuration
 * This helps verify that your custom tools JSON is valid before using it
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateCustomTools(filePath) {
  console.log('🧪 Testing Custom Tools Configuration...\n');

  try {
    // Read the JSON file
    const content = fs.readFileSync(filePath, 'utf8');
    const tools = JSON.parse(content);

    console.log(`✅ JSON is valid - found ${tools.length} custom tools\n`);

    // Validate each tool
    tools.forEach((tool, index) => {
      console.log(`🔍 Validating tool ${index + 1}: "${tool.name}"`);
      
      // Check required fields
      const requiredFields = ['name', 'description', 'page', 'handler'];
      const missing = requiredFields.filter(field => !tool[field]);
      
      if (missing.length > 0) {
        console.log(`   ❌ Missing fields: ${missing.join(', ')}`);
        return;
      }

      // Check if page URL is valid
      try {
        new URL(tool.page);
        console.log(`   ✅ Page URL is valid: ${tool.page}`);
      } catch (e) {
        console.log(`   ❌ Invalid page URL: ${tool.page}`);
      }

      // Check if handler has try-catch (recommended)
      if (tool.handler.includes('try') && tool.handler.includes('catch')) {
        console.log(`   ✅ Handler has error handling`);
      } else {
        console.log(`   ⚠️  Handler should include try-catch for better error handling`);
      }

      // Check parameters
      if (tool.parameters) {
        console.log(`   ✅ Has ${Object.keys(tool.parameters).length} parameter(s)`);
      } else {
        console.log(`   ✅ No parameters (simple tool)`);
      }

      console.log('');
    });

    console.log('🎉 Validation complete!\n');

    // Generate environment variable format
    console.log('📋 Environment variable format:');
    console.log('CUSTOM_TOOLS="' + JSON.stringify(tools).replace(/"/g, '\\"') + '"');
    console.log('\n💡 Copy the above line to use in your MCP configuration\n');

  } catch (error) {
    console.error('❌ Error validating custom tools:', error.message);
    process.exit(1);
  }
}

// Run validation
const toolsFile = path.join(__dirname, 'custom-tools-examples.json');

if (fs.existsSync(toolsFile)) {
  validateCustomTools(toolsFile);
} else {
  console.error('❌ custom-tools-examples.json not found');
  console.log('💡 Make sure you\'re running this from the storybook-mcp directory');
  process.exit(1);
}
