#!/bin/bash

# Скрипт для настройки SSL сертификата с Let's Encrypt
# Запускайте после настройки Nginx

set -e

echo "🔒 Настройка SSL сертификата..."

# Устанавливаем Certbot
echo "📦 Устанавливаем Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Получаем SSL сертификат
echo "🔐 Получаем SSL сертификат для vgosty05.ru..."
certbot --nginx -d vgosty05.ru -d www.vgosty05.ru --non-interactive --agree-tos --email admin@vgosty05.ru

# Настраиваем автоматическое обновление
echo "🔄 Настраиваем автоматическое обновление сертификата..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Тестируем обновление
echo "🧪 Тестируем обновление сертификата..."
certbot renew --dry-run

echo "✅ SSL сертификат настроен успешно!"
echo "🌐 Ваш сайт теперь доступен по HTTPS: https://vgosty05.ru"