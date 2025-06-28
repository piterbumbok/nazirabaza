#!/bin/bash

# Быстрое обновление только кода (без остановки сервера)
echo "⚡ Быстрое обновление кода..."

cd /var/www/vgosty05/nazirabaza

# Получаем обновления
echo "📥 Загружаем обновления..."
git pull origin main

# Собираем фронтенд
echo "🔨 Пересобираем фронтенд..."
npm run build

# Перезапускаем сервер
echo "🔄 Перезапускаем сервер..."
pm2 restart vgosti-server

echo "✅ Быстрое обновление завершено!"
echo "🌐 Сайт: https://vgosty05.ru"