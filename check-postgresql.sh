#!/bin/bash

# Скрипт для проверки состояния PostgreSQL
echo "🔍 Проверяем состояние PostgreSQL..."

# Проверяем статус службы
echo "📊 Статус службы PostgreSQL:"
systemctl status postgresql --no-pager -l

echo ""
echo "🔗 Проверяем подключение к базе данных:"
sudo -u postgres psql -d vgosti_db -c "
SELECT 
    'Database: ' || current_database() as info
UNION ALL
SELECT 
    'User: ' || current_user
UNION ALL
SELECT 
    'Version: ' || version()
UNION ALL
SELECT 
    'Time: ' || now()::text;
"

echo ""
echo "📈 Статистика таблиц:"
sudo -u postgres psql -d vgosti_db -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables;
"

echo ""
echo "💾 Размер базы данных:"
sudo -u postgres psql -d vgosti_db -c "
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database 
WHERE datname = 'vgosti_db';
"

echo ""
echo "📋 Список таблиц:"
sudo -u postgres psql -d vgosti_db -c "\dt"

echo ""
echo "🔧 Проверяем подключение через приложение:"
cd /var/www/vgosty05/nazirabaza
node -e "
const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.query('SELECT NOW() as current_time, COUNT(*) as cabin_count FROM cabins')
  .then(result => {
    console.log('✅ Подключение через приложение успешно!');
    console.log('Время:', result.rows[0].current_time);
    console.log('Количество домиков:', result.rows[0].cabin_count);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Ошибка подключения:', err.message);
    process.exit(1);
  });
"