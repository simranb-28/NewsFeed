#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the build output and provides performance insights
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFilesRecursive(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getFilesRecursive(filePath, fileList);
    } else {
      fileList.push({
        path: filePath,
        name: file,
        size: stat.size,
      });
    }
  });
  
  return fileList;
}

function analyzeBundle() {
  if (!fs.existsSync(distDir)) {
    console.error(`${colors.red}Error: dist directory not found. Please run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.bold}${colors.cyan}📦 Bundle Analysis${colors.reset}\n`);
  console.log(`${colors.blue}Analyzing dist directory: ${distDir}${colors.reset}\n`);

  const files = getFilesRecursive(distDir).sort((a, b) => b.size - a.size);
  
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  let assetSize = 0;
  let htmlSize = 0;

  const filesByType = {
    '.js': { files: [], size: 0 },
    '.css': { files: [], size: 0 },
    '.html': { files: [], size: 0 },
    '.json': { files: [], size: 0 },
    '.svg': { files: [], size: 0 },
    '.png': { files: [], size: 0 },
    '.jpg': { files: [], size: 0 },
    '.woff': { files: [], size: 0 },
    '.woff2': { files: [], size: 0 },
    'other': { files: [], size: 0 },
  };

  files.forEach((file) => {
    totalSize += file.size;
    const ext = path.extname(file.name).toLowerCase();
    
    if (filesByType[ext]) {
      filesByType[ext].files.push(file);
      filesByType[ext].size += file.size;
    } else {
      filesByType['other'].files.push(file);
      filesByType['other'].size += file.size;
    }
  });

  // Display breakdown by type
  console.log(`${colors.bold}File Type Breakdown:${colors.reset}`);
  console.log('-'.repeat(50));
  
  Object.entries(filesByType).forEach(([type, data]) => {
    if (data.size > 0) {
      const percentage = ((data.size / totalSize) * 100).toFixed(1);
      const typeLabel = type === 'other' ? 'Other' : type;
      console.log(`${typeLabel.padEnd(10)} ${formatBytes(data.size).padEnd(12)} (${percentage}%)`);
    }
  });

  console.log('-'.repeat(50));
  console.log(`${'Total'.padEnd(10)} ${colors.bold}${formatBytes(totalSize)}${colors.reset}\n`);

  // Display largest files
  console.log(`${colors.bold}Largest Files (Top 10):${colors.reset}`);
  console.log('-'.repeat(70));
  console.log(`${colors.cyan}File Name${colors.reset.padEnd(40)} Size${colors.reset.padEnd(15)} % of Total`);
  console.log('-'.repeat(70));

  files.slice(0, 10).forEach((file) => {
    const relativePath = path.relative(distDir, file.path);
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    const sizeStr = formatBytes(file.size);
    
    let color = colors.green;
    if (file.size > 500000) color = colors.red;
    else if (file.size > 250000) color = colors.yellow;
    
    console.log(
      `${relativePath.substring(0, 38).padEnd(40)} ${color}${sizeStr.padEnd(14)}${colors.reset} ${percentage}%`
    );
  });

  console.log('-'.repeat(70));

  // Performance recommendations
  console.log(`\n${colors.bold}${colors.yellow}⚡ Performance Recommendations:${colors.reset}\n`);

  let recommendations = 0;

  if (filesByType['.js'].size > 500000) {
    recommendations++;
    console.log(`${recommendations}. ${colors.yellow}JavaScript bundle is large (${formatBytes(filesByType['.js'].size)})${colors.reset}`);
    console.log(`   → Consider code splitting or tree-shaking unused code\n`);
  }

  if (filesByType['.css'].size > 150000) {
    recommendations++;
    console.log(`${recommendations}. ${colors.yellow}CSS bundle is large (${formatBytes(filesByType['.css'].size)})${colors.reset}`);
    console.log(`   → Review and remove unused styles\n`);
  }

  const largestFile = files[0];
  if (largestFile.size > 500000) {
    recommendations++;
    console.log(`${recommendations}. ${colors.yellow}${largestFile.name} is very large (${formatBytes(largestFile.size)})${colors.reset}`);
    console.log(`   → This file could be optimized further\n`);
  }

  if (recommendations === 0) {
    console.log(`${colors.green}✓ Bundle looks good! No major issues detected.${colors.reset}\n`);
  }

  // Summary
  console.log(`${colors.bold}${colors.green}Summary:${colors.reset}`);
  console.log('-'.repeat(50));
  console.log(`Total Bundle Size: ${colors.bold}${formatBytes(totalSize)}${colors.reset}`);
  console.log(`JavaScript: ${formatBytes(filesByType['.js'].size)}`);
  console.log(`CSS: ${formatBytes(filesByType['.css'].size)}`);
  console.log(`Assets: ${formatBytes(filesByType['.svg'].size + filesByType['.png'].size + filesByType['.jpg'].size)}`);
  console.log(`Files: ${files.length}`);
  console.log('-'.repeat(50) + '\n');
}

analyzeBundle();
