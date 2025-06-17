#!/bin/bash

# Полное обновление сайта с GitHub (удаляет все локальные изменения)
echo "🔄 ПОЛНОЕ обновление с GitHub..."
echo "⚠️  ВНИМАНИЕ: Все локальные изменения будут удалены!"

cd /var/www/vgosty05

# Останавливаем все процессы
echo "🛑 Останавливаем все процессы..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

# Создаем резервную копию базы данных (если есть)
echo "💾 Создаем резервную копию базы данных..."
if [ -f "nazirabaza/server/database.sqlite" ]; then
    cp nazirabaza/server/database.sqlite database.sqlite.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ База данных сохранена"
fi

# Полностью удаляем старую папку
echo "🗑️ Удаляем старые файлы..."
rm -rf nazirabaza

# Клонируем свежую версию с GitHub
echo "📥 Скачиваем свежую версию с GitHub..."
git clone https://github.com/piterbumbok/nazirabaza.git

# Переходим в папку проекта
cd nazirabaza

# Восстанавливаем базу данных (если была)
echo "🔄 Восстанавливаем базу данных..."
if [ -f "../database.sqlite.backup."* ]; then
    LATEST_BACKUP=$(ls -t ../database.sqlite.backup.* | head -1)
    cp "$LATEST_BACKUP" server/database.sqlite
    echo "✅ База данных восстановлена из: $LATEST_BACKUP"
fi

# Устанавливаем зависимости фронтенда
echo "📦 Устанавливаем зависимости фронтенда..."
npm install

# Собираем фронтенд
echo "🔨 Собираем фронтенд..."
npm run build

# Устанавливаем зависимости сервера
echo "📦 Устанавливаем зависимости сервера..."
cd server
npm install
cd ..

# Создаем директорию для загрузок
echo "📁 Создаем директорию для загрузок..."
mkdir -p server/uploads

# Настраиваем права доступа
echo "🔐 Настраиваем права доступа..."
chown -R vgosti:vgosti /var/www/vgosty05

# Запускаем сервер
echo "🚀 Запускаем сервер..."
pm2 start ecosystem.config.cjs

# Сохраняем конфигурацию PM2
pm2 save

echo ""
echo "✅ ПОЛНОЕ обновление завершено!"
echo ""
echo "📊 Статус сервера:"
pm2 status
echo ""
echo "🌐 Проверьте сайт: https://vgosty05.ru"
echo "🔧 Админка: https://vgosty05.ru/admin"
echo ""
echo "📝 Если нужны логи: pm2 logs vgosti-server"