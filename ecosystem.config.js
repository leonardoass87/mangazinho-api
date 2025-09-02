module.exports = {
  apps: [
    {
      name: 'mangazinho-api',
      script: 'src/server.js',
      cwd: '/var/www/mangazinho',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/mangazinho/api-error.log',
      out_file: '/var/log/mangazinho/api-out.log',
      log_file: '/var/log/mangazinho/api-combined.log',
      time: true
    },
    {
      name: 'mangazinho-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/mangazinho/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/mangazinho/frontend-error.log',
      out_file: '/var/log/mangazinho/frontend-out.log',
      log_file: '/var/log/mangazinho/frontend-combined.log',
      time: true
    }
  ]
};
