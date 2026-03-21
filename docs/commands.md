# AI-Ship CLI Commands

AI-Ship is a CLI tool that uses AI + Git diff intelligence to automate commits and branches.

This document outlines all the available commands and flags you can use with the `ai-ship` CLI.

## Core Commands

### `ai-ship commit`

Generates an AI-powered commit message based on your staged Git changes, automatically commits the changes, and optionally generates and checks out a new branch based on the commit context.

AI-Ship analyzes actual Git diffs (not just filenames) to generate context-aware commit messages.

**Usage:**

```bash
ai-ship commit [file1] [file2] ... [flags]
```

_Note: If no files are specified, it will stage all changed files (`git add .`). If files are specified, only those specific files are staged before running the commit process._

**Available Flags:**

- `--model <provider>`: Overrides your default config to use a specific AI provider for this run (e.g., `--model local` to use Ollama/Gemma, or `--model cloud` for Gemini).
- `--new-branch`: Automatically generates a relevant branch name from the AI analysis, creates the new branch, and checks it out.
- `--push`: Automatically pushes the committed changes to your remote tracking repository. If an upstream branch is not found, it automatically creates one for you (`git push --set-upstream origin <branchName>`).
- `--yes`: Skips the interactive prompts for both commit message generation and branch creation, automatically accepting the first AI-generated suggestion.
- `--dry-run`: Simulates the process. It will generate the commit message and branch name, but will intentionally skip actually committing the files and creating the branch. Also unstages files if they were tracked during the command run.

### `ai-ship config`

Manages the global configuration for your `ai-ship` setup (such as API keys, default models, and user preferences).

**Usage:**

```bash
ai-ship config <sub-command> [flags]
```

#### `config set`

Sets a specific configuration key.

**Usage:**

```bash
ai-ship config set <key> <value>
```

_Example: `ai-ship config set default-model local`_

#### `config get`

Retrieves the value of a specific configuration key.

**Usage:**

```bash
ai-ship config get <key>
```

#### `config show`

Displays your entire active configuration.

**Available Flags:**

- `--verbose`: Pretty-prints the config with color and readable formatting.
- `--json`: Prints the config as raw JSON.

#### Configuration Flags

Other utility flags applicable when invoking `ai-ship config`:

- `--add-key`: Interactively prompts you to add your AI Provider API key (e.g. Gemini API Key).
- `--delete-key`: Instantly removes your stored API key.

## Quick Examples

**1. Fast auto-commit:**  
Stages everything, generates a message, generates a branch and skips all interactive approvals.

```bash
ai-ship commit --new-branch --yes
```

**2. Preview what the AI thinks:**  
See the AI-generated summary without altering the Git history.

```bash
ai-ship commit --dry-run
```

**3. Override the default model:**  
Normally you use cloud, but today you want to test generating with your local Ollama setup.

```bash
ai-ship commit --model local
```

## Coming Soon

### `ai-ship pr`

Generate pull request titles and descriptions using commit history and diff analysis.
