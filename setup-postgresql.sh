#!/bin/bash

# Скрипт для установки и настройки PostgreSQL
echo "🐘 Устанавливаем и настраиваем PostgreSQL..."

# Обновляем систему
echo "📦 Обновляем систему..."
apt update

# Устанавливаем PostgreSQL
echo "📦 Устанавливаем PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Запускаем и включаем PostgreSQL
echo "🚀 Запускаем PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Создаем пользователя и базу данных
echo "👤 Создаем пользователя и базу данных..."
sudo -u postgres psql << EOF
-- Создаем пользователя
CREATE USER vgosti_user WITH PASSWORD 'vgosti_secure_password_2024';

-- Создаем базу данных
CREATE DATABASE vgosti_db OWNER vgosti_user;

-- Даем права пользователю
GRANT ALL PRIVILEGES ON DATABASE vgosti_db TO vgosti_user;

-- Выходим
\q
EOF

# Настраиваем PostgreSQL для подключений
echo "🔧 Настраиваем PostgreSQL..."

# Находим конфигурационные файлы
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

# Настраиваем postgresql.conf
echo "📝 Настраиваем postgresql.conf..."
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONFIG_DIR/postgresql.conf"
sed -i "s/#port = 5432/port = 5432/" "$PG_CONFIG_DIR/postgresql.conf"

# Настраиваем pg_hba.conf
echo "📝 Настраиваем pg_hba.conf..."
echo "local   vgosti_db   vgosti_user                     md5" >> "$PG_CONFIG_DIR/pg_hba.conf"
echo "host    vgosti_db   vgosti_user   127.0.0.1/32      md5" >> "$PG_CONFIG_DIR/pg_hba.conf"

# Перезапускаем PostgreSQL
echo "🔄 Перезапускаем PostgreSQL..."
systemctl restart postgresql

# Проверяем подключение
echo "🧪 Проверяем подключение к базе данных..."
sudo -u postgres psql -d vgosti_db -c "SELECT 'PostgreSQL is working!' as status;"

echo "✅ PostgreSQL настроен успешно!"
echo ""
echo "📊 Информация о базе данных:"
echo "  Хост: localhost"
echo "  Порт: 5432"
echo "  База данных: vgosti_db"
echo "  Пользователь: vgosti_user"
echo "  Пароль: vgosti_secure_password_2024"