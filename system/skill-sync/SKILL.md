---
name: skill-sync
description: Sync Claude skills from GitHub repository. Checks for updates on session start and syncs changes to local cache. Commands - /skill-sync check, /skill-sync pull, /skill-sync status, /skill-sync push <skill-name>, /skill-sync new <skill-name>
allowed-tools:
  - Bash
  - Read
  - Write
  - WebFetch
  - Edit
  - AskUserQuestion
---

# skill-sync Skill

**Purpose:** Manage skill synchronization between GitHub repository and local cache. Automatically checks for updates on session start and provides commands for manual sync operations.

## Configuration

Skill-sync uses `~/.claude/skills-config.json` for configuration:

```json
{
  "repository": "danielmills/claude-skills",
  "branch": "main",
  "autoCheck": true,
  "autoSync": false,
  "lastCheck": "2026-01-11T00:00:00Z",
  "lastSync": "2026-01-11T00:00:00Z"
}
```

## Commands

### `/skill-sync check`

Check for available updates without syncing.

**Workflow:**
1. Read local manifest from `~/.claude/skills-cache/.manifest.json`
2. Fetch remote manifest from GitHub raw URL:
   ```
   https://raw.githubusercontent.com/{repository}/{branch}/skills.json
   ```
3. Compare versions for each skill
4. Report new, updated, and removed skills

**Output format:**
```
Skill Sync Check Results
========================
Repository: danielmills/claude-skills (main)
Last sync: 2 days ago

Updates available:
  - test-specialist: 1.0.0 -> 1.1.0
  - plugin-workflow: 1.0.0 -> 1.0.1

New skills:
  - my-new-skill (workflow)

Run /skill-sync pull to update
```

### `/skill-sync pull`

Sync all skills from GitHub to local cache.

**Workflow:**
1. Read skills-config.json for repository settings
2. Fetch remote skills.json manifest
3. For each skill with updates:
   a. Download skill folder contents from GitHub API
   b. Write to `~/.claude/skills-cache/{path}/`
4. Update local manifest with sync timestamp
5. Report what changed

**Implementation:**
```bash
# Fetch manifest
curl -s "https://raw.githubusercontent.com/{repo}/{branch}/skills.json" > /tmp/skills.json

# For each updated skill, download via GitHub API
# Example for a single file:
curl -s "https://raw.githubusercontent.com/{repo}/{branch}/{skill-path}/SKILL.md" \
  > ~/.claude/skills-cache/{skill-path}/SKILL.md
```

**GitHub API for directory listing:**
```bash
curl -s "https://api.github.com/repos/{owner}/{repo}/contents/{skill-path}?ref={branch}"
```

### `/skill-sync status`

Show current sync status and local vs remote versions.

**Workflow:**
1. Read local manifest
2. Fetch remote manifest (cached for 5 minutes)
3. Show table of all skills with local/remote versions

**Output format:**
```
Skill Sync Status
=================
Repository: danielmills/claude-skills (main)
Last check: 5 minutes ago
Last sync: 2 days ago

Skill                  Local    Remote   Status
-----                  -----    ------   ------
test-specialist        1.0.0    1.1.0    Update available
codebase-documenter    1.0.0    1.0.0    Up to date
plugin-workflow        1.0.0    1.0.1    Update available
my-new-skill           -        1.0.0    New (not installed)
```

### `/skill-sync push <skill-name>`

Push local skill changes to GitHub repository.

**Preconditions:**
- Git must be configured with push access to the repository
- Local skill must have modifications

**Workflow:**
1. Locate skill in local cache
2. Prompt for version bump type (patch/minor/major)
3. Update version in skill's frontmatter
4. Update skills.json manifest
5. Create git commit with descriptive message
6. Push to remote

**Alternative (PR workflow):**
If user prefers PRs:
1. Create a new branch: `skill-update/{skill-name}-{version}`
2. Commit changes
3. Open PR via `gh pr create`

## Session Start Integration

On session start, if `autoCheck` is enabled:

1. Check if last check was more than 24 hours ago
2. If so, fetch remote manifest and compare versions
3. Output notification if updates available:
   ```
   [Skill Sync] 3 skill updates available. Run /skill-sync pull to update.
   ```

## Local Cache Structure

```
~/.claude/
├── skills-config.json          # Sync configuration
└── skills-cache/               # Cached skills from GitHub
    ├── .manifest.json          # Local copy of skills.json with sync metadata
    ├── core/
    │   ├── development/
    │   │   ├── test-specialist/
    │   │   └── ...
    │   ├── documentation/
    │   ├── infrastructure/
    │   └── ui/
    ├── workflow/
    ├── research/
    └── system/
```

