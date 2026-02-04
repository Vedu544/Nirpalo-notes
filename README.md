
# Nirpalo Notes – Assessment Task

Nirpalo Notes is a full-stack notes management application built as part of an **assessment task for Nirpalo**.
It supports authentication, note management, note sharing, activity tracking, and public note access.

---

## 🔗 Links

* **Frontend (Live):** [https://nirpalo-notes-1.onrender.com](https://nirpalo-notes-1.onrender.com)
* **Backend (Live):** [https://nirpalo-notes.onrender.com](https://nirpalo-notes.onrender.com)
* **GitHub Repo:** [https://github.com/Vedu544/Nirpalo-notes](https://github.com/Vedu544/Nirpalo-notes)

---

## 🧱 Tech Stack

**Frontend:** React (Vite), Tailwind CSS, Axios, Socket.IO
**Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, JWT, Socket.IO

---

## 📁 Architecture Overview

* **Controller–Service architecture**
* Controllers handle request/response
* Services handle business logic & DB access
* Prisma used for database operations
* JWT-based authentication with middleware
* Socket.IO for real-time events
* Centralized error handling

---

## ⚙️ Setup

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Backend `.env` (example only):**

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Frontend `.env` (example only):**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```



## 🗄️ Database Schema (Summary)

* **User** → users of the app
* **Note** → notes created by users
* **SharedNote** → note sharing between users
* **Activity** → logs of important actions

## Crdentials for Testing 
* **email - john@gmail.com && johny@gmail.com 
* **password - Test123@
