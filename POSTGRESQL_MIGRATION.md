# 🐘 Миграция на PostgreSQL

## Что изменилось

✅ **SQLite → PostgreSQL** - профессиональная база данных  
✅ **Улучшенная производительность** - индексы и оптимизация  
✅ **Лучшая масштабируемость** - поддержка множественных подключений  
✅ **Транзакции** - надежность операций  
✅ **JSON поля** - эффективное хранение настроек  

## 📋 Пошаговая инструкция

### 1. Подключитесь к серверу
```bash
ssh root@80.71.227.96
```

### 2. Перейдите в папку проекта
```bash
cd /var/www/vgosty05/nazirabaza
```

### 3. Запустите миграцию
```bash
# Сделайте скрипт исполняемым
chmod +x migrate-to-postgresql.sh

# Запустите миграцию
./migrate-to-postgresql.sh
```

### 4. Проверьте результат
```bash
# Проверьте статус сервера
pm2 status

# Проверьте PostgreSQL
./check-postgresql.sh

# Проверьте сайт
curl -I https://vgosty05.ru
```

## 🔧 Управление PostgreSQL

### Подключение к базе данных
```bash
sudo -u postgres psql -d vgosti_db
```

### Полезные SQL команды
```sql
-- Список таблиц
\dt

-- Структура таблицы
\d cabins

-- Количество записей
SELECT COUNT(*) FROM cabins;

-- Выход
\q
```

### Резервное копирование
```bash
# Создать бэкап
./postgresql-backup.sh

# Восстановить из бэкапа
./postgresql-restore.sh /var/backups/postgresql/backup.sql.gz
```

## 📊 Преимущества PostgreSQL

### Производительность
- **Индексы** - быстрый поиск по данным
- **Параллельные запросы** - множественные подключения
- **Кэширование** - умное управление памятью

### Надежность
- **ACID транзакции** - гарантия целостности данных
- **Репликация** - возможность создания копий
- **Восстановление** - точка-в-времени восстановление

### Функциональность
- **JSON поля** - гибкое хранение настроек
- **Полнотекстовый поиск** - поиск по содержимому
- **Расширения** - дополнительные возможности

## 🔍 Мониторинг

### Проверка состояния
```bash
# Статус службы
systemctl status postgresql

# Проверка подключения
./check-postgresql.sh

# Логи PostgreSQL
tail -f /var/log/postgresql/postgresql-*-main.log
```

### Производительность
```sql
-- Активные подключения
SELECT count(*) FROM pg_stat_activity;

-- Размер базы данных
SELECT pg_size_pretty(pg_database_size('vgosti_db'));

-- Статистика таблиц
SELECT * FROM pg_stat_user_tables;
```

## 🆘 Устранение неполадок

### Сервер не запускается
```bash
# Проверьте логи
pm2 logs vgosti-server

# Проверьте .env файл
cat server/.env

# Проверьте PostgreSQL
systemctl status postgresql
```

### Ошибки подключения
```bash
# Проверьте настройки PostgreSQL
sudo -u postgres psql -c "SHOW listen_addresses;"

# Проверьте права пользователя
sudo -u postgres psql -c "\du"
```

### Восстановление
```bash
# Если что-то пошло не так, можно вернуться к SQLite
pm2 stop vgosti-server
# Восстановите старый server/index.js из бэкапа
# Установите sqlite3: npm install sqlite3
pm2 start vgosti-server
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs vgosti-server`
2. Проверьте PostgreSQL: `./check-postgresql.sh`
3. Создайте issue с описанием проблемы