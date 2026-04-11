const gh = require('../gh')
const { renderTemplate, formatMemberTable, formatMemberList } = require('../template')
const { saveConfig, createConfig } = require('../config')

async function initCommand(configFile, opts) {
  const fs = require('fs')
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'))

  console.log(`\nProvisioning repos for ${config.org}...`)
  console.log(`  Hub: ${config.hub}`)
  console.log(`  Teams: ${config.teams.length}\n`)

  const fullHub = `${config.org}/${config.hub}`
  const vars = {
    EVENT_NAME: config.event.name,
    EVENT_DATE: config.event.date,
    EVENT_TIME: config.event.time,
    EVENT_LOCATION: config.event.location,
    SESSION_LENGTH: config.event.sessionLength,
    ORG_NAME: config.org,
    HUB_REPO: config.hub,
    DISCORD_INVITE: config.discord || '',
    FACILITATOR_1: config.facilitators[0] || '',
    FACILITATOR_2: config.facilitators[1] || '',
    POD_SIZE: '3-4'
  }

  // Create hub repo
  if (!gh.repoExists(fullHub)) {
    console.log(`Creating hub repo: ${fullHub}`)
    gh.createRepo(fullHub, `${config.event.name} - Workshop Hub`)
  } else {
    console.log(`Hub repo exists: ${fullHub}`)
  }

  // Push hub files
  console.log('  Pushing hub CLAUDE.md...')
  gh.pushFile(fullHub, 'CLAUDE.md', renderTemplate('hub/CLAUDE.md', vars), 'feat: add workshop CLAUDE.md')

  console.log('  Pushing hub SETUP.md...')
  gh.pushFile(fullHub, 'SETUP.md', renderTemplate('hub/SETUP.md', vars), 'feat: add setup guide')

  // Build pod table for hub README
  const podRows = config.teams.map(t => {
    const memberNames = t.members.slice(1).map(m => m.name).join(', ')
    return `| **${t.name}** | ${t.members[0].name} | ${memberNames} | [${t.repo}](https://github.com/${config.org}/${t.repo}) |`
  }).join('\n')

  vars.POD_TABLE = `| Pod | Leader | Members | Repo |\n|-----|--------|---------|------|\n${podRows}`

  const hubReadme = `# ${config.event.name}\n\n## Pods\n\n${vars.POD_TABLE}\n`
  console.log('  Pushing hub README.md...')
  gh.pushFile(fullHub, 'README.md', hubReadme, 'feat: add workshop README with pod table')

  // Create team repos
  for (const team of config.teams) {
    const fullRepo = `${config.org}/${team.repo}`
    const teamVars = {
      ...vars,
      POD_NAME: team.name,
      POD_LETTER: team.letter,
      POD_REPO: team.repo,
      POD_SIZE: String(team.members.length),
      POD_LEADER: team.members[0].name,
      POD_RATIONALE: team.rationale || '',
      POD_MEMBERS: formatMemberList(team.members),
      POD_ROSTER_TABLE: formatMemberTable(team.members),
      EVENT_NAME_BADGE: config.event.name.replace(/ /g, '_')
    }

    if (!gh.repoExists(fullRepo)) {
      console.log(`\nCreating team repo: ${fullRepo}`)
      gh.createRepo(fullRepo, `${config.event.name} - ${team.name}`)
    } else {
      console.log(`\nTeam repo exists: ${fullRepo}`)
    }

    console.log(`  Pushing ${team.name} CLAUDE.md...`)
    gh.pushFile(fullRepo, 'CLAUDE.md', renderTemplate('pod/CLAUDE.md', teamVars), `feat: add ${team.name} CLAUDE.md`)

    console.log(`  Pushing ${team.name} README.md...`)
    gh.pushFile(fullRepo, 'README.md', renderTemplate('pod/README.md', teamVars), `feat: add ${team.name} README`)

    console.log(`  Pushing ${team.name} notes.md...`)
    gh.pushFile(fullRepo, 'notes.md', renderTemplate('pod/notes.md', teamVars), `feat: add ${team.name} build notes template`)
  }

  // Save config locally
  saveConfig(config)

  console.log(`\n--- Done ---`)
  console.log(`Hub: https://github.com/${fullHub}`)
  config.teams.forEach(t => {
    console.log(`${t.name}: https://github.com/${config.org}/${t.repo}`)
  })
  console.log(`\nConfig saved to team-repo.json`)
  console.log(`Next: create PAT tokens with 'team-repo tokens --create'`)
}

module.exports = initCommand
