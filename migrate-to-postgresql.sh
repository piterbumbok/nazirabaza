#!/bin/bash

# Полная миграция сайта на PostgreSQL
echo "🔄 Начинаем миграцию на PostgreSQL..."

cd /var/www/vgosty05/nazirabaza

# 1. Останавливаем старый сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true
pm2 delete vgosti-server 2>/dev/null || true

# 2. Создаем резервную копию SQLite (если есть)
echo "💾 Создаем резервную копию SQLite..."
if [ -f "server/database.sqlite" ]; then
    cp server/database.sqlite server/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Резервная копия SQLite создана"
fi

# 3. Устанавливаем PostgreSQL
echo "🐘 Устанавливаем PostgreSQL..."
bash setup-postgresql.sh

# 4. Обновляем зависимости сервера
echo "📦 Обновляем зависимости сервера..."
cd server

# Удаляем SQLite зависимости и добавляем PostgreSQL
npm uninstall sqlite3
npm install pg@^8.11.3 dotenv@^16.3.1

cd ..

# 5. Создаем .env файл
echo "📝 Создаем .env файл..."
cat > server/.env << 'EOF'
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vgosti_db
DB_USER=vgosti_user
DB_PASSWORD=vgosti_secure_password_2024

# Server Configuration
NODE_ENV=production
PORT=3001

# Security
JWT_SECRET=vgosti_jwt_secret_2024_secure_key
EOF

# 6. Обновляем права доступа
echo "🔐 Настраиваем права доступа..."
chown -R vgosti:vgosti /var/www/vgosty05
chmod 600 server/.env

# 7. Пересобираем фронтенд
echo "🔨 Пересобираем фронтенд..."
npm run build

# 8. Запускаем новый сервер с PostgreSQL
echo "🚀 Запускаем сервер с PostgreSQL..."
pm2 start ecosystem.config.cjs

# 9. Сохраняем конфигурацию PM2
pm2 save

echo "✅ Миграция на PostgreSQL завершена!"
echo ""
echo "📊 Статус сервера:"
pm2 status
echo ""
echo "🐘 Информация о PostgreSQL:"
echo "  База данных: vgosti_db"
echo "  Пользователь: vgosti_user"
echo "  Хост: localhost:5432"
echo ""
echo "🌐 Проверьте сайт: https://vgosty05.ru"
echo "🔧 Админка: https://vgosty05.ru/admin"
echo ""
echo "📝 Полезные команды:"
echo "  pm2 logs vgosti-server  - логи сервера"
echo "  pm2 restart vgosti-server - перезапуск"
echo "  sudo -u postgres psql -d vgosti_db - подключение к БД"