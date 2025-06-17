#!/bin/bash

# Скрипт для восстановления PostgreSQL из бэкапа
echo "🔄 Восстановление PostgreSQL из бэкапа..."

if [ -z "$1" ]; then
    echo "❌ Укажите файл бэкапа:"
    echo "Использование: ./postgresql-restore.sh /path/to/backup.sql.gz"
    echo ""
    echo "Доступные бэкапы:"
    ls -la /var/backups/postgresql/
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Файл бэкапа не найден: $BACKUP_FILE"
    exit 1
fi

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server

# Удаляем текущую базу данных
echo "🗑️ Удаляем текущую базу данных..."
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS vgosti_db;
CREATE DATABASE vgosti_db OWNER vgosti_user;
GRANT ALL PRIVILEGES ON DATABASE vgosti_db TO vgosti_user;
\q
EOF

# Восстанавливаем из бэкапа
echo "📥 Восстанавливаем из бэкапа..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | sudo -u postgres psql vgosti_db
else
    sudo -u postgres psql vgosti_db < "$BACKUP_FILE"
fi

# Запускаем сервер
echo "🚀 Запускаем сервер..."
pm2 start vgosti-server

echo "✅ Восстановление завершено!"
echo ""
echo "📊 Статус сервера:"
pm2 status