#!/bin/bash

# Быстрое исправление проблем с сервером
echo "🔧 Исправляем проблемы с сервером..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем все процессы
echo "🛑 Останавливаем все процессы..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

# Проверяем, что файлы на месте
echo "📁 Проверяем файлы..."
if [ ! -f "server/index.js" ]; then
    echo "❌ Файл server/index.js не найден!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ Файл package.json не найден!"
    exit 1
fi

# Устанавливаем зависимости сервера
echo "📦 Устанавливаем зависимости сервера..."
cd server
npm install
cd ..

# Пересобираем фронтенд
echo "🔨 Пересобираем фронтенд..."
npm install
npm run build

# Создаем директорию для загрузок
mkdir -p server/uploads

# Проверяем права доступа
chown -R vgosti:vgosti /var/www/vgosty05 2>/dev/null || true

# Запускаем сервер напрямую для проверки
echo "🧪 Тестируем сервер..."
cd server
timeout 10s node index.js &
SERVER_PID=$!
sleep 3

# Проверяем, работает ли сервер
if curl -f http://localhost:3001/api/cabins >/dev/null 2>&1; then
    echo "✅ Сервер работает!"
    kill $SERVER_PID 2>/dev/null || true
else
    echo "❌ Сервер не отвечает!"
    kill $SERVER_PID 2>/dev/null || true
    echo "📋 Логи сервера:"
    node index.js &
    sleep 2
    kill $! 2>/dev/null || true
fi

cd ..

# Запускаем через PM2
echo "🚀 Запускаем через PM2..."
pm2 start ecosystem.config.cjs

# Проверяем статус
echo "📊 Статус сервера:"
pm2 status

echo ""
echo "🌐 Проверьте сайт: https://vgosty05.ru"
echo "🔧 Админка: https://vgosty05.ru/admin"
echo ""
echo "📝 Если проблемы остались, запустите:"
echo "pm2 logs vgosti-server"