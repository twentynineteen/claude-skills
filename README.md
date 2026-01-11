# Claude Skills

A centralized repository of Claude Code skills with version control, automatic updates, and categorized organization.

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/danielmills/claude-skills.git
```

### 2. Configure skill sync

Create or update `~/.claude/skills-config.json`:

```json
{
  "repository": "danielmills/claude-skills",
  "branch": "main",
  "autoCheck": true,
  "autoSync": false
}
```

### 3. Sync skills

Run `/skill-sync pull` in Claude Code to download all skills to your local cache.

## Repository Structure

```
claude-skills/
├── skills.json              # Central manifest with versions and metadata
├── core/                    # Stable, production-ready skills
│   ├── development/         # Testing, documentation, versioning
│   ├── documentation/       # Document generation
│   ├── infrastructure/      # CI/CD, Docker, Git
│   └── ui/                  # Frontend, animations, styling
├── workflow/                # Multi-phase development workflows
├── research/                # Investigation and knowledge capture
└── system/                  # Skill management and configuration
```

## Available Skills

### Core - Development
| Skill | Description |
|-------|-------------|
| `test-specialist` | Write tests, fix bugs, improve coverage for JS/TS |
| `tech-debt-analyzer` | Analyze and document technical debt |
| `codebase-documenter` | Generate README, architecture, API docs |
| `increment-version` | Bump semantic versions across config files |

### Core - Documentation
| Skill | Description |
|-------|-------------|
| `document-skills` | Generate PDF, DOCX, PPTX, XLSX documents |
| `frontend-enhancer` | Enhance Next.js apps with modern UI components |

### Core - Infrastructure
| Skill | Description |
|-------|-------------|
| `cicd-pipeline-generator` | Generate GitHub Actions, GitLab CI configs |
| `docker-containerization` | Create Dockerfiles and docker-compose |
| `worktree-manager` | Manage Git worktrees |

### Core - UI
| Skill | Description |
|-------|-------------|
| `ux-animation-guru` | Implement smooth animations with TDD |
| `tailwind-auditor` | Audit Tailwind CSS for consistent theming |
| `new-frontend-feature` | Scaffold frontend features with tests |
| `ui-analyzer` | Analyze accessibility and visual consistency |

### Workflow
| Skill | Description |
|-------|-------------|
| `plugin-workflow` | JUCE plugin implementation stages 1-3 |
| `plugin-planning` | Plugin architecture and planning |
| `plugin-ideation` | Brainstorm plugin concepts |
| `plugin-testing` | Validate plugins with pluginval and DAW tests |
| `plugin-lifecycle` | Install, uninstall, manage plugins |
| `plugin-packaging` | Create PKG installers |
| `aesthetic-dreaming` | Create visual design templates |
| `ui-mockup` | WebView UI mockup creation |
| `ui-template-library` | Manage aesthetic templates |
| `context-resume` | Resume work from handoff files |

### Research
| Skill | Description |
|-------|-------------|
| `deep-research` | Multi-agent investigation for complex problems |
| `troubleshooting-docs` | Document solved problems for future reference |

### System
| Skill | Description |
|-------|-------------|
| `skill-sync` | Sync skills from this repository |
| `system-setup` | Configure dependencies for plugin development |

## Skill Sync Commands

| Command | Description |
|---------|-------------|
| `/skill-sync check` | Check for available updates |
| `/skill-sync pull` | Download latest skills to local cache |
| `/skill-sync status` | Show local vs remote versions |
| `/skill-sync push <name>` | Push local changes to repository |

## How It Works

1. **Session Start**: Claude checks for updates (if 24+ hours since last check)
2. **Notification**: You're notified if updates are available
3. **Manual Sync**: Run `/skill-sync pull` to download updates
4. **Local Cache**: Skills are cached in `~/.claude/skills-cache/`

## Making Changes

Since GitHub is the source of truth:

1. Edit skills locally in `~/.claude/skills-cache/`
2. Test your changes
3. Run `/skill-sync push <skill-name>` to push to GitHub
4. Changes sync to all your projects

## Adding a New Skill

1. Create folder: `<category>/<skill-name>/`
2. Add `SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: skill-name
   description: What this skill does
   ---
   ```
3. Add entry to `skills.json`
4. Push to repository

## License

MIT
