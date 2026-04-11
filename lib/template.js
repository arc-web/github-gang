const fs = require('fs')
const path = require('path')

function fillTemplate(templateStr, vars) {
  let result = templateStr
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(pattern, value)
  }
  return result
}

function loadTemplate(name) {
  const templateDir = path.join(__dirname, '..', 'templates')
  const filePath = path.join(templateDir, name)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

function renderTemplate(name, vars) {
  return fillTemplate(loadTemplate(name), vars)
}

function formatMemberTable(members) {
  const rows = members.map((m, i) => {
    const prefix = i === 0 ? '| 👑 ' : '|     '
    const role = i === 0 ? 'Pod Leader' : 'Member'
    return `${prefix}**${m.name}** | ${role} | ${m.level || '-'} | ${m.computer || '-'} |`
  })
  const header = '| | Name | Role | Level | Computer |\n|---|------|------|-------|----------|'
  return header + '\n' + rows.join('\n')
}

function formatMemberList(members) {
  return members.map((m, i) => {
    const role = i === 0 ? '(Pod Leader)' : ''
    const details = [m.title, m.level, m.computer ? `on ${m.computer}` : ''].filter(Boolean).join(', ')
    return `- ${m.name} ${role} - ${details}`
  }).join('\n')
}

module.exports = { fillTemplate, loadTemplate, renderTemplate, formatMemberTable, formatMemberList }
