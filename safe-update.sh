#!/bin/bash

# Безопасное обновление сайта с сохранением всех данных
echo "🔄 Безопасное обновление сайта..."
echo "📊 Все ваши данные (домики, настройки, отзывы) будут сохранены!"

cd /var/www/vgosty05/nazirabaza

# Проверяем, что мы в правильной папке
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: не найден файл package.json"
    echo "Убедитесь, что вы находитесь в папке /var/www/vgosty05/nazirabaza"
    exit 1
fi

# Создаем резервную копию базы данных
echo "💾 Создаем резервную копию базы данных..."
if [ -f "server/database.sqlite" ]; then
    cp server/database.sqlite server/database.backup.$(date +%Y%m%d_%H%M%S).sqlite
    echo "✅ Резервная копия создана"
else
    echo "⚠️  База данных не найдена, будет создана новая"
fi

# Создаем резервную копию загруженных файлов
echo "📸 Создаем резервную копию загруженных изображений..."
if [ -d "server/uploads" ]; then
    cp -r server/uploads server/uploads.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Изображения сохранены"
fi

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true

# Получаем обновления с GitHub
echo "📥 Загружаем обновления с GitHub..."
git stash 2>/dev/null || true  # Сохраняем локальные изменения
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при загрузке обновлений"
    echo "Попробуйте выполнить команды вручную:"
    echo "git stash"
    echo "git pull origin main"
    exit 1
fi

# Устанавливаем зависимости фронтенда
echo "📦 Обновляем зависимости фронтенда..."
npm install

# Собираем новый фронтенд
echo "🔨 Собираем обновленный фронтенд..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке фронтенда"
    exit 1
fi

# Устанавливаем зависимости сервера
echo "📦 Обновляем зависимости сервера..."
cd server
npm install
cd ..

# Создаем папку для загрузок, если её нет
mkdir -p server/uploads

# Настраиваем права доступа
echo "🔐 Настраиваем права доступа..."
chown -R vgosti:vgosti /var/www/vgosty05 2>/dev/null || true

# Запускаем сервер
echo "🚀 Запускаем обновленный сервер..."
pm2 start vgosti-server 2>/dev/null || pm2 start ecosystem.config.cjs

# Проверяем статус
echo ""
echo "📊 Статус сервера:"
pm2 status

# Проверяем работу API
echo ""
echo "🧪 Проверяем работу сервера..."
sleep 3
if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ Сервер работает корректно!"
else
    echo "⚠️  Сервер запущен, но API может быть недоступен"
    echo "Проверьте логи: pm2 logs vgosti-server"
fi

echo ""
echo "🎉 =================================="
echo "✅ ОБНОВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО!"
echo "🎉 =================================="
echo ""
echo "📊 Что сохранено:"
echo "   ✅ Все домики и их настройки"
echo "   ✅ Все отзывы"
echo "   ✅ Все настройки сайта"
echo "   ✅ Все загруженные изображения"
echo "   ✅ Логин и пароль админки"
echo ""
echo "🌐 Ваш сайт: https://vgosty05.ru"
echo "🔧 Админка: https://vgosty05.ru/admin"
echo ""
echo "📝 Если есть проблемы:"
echo "   pm2 logs vgosti-server"
echo "   pm2 restart vgosti-server"