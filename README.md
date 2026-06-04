# 🎓 Student Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=for-the-badge&logo=render)](https://student-management-k9us.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/nihalxofficial/FullStack-Student-Manager)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-Image-2496ED?style=for-the-badge&logo=docker)](https://hub.docker.com/r/nihalxofficial/student-manager)

A full-stack web application for managing students, classes, marks and attendance — built with a **Go Fiber** backend and a **Vanilla JS + Tailwind CSS + DaisyUI** frontend.

---

## 🌐 Live Demo

👉 **[https://student-management-k9us.onrender.com/](https://student-management-k9us.onrender.com/)**

> ⚠️ Hosted on Render's free tier — may take ~30 seconds to spin up on first load.

---

## 📸 Overview

This project simulates a real-world school management dashboard with live statistics, advanced filtering and full CRUD operations — all connected through a clean RESTful API.

![Student-Manager](https://github.com/user-attachments/assets/ba9e08e8-50d4-4c32-bb69-e76c7e314201)

---

## ✨ Features

### 👥 Student Management
- Add, edit (click on a student card to populate the form) and delete students
- Manage marks and attendance per student

### 🏫 Class Management
- Dynamically create and manage classes
- Safe delete with dependency handling (prevents deleting classes with enrolled students)

### 📊 Real-Time Statistics
| Stat | Description |
|------|-------------|
| 👤 Total Students | Live count of all registered students |
| 🏫 Total Classes | Number of active classes |
| 📈 Average Marks | Computed average across all students |
| ✅ Present Avg | Attendance percentage across all students |
| 🧮 Total Present | Cumulative present count across all students |

### 🔍 Advanced Filtering
- 🔎 Search students by name (live search — updates on every keystroke)
- 🏷️ Filter by class
- 📉 Filter by minimum marks
- 📅 Filter by minimum attendance

### ⚡ Redis Caching
- Student list and class list cached for **30 seconds**
- Stats cached for **5 minutes**
- Cache is automatically invalidated on every create, update, or delete
- Graceful fallback — app continues working even if Redis is unavailable

### 📄 Report Generator
- Generates a full printable/PDF report with one click
- Includes overview stats, per-class breakdown, top 5 students by marks
- Highlights students needing attention (marks < 60 or attendance < 15)
- Full student table with Pass/Fail status
- Opens in a new tab with print dialog for easy PDF export

### 🔄 Keep-Alive
- Self-pings the server every **14 minutes** to prevent Render's free tier from spinning down

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first styling |
| **DaisyUI** | Component library on top of Tailwind |
| **Vanilla JS (ES6)** | DOM manipulation & API integration |

### 🔧 Backend
| Technology | Purpose |
|------------|---------|
| **Go (Golang)** | Server-side language |
| **Fiber** | Fast, Express-inspired web framework |
| **GORM** | ORM for database operations |
| **PostgreSQL** | Relational SQL database |
| **Redis** | In-memory caching layer |
| **Docker** | Containerization & deployment |

---

## 📡 API Endpoints

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/students` | Get all students |
| `GET` | `/students/filtered` | Get students with optional filters |
| `GET` | `/students/:id` | Get a single student |
| `POST` | `/students` | Create a new student |
| `PUT` | `/students/:id` | Update student details |
| `DELETE` | `/students/:id` | Delete a student |
| `DELETE` | `/students/class/:id` | Delete all students in a class |

### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/classes` | Get all classes |
| `POST` | `/classes` | Create a new class |
| `DELETE` | `/classes/:id` | Delete a class (safe, checks dependencies) |

### Stats & Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stats` | Get aggregated statistics |
| `GET` | `/ping` | Health check / keep-alive endpoint |

### Query Parameters (for `GET /students/filtered`)
| Param | Type | Description |
|-------|------|-------------|
| `name` | `string` | Filter by student name |
| `class_id` | `int` | Filter by class |
| `marks` | `int` | Minimum marks threshold |
| `present` | `int` | Minimum attendance threshold |

---

## 🐳 Docker

The project is fully containerized and available on Docker Hub.

### Pull & Run
```bash
docker pull nihalxofficial/student-manager:v1

docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:password@host/dbname \
  -e REDIS_URL=rediss://default:password@host:6380 \
  -e RENDER_EXTERNAL_URL=https://your-app.onrender.com \
  nihalxofficial/student-manager
```

Then open **http://localhost:5000**

## 🚀 Getting Started

### Prerequisites
- [Go](https://golang.org/dl/) 1.20+
- [PostgreSQL](https://www.postgresql.org/download/) 14+
- [Redis](https://redis.io/download/) 7+
- A modern web browser

### 1. Clone the Repository
```bash
git clone https://github.com/nihalxofficial/FullStack-Student-Manager.git
cd FullStack-Student-Manager
```

### 2. Set Environment Variables

Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@host/dbname
REDIS_URL=rediss://default:password@host:6380
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

> `RENDER_EXTERNAL_URL` is auto-set by Render in production — no need to add it manually there.

### 3. Install Dependencies
```bash
go mod tidy
```

### 4. Run the Server
```bash
go run server.go
```

The app will be available at `http://localhost:5000`

> The Go server serves the `public/` folder as static files, so no separate frontend setup is needed.

---

## 📁 Project Structure

```
FullStack-Student-Manager/
├── public/
│   ├── index.html      # Main HTML file
│   ├── app.js          # ES6 JavaScript logic
│   └── style.css       # Custom styles (Tailwind + DaisyUI)
├── server.go           # Entire Go backend (Fiber + GORM + Redis + routes)
├── .env                # Environment variables (not committed)
├── Dockerfile          # Docker image definition
├── go.mod
├── go.sum
└── README.md
```

---

## 💡 What I Learned

- ⚙️ Building scalable REST APIs with **Go Fiber**
- 🗄️ Managing relational data using **GORM** and **PostgreSQL**
- ⚡ Implementing **Redis caching** with automatic invalidation strategies
- 🔗 Connecting a frontend to a backend via **fetch API**
- 🔍 Implementing multi-parameter filtering with live search
- 🧱 Designing real-world CRUD systems with clean separation of concerns
- 🚀 Deploying full-stack Go apps on **Render** with keep-alive strategies
- 📄 Generating dynamic printable HTML reports from live API data
- 🐳 Containerizing a Go app with **Docker** and publishing to Docker Hub

---

✅ © 2026 | All rights reserved by Md. Nihal Uddin