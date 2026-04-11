const { execSync } = require('child_process')
const gh = require('../gh')
const { loadConfig } = require('../config')
const fs = require('fs')
const path = require('path')

function deployCommand(opts) {
  const config = loadConfig()
  if (!config) {
    console.error('No team-repo.json found. Run "team-repo init" first.')
    process.exit(1)
  }

  const team = config.teams.find(t => t.letter === opts.team || t.name === opts.team)
  if (!team) {
    console.error(`Team "${opts.team}" not found.`)
    process.exit(1)
  }

  const fullRepo = `${config.org}/${team.repo}`

  if (opts.pages) {
    console.log(`Enabling GitHub Pages for ${fullRepo}...`)
    try {
      const result = gh.enablePages(fullRepo)
      const url = result && result.html_url ? result.html_url : `https://${config.org}.github.io/${team.repo}/`
      console.log(`Live at: ${url}`)
    } catch (err) {
      if (err.message.includes('409')) {
        console.log(`Pages already enabled.`)
        console.log(`Live at: https://${config.org}.github.io/${team.repo}/`)
      } else {
        throw err
      }
    }
    return
  }

  // Local deployment
  const port = opts.port || (3000 + config.teams.indexOf(team))
  const cloneDir = path.join('/tmp', `${team.repo}-live`)

  // Clone or pull
  if (fs.existsSync(cloneDir)) {
    console.log(`Pulling latest for ${team.name}...`)
    execSync('git pull', { cwd: cloneDir, stdio: 'pipe' })
  } else {
    console.log(`Cloning ${fullRepo}...`)
    execSync(`git clone https://github.com/${fullRepo}.git ${cloneDir}`, { stdio: 'pipe' })
  }

  // Detect app type
  const files = fs.readdirSync(cloneDir)
  const hasPackageJson = files.includes('package.json')
  const hasIndexHtml = files.includes('index.html')
  const hasNextConfig = files.includes('next.config.js') || files.includes('next.config.mjs')
  const hasViteConfig = files.includes('vite.config.js') || files.includes('vite.config.ts')

  if (hasNextConfig) {
    console.log(`Detected: Next.js app`)
    console.log(`Installing dependencies...`)
    execSync('npm install --legacy-peer-deps', { cwd: cloneDir, stdio: 'pipe' })

    if (opts.envStub) {
      stubEnvFile(cloneDir)
    }

    console.log(`Starting on port ${port}...`)
    const child = require('child_process').spawn('npx', ['next', 'dev', '-p', String(port)], {
      cwd: cloneDir, detached: true, stdio: 'ignore'
    })
    child.unref()
    console.log(`Running at: http://localhost:${port}`)

  } else if (hasViteConfig) {
    console.log(`Detected: Vite app`)
    console.log(`Installing dependencies...`)
    execSync('npm install', { cwd: cloneDir, stdio: 'pipe' })
    console.log(`Starting on port ${port}...`)
    const child = require('child_process').spawn('npx', ['vite', '--port', String(port)], {
      cwd: cloneDir, detached: true, stdio: 'ignore'
    })
    child.unref()
    console.log(`Running at: http://localhost:${port}`)

  } else if (hasIndexHtml) {
    console.log(`Detected: Static HTML`)
    execSync(`open ${path.join(cloneDir, 'index.html')}`)
    console.log(`Opened in browser.`)

  } else if (hasPackageJson) {
    console.log(`Detected: Node.js app`)
    execSync('npm install', { cwd: cloneDir, stdio: 'pipe' })
    console.log(`Starting on port ${port}...`)
    const child = require('child_process').spawn('npm', ['start'], {
      cwd: cloneDir, detached: true, stdio: 'ignore',
      env: { ...process.env, PORT: String(port) }
    })
    child.unref()
    console.log(`Running at: http://localhost:${port}`)

  } else {
    console.log(`No recognized app structure. Files: ${files.join(', ')}`)
  }
}

function stubEnvFile(dir) {
  const envExample = ['.env.local.example', '.env.example'].find(f =>
    fs.existsSync(path.join(dir, f))
  )
  if (!envExample) return

  const envPath = path.join(dir, '.env.local')
  if (fs.existsSync(envPath)) return

  console.log(`Stubbing .env.local from ${envExample}...`)
  let content = fs.readFileSync(path.join(dir, envExample), 'utf8')

  // Replace placeholder Supabase URLs with valid-format stubs
  content = content.replace(
    /NEXT_PUBLIC_SUPABASE_URL=.*/,
    'NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co'
  )
  content = content.replace(
    /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24ifQ.placeholder'
  )

  fs.writeFileSync(envPath, content)
  console.log(`  Stubbed env vars so UI renders (auth won't work until real keys are added)`)
}

module.exports = deployCommand
