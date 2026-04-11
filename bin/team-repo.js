#!/usr/bin/env node

const { program } = require('commander')

program
  .name('team-repo')
  .description('Provision, manage, and monitor GitHub repo infrastructure for teams')
  .version('1.0.0')

program
  .command('init <config-file>')
  .description('Provision hub repo + team repos from a config file')
  .action((configFile) => {
    const init = require('../lib/commands/init')
    init(configFile)
  })

program
  .command('status')
  .description('Show status of all team repos')
  .option('-t, --team <letter>', 'Show specific team only')
  .option('-d, --detailed', 'Show full commit log')
  .option('-s, --stalled', 'Show only stalled teams (no commits in 30+ min)')
  .action((opts) => {
    const status = require('../lib/commands/status')
    status(opts)
  })

program
  .command('context')
  .description('View or update a team CLAUDE.md')
  .requiredOption('-t, --team <letter>', 'Team letter or name')
  .option('-b, --building <description>', 'Update "What We\'re Building" (format: "problem for who")')
  .option('-s, --show', 'Print current CLAUDE.md')
  .action((opts) => {
    const context = require('../lib/commands/context')
    context(opts)
  })

program
  .command('deploy')
  .description('Deploy a team app via GitHub Pages or locally')
  .requiredOption('-t, --team <letter>', 'Team letter or name')
  .option('-p, --pages', 'Enable GitHub Pages')
  .option('-l, --local', 'Clone and run locally (default)')
  .option('--port <number>', 'Port for local server', parseInt)
  .option('--env-stub', 'Stub missing env vars so UI renders')
  .action((opts) => {
    const deploy = require('../lib/commands/deploy')
    deploy(opts)
  })

program
  .command('nudge')
  .description('Generate context-aware prompts for teams')
  .option('-t, --team <letter>', 'Specific team')
  .option('-m, --message <text>', 'Custom message for all teams')
  .option('-c, --custom', 'Auto-generate based on repo state')
  .option('-s, --stalled', 'Target stalled teams only')
  .option('-a, --audit', 'Generate blind spot audit prompt')
  .option('-f, --final-push', 'Generate final push prompt')
  .action((opts) => {
    const nudge = require('../lib/commands/nudge')
    nudge(opts)
  })

program
  .command('pages')
  .description('Enable GitHub Pages for a team repo')
  .requiredOption('-t, --team <letter>', 'Team letter or name')
  .action((opts) => {
    const deploy = require('../lib/commands/deploy')
    deploy({ ...opts, pages: true })
  })

program.parse()
