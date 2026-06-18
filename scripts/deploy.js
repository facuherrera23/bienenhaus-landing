import { execSync } from 'child_process'
import { publish } from 'gh-pages'

console.log('=== Building for production ===')
execSync('npm run build', { stdio: 'inherit' })

console.log('\n=== Deploying to gh-pages ===')
publish(
  'dist',
  {
    branch: 'gh-pages',
    repo: 'https://github.com/facuherrera23/bienenhaus-landing.git',
    message: 'deploy: update landing [skip ci]',
  },
  (err) => {
    if (err) {
      console.error('Deploy failed:', err)
      process.exit(1)
    }
    console.log('Deploy complete!')
  }
)
