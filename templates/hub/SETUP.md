# Setup Guide

**Goal: Get Claude Code running on your computer before the session starts.**

This should take about 10 minutes. You don't need to be technical. Just follow each step, and if you get stuck - ask someone in your pod first, then raise your hand.

---

## Step 1 - Create a Claude Account

Go to **https://claude.ai** and sign up for a free account.

Already have one? Great, sign in and move to Step 2.

> Raise your hand when you're signed in to claude.ai

---

## Step 2 - Get Your Pod API Key

Your pod has an API key - think of it as a pass that unlocks Claude Code for today.

1. Open Discord: **{{DISCORD_INVITE}}**
2. Go to your Pod channel ({{POD_CHANNEL_LIST}})
3. Find the pinned message - your API key starts with `sk-ant-`
4. Copy it

> Raise your hand when you have your API key copied

---

## Step 3 - Let Claude Walk You Through the Rest

Instead of following a long technical guide, paste one message into Claude and let it guide you through setup - step by step, for your exact computer.

**Open a new chat on claude.ai and paste this exactly:**

```
I'm at {{EVENT_NAME}} in {{EVENT_LOCATION}} today. I need help getting Claude Code set up on my computer. Claude Code is Anthropic's tool that lets you use Claude inside your terminal.

Workshop repo for context: https://github.com/{{ORG_NAME}}/{{HUB_REPO}}

Please:
1. First ask me what type of computer I have (Mac, Windows, or Linux) and what version
2. Walk me through the full setup one step at a time - wait for me to confirm each step is done before moving on
3. My pod API key starts with sk-ant- and I have it ready to give you when you need it
4. If I hit an error, help me troubleshoot it before moving on
5. Let me know when I'm done and ready to go

Let's start - what computer do I have?
```

Claude will ask what kind of computer you have, then give you the exact steps for your machine.

> Raise your hand when Claude responds and asks about your computer

---

## Step 4 - Follow Claude's Instructions

Just do what Claude tells you, one step at a time. Confirm each step before moving on.

**If you get stuck:**
- First ask the person next to you in your pod
- If they can't help, raise your hand and a facilitator will come to you

**You'll know you're done when:**
You see a `>` prompt in your terminal after typing `claude` - that means Claude Code is running and you're ready.

> Raise your hand when Claude Code is running in your terminal

---

## Terminal Shortcuts (for later)

| What you want to do | How |
|---------------------|-----|
| Stop what's running | `Ctrl + C` |
| Clear the screen | Type `clear` then Enter |
| Exit Claude Code | Type `/exit` then Enter |
| Start Claude Code again | Type `claude` then Enter |

---

Back to [main README](README.md)
