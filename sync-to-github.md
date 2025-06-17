# 🔧 Как синхронизировать изменения с GitHub

## Проблема
Изменения сделаны в Bolt, но не попали в GitHub репозиторий.

## Решение 1: Ручное обновление файлов

### 1. Скачайте обновленные файлы из Bolt
Скопируйте содержимое следующих файлов из этого проекта:

**src/App.tsx** - добавлены новые маршруты
**src/components/Hero.tsx** - кнопка "Найти жилье" работает
**src/components/Header.tsx** - ссылки О нас и Контакты
**src/pages/AboutPage.tsx** - новая страница О нас
**src/pages/ContactsPage.tsx** - новая страница Контакты
**server/index.js** - API для кастомной админки
**src/services/api.ts** - новые API методы

### 2. Обновите файлы на сервере
```bash
# Подключитесь к серверу
ssh root@80.71.227.96

# Перейдите в папку проекта
cd /var/www/vgosty05/nazirabaza

# Остановите сервер
pm2 stop vgosti-server

# Создайте новые файлы
nano src/pages/AboutPage.tsx
# Вставьте содержимое из Bolt

nano src/pages/ContactsPage.tsx
# Вставьте содержимое из Bolt

# Обновите существующие файлы
nano src/App.tsx
nano src/components/Hero.tsx
nano src/components/Header.tsx
nano server/index.js
nano src/services/api.ts

# Пересоберите и запустите
npm run build
pm2 start vgosti-server
```

## Решение 2: Автоматическое обновление

Запустите этот скрипт на сервере: