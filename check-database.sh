#!/bin/bash

# Диагностика базы данных
echo "🔍 Диагностика базы данных..."

cd /var/www/vgosty05/nazirabaza

echo "📁 Текущая директория: $(pwd)"
echo ""

echo "🗃️ Поиск всех файлов базы данных:"
find . -name "*.sqlite" -o -name "*.db" 2>/dev/null
echo ""

echo "📊 Проверяем основную базу данных:"
if [ -f "server/database.sqlite" ]; then
    echo "✅ Найдена: server/database.sqlite"
    echo "📏 Размер: $(ls -lh server/database.sqlite | awk '{print $5}')"
    echo "📅 Изменена: $(ls -l server/database.sqlite | awk '{print $6, $7, $8}')"
    
    echo ""
    echo "📋 Таблицы в базе данных:"
    sqlite3 server/database.sqlite ".tables"
    
    echo ""
    echo "📊 Количество записей:"
    echo "Домики: $(sqlite3 server/database.sqlite "SELECT COUNT(*) FROM cabins;" 2>/dev/null || echo "Таблица не найдена")"
    echo "Настройки: $(sqlite3 server/database.sqlite "SELECT COUNT(*) FROM site_settings;" 2>/dev/null || echo "Таблица не найдена")"
    echo "Админы: $(sqlite3 server/database.sqlite "SELECT COUNT(*) FROM admin_credentials;" 2>/dev/null || echo "Таблица не найдена")"
    
    echo ""
    echo "⚙️ Все настройки в базе:"
    sqlite3 server/database.sqlite "SELECT key, substr(value, 1, 50) || '...' as value FROM site_settings;" 2>/dev/null || echo "Нет настроек"
    
else
    echo "❌ База данных server/database.sqlite НЕ НАЙДЕНА!"
fi

echo ""
echo "🌐 Проверяем API:"
if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ API работает"
    echo "📊 Ответ API:"
    curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
else
    echo "❌ API не отвечает"
fi

echo ""
echo "📊 Статус PM2:"
pm2 status

echo ""
echo "📝 Последние логи сервера:"
pm2 logs vgosti-server --lines 10 --nostream 2>/dev/null || echo "Нет логов PM2"