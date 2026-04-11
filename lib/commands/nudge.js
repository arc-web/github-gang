const gh = require('../gh')
const { loadConfig } = require('../config')

function nudgeCommand(opts) {
  const config = loadConfig()
  if (!config) {
    console.error('No team-repo.json found. Run "team-repo init" first.')
    process.exit(1)
  }

  const teams = opts.team
    ? config.teams.filter(t => t.letter === opts.team || t.name === opts.team)
    : opts.stalled
    ? getStalledTeams(config)
    : config.teams

  if (teams.length === 0) {
    console.log('No teams matched.')
    return
  }

  for (const team of teams) {
    const fullRepo = `${config.org}/${team.repo}`
    let message = ''

    if (opts.message) {
      message = opts.message
    } else if (opts.custom) {
      message = generateCustomNudge(config, team, fullRepo)
    } else if (opts.stalled) {
      message = generateStalledNudge(team)
    } else if (opts.audit) {
      message = generateAuditNudge(config, team, fullRepo)
    } else if (opts.finalPush) {
      message = generateFinalPushNudge()
    }

    console.log(`\n--- ${team.name} ---`)
    console.log(message)
    console.log()
  }
}

function getStalledTeams(config) {
  const now = Date.now()
  return config.teams.filter(team => {
    const fullRepo = `${config.org}/${team.repo}`
    const commits = gh.getRecentCommits(fullRepo, 1)
    if (!commits) return true
    const dateStr = commits.split(' | ')[0].trim()
    const date = new Date(dateStr + ':00Z')
    return (now - date.getTime()) > 30 * 60 * 1000
  })
}

function generateCustomNudge(config, team, fullRepo) {
  const notes = gh.getFileContent(fullRepo, 'notes.md') || ''
  const files = gh.getRepoFiles(fullRepo) || ''
  const commits = gh.getRecentCommits(fullRepo, 3) || ''

  const hasApp = files.includes('index.html') || files.includes('package.json')
  const notesFilled = notes.replace(/[#\n\r\s*]/g, '').length > 200

  let msg = `${team.name} - `

  if (!hasApp) {
    msg += `no app code pushed yet. Here's a prompt to get moving:\n\n`
    msg += '```\nPaste this into your terminal:\n\n'
    msg += `"I'm at a workshop building [describe your project]. I need something working and demo-able. Start building the simplest version right now - a single HTML file that does the core thing. Save it to this repo when it's working."\n`
    msg += '```'
  } else if (!notesFilled) {
    msg += `you're building but notes.md is empty. Fill it in now:\n\n`
    msg += '```\nPaste this into your terminal:\n\n'
    msg += `"Look at everything in this repo and fill in notes.md completely - problem, approach, what we built, how to use it, what we'd do next. Write it like a human."\n`
    msg += '```'
  } else {
    msg += `looking good. Run a blind spot check:\n\n`
    msg += '```\nPaste this into your terminal:\n\n'
    msg += `"Audit this codebase for demo-breaking issues. What breaks if the user does something unexpected? Rank each HIGH / MEDIUM / LOW. Fix HIGH only."\n`
    msg += '```'
  }

  return msg
}

function generateStalledNudge(team) {
  return `${team.name} - nothing showing in your repo yet. That's fine, let's fix it now.\n\n` +
    '```\nPaste this into your terminal:\n\n' +
    '"I need something working and demo-able by end of today. ' +
    'If we haven\'t decided what to build yet: ask me 3 quick questions then suggest the fastest thing we can build. ' +
    'If we have decided: skip planning, start building the simplest version right now. ' +
    'After every piece is done, save it to our GitHub repo."\n' +
    '```'
}

function generateAuditNudge(config, team, fullRepo) {
  const files = gh.getRepoFiles(fullRepo) || ''
  const hasHtml = files.includes('index.html')

  let msg = `${team.name} - run this blind spot check before the demo:\n\n`
  msg += '```\nPaste this into your terminal:\n\n'
  msg += '"Do not change anything yet. Audit this codebase for blind spots and edge cases only.\n\n'
  msg += 'Look for:\n'
  msg += '- What happens with blank input, weird characters, double-clicking\n'
  msg += '- What breaks if data is missing or empty\n'
  msg += '- What a user would try first that currently doesn\'t work\n'
  msg += '- Anything that would embarrass us in a live demo\n\n'
  msg += 'Rank each HIGH / MEDIUM / LOW. Fix HIGH only. Tell me what they are before you touch anything."\n'
  msg += '```'
  return msg
}

function generateFinalPushNudge() {
  return 'Final stretch. Paste this into your terminal:\n\n' +
    '```\n"Look at everything we\'ve built so far in this repo. Then do three things:\n' +
    '1. Fill in our notes.md completely - problem we solved, what we built, how to use it, what we\'d do next.\n' +
    '2. Make sure our README says what we built in one clear sentence.\n' +
    '3. Tell me the single most important thing to finish before the demo so we end with something working."\n' +
    '```'
}

module.exports = nudgeCommand
