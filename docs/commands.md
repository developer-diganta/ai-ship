# AI-Ship CLI Commands

This document outlines all the available commands and flags you can use with the \`ai-ship\` CLI.

## Core Commands

### \`ai-ship commit\`

Generates an AI-powered commit message based on your staged Git changes, automatically commits the changes, and optionally generates/renames your branch based on the commit context.

**Usage:**
\`\`\`bash
ai-ship commit [file1] [file2] ... [flags]
\`\`\`
_Note: If no files are specified, it will stage all changed files (\`git add .\`). If files are specified, only those specific files are staged before running the commit process._

**Available Flags:**

- \`--model <provider>\`: Overrides your default config to use a specific AI provider for this run (e.g., \`--model local\` to use Ollama/Gemma, or \`--model gemini\` for Google Gemini).
- \`--yes\`: Skips the interactive prompts for both commit message generation and branch renaming, automatically accepting the first AI-generated suggestion.
- \`--dry-run\`: Simulates the process. It will generate the commit message and branch name, but will intentionally skip actually committing the files and renaming the branch. Also unstages files if they were tracked during the command run.

### \`ai-ship config\`

Manages the global configuration for your \`ai-ship\` setup (such as API keys, default models, and user preferences).

**Usage:**
\`\`\`bash
ai-ship config <sub-command> [flags]
\`\`\`

#### \`config set\`

Sets a specific configuration key.

**Usage:**
\`\`\`bash
ai-ship config set <key> <value>
\`\`\`
_Example: \`ai-ship config set default-model local\`_

#### \`config get\`

Retrieves the value of a specific configuration key.

**Usage:**
\`\`\`bash
ai-ship config get <key>
\`\`\`

#### \`config show\`

Displays your entire active configuration.

**Available Flags:**

- \`--verbose\`: Pretty-prints the config with color and readable formatting.
- \`--json\`: Prints the config as raw JSON.

#### Configuration Flags

Other utility flags applicable when invoking \`ai-ship config\`:

- \`--add-key\`: Interactively prompts you to add your AI Provider API key (e.g. Gemini API Key).
- \`--delete-key\`: Instantly removes your stored API key.

## Typical Workflows

**1. Fast auto-commit:**
Stages everything, generates a message, generates a branch and skips all interactive approvals.
\`\`\`bash
ai-ship commit --yes
\`\`\`

**2. Preview what the AI thinks:**
See what the AI summary without altering the git history.
\`\`\`bash
ai-ship commit --dry-run
\`\`\`

**3. Override the default model:**
Normally you use Gemini, but today you want to test generating with your local Ollama setup.
\`\`\`bash
ai-ship commit --model local
\`\`\`
