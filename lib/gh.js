const { execSync } = require('child_process')

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts }).trim()
  } catch (err) {
    if (opts.ignoreError) return ''
    const msg = err.stderr ? err.stderr.trim() : err.message
    throw new Error(`Command failed: ${cmd}\n${msg}`)
  }
}

function ghApi(path, method = 'GET', body = null) {
  let cmd = `gh api "${path}"`
  if (method !== 'GET') cmd += ` --method ${method}`
  if (body) {
    const json = JSON.stringify(body).replace(/'/g, "'\\''")
    cmd += ` --input - <<'GHEOF'\n${JSON.stringify(body)}\nGHEOF`
  }
  const raw = run(cmd, { shell: '/bin/bash' })
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return raw }
}

function ghApiJq(path, jq) {
  const cmd = `gh api "${path}" --jq '${jq}'`
  return run(cmd, { ignoreError: true })
}

function repoExists(fullName) {
  try {
    run(`gh repo view ${fullName} --json name`)
    return true
  } catch { return false }
}

function createRepo(fullName, description, isPublic = true) {
  const visibility = isPublic ? '--public' : '--private'
  return run(`gh repo create ${fullName} ${visibility} --description "${description}"`)
}

function pushFile(fullName, path, content, message, branch = 'main') {
  const encoded = Buffer.from(content).toString('base64')
  const body = { message, content: encoded, branch }
  return ghApi(`repos/${fullName}/contents/${path}`, 'PUT', body)
}

function getFileContent(fullName, path) {
  try {
    const data = ghApi(`repos/${fullName}/contents/${path}`)
    if (data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf8')
    }
    return null
  } catch { return null }
}

function getRecentCommits(fullName, count = 5) {
  const jq = `.[0:${count}] | .[] | "\\(.commit.author.date[0:16]) | \\(.commit.author.name) | \\(.commit.message | split("\\n")[0])"`
  return ghApiJq(`repos/${fullName}/commits`, jq)
}

function getRepoFiles(fullName) {
  return ghApiJq(`repos/${fullName}/contents`, '.[].name')
}

function enablePages(fullName, branch = 'main') {
  return ghApi(`repos/${fullName}/pages`, 'POST', { source: { branch, path: '/' } })
}

function archiveRepo(fullName) {
  return ghApi(`repos/${fullName}`, 'PATCH', { archived: true })
}

module.exports = {
  run, ghApi, ghApiJq, repoExists, createRepo, pushFile,
  getFileContent, getRecentCommits, getRepoFiles, enablePages, archiveRepo
}
