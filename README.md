<div align="center">
  <img alt="AI-Ship Logo" src="https://img.icons8.com/nolan/256/spaceship.png" width="120" />
  <h1>🚀 AI-SHIP</h1>
  <p><strong>Your ultimate AI-powered terminal assistant for seamless Git workflows.</strong></p>
  <p>Dynamically analyzes your code diffs to automatically write robust and contextual commit messages, generate meaningful branch names, push your changes, and spin up intelligent GitHub Pull Requests—all without ever leaving your terminal.</p>
</div>

<br />

## ✨ Features

- **🧠 Deep Code Analysis:** AI-Ship doesn't just read filenames. It reads your raw `git diff` outputs, intelligently filters out noise (like lockfiles), and evaluates the actual intent of your code changes.
- **📝 Automated Intelligent Commits:** Say goodbye to "fixed bug" or "updated code". AI-Ship drafts rich, standard-compliant commit messages highlighting semantic changes.
- **🌿 Smart Branch Name Generation:** Need a new feature branch? Throw in `--new-branch` to let AI-Ship read your commit's context, draft a descriptive semantic branch name (e.g. `feature/implement-user-auth`), automatically apply branch collision defenses, and check it out for you.
- **🚀 One-command PR Pipelines:** Complete your entire development phase in one go. Using `ai-ship commit --push --pr` takes your staged changes, commits them intelligibly, pushes them directly to `origin`, and opens a full contextual Pull Request over the GitHub CLI.
- **🤖 Provider Agnostic:** Works beautifully with **Google Gemini** (Cloud) out-of-the-box or **Ollama** for entirely private, local execution.
- **🛡️ Dry Runs & Pre-flights:** Want to see what the AI cooks up without mutating your local Git repository? Use `--dry-run`.
- **✍️ Interactive Refinements:** Don't like the drafted message? Instantly edit it, request a retry, or skip.
- **🎨 Beautiful, Professional CLI:** Enjoy a sleek, modern terminal interface with custom animated spinners, colored outputs, and structured logging that elevates your entire experience.

---

## 📦 Prerequisites

Before deploying AI-Ship, ensure your machine meets the following structural requirements:

1. **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
2. **[Git](https://git-scm.com/)** installed and initialized in your working repository.
3. **[GitHub CLI (`gh`)](https://cli.github.com/)** installed and authenticated (required exclusively if you use `--pr` flows).
4. **An API Access key** for Google Gemini, **OR** a local instance of [Ollama](https://ollama.com/) running locally.

---

## 🛠️ Installation & Setup

For now, AI-Ship can be run directly from source.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/developer-diganta/ai-ship.git
   cd ai-ship
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the CLI executable:**

   ```bash
   npm run build
   ```

4. **Link globally (Optional but recommended):**
   ```bash
   npm link
   ```
   _This globally registers the `ai-ship` command in your terminal so it can be initiated in any Git repository on your system._

---

## ⚙️ Configuration

Control how AI-Ship operates directly from the CLI via the `config` command.

### 🔑 Set up your API Key (Cloud/Gemini)

To utilize the Gemini API connection:

```bash
ai-ship config --add-key
```

_It will securely prompt for your API key and store it locally._

To remove your key:

```bash
ai-ship config --delete-key
```

### 🧠 Change AI Provider (Local vs Cloud)

If you prefer running a local execution without making network API calls to Cloud AI models, you can switch providers. _(Requires a local Ollama server)_:

```bash
ai-ship config set provider local
```

To switch back to the cloud via Google Gemini:

```bash
ai-ship config set provider cloud
```

### 🧾 View Current Config

```bash
ai-ship config show --verbose
```

---

## 🚢 Usage

At its core, `ai-ship` hooks into your uncommitted, staged files.

### Basic Usage

Stage your files as usual (`git add .`), then draft an AI commit:

```bash
ai-ship commit
```

> _Note: If you run `ai-ship commit` without staging, AI-Ship will automatically run `git add -A` for you!_

You can also pass specific files to be explicitly staged:

```bash
ai-ship commit src/index.ts src/utils/helper.ts
```

### Advanced Pipeline Workflows

AI-Ship can condense the 5 basic Git commands down into **one single instruction**.

**🔥 The Ultimate CLI Combo (Commit, Branch, Push, PR):**

```bash
ai-ship commit --new-branch --push --pr --yes
```

_What this single command achieved:_

1. Auto-staged all tracked changes.
2. Read the unified diff and generated a beautiful Commit Message.
3. Examined that context and automatically made a new branch (e.g., `feature/add-payment-gate`).
4. Directly pushed the new upstream branch to origin.
5. Invoked the `gh` CLI to summarize the commit history into a Pull Request Description.
6. Auto-published the PR on GitHub without asking for manual confirmation (`--yes`).

### 🎌 Command Flags

Append these arguments upon the `commit` hook to modify AI-Ship's behavior:

| Flag                       | Action                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--new-branch`             | Analyzes commit context, drafts a semantic branch name, & securely checks it out.                                                       |
| `--push`                   | Triggers a `git push`. If there isn't an upstream anchor configured, securely configures tracking mappings for you.                     |
| `--pr`                     | Utilizes the GitHub CLI to publish an intelligent PR onto default target branches. Prompts interactions manually if omitted.            |
| `--target-branch <branch>` | Manually overrides the base branch point targeting your `--pr`.                                                                         |
| `--yes`                    | Headless execution. Skips interactive "Edit/Continue/Cancel" refinements and accepts the AI's first guess automatically.                |
| `--dry-run`                | Reads files, interfaces with the AI layer, and outputs responses without actually performing Git mutations. Great for observing syntax. |
| `--model <provider>`       | Inline injection overriding the globally chosen logic model (e.g `--model local` or `--model cloud`).                                   |

---

## 🤝 Contributing

Contributions are heavily welcomed!

1. **Fork** the repository
2. Implement your magic fix or feature branch (`git checkout -b feature/magic-fix`)
3. Pass through Prettier & Typescript integrations by running `npm run build && npm run format`
4. Use AI-Ship to push your PR logic gracefully.
5. Submit your **Pull Request**.

If you locate any discrepancies or issues, please [file a new GitHub Issue](https://github.com/developer-diganta/ai-ship/issues).

<br />

<div align="center">
  <p>Built with 🩵 by <a href="https://github.com/developer-diganta">Diganta</a></p>
</div>
