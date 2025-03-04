// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

module.exports = {
  apps: [
    {
      name: 'lw-ai',
      script: 'node_modules/.bin/next',
      args: 'dev --turbopack',
      watch: ['app', 'components', 'hooks', 'lib', 'public'],
      ignore_watch: ['node_modules', '.next'],
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/output.log',
      merge_logs: true,
      max_memory_restart: '1G'
    },
    {
      name: 'lw-ai-build',
      script: 'node_modules/.bin/next',
      args: 'build',
      autorestart: false,
      env: {
        NODE_ENV: 'production',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      }
    }
  ]
}; 