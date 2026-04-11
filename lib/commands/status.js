const gh = require('../gh')
const { loadConfig } = require('../config')

function statusCommand(opts) {
  const config = loadConfig()
  if (!config) {
    console.error('No team-repo.json found. Run "team-repo init" first.')
    process.exit(1)
  }

  const teams = opts.team
    ? config.teams.filter(t => t.letter === opts.team || t.name === opts.team)
    : config.teams

  if (teams.length === 0) {
    console.error(`Team "${opts.team}" not found.`)
    process.exit(1)
  }

  const now = Date.now()

  console.log(`\n${'='.repeat(70)}`)
  console.log(`  TEAM STATUS - ${config.event.name}`)
  console.log(`${'='.repeat(70)}\n`)

  for (const team of teams) {
    const fullRepo = `${config.org}/${team.repo}`

    console.log(`--- ${team.name} (${fullRepo}) ---\n`)

    // Files
    const files = gh.getRepoFiles(fullRepo)
    const fileList = files ? files.split('\n').filter(Boolean) : []
    const templateFiles = ['CLAUDE.md', 'README.md', 'notes.md']
    const newFiles = fileList.filter(f => !templateFiles.includes(f))

    console.log(`  Files: ${fileList.length} total, ${newFiles.length} new`)
    if (newFiles.length > 0) {
      console.log(`  New: ${newFiles.join(', ')}`)
    }

    // notes.md fill state
    const notes = gh.getFileContent(fullRepo, 'notes.md')
    if (notes) {
      const sections = ['Problem We\'re Solving', 'Our Approach', 'What We Built', 'How to Use It']
      const filled = sections.filter(s => {
        const idx = notes.indexOf(s)
        if (idx === -1) return false
        const afterHeader = notes.substring(idx + s.length, idx + s.length + 100)
        return afterHeader.replace(/[#\n\r\s]/g, '').length > 5
      })
      const state = filled.length === 0 ? 'EMPTY' : filled.length >= 3 ? 'COMPLETE' : 'PARTIAL'
      console.log(`  notes.md: ${state} (${filled.length}/${sections.length} sections)`)
    }

    // README "What We're Building" check
    const readme = gh.getFileContent(fullRepo, 'README.md')
    if (readme) {
      const buildingIdx = readme.indexOf("Problem we're solving:")
      if (buildingIdx > -1) {
        const after = readme.substring(buildingIdx + 22, buildingIdx + 120).replace(/[*\n\r\s]/g, '')
        console.log(`  Building: ${after.length > 5 ? 'FILLED' : 'EMPTY'}`)
      }
    }

    // Recent commits
    const commits = gh.getRecentCommits(fullRepo, 5)
    if (commits) {
      const lines = commits.split('\n').filter(Boolean)
      console.log(`  Recent commits: ${lines.length}`)

      if (lines.length > 0) {
        const latestDateStr = lines[0].split(' | ')[0].trim()
        const latestDate = new Date(latestDateStr + ':00Z')
        const minAgo = Math.round((now - latestDate.getTime()) / 60000)

        if (minAgo > 30) {
          console.log(`  ** STALLED - last commit ${minAgo} min ago **`)
        } else {
          console.log(`  Last commit: ${minAgo} min ago`)
        }

        // Active contributors
        const authors = [...new Set(lines.map(l => l.split(' | ')[1].trim()))]
        const nonFacilitator = authors.filter(a => !a.includes('Michael Ensor') && a !== 'Claude Code')
        console.log(`  Active contributors: ${nonFacilitator.join(', ') || '(facilitator only)'}`)
      }

      if (opts.detailed) {
        console.log('\n  Commit log:')
        lines.forEach(l => console.log(`    ${l}`))
      }
    }

    console.log()
  }

  // Summary
  if (!opts.team) {
    console.log(`${'='.repeat(70)}`)
    console.log(`  SUMMARY`)
    console.log(`${'='.repeat(70)}\n`)

    const stalled = []
    for (const team of config.teams) {
      const fullRepo = `${config.org}/${team.repo}`
      const commits = gh.getRecentCommits(fullRepo, 1)
      if (commits) {
        const latestDateStr = commits.split(' | ')[0].trim()
        const latestDate = new Date(latestDateStr + ':00Z')
        const minAgo = Math.round((now - latestDate.getTime()) / 60000)
        if (minAgo > 30) stalled.push(`${team.name} (${minAgo} min)`)
      } else {
        stalled.push(`${team.name} (no commits)`)
      }
    }

    if (stalled.length > 0) {
      console.log(`  STALLED: ${stalled.join(', ')}`)
    } else {
      console.log(`  All teams active.`)
    }
    console.log()
  }
}

module.exports = statusCommand
