#!/bin/bash

# Настройка SSL сертификата
echo "🔒 Настройка SSL сертификата..."

# Устанавливаем Certbot
echo "📦 Устанавливаем Certbot..."
apt install -y certbot python3-certbot-nginx

# Получаем SSL сертификат
echo "🔐 Получаем SSL сертификат..."
certbot --nginx -d vgosty05.ru -d www.vgosty05.ru --non-interactive --agree-tos --email admin@vgosty05.ru

# Настраиваем автоматическое обновление
echo "🔄 Настраиваем автоматическое обновление..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Тестируем обновление
echo "🧪 Тестируем обновление сертификата..."
certbot renew --dry-run

echo "✅ SSL сертификат настроен!"
echo "🌐 Ваш сайт теперь доступен по HTTPS: https://vgosty05.ru"