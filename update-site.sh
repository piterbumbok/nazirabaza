#!/bin/bash

# Скрипт для обновления сайта с GitHub
echo "🔄 Обновляем сайт с GitHub..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true

# Получаем последние изменения
echo "📥 Получаем обновления с GitHub..."
git pull origin main

# Устанавливаем зависимости фронтенда (если изменились)
echo "📦 Проверяем зависимости фронтенда..."
npm install

# Пересобираем фронтенд
echo "🔨 Пересобираем фронтенд..."
npm run build

# Устанавливаем зависимости сервера (если изменились)
echo "📦 Проверяем зависимости сервера..."
cd server
npm install
cd ..

# Запускаем сервер
echo "🚀 Запускаем сервер..."
pm2 start vgosti-server

echo "✅ Сайт обновлен!"
echo ""
echo "📊 Статус сервера:"
pm2 status