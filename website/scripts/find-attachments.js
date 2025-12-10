#!/usr/bin/env node

/**
 * Script to find all attachment references in markdown files
 * and list which files are missing from the attachments directory
 */

const fs = require('fs');
const path = require('path');

const contentDirectories = [
  '1 – Tools, methods, frameworks, or guides',
  '2 – Collections, Compendia, or Kits',
  '3 – Practical academic articles and scientific reports',
];

const attachmentsDir = path.join(__dirname, '../public/attachments');
const rootDir = path.join(__dirname, '../..');

function findAttachmentReferences() {
  const attachmentRefs = new Set();
  const attachmentRegex = /!\[\[([^\]]+)\]\]/g;

  contentDirectories.forEach((dir) => {
    const dirPath = path.join(rootDir, dir);

    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️  Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dirPath);

    files
      .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
      .forEach((file) => {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        let match;
        while ((match = attachmentRegex.exec(content)) !== null) {
          attachmentRefs.add(match[1]);
        }
      });
  });

  return Array.from(attachmentRefs).sort();
}

function checkExistingAttachments(attachmentRefs) {
  if (!fs.existsSync(attachmentsDir)) {
    return { existing: [], missing: attachmentRefs };
  }

  const existingFiles = fs.readdirSync(attachmentsDir);
  const existing = [];
  const missing = [];

  attachmentRefs.forEach((ref) => {
    if (existingFiles.includes(ref)) {
      existing.push(ref);
    } else {
      missing.push(ref);
    }
  });

  return { existing, missing };
}

function main() {
  console.log('🔍 Scanning markdown files for attachments...\n');

  const attachmentRefs = findAttachmentReferences();

  console.log(`📊 Found ${attachmentRefs.length} attachment references:\n`);

  const { existing, missing } = checkExistingAttachments(attachmentRefs);

  if (existing.length > 0) {
    console.log(`✅ ${existing.length} attachments found:\n`);
    existing.forEach((file) => console.log(`   ${file}`));
    console.log('');
  }

  if (missing.length > 0) {
    console.log(`❌ ${missing.length} attachments missing:\n`);
    missing.forEach((file) => console.log(`   ${file}`));
    console.log('');
    console.log('📁 To add these files:');
    console.log(`   1. Find your Obsidian vault's attachments folder`);
    console.log(`   2. Copy the missing files to: ${attachmentsDir}`);
    console.log(`   3. Run this script again to verify\n`);
  } else {
    console.log('🎉 All attachments are present!\n');
  }

  // Group by file type
  const byType = attachmentRefs.reduce((acc, file) => {
    const ext = path.extname(file).toLowerCase();
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {});

  console.log('📈 Breakdown by file type:');
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      console.log(`   ${ext || '(no extension)'}: ${count}`);
    });
}

main();
