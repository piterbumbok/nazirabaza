#!/bin/bash

# Скрипт для применения всех обновлений на сервер
echo "🔄 Применяем обновления на сервер..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true

# Сохраняем базу данных (если есть)
echo "💾 Сохраняем базу данных..."
if [ -f "server/database.sqlite" ]; then
    cp server/database.sqlite server/database.sqlite.backup
fi

# Получаем последние изменения с GitHub
echo "📥 Получаем обновления с GitHub..."
git stash 2>/dev/null || true
git pull origin main

# Если есть конфликты, принудительно обновляем
if [ $? -ne 0 ]; then
    echo "⚠️ Обнаружены конфликты, принудительно обновляем..."
    git fetch origin
    git reset --hard origin/main
fi

# Восстанавливаем базу данных
echo "🔄 Восстанавливаем базу данных..."
if [ -f "server/database.sqlite.backup" ]; then
    cp server/database.sqlite.backup server/database.sqlite
fi

# Устанавливаем зависимости фронтенда
echo "📦 Устанавливаем зависимости фронтенда..."
npm install

# Пересобираем фронтенд
echo "🔨 Пересобираем фронтенд..."
npm run build

# Устанавливаем зависимости сервера
echo "📦 Устанавливаем зависимости сервера..."
cd server
npm install
cd ..

# Создаем директорию для загрузок (если не существует)
mkdir -p server/uploads

# Запускаем сервер
echo "🚀 Запускаем сервер..."
pm2 start vgosti-server

echo "✅ Обновления применены!"
echo ""
echo "📊 Статус сервера:"
pm2 status
echo ""
echo "🌐 Проверьте сайт: https://vgosty05.ru"
echo "🔧 Админка: https://vgosty05.ru/admin"