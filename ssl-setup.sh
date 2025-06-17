#!/bin/bash

# Настройка SSL сертификата
echo "🔒 Настройка SSL сертификата..."

# Устанавливаем Certbot
apt install -y certbot python3-certbot-nginx

# Получаем SSL сертификат
certbot --nginx -d vgosty05.ru -d www.vgosty05.ru --non-interactive --agree-tos --email admin@vgosty05.ru

# Настраиваем автоматическое обновление
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Тестируем обновление
certbot renew --dry-run

echo "✅ SSL сертификат настроен!"