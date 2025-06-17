#!/bin/bash

# Простое обновление ВСЕГО сайта с GitHub
echo "🔄 Обновляем ВЕСЬ сайт с GitHub..."

cd /var/www/vgosty05

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Сохраняем базу данных
echo "💾 Сохраняем базу данных..."
if [ -f "nazirabaza/server/database.sqlite" ]; then
    cp nazirabaza/server/database.sqlite database.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ База данных сохранена"
fi

# Удаляем старую папку
echo "🗑️ Удаляем старые файлы..."
rm -rf nazirabaza

# Клонируем с GitHub
echo "📥 Скачиваем с GitHub..."
git clone https://github.com/piterbumbok/nazirabaza.git

cd nazirabaza

# Восстанавливаем базу данных
echo "🔄 Восстанавливаем базу данных..."
if [ -f "../database.backup."* ]; then
    LATEST_BACKUP=$(ls -t ../database.backup.* | head -1)
    cp "$LATEST_BACKUP" server/database.sqlite
    echo "✅ База данных восстановлена"
fi

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Собираем фронтенд
echo "🔨 Собираем фронтенд..."
npm run build

# Устанавливаем зависимости сервера
echo "📦 Устанавливаем зависимости сервера..."
cd server
npm install
cd ..

# Создаем папку для загрузок
mkdir -p server/uploads

# Настраиваем права
chown -R vgosti:vgosti /var/www/vgosty05

# Запускаем сервер
echo "🚀 Запускаем сервер..."
pm2 start ecosystem.config.cjs
pm2 save

echo "✅ Обновление завершено!"
echo ""
echo "📊 Статус:"
pm2 status
echo ""
echo "🌐 Сайт: https://vgosty05.ru"
echo "🔧 Админка: https://vgosty05.ru/admin"