## Fallback Behavior

If a skill is not found in local cache:
1. Attempt to fetch directly from GitHub raw URL
2. Cache the fetched skill for future use
3. Log warning about missing local skill

## Error Handling

| Error | Recovery |
|-------|----------|
| Network unavailable | Use local cache, warn user |
| GitHub rate limited | Use local cache, retry after cooldown |
| Invalid manifest JSON | Keep previous manifest, report error |
| Skill download failed | Skip skill, continue with others |

## Version Comparison

Uses semantic versioning comparison:
- `1.0.0` < `1.0.1` (patch)
- `1.0.1` < `1.1.0` (minor)
- `1.1.0` < `2.0.0` (major)

## Integration with Claude Code

Skills are loaded from `~/.claude/skills-cache/` when invoked. The skill-sync system maintains this cache to ensure:

1. Skills work offline (cached locally)
2. Updates are available when connected
3. Version history is tracked
4. Rollback is possible (via git)

### `/skill-sync new <skill-name>`

Create a new skill with proper structure and push to GitHub.

**Workflow:**

1. **Gather information via AskUserQuestion:**
   - Category selection (present options based on skills.json categories)
   - Brief description of what the skill does
   - When to use the skill (trigger phrases)
   - Tools the skill needs access to

2. **Create skill structure:**
   ```
   ~/.claude/skills-cache/{category}/{skill-name}/
   └── SKILL.md
   ```

3. **Generate SKILL.md with frontmatter:**
   ```yaml
   ---
   name: {skill-name}
   description: {description}. {trigger phrases}
   allowed-tools:
     - {selected tools}
   ---

   # {skill-name} Skill

   **Purpose:** {description}

   ## When to Use

   Use this skill when:
   - {trigger condition 1}
   - {trigger condition 2}

   ## Workflow

   1. {Step 1}
   2. {Step 2}

   ## Quick Reference

   | Command | Description |
   |---------|-------------|
   | `/{skill-name}` | {brief description} |
   ```

4. **Update skills.json manifest:**
   ```json
   "{skill-name}": {
     "path": "{category}/{skill-name}",
     "version": "1.0.0",
     "description": "{description}",
     "category": "{category-key}",
     "dependencies": [],
     "tags": ["{auto-generated tags}"]
   }
   ```

5. **Create symlink in ~/.claude/skills/:**
   ```bash
   ln -s ~/.claude/skills-cache/{category}/{skill-name} ~/.claude/skills/{skill-name}
   ```

6. **Commit and push to GitHub:**
   ```bash
   cd ~/.claude/skills-cache
   git add .
   git commit -m "feat({skill-name}): add new skill - {brief description}"
   git push
   ```

7. **Report success:**
   ```
   Skill Created Successfully
   ==========================
   Name: {skill-name}
   Category: {category}
   Path: {category}/{skill-name}
   Version: 1.0.0

   The skill is now available. Try: /{skill-name}

   GitHub: https://github.com/{repository}/tree/main/{category}/{skill-name}
   ```

**Example interaction:**

```
User: /skill-sync new api-tester

Claude: I'll help you create a new skill. Let me gather some information.

[AskUserQuestion: Category]
Options: core/development, core/documentation, core/infrastructure, core/ui, workflow, research, system

[AskUserQuestion: Description]
"What does this skill do? (1-2 sentences)"

[AskUserQuestion: Triggers]
"When should this skill be invoked? List trigger phrases."

[AskUserQuestion: Tools]
Options: Read, Write, Edit, Bash, WebFetch, WebSearch, Task, AskUserQuestion
(multiSelect: true)

Claude: Creating api-tester skill...
- Created SKILL.md with frontmatter
- Updated skills.json
- Created symlink
- Pushed to GitHub

Skill 'api-tester' is now available!
```

**Category paths:**

| Category Key | Path | Description |
|--------------|------|-------------|
| development | core/development | Testing, documentation, versioning |
| documentation | core/documentation | Document generation |
| infrastructure | core/infrastructure | CI/CD, Docker, deployment |
| ui | core/ui | Frontend, animations, styling |
| workflow | workflow | Multi-phase development workflows |
| research | research | Investigation, troubleshooting |
| system | system | Meta/management skills |

## Quick Reference

| Command | Description |
|---------|-------------|
| `/skill-sync check` | Check for updates |
| `/skill-sync pull` | Download updates |
| `/skill-sync status` | Show all skill versions |
| `/skill-sync push <name>` | Push local changes |
| `/skill-sync new <name>` | Create new skill and push to GitHub |
