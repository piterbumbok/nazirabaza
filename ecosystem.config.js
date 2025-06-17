module.exports = {
  apps: [{
    name: 'vgosti-server',
    script: 'server/index.js',
    cwd: '/var/www/vgosty05',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_USER: 'vgosti_user',
      DB_HOST: 'localhost',
      DB_NAME: 'vgosti_db',
      DB_PASSWORD: 'your_secure_password',
      DB_PORT: 5432
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/vgosti-error.log',
    out_file: '/var/log/pm2/vgosti-out.log',
    log_file: '/var/log/pm2/vgosti-combined.log',
    time: true
  }]
};