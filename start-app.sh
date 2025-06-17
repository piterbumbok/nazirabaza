#!/bin/bash

# Запуск приложения через PM2
echo "🚀 Запускаем приложение..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем старые процессы
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Запускаем сервер через PM2
pm2 start ecosystem.config.cjs

# Сохраняем конфигурацию PM2
pm2 save
pm2 startup

echo "✅ Приложение запущено!"
echo ""
echo "📊 Статус сервера:"
pm2 status