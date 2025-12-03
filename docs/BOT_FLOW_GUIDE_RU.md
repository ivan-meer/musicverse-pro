# Руководство по улучшенному Bot Flow

## Обзор

Данное руководство описывает улучшенную систему взаимодействия пользователя с Telegram ботом MusicVerse Pro.

## Ключевые улучшения

### 1. Приветственное сообщение с Deep Link

**Что это:**
- Закрепленное сообщение в чате с кнопкой быстрого доступа к профилю
- Deep link открывает Mini App сразу на нужной странице
- Идемпотентность: повторный /start обновляет существующее сообщение

**Как работает:**
```
Пользователь → /start
    ↓
Бот отправляет приветствие
    ↓
Сообщение автоматически закрепляется
    ↓
Кнопка содержит deep link: t.me/bot/app?startapp=profile_123456
```

**Пример использования:**
```javascript
// Отправка приветствия
await welcomeManager.sendWelcome(bot, chatId, userId, userName);

// Deep link автоматически генерируется с подписью
const deepLink = welcomeManager.generateDeepLink(userId, 'profile');
```

### 2. Многоуровневое меню с автозаменой

**Что это:**
- Одно сообщение для всего меню
- Навигация через редактирование сообщения (без спама)
- Breadcrumbs для понимания текущей позиции
- История навигации для кнопки "Назад"

**Структура меню:**
```
Главное меню
├── 🎧 Музыка
│   ├── 🎯 Рекомендации
│   ├── 🔍 Поиск
│   ├── 🎼 Жанры
│   └── 🆕 Новинки
├── 📚 Плейлисты
│   ├── Мои плейлисты
│   ├── Создать новый
│   └── Популярные
├── ❤️ Избранное
│   ├── Все треки
│   ├── По жанрам
│   └── Недавно добавленные
└── ⚙️ Настройки
    ├── Уведомления
    ├── Язык
    ├── Профиль
    └── О приложении
```

**Пример использования:**
```javascript
// Открыть главное меню
await menuManager.showMainMenu(bot, chatId, userId);

// Обработка навигации
bot.on('callback_query', async (query) => {
  if (query.data.startsWith('menu:')) {
    await menuManager.handleMenuCallback(bot, query);
  }
});
```

### 3. Уведомления о прогрессе с автоудалением

**Что это:**
- Временные сообщения для длительных операций
- Обновление прогресса в реальном времени
- Автоматическое удаление после завершения
- Разные таймауты для разных типов сообщений

**Типы сообщений и таймауты:**
- ✅ Успех: 5 секунд
- ❌ Ошибка: 10 секунд
- 📢 Уведомление: 30 секунд
- ℹ️ Информация: 15 секунд

**Пример использования:**
```javascript
// Начать операцию с прогрессом
const notificationId = await progressNotifier.start(
  bot, 
  chatId, 
  'Загрузка рекомендаций'
);

// Обновить прогресс
await progressNotifier.update(notificationId, 50, 'Обработано 10/20 треков');

// Завершить (автоудаление через 5 секунд)
await progressNotifier.complete(notificationId, 'Готово! Найдено 20 треков');
```

## Архитектура

### Компоненты

**1. WelcomeManager**
- Генерация deep links
- Отправка и закрепление приветствия
- Обновление существующего приветствия

**2. MenuManager**
- Рендеринг меню
- Обработка навигации
- Генерация breadcrumbs

**3. MenuStateStorage**
- Хранение состояния меню
- История навигации (стек)
- Автоматическая очистка устаревших состояний

**4. MessageLifecycleManager**
- Отправка и закрепление сообщений
- Редактирование сообщений
- Планирование автоудаления

**5. DeleteQueueManager**
- Очередь автоудаления
- Персистентность в Supabase
- Фоновая обработка

**6. ProgressNotifier**
- Создание уведомлений о прогрессе
- Обновление статуса
- Интеграция с автоудалением

### Поток данных

```
Пользователь нажимает кнопку меню
    ↓
MenuManager.handleCallback()
    ↓
MenuStateStorage.getState() - получить текущее состояние
    ↓
MenuManager.renderLevel() - сформировать новый уровень
    ↓
MessageLifecycleManager.editMessage() - обновить сообщение
    ↓
MenuStateStorage.updateState() - сохранить новое состояние
```

## Конфигурация

### Переменные окружения

```bash
# Таймауты сообщений (в секундах)
PROGRESS_MESSAGE_TIMEOUT=5
ERROR_MESSAGE_TIMEOUT=10
NOTIFICATION_TIMEOUT=30
INFO_MESSAGE_TIMEOUT=15

# Конфигурация меню
MENU_STATE_EXPIRY=3600  # 1 час
MENU_CLEANUP_INTERVAL=300  # 5 минут

# Очередь удаления
DELETE_QUEUE_PROCESS_INTERVAL=1000  # 1 секунда
DELETE_QUEUE_BATCH_SIZE=10

# Deep Link
MINI_APP_SHORT_NAME=musicverse
```

### Структура меню

Меню настраивается в файле `bot/config/menuStructure.js`:

```javascript
const MENU_STRUCTURE = {
  main: {
    title: '🎵 Главное меню',
    buttons: [
      { text: '🎧 Музыка', callback: 'menu:music' },
      { text: '📚 Плейлисты', callback: 'menu:playlists' },
      // ...
    ]
  },
  music: {
    title: '🎧 Музыка',
    parent: 'main',
    buttons: [
      { text: '🎯 Рекомендации', callback: 'action:recommendations' },
      // ...
      { text: '◀️ Назад', callback: 'menu:main' }
    ]
  }
};
```

