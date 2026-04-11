const gh = require('../gh')
const { loadConfig } = require('../config')

function contextCommand(opts) {
  const config = loadConfig()
  if (!config) {
    console.error('No team-repo.json found. Run "team-repo init" first.')
    process.exit(1)
  }

  const team = config.teams.find(t => t.letter === opts.team || t.name === opts.team)
  if (!team) {
    console.error(`Team "${opts.team}" not found. Available: ${config.teams.map(t => t.letter).join(', ')}`)
    process.exit(1)
  }

  const fullRepo = `${config.org}/${team.repo}`
  const claude = gh.getFileContent(fullRepo, 'CLAUDE.md')

  if (!claude) {
    console.error(`No CLAUDE.md found in ${fullRepo}`)
    process.exit(1)
  }

  if (opts.building) {
    const parts = opts.building.split(' for ')
    const problem = parts[0]
    const who = parts[1] || ''

    let updated = claude
    const problemMarker = "**Problem we're solving:**"
    const whoMarker = '**Who it helps:**'
    const approachMarker = '**Our approach:**'

    if (updated.includes(problemMarker)) {
      updated = updated.replace(
        new RegExp(`${problemMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${whoMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        `${problemMarker} ${problem}\n\n${whoMarker}`
      )
    }

    if (who && updated.includes(whoMarker)) {
      updated = updated.replace(
        new RegExp(`${whoMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${approachMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        `${whoMarker} ${who}\n\n${approachMarker}`
      )
    }

    // Get existing SHA for update
    const fileData = gh.ghApi(`repos/${fullRepo}/contents/CLAUDE.md`)
    const sha = fileData ? fileData.sha : undefined
    const encoded = Buffer.from(updated).toString('base64')
    const body = { message: `feat: update What We're Building - ${problem}`, content: encoded, sha }
    gh.ghApi(`repos/${fullRepo}/contents/CLAUDE.md`, 'PUT', body)

    console.log(`Updated ${team.name} CLAUDE.md:`)
    console.log(`  Problem: ${problem}`)
    if (who) console.log(`  Who: ${who}`)
  }

  if (opts.show) {
    console.log(claude)
  }
}

module.exports = contextCommand
