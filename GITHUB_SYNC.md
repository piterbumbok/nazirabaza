# 🔧 Как синхронизировать изменения с GitHub

## 📥 Загрузка изменений на GitHub

### Вариант 1: Через веб-интерфейс GitHub

1. **Откройте репозиторий**: https://github.com/piterbumbok/nazirabaza
2. **Для каждого измененного файла**:
   - Нажмите на файл (например, `src/App.tsx`)
   - Нажмите кнопку "Edit" (карандаш)
   - Замените содержимое на новое из Bolt
   - Нажмите "Commit changes"

### Вариант 2: Через Git (если у вас есть доступ)

```bash
# Клонируйте репозиторий
git clone https://github.com/piterbumbok/nazirabaza.git
cd nazirabaza

# Замените файлы новыми версиями из Bolt
# Затем:
git add .
git commit -m "Исправлена кнопка Найти жилье, добавлены страницы О нас и Контакты"
git push origin main
```

## 🔄 Обновление сервера с GitHub

### Способ 1: Автоматический скрипт

```bash
# Подключитесь к серверу
ssh root@80.71.227.96

# Скачайте и запустите скрипт обновления
cd /var/www/vgosty05/nazirabaza
wget https://raw.githubusercontent.com/piterbumbok/nazirabaza/main/update-from-github.sh
chmod +x update-from-github.sh
./update-from-github.sh
```

### Способ 2: Ручное обновление

```bash
# Подключитесь к серверу
ssh root@80.71.227.96

# Перейдите в папку проекта
cd /var/www/vgosty05/nazirabaza

# Остановите сервер
pm2 stop vgosti-server

# Получите обновления
git pull origin main

# Пересоберите фронтенд
npm run build

# Запустите сервер
pm2 start vgosti-server
```

## 📋 Список измененных файлов

Эти файлы нужно обновить в GitHub:

1. **src/App.tsx** - добавлены маршруты для новых страниц
2. **src/components/Hero.tsx** - кнопка "Найти жилье" теперь работает
3. **src/components/Header.tsx** - ссылки О нас и Контакты ведут на страницы
4. **src/components/Footer.tsx** - динамический контент из админки
5. **src/components/WhyChooseUs.tsx** - динамический контент
6. **src/pages/HomePage.tsx** - динамическая галерея
7. **src/pages/AboutPage.tsx** - новая страница О нас
8. **src/pages/ContactsPage.tsx** - новая страница Контакты
9. **src/services/api.ts** - новые API методы
10. **server/index.js** - API для кастомной админки

## ✅ Что будет исправлено

- ✅ Кнопка "Найти жилье" будет работать
- ✅ Страницы О нас и Контакты будут доступны
- ✅ Все тексты будут загружаться из админки
- ✅ Галерея будет динамической
- ✅ Все изменения в админке будут отображаться на сайте

## 🆘 Если что-то не работает

1. Проверьте логи: `pm2 logs vgosti-server`
2. Перезапустите: `pm2 restart vgosti-server`
3. Проверьте статус: `pm2 status`