## Примеры использования

### Пример 1: Добавление нового пункта меню

```javascript
// В bot/config/menuStructure.js
const MENU_STRUCTURE = {
  // ... существующие уровни
  
  genres: {
    title: '🎼 Жанры',
    parent: 'music',
    buttons: [
      { text: 'Rock', callback: 'action:genre_rock' },
      { text: 'Pop', callback: 'action:genre_pop' },
      { text: 'Jazz', callback: 'action:genre_jazz' },
      { text: 'Electronic', callback: 'action:genre_electronic' },
      { text: '◀️ Назад', callback: 'menu:music' }
    ]
  }
};

// В bot/handlers.js - обработка действия
async function handleGenreSelection(bot, query, genre) {
  const chatId = query.message.chat.id;
  
  // Показать прогресс
  const notificationId = await progressNotifier.start(
    bot,
    chatId,
    `Загрузка треков жанра ${genre}...`
  );
  
  // Получить треки
  const tracks = await musicService.getTracksByGenre(genre);
  
  // Завершить с результатом
  await progressNotifier.complete(
    notificationId,
    `Найдено ${tracks.length} треков жанра ${genre}`
  );
}
```

### Пример 2: Отправка уведомления с действиями

```javascript
// Отправить уведомление о новых рекомендациях
await notificationManager.sendNotification(
  bot,
  chatId,
  '🎵 Для вас есть новые рекомендации!',
  [
    { text: '👀 Посмотреть', callback: 'action:view_recommendations' },
    { text: '🔕 Не сейчас', callback: 'action:dismiss' }
  ]
);

// Кнопки автоматически удалятся через 30 секунд
// Если пользователь нажмет кнопку, уведомление обработается и удалится через 5 секунд
```

### Пример 3: Использование deep link из внешнего источника

```javascript
// Генерация deep link для шаринга плейлиста
const playlistDeepLink = welcomeManager.generateDeepLink(
  userId,
  `playlist_${playlistId}`
);

// Отправка пользователю
await bot.sendMessage(chatId, 'Поделитесь плейлистом:', {
  reply_markup: {
    inline_keyboard: [[
      { text: '📤 Поделиться', url: playlistDeepLink }
    ]]
  }
});

// В Mini App - обработка deep link
const startapp = Telegram.WebApp.initDataUnsafe.start_param;
if (startapp && startapp.startsWith('playlist_')) {
  const playlistId = startapp.replace('playlist_', '');
  // Открыть плейлист
  openPlaylist(playlistId);
}
```

## Безопасность

### Deep Link подпись

Deep links защищены HMAC подписью:

```javascript
function generateDeepLinkSignature(userId, timestamp, secret) {
  const data = `${userId}:${timestamp}`;
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
    .substring(0, 16);
}

// Формат: profile_{userId}_{timestamp}_{signature}
```

### Rate Limiting

Защита от злоупотреблений:

```javascript
// Лимиты на пользователя
- Навигация по меню: 10 действий/минуту
- Callback queries: 20 запросов/минуту
- Одновременные уведомления о прогрессе: максимум 5
```

## Мониторинг

### Метрики для отслеживания

**Меню:**
- Распределение глубины навигации
- Среднее время на уровень меню
- Частота использования кнопки "Назад"
- Процент отказов от меню

**Сообщения:**
- Соотношение успешных/неудачных закреплений
- Процент успешных редактирований
- Скорость выполнения автоудаления
- Размер очереди удаления

**Производительность:**
- Время рендеринга меню (p50, p95, p99)
- Время поиска состояния
- Время обработки очереди удаления
- Использование памяти хранилищем состояний

## Troubleshooting

### Проблема: Сообщение не закрепляется

**Причина:** Недостаточно прав у бота

**Решение:**
1. Убедитесь, что бот является администратором группы
2. Проверьте, что у бота есть право "Pin messages"
3. Система продолжит работу без закрепления (graceful degradation)

### Проблема: Меню не обновляется

**Причина:** Сообщение слишком старое для редактирования

**Решение:**
- Система автоматически отправит новое сообщение
- Старое сообщение будет удалено, если возможно

### Проблема: Состояние меню потеряно

**Причина:** Сессия истекла или бот перезапущен

**Решение:**
- Состояния восстанавливаются из Supabase при перезапуске
- Истекшие состояния (>1 часа) автоматически очищаются
- Пользователь может открыть меню заново командой /menu

### Проблема: Сообщения не удаляются автоматически

**Причина:** Очередь удаления не обрабатывается

**Решение:**
1. Проверьте, что DeleteQueueManager запущен
2. Проверьте логи на ошибки удаления
3. Убедитесь, что бот имеет права на удаление сообщений

## Дальнейшее развитие

### Планируемые улучшения

1. **Персонализация меню:**
   - Адаптивное меню на основе истории использования
   - Быстрые действия для часто используемых функций

2. **Расширенные уведомления:**
   - Push-уведомления через Telegram
   - Группировка уведомлений
   - Приоритизация важных уведомлений

3. **Аналитика:**
   - Тепловая карта использования меню
   - A/B тестирование структуры меню
   - Рекомендации по оптимизации UX

4. **Интеграция с Mini App:**
   - Синхронизация состояния между ботом и Mini App
   - Уведомления из Mini App в бот
   - Единая история навигации

## Заключение

Улучшенный bot flow обеспечивает:
- ✅ Чистый чат без спама
- ✅ Интуитивная навигация
- ✅ Мгновенная обратная связь
- ✅ Персистентность состояния
- ✅ Безопасность и производительность

Для начала работы см. `.kiro/specs/bot-flow-improvements/tasks.md`
