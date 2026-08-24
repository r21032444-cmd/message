# 🚀 Как запустить проект

## 1. Быстрый старт (Рекомендуется)

### Через Backend (всё в одном)

```powershell
cd backend
npm install
npm start
```

Откройте браузер: **http://localhost:3001**

✅ Так работает всё вместе — frontend и backend на одном сервере!

---

## 2. Разработка с Vite (Frontend отдельно)

Если нужна горячая перезагрузка фронтенда:

**Терминал 1 - Backend:**
```powershell
cd backend
npm install
npm start
```

**Терминал 2 - Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

Фронтенд будет на **http://localhost:5173** (Vite dev server)

---

## 3. Использование Go Live 

### Вариант A: С модифицированным Backend (✅ ЛУЧШЕ)

1. Установите расширение **Live Server** в VS Code
2. Запустите: `npm start` в папке `backend`
3. Right-click на файл → "Open with Live Server" → выберет http://localhost:3001
4. Всё работает: backend, frontend, Socket.IO!

### Вариант B: Только Frontend (без backend)

1. Откройте папку `frontend`
2. Right-click на `index.html` → "Open with Live Server"
3. Фронтенд будет служиться локально
4. Backend API не будет работать (только локальные данные)

---

## 📁 Структура проекта

```
backend/
├── src/
│   ├── server.js          ← Express + Socket.IO сервер
│   ├── db.js              ← База данных (JSON)
│   └── uploads/           ← Загруженные файлы
└── package.json

frontend/
├── index.html             ← HTML страница (Go Live откроет это)
├── app.js                 ← Vanilla JS версия приложения
├── styles.css             ← Стили (основные)
├── src/
│   ├── App.jsx            ← React версия приложения
│   ├── main.jsx           ← React entry point
│   └── styles.css         ← React стили
└── package.json           ← Vite конфиг
```

---

## 🔧 Что я изменил

**Backend теперь:**
- ✅ Обслуживает статические файлы фронтенда
- ✅ Имеет catch-all маршрут для SPA (React Router)
- ✅ Позволяет Go Live работать с фронтом и бэком вместе

**Команда в `server.js` (строка 23):**
```javascript
app.use(express.static(frontendPath)); // Обслуживает frontend папку
```

---

## 🌐 Как использовать в производстве

```powershell
cd backend
npm install
npm start
# Сервер запустится на http://localhost:3001
# Frontend будет включен и доступен вместе с API
```

Живые обновления сообщений работают через Socket.IO! 🎉

---

## 📝 Примечания

- Данные сохраняются в `backend/src/data.json`
- JWT токены используют secret: `clock_secret` (в production измените!)
- Uploads хранятся в `backend/src/uploads/`
