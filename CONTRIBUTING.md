# Contributing to Claude Skills

## Skill Structure

Every skill must have this structure:

```
skill-name/
├── SKILL.md              # Required: Main skill definition
├── references/           # Optional: Supporting documentation
│   └── guide.md
└── assets/               # Optional: Templates, scripts
    └── template.md
```

## SKILL.md Format

```yaml
---
name: skill-name
description: Clear description of what the skill does and when to use it
allowed-tools:            # Optional: Restrict tool usage
  - Read
  - Write
  - Bash
preconditions:            # Optional: Requirements before running
  - Some file must exist
---

# Skill Name

## Overview

Brief explanation of the skill's purpose.

## When to Use

- Scenario 1
- Scenario 2

## Workflow

1. Step one
2. Step two
```

## Required Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (must match folder name) |
| `description` | Yes | Clear description (10+ characters) |
| `allowed-tools` | No | List of tools this skill can use |
| `preconditions` | No | Requirements before the skill runs |

## Adding a Skill

1. **Choose a category:**
   - `core/development` - Testing, documentation, versioning
   - `core/documentation` - Document generation
   - `core/infrastructure` - CI/CD, Docker, deployment
   - `core/ui` - Frontend, animations, styling
   - `workflow` - Multi-phase development workflows
   - `research` - Investigation and troubleshooting
   - `system` - Meta/management skills

2. **Create the skill folder:**
   ```bash
   mkdir -p core/development/my-skill
   ```

3. **Add SKILL.md with frontmatter:**
   ```yaml
   ---
   name: my-skill
   description: What this skill does and when to invoke it
   ---
   ```

4. **Update skills.json:**
   ```json
   "my-skill": {
     "path": "core/development/my-skill",
     "version": "1.0.0",
     "description": "Short description",
     "category": "development",
     "dependencies": [],
     "tags": ["tag1", "tag2"]
   }
   ```

5. **Run validation:**
   ```bash
   node .github/scripts/validate-skills.js
   ```

## Updating a Skill

1. Make your changes to SKILL.md or supporting files
2. Bump the version in `skills.json` (use semver):
   - Patch (1.0.0 -> 1.0.1): Bug fixes
   - Minor (1.0.0 -> 1.1.0): New features
   - Major (1.0.0 -> 2.0.0): Breaking changes
3. Update `lastUpdated` timestamp in skills.json
4. Commit with descriptive message

## Validation

The CI workflow validates:
- Every skill folder has SKILL.md
- SKILL.md has valid YAML frontmatter
- Required fields are present
- skills.json paths exist
- Version numbers are valid semver

Run locally:
```bash
node .github/scripts/validate-skills.js
```

## Best Practices

1. **Clear descriptions**: Explain when to use the skill
2. **Workflow phases**: Break complex skills into numbered phases
3. **Tool constraints**: Only list tools the skill actually needs
4. **Dependencies**: List skills this one depends on
5. **Tags**: Add relevant tags for discoverability

## Commit Messages

Format: `<type>(<skill>): <description>`

Examples:
- `feat(test-specialist): add coverage reporting`
- `fix(plugin-workflow): correct stage 2 validation`
- `docs(readme): update installation steps`
