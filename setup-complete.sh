#!/bin/bash

# Полная установка сайта VGosti с GitHub
# Для сервера: 80.71.227.96
# Домен: vgosty05.ru

set -e

echo "🚀 Начинаем полную установку VGosti..."

# 1. Обновляем систему
echo "📦 Обновляем систему..."
apt update && apt upgrade -y

# 2. Устанавливаем необходимые пакеты
echo "📦 Устанавливаем необходимые пакеты..."
apt install -y curl wget git nginx ufw fail2ban build-essential python3

# 3. Устанавливаем Node.js 18.x
echo "📦 Устанавливаем Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 4. Устанавливаем PM2 глобально
echo "📦 Устанавливаем PM2..."
npm install -g pm2

# 5. Создаем пользователя для приложения (если не существует)
if ! id "vgosti" &>/dev/null; then
    echo "👤 Создаем пользователя vgosti..."
    useradd -m -s /bin/bash vgosti
    usermod -aG sudo vgosti
fi

# 6. Создаем директории
echo "📁 Создаем директории..."
mkdir -p /var/www/vgosty05
cd /var/www/vgosty05

# 7. Останавливаем все старые процессы
echo "🛑 Останавливаем старые процессы..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pkill -f "node.*server/index.js" 2>/dev/null || true

# 8. Удаляем старые файлы (если есть)
echo "🗑️ Очищаем старые файлы..."
rm -rf nazirabaza 2>/dev/null || true

# 9. Клонируем проект с GitHub
echo "📥 Клонируем проект с GitHub..."
git clone https://github.com/piterbumbok/nazirabaza.git

# 10. Переходим в директорию проекта
cd nazirabaza

# 11. Устанавливаем зависимости фронтенда
echo "📦 Устанавливаем зависимости фронтенда..."
npm install

# 12. Собираем фронтенд
echo "🔨 Собираем фронтенд..."
npm run build

# 13. Устанавливаем зависимости сервера
echo "📦 Устанавливаем зависимости сервера..."
cd server
npm install
cd ..

# 14. Создаем директорию для загрузок
echo "📁 Создаем директорию для загрузок..."
mkdir -p server/uploads

# 15. Настраиваем права доступа
echo "🔐 Настраиваем права доступа..."
chown -R vgosti:vgosti /var/www/vgosty05

# 16. Создаем директории для логов
echo "📁 Создаем директории для логов..."
mkdir -p /var/log/pm2
chown -R vgosti:vgosti /var/log/pm2

# 17. Настраиваем firewall
echo "🔥 Настраиваем firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3001

# 18. Настраиваем fail2ban
echo "🛡️ Настраиваем fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

echo "✅ Установка завершена!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Настройте Nginx конфигурацию"
echo "2. Настройте SSL сертификат"
echo "3. Запустите приложение через PM2"