#!/bin/bash

# Скрипт для развертывания VGosti на VPS сервере
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем развертывание VGosti..."

# Проверяем, что мы находимся в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Убедитесь, что вы находитесь в корневой директории проекта."
    exit 1
fi

# Устанавливаем зависимости для фронтенда
echo "📦 Устанавливаем зависимости фронтенда..."
npm install

# Собираем фронтенд
echo "🔨 Собираем фронтенд..."
npm run build

# Переходим в директорию сервера и устанавливаем зависимости
echo "📦 Устанавливаем зависимости сервера..."
cd server
npm install
cd ..

# Создаем директории для логов
echo "📁 Создаем директории для логов..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Создаем директорию для загрузок
echo "📁 Создаем директорию для загрузок..."
mkdir -p server/uploads

# Устанавливаем PM2 глобально, если не установлен
if ! command -v pm2 &> /dev/null; then
    echo "📦 Устанавливаем PM2..."
    sudo npm install -g pm2
fi

# Останавливаем предыдущий процесс, если он запущен
echo "🛑 Останавливаем предыдущие процессы..."
pm2 stop vgosti-server 2>/dev/null || true
pm2 delete vgosti-server 2>/dev/null || true

# Запускаем сервер через PM2
echo "🚀 Запускаем сервер через PM2..."
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2
echo "💾 Сохраняем конфигурацию PM2..."
pm2 save
pm2 startup

echo "✅ Развертывание завершено!"
echo ""
echo "📊 Статус сервера:"
pm2 status

echo ""
echo "📝 Полезные команды:"
echo "  pm2 status          - статус процессов"
echo "  pm2 logs vgosti-server - логи сервера"
echo "  pm2 restart vgosti-server - перезапуск сервера"
echo "  pm2 stop vgosti-server - остановка сервера"
echo ""
echo "🌐 Сайт должен быть доступен по адресу: https://vgosty05.ru"