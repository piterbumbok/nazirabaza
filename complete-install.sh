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

# 19. Настраиваем Nginx
echo "🌐 Настраиваем Nginx..."

# Удаляем дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Создаем конфигурацию для vgosty05.ru
cat > /etc/nginx/sites-available/vgosty05.ru << 'NGINX_EOF'
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
NGINX_EOF

# Создаем символическую ссылку
ln -sf /etc/nginx/sites-available/vgosty05.ru /etc/nginx/sites-enabled/

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl enable nginx
systemctl restart nginx

# 20. Запускаем приложение через PM2
echo "🚀 Запускаем приложение..."
cd /var/www/vgosty05/nazirabaza

# Запускаем сервер через PM2
pm2 start ecosystem.config.cjs

# Сохраняем конфигурацию PM2
pm2 save
pm2 startup

echo "✅ Установка завершена!"
echo ""
echo "📊 Статус сервера:"
pm2 status
echo ""
echo "🌐 Сайт должен быть доступен по адресу: http://vgosty05.ru"
echo ""
echo "📝 Следующий шаг - настройка SSL:"
echo "Запустите: bash /var/www/vgosty05/nazirabaza/ssl-setup.sh"