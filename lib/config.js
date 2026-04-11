const fs = require('fs')
const path = require('path')

const CONFIG_FILE = 'team-repo.json'

function findConfig(dir = process.cwd()) {
  let current = dir
  while (current !== path.dirname(current)) {
    const configPath = path.join(current, CONFIG_FILE)
    if (fs.existsSync(configPath)) return configPath
    current = path.dirname(current)
  }
  return null
}

function loadConfig() {
  const configPath = findConfig()
  if (!configPath) return null
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

function saveConfig(config, dir = process.cwd()) {
  const configPath = path.join(dir, CONFIG_FILE)
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
  return configPath
}

function createConfig(opts) {
  return {
    org: opts.org,
    hub: opts.hub,
    event: {
      name: opts.eventName || '',
      date: opts.eventDate || '',
      time: opts.eventTime || '',
      location: opts.eventLocation || '',
      sessionLength: opts.sessionLength || '5 hours'
    },
    facilitators: opts.facilitators || [],
    discord: opts.discord || '',
    teams: opts.teams || [],
    createdAt: new Date().toISOString()
  }
}

module.exports = { loadConfig, saveConfig, createConfig, CONFIG_FILE }
