# 🚀 AI-Ship

> **Review your code before your PR. Ship with confidence.**

AI-Ship is a **Git Intelligence CLI** that helps you:

* generate commits
* create PRs / MRs
* review your code with AI

👉 All **before your code leaves your machine**

---
<br/>

# 🔥 Why AI-Ship?

### The problem

- Writing meaningful commit messages is harder than it should be  
- Naming branches consistently breaks developer flow  
- PR reviews come **too late** — basic issues slip through  
- Reviewers spend time on **avoidable mistakes**  
- AI tools (like Copilot) help write code — but don’t understand your **full Git diff**  

👉 Git workflows remain manual where they should be intelligent

---

### The solution

Run this before pushing:

```bash
ai-ship review main
```

👉 Get:

* 🔴 Critical bugs
* 🟡 Warnings
* 🟢 Improvements

**Before your PR even exists.**

---

# ⚡ What AI-Ship Does

## 🧠 1. AI Code Review (Core Feature 🔥)

Analyze your code changes using:

* `git diff` (actual changes)
* intelligent filtering (no noise)
* signal-based analysis (not just keywords)
* AI (Gemini + local fallback)

👉 Output:

* structured feedback
* severity classification
* clean HTML report

---

## ✨ 2. Smart Commits

```bash
ai-ship commit
```

* Generates meaningful commit messages
* Based on actual code changes
* Avoids generic commits like "fix stuff"

---

## 🌿 3. Smart Branch Naming

```bash
--new-branch
```

* AI-generated semantic branch names
* Example: `feature/add-user-auth`

---

## 🚀 4. One-Command Workflow

```bash
ai-ship commit --new-branch --push --pr --yes
```

👉 This does everything:

* Stage changes
* Generate commit
* Create branch
* Push to remote
* Open PR / MR (GitLab supported)

---

## 🔍 5. Pre-PR Review System

AI-Ship is NOT a PR bot.

👉 It runs **before PR creation**

* No spam comments
* No noise in GitHub/GitLab
* Private, fast, local feedback

---

## ⚙️ 6. Configurable AI Providers

Supports:

* **Gemini (cloud)** → fast + powerful
* **Ollama (local)** → private + offline

```bash
ai-ship config set provider local
ai-ship config set gitlab.token <token>
ai-ship config set gitlab.baseUrl https://gitlab.com
```

---

## 🧩 7. Intelligent Diff Processing

AI-Ship doesn't blindly send diffs.

It:

* extracts meaningful patches
* scores them using signals (conditions, loops, API calls, etc.)
* filters noise (lockfiles, low-signal changes)

👉 Result: **better AI output**

---

## 🧠 8. Signal-Based Review Engine

Instead of keyword matching, AI-Ship detects:

* conditions
* functions
* loops
* API calls
* DB queries
* error handling

👉 This makes reviews:

* more accurate
* less noisy
* language-flexible (and ready for Tree-sitter)

---

## 📄 9. HTML Review Report

AI-Ship generates a clean HTML report:

* grouped by file
* severity-based coloring
* summary at top

👉 Easy to scan, easy to act

---

# 🔍 Example Output

```txt
[file: auth.js]

signals: condition_added(2), api_call(1)

- [critical] Possible assignment instead of comparison
- [warning] Missing error handling in API call
```

---

# 🛠️ Installation

```bash
git clone https://github.com/developer-diganta/ai-ship.git
cd ai-ship
npm install
npm run build
npm link
```

---

# 🚢 Usage

## Basic commit

```bash
ai-ship commit
```

## Review before PR

```bash
ai-ship review main
```

## Full workflow

```bash
ai-ship commit --new-branch --push --pr --yes
```

---

# 🎛️ CLI Options

| Flag                 | Description                |
| -------------------- | -------------------------- |
| `--new-branch`       | Create AI-generated branch |
| `--push`             | Push to remote             |
| `--pr`               | Create PR / MR             |
| `--yes`              | Skip confirmations         |
| `--dry-run`          | Preview without executing  |


---

# ⚙️ Configuration

```bash
ai-ship config set provider local
ai-ship config set gitlab.token <token>
ai-ship config show --verbose
```

Config stored in:

```
~/.ai-ship/config.json
```

---

# 🧠 Philosophy

> “Review your code before the world sees it.”

AI-Ship is:

* ❌ Not a chatbot
* ❌ Not a PR comment bot
* ✅ A local developer assistant

---

# ⚠️ Current Limitations

* HTML UI is minimal (improving)
* No line-level annotations (yet)
* Limited language awareness (Tree-sitter planned)

---

# 🗺️ Roadmap

* [ ] Tree-sitter integration (better multi-language support)
* [ ] Line-level annotations
* [ ] Enhanced HTML UI
* [ ] VS Code extension


---

# 🤝 Contributing

PRs are welcome!

1. Fork the repo
2. Create your branch
3. Submit a PR

---

# 👨‍💻 Author

Built by Diganta

---

# ⭐ Final Thought

AI-Ship introduces a new idea:

> **Pre-PR Code Intelligence**

Let AI-SHIP handle all the git workflows while you focus on what goes into the code!

---
