# Руководство по развертыванию VGosti на VPS

## Предварительные требования

- VPS сервер с Ubuntu 20.04+ или Debian 11+
- Доменное имя (vgosty05.ru), настроенное на IP вашего сервера
- SSH доступ к серверу с правами sudo

## Пошаговое развертывание

### 1. Подключение к серверу

```bash
ssh root@80.71.227.96
```

### 2. Первоначальная настройка сервера

```bash
# Скачиваем и запускаем скрипт настройки
wget https://raw.githubusercontent.com/piterbumbok/nazirabaza/main/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

### 3. Клонирование проекта

```bash
# Переходим в директорию веб-сайтов
cd /var/www

# Клонируем проект
git clone https://github.com/piterbumbok/nazirabaza.git vgosty05

# Меняем владельца
chown -R vgosti:vgosti vgosty05

# Переходим в директорию проекта
cd vgosty05
```

### 4. Настройка Nginx

```bash
# Копируем конфигурацию Nginx
cp nginx.conf /etc/nginx/sites-available/vgosty05.ru

# Создаем символическую ссылку
ln -s /etc/nginx/sites-available/vgosty05.ru /etc/nginx/sites-enabled/

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl reload nginx
```

### 5. Настройка SSL сертификата

```bash
# Запускаем скрипт настройки SSL
chmod +x ssl-setup.sh
./ssl-setup.sh
```

### 6. Развертывание приложения

```bash
# Переключаемся на пользователя vgosti
su - vgosti
cd /var/www/vgosty05

# Запускаем развертывание
chmod +x deploy.sh
./deploy.sh
```

## Управление приложением

### Основные команды PM2

```bash
# Статус всех процессов
pm2 status

# Логи сервера
pm2 logs vgosti-server

# Перезапуск сервера
pm2 restart vgosti-server

# Остановка сервера
pm2 stop vgosti-server

# Мониторинг в реальном времени
pm2 monit
```

### Обновление приложения

```bash
cd /var/www/vgosty05

# Получаем последние изменения
git pull origin main

# Пересобираем и перезапускаем
./deploy.sh
```

### Логи и мониторинг

```bash
# Логи Nginx
tail -f /var/log/nginx/vgosty05.access.log
tail -f /var/log/nginx/vgosty05.error.log

# Логи PM2
pm2 logs vgosti-server

# Системные логи
journalctl -u nginx -f
```

## Резервное копирование

### База данных

```bash
# Создание резервной копии
cp /var/www/vgosty05/server/database.sqlite /backup/database-$(date +%Y%m%d).sqlite

# Восстановление
cp /backup/database-20231201.sqlite /var/www/vgosty05/server/database.sqlite
pm2 restart vgosti-server
```

### Загруженные файлы

```bash
# Резервное копирование загрузок
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/www/vgosty05/server/uploads/

# Восстановление
tar -xzf /backup/uploads-20231201.tar.gz -C /
```

## Устранение неполадок

### Сайт не открывается

1. Проверьте статус Nginx: `systemctl status nginx`
2. Проверьте статус PM2: `pm2 status`
3. Проверьте логи: `pm2 logs vgosti-server`

### Ошибки SSL

1. Проверьте сертификат: `certbot certificates`
2. Обновите сертификат: `certbot renew`
3. Перезапустите Nginx: `systemctl reload nginx`

### Проблемы с базой данных

1. Проверьте права доступа: `ls -la /var/www/vgosty05/server/`
2. Пересоздайте базу: удалите `database.sqlite` и перезапустите сервер

## Безопасность

### Регулярные обновления

```bash
# Обновление системы
apt update && apt upgrade -y

# Обновление Node.js пакетов
cd /var/www/vgosty05
npm audit fix
cd server
npm audit fix
```

### Мониторинг

- Настройте мониторинг с помощью `htop`, `iotop`
- Используйте `fail2ban` для защиты от брутфорс атак
- Регулярно проверяйте логи на подозрительную активность

## Контакты

При возникновении проблем обращайтесь к документации или создавайте issue в репозитории проекта.