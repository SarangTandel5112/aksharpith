# GitHub Access for Claude Code — Setup Guide

This guide sets up two things:
1. GitHub MCP — so Claude Code can read/write your repo directly
2. GitHub Actions — so Claude Code can trigger CI from the terminal

---

## Part 1 — Create a GitHub Personal Access Token (PAT)

This token is what gives Claude Code permission to act on your GitHub account.

### Step 1 — Go to GitHub Token Settings

Open this URL in your browser:
https://github.com/settings/tokens?type=beta

(This is Fine-grained tokens — more secure than classic tokens)

### Step 2 — Click "Generate new token"

Fill in:
- **Token name:** `claude-code-pos-pwa`
- **Expiration:** 90 days (or custom — set a reminder to rotate)
- **Resource owner:** Your GitHub username

### Step 3 — Select Repository Access

Choose: **Only select repositories**
Select: `pos-pwa` (your repo)

### Step 4 — Set Permissions

Under "Repository permissions", set these:

| Permission          | Access         | Why Claude needs it              |
|---------------------|----------------|----------------------------------|
| Contents            | Read and write | Read code, create branches       |
| Pull requests       | Read and write | Create PRs, post review comments |
| Issues              | Read and write | Create issues for bugs found     |
| Workflows           | Read and write | Trigger CI runs                  |
| Commit statuses     | Read and write | Post check results on commits    |
| Metadata            | Read (required)| Required by GitHub               |

Leave everything else as **No access**.

### Step 5 — Generate and Copy the Token

Click **Generate token**.
Copy the token — it starts with `github_pat_...`
⚠️ You will NOT see it again after leaving this page.

---

## Part 2 — Add Token to Claude Code

### Option A — Environment Variable (Recommended)

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="github_pat_YOUR_TOKEN_HERE"
```

Then reload:
```bash
source ~/.zshrc
```

Claude Code will pick this up automatically via `.claude/mcp.json`.

### Option B — .env.local (Project-scoped)

Add to `pos-pwa/.env.local`:

```
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_YOUR_TOKEN_HERE
```

⚠️ `.env.local` is already in `.gitignore` — it will NOT be committed.
⚠️ Never put this token in `.env.example` or any committed file.

---

## Part 3 — Verify the Connection

Open Claude Code in your project and type:

```
Use the GitHub MCP to list the open pull requests in this repo.
```

If it works, you'll see PR data.
If it fails, check:
1. Token is set in environment (`echo $GITHUB_PERSONAL_ACCESS_TOKEN`)
2. Token has not expired
3. Repo name in the request matches exactly

---

## Part 4 — What Claude Code Can Do With GitHub Access

Once connected, Claude Code can:

```
"Create a new branch feat/auth and push the current changes"
"Open a PR from feat/auth to main with this description: ..."
"Show me all open PRs and their CI status"
"Post a review comment on PR #12 line 47 saying: ..."
"What issues are currently open with label 'bug'?"
"Create an issue: useLogin hook does not handle 401 correctly"
"Show me the CI run results for the last commit on feat/auth"
"What files changed in PR #8?"
```

---

## Part 5 — Token Security Rules

```
✅ DO:
  - Store token in environment variable or .env.local only
  - Set expiry — never create a non-expiring token
  - Use Fine-grained token scoped to ONE repo only
  - Rotate every 90 days

❌ NEVER:
  - Commit token to any file in the repo
  - Put token in .env.example
  - Share token in Slack, email, or screenshots
  - Use a Classic token (too broad permissions)
  - Create org-level tokens for a single project
```

---

## Part 6 — Revoking Access

If your token is ever exposed:

1. Go to: https://github.com/settings/tokens
2. Find `claude-code-pos-pwa`
3. Click **Delete** — access revoked immediately
4. Generate a new token following Part 1 again
5. Update your environment variable

---

## Part 7 — Playwright MCP Setup

The Playwright MCP is already configured in `.claude/mcp.json`.
It needs Playwright browsers installed:

```bash
npx playwright install chromium
```

Once installed, Claude Code can:

```
"Run the checkout E2E test and show me a screenshot if it fails"
"Navigate to http://localhost:3000/login and take a screenshot"
"Run all E2E tests and report which ones failed"
"Debug the failing step in checkout.e2e.ts line 34"
```

---

## Summary — Files Created / Modified

| File                      | What It Does                               |
|---------------------------|--------------------------------------------|
| .claude/mcp.json          | Registers GitHub + Playwright MCP servers  |
| .claude/settings.json     | Auto-approve safe commands, protect others |
| CLAUDE.md                 | Project brain — read on every session      |
| .claude/commands/*.md     | 7 slash commands for common workflows      |

---

## Quick Reference — All Slash Commands

Open Claude Code and type any of these:

| Command          | When to Use                                     |
|------------------|-------------------------------------------------|
| `/new-feature`   | Starting a new feature from scratch             |
| `/tdd`           | Enforcing Red→Green→Refactor on a file          |
| `/review`        | Before raising any PR                           |
| `/react-check`   | After adding/editing React components           |
| `/coverage`      | Checking what needs more tests                  |
| `/pr-ready`      | Final gate before pushing a PR                  |
| `/sync-check`    | Verifying offline queue is healthy              |
