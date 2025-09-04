// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'mangazinho-api',
      cwd: '/home/dev/projects/mangazinho-api',   // 🔹 caminho oficial do backend
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/dev/.pm2/logs/mangazinho-api-error.log',
      out_file: '/home/dev/.pm2/logs/mangazinho-api-out.log',
      log_file: '/home/dev/.pm2/logs/mangazinho-api-combined.log',
      time: true
    },
    {
      name: 'mangazinho-fe',
      cwd: '/home/dev/projects/mangazinho-fe',    // 🔹 caminho oficial do frontend
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: '/home/dev/.pm2/logs/mangazinho-fe-error.log',
      out_file: '/home/dev/.pm2/logs/mangazinho-fe-out.log',
      log_file: '/home/dev/.pm2/logs/mangazinho-fe-combined.log',
      time: true
    }
  ]
};
