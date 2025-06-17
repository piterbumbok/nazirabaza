#!/bin/bash

# Скрипт для первоначальной настройки VPS сервера
# Запускайте с правами root или через sudo

set -e

echo "🔧 Настройка VPS сервера для VGosti..."

# Обновляем систему
echo "📦 Обновляем систему..."
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
echo "📦 Устанавливаем необходимые пакеты..."
apt install -y curl wget git nginx ufw fail2ban

# Устанавливаем Node.js 18.x
echo "📦 Устанавливаем Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Проверяем версии
echo "✅ Версии установленного ПО:"
node --version
npm --version
nginx -v

# Устанавливаем PM2 глобально
echo "📦 Устанавливаем PM2..."
npm install -g pm2

# Создаем пользователя для приложения (если не существует)
if ! id "vgosti" &>/dev/null; then
    echo "👤 Создаем пользователя vgosti..."
    useradd -m -s /bin/bash vgosti
    usermod -aG sudo vgosti
fi

# Создаем директорию для приложения
echo "📁 Создаем директории..."
mkdir -p /var/www/vgosty05
chown -R vgosti:vgosti /var/www/vgosty05

# Настраиваем firewall
echo "🔥 Настраиваем firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3001

# Настраиваем fail2ban
echo "🛡️ Настраиваем fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Создаем конфигурацию Nginx
echo "🌐 Настраиваем Nginx..."
# Удаляем дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Включаем и запускаем Nginx
systemctl enable nginx
systemctl start nginx

echo "✅ Базовая настройка сервера завершена!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Скопируйте код проекта в /var/www/vgosty05"
echo "2. Настройте SSL сертификат с помощью Let's Encrypt"
echo "3. Скопируйте nginx.conf в /etc/nginx/sites-available/vgosty05.ru"
echo "4. Создайте символическую ссылку: ln -s /etc/nginx/sites-available/vgosty05.ru /etc/nginx/sites-enabled/"
echo "5. Перезапустите Nginx: systemctl reload nginx"
echo "6. Запустите deploy.sh для развертывания приложения"