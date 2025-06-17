#!/bin/bash

# Настройка Nginx для VGosti
echo "🌐 Настраиваем Nginx..."

# Удаляем дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Создаем конфигурацию для vgosty05.ru
cat > /etc/nginx/sites-available/vgosty05.ru << 'EOF'
server {
    listen 80;
    server_name vgosty05.ru www.vgosty05.ru;
    
    # Временно отдаем статику, пока не настроен SSL
    root /var/www/vgosty05/nazirabaza/dist;
    index index.html;

    # Максимальный размер загружаемых файлов
    client_max_body_size 50M;

    # Логи
    access_log /var/log/nginx/vgosty05.access.log;
    error_log /var/log/nginx/vgosty05.error.log;

    # API запросы проксируем на Node.js сервер
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Загруженные файлы
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Кэширование изображений
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Статические файлы React приложения
    location / {
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических ресурсов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Скрытие версии Nginx
    server_tokens off;
}
EOF

# Создаем символическую ссылку
ln -sf /etc/nginx/sites-available/vgosty05.ru /etc/nginx/sites-enabled/

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl enable nginx
systemctl restart nginx

echo "✅ Nginx настроен!"