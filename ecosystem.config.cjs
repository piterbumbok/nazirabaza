module.exports = {
  apps: [{
    name: 'vgosti-server',
    script: 'server/index.js',
    cwd: '/var/www/vgosty05/nazirabaza',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/vgosti-error.log',
    out_file: '/var/log/pm2/vgosti-out.log',
    log_file: '/var/log/pm2/vgosti-combined.log',
    time: true,
    // Автоматический перезапуск при ошибках
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    // Переменные окружения для отладки
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      DEBUG: 'vgosti:*'
    }
  }]
};