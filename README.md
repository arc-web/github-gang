# team-repo

CLI tool for provisioning, managing, and monitoring GitHub repo infrastructure for teams. One command to spin up a fully-instrumented team workspace with AI context, access tokens, and real-time monitoring.

Built from patterns managing 5 repos across 4 teams during a live workshop.

---

## Install

```bash
npm install -g team-repo
```

Or run directly:
```bash
npx team-repo <command>
```

Requires `gh` CLI authenticated with your GitHub org.

---

## Commands

### `team-repo init <config.json>`

Provisions a hub repo + team repos from a JSON config file. Creates CLAUDE.md (AI context), README (team roster), and notes.md (work log) in each repo.

```bash
team-repo init workshop.json
```

See `examples/workshop.json` for the config format.

### `team-repo status`

Dashboard showing all team repos: files, notes.md fill state, commit velocity, stalled teams.

```bash
team-repo status                    # all teams
team-repo status -t a               # specific team
team-repo status -d                 # with full commit log
team-repo status -s                 # stalled teams only (30+ min no commits)
```

### `team-repo context`

View or update a team's CLAUDE.md (the file that tells Claude Code what this team is building).

```bash
team-repo context -t a --show                              # print current CLAUDE.md
team-repo context -t a --building "grocery price comparison for shoppers"   # update What We're Building
```

### `team-repo deploy`

Deploy a team's app via GitHub Pages or run it locally. Auto-detects app type (static HTML, Vite, Next.js).

```bash
team-repo deploy -t a --pages              # enable GitHub Pages
team-repo deploy -t b --local --port 3001  # clone + npm install + npm run dev
team-repo deploy -t d --local --env-stub   # stub missing env vars so UI renders
```

### `team-repo nudge`

Generate context-aware prompts for teams based on their actual repo state.

```bash
team-repo nudge --final-push               # final push prompt for all teams
team-repo nudge -t a --custom              # auto-generated based on repo state
team-repo nudge --stalled                  # target only stalled teams
team-repo nudge --audit                    # blind spot audit prompt
team-repo nudge -m "Fill in notes.md now"  # custom message for all
```

### `team-repo pages`

Shortcut for enabling GitHub Pages on a team repo.

```bash
team-repo pages -t a                       # enable and print live URL
```

---

## Config format

Create a JSON file with your org, teams, and event details:

```json
{
  "org": "my-org",
  "hub": "my-workshop",
  "event": {
    "name": "AI Builder Workshop",
    "date": "2026-05-15",
    "time": "1 PM to 6 PM",
    "location": "WeWork Manila",
    "sessionLength": "5 hours"
  },
  "facilitators": ["Jane Smith", "John Doe"],
  "discord": "https://discord.gg/example",
  "teams": [
    {
      "name": "Pod A",
      "letter": "a",
      "repo": "workshop-pod-a",
      "rationale": "Strong leader with two learners",
      "members": [
        { "name": "Alice", "title": "PM", "level": "Subscription", "computer": "Mac" },
        { "name": "Bob", "title": "Marketing", "level": "Learning", "computer": "Windows" }
      ]
    }
  ]
}
```

---

## What it provisions

Each team repo gets:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Primes Claude Code with team context, member names, roles, guide references, token setup, "What We're Building" placeholder |
| `README.md` | Team roster, how to add work, project description |
| `notes.md` | Structured build notes template (problem, approach, what we built, how to use it, what's next) |

The hub repo gets a README with links to all team repos.

---

## Software company use

Everything maps to running distributed engineering teams:

| Workshop concept | Company equivalent |
|---|---|
| Pods | Feature teams / squads |
| Hub repo | Engineering wiki |
| CLAUDE.md per team | Team-specific AI context |
| Fine-grained PATs | Service accounts with minimal permissions |
| notes.md | Sprint retros / decision logs |
| Status monitoring | Engineering metrics dashboard |
| Nudge prompts | Automated Slack reminders |
| GitHub Pages deploy | Preview environments |
