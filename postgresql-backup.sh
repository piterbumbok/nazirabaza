#!/bin/bash

# Скрипт для резервного копирования PostgreSQL
echo "💾 Создаем резервную копию PostgreSQL..."

# Создаем директорию для бэкапов
mkdir -p /var/backups/postgresql

# Создаем дамп базы данных
BACKUP_FILE="/var/backups/postgresql/vgosti_db_$(date +%Y%m%d_%H%M%S).sql"

sudo -u postgres pg_dump vgosti_db > "$BACKUP_FILE"

# Сжимаем бэкап
gzip "$BACKUP_FILE"

echo "✅ Резервная копия создана: ${BACKUP_FILE}.gz"

# Удаляем старые бэкапы (старше 7 дней)
find /var/backups/postgresql -name "*.gz" -mtime +7 -delete

echo "🧹 Старые бэкапы очищены"

# Показываем размер бэкапа
ls -lh "${BACKUP_FILE}.gz"