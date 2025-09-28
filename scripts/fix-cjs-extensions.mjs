#!/usr/bin/env node

/**
 * Fix CommonJS extensions after TypeScript compilation
 * This script ensures proper .js extensions are used in require() statements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      processFile(filePath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix require statements to include .js extension
  content = content.replace(
    /require\(["'](\.[^"']*?)["']\)/g,
    (match, modulePath) => {
      if (!modulePath.endsWith('.js') && !modulePath.includes('..')) {
        modified = true;
        return `require("${modulePath}.js")`;
      }
      return match;
    }
  );
  
  // Fix export/import statements for relative paths
  content = content.replace(
    /(from|import)\s+["'](\.[^"']*?)["']/g,
    (match, keyword, modulePath) => {
      if (!modulePath.endsWith('.js') && !modulePath.includes('..')) {
        modified = true;
        return `${keyword} "${modulePath}.js"`;
      }
      return match;
    }
  );
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed extensions in: ${filePath}`);
  }
}

const cjsDir = path.join(__dirname, '..', 'dist', 'cjs');
const esmDir = path.join(__dirname, '..', 'dist', 'esm');

if (fs.existsSync(cjsDir)) {
  console.log('Fixing CommonJS extensions...');
  processDirectory(cjsDir);
  console.log('CommonJS extensions fixed.');
} else {
  console.log('CommonJS dist directory not found, skipping...');
}

if (fs.existsSync(esmDir)) {
  console.log('Fixing ESM extensions...');
  processDirectory(esmDir);
  console.log('ESM extensions fixed.');
} else {
  console.log('ESM dist directory not found, skipping...');
}