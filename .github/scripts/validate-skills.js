#!/usr/bin/env node
/**
 * Skill Validation Script
 * Validates all skills in the repository for proper structure and frontmatter
 */

const fs = require('fs');
const path = require('path');

const SKILL_DIRS = ['core', 'workflow', 'research', 'system'];
const REQUIRED_FRONTMATTER_FIELDS = ['name', 'description'];

let errors = [];
let warnings = [];
let validatedCount = 0;

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle quoted strings
      if (value.startsWith("'") || value.startsWith('"')) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * Validate a single skill directory
 */
function validateSkill(skillPath, skillName) {
  const skillMdPath = path.join(skillPath, 'SKILL.md');

  // Check SKILL.md exists
  if (!fs.existsSync(skillMdPath)) {
    errors.push(`${skillName}: Missing SKILL.md file`);
    return false;
  }

  const content = fs.readFileSync(skillMdPath, 'utf-8');
  const frontmatter = parseFrontmatter(content);

  // Check frontmatter exists
  if (!frontmatter) {
    errors.push(`${skillName}: Missing or invalid YAML frontmatter`);
    return false;
  }

  // Check required fields
  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`${skillName}: Missing required frontmatter field '${field}'`);
    }
  }

  // Validate name matches directory name
  if (frontmatter.name && frontmatter.name !== skillName) {
    warnings.push(`${skillName}: Frontmatter name '${frontmatter.name}' doesn't match directory name`);
  }

  // Check description isn't empty
  if (frontmatter.description && frontmatter.description.length < 10) {
    warnings.push(`${skillName}: Description seems too short`);
  }

  validatedCount++;
  return true;
}

/**
 * Recursively find and validate all skills in a directory
 */
function validateDirectory(dirPath, depth = 0) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = path.join(dirPath, entry.name);
    const skillMdPath = path.join(fullPath, 'SKILL.md');

    // If this directory has a SKILL.md, it's a skill
    if (fs.existsSync(skillMdPath)) {
      validateSkill(fullPath, entry.name);
    } else if (depth < 2) {
      // Otherwise, look for skills in subdirectories (up to 2 levels deep)
      validateDirectory(fullPath, depth + 1);
    }
  }
}

/**
 * Validate skills.json manifest
 */
function validateManifest() {
  const manifestPath = path.join(process.cwd(), 'skills.json');

  if (!fs.existsSync(manifestPath)) {
    errors.push('skills.json: Manifest file not found');
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (e) {
    errors.push(`skills.json: Invalid JSON - ${e.message}`);
    return;
  }

  // Check required top-level fields
  if (!manifest.version) {
    errors.push('skills.json: Missing version field');
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push(`skills.json: Version '${manifest.version}' is not valid semver`);
  }

  if (!manifest.skills) {
    errors.push('skills.json: Missing skills object');
    return;
  }

  // Validate each skill entry in manifest
  for (const [skillName, skillData] of Object.entries(manifest.skills)) {
    if (!skillData.path) {
      errors.push(`skills.json: Skill '${skillName}' missing path`);
      continue;
    }

    // Check skill path exists
    const skillPath = path.join(process.cwd(), skillData.path);
    if (!fs.existsSync(skillPath)) {
      errors.push(`skills.json: Skill '${skillName}' path '${skillData.path}' does not exist`);
    }

    // Check version format
    if (skillData.version && !/^\d+\.\d+\.\d+$/.test(skillData.version)) {
      warnings.push(`skills.json: Skill '${skillName}' version '${skillData.version}' is not valid semver`);
    }

    // Check category is valid
    if (skillData.category && manifest.categories && !manifest.categories[skillData.category]) {
      warnings.push(`skills.json: Skill '${skillName}' has undefined category '${skillData.category}'`);
    }
  }
}

// Main execution
console.log('Validating Claude Skills Repository...\n');

// Validate all skill directories
for (const dir of SKILL_DIRS) {
  const dirPath = path.join(process.cwd(), dir);
  validateDirectory(dirPath);
}

// Validate manifest
validateManifest();

// Report results
console.log(`Validated ${validatedCount} skills\n`);

if (warnings.length > 0) {
  console.log('Warnings:');
  for (const warning of warnings) {
    console.log(`  - ${warning}`);
  }
  console.log('');
}

if (errors.length > 0) {
  console.log('Errors:');
  for (const error of errors) {
    console.log(`  - ${error}`);
  }
  console.log('');
  process.exit(1);
}

console.log('All validations passed!');
