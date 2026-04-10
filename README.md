# 🎓 Student Management System

A full-stack web application for managing students, classes, marks, and attendance — built with a **Go Fiber** backend and a **Vanilla JS + Tailwind CSS + DaisyUI** frontend.

---

## 📸 Overview

This project simulates a real-world school management dashboard with live statistics, advanced filtering, and full CRUD operations — all connected through a clean RESTful API.

---

## ✨ Features

### 👥 Student Management
- Add, edit (double-click to edit inline), and delete students
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
| ✅ Average Attendance | Attendance percentage across all students |

### 🔍 Advanced Filtering
- 🔎 Search students by name
- 🏷️ Filter by class
- 📉 Filter by minimum marks
- 📅 Filter by minimum attendance

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
| **MySQL** | Relational SQL database |

---

## 📡 API Endpoints

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | Get all students (with optional filters) |
| `POST` | `/api/students` | Create a new student |
| `PUT` | `/api/students/:id` | Update student details |
| `DELETE` | `/api/students/:id` | Delete a student |

### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/classes` | Get all classes |
| `POST` | `/api/classes` | Create a new class |
| `DELETE` | `/api/classes/:id` | Delete a class (safe, checks dependencies) |

### Query Parameters (for `GET /api/students`)
| Param | Type | Description |
|-------|------|-------------|
| `name` | `string` | Filter by student name |
| `class_id` | `int` | Filter by class |
| `min_marks` | `float` | Minimum marks threshold |
| `min_attendance` | `float` | Minimum attendance threshold |

---
<img width="1366" height="1083" alt="Student-Manager" src="https://github.com/user-attachments/assets/ba9e08e8-50d4-4c32-bb69-e76c7e314201" />


---

## 🚀 Getting Started

### Prerequisites
- [Go](https://golang.org/dl/) 1.20+
- [MySQL](https://dev.mysql.com/downloads/) 8.0+
- A modern web browser

### 1. Clone the Repository
```bash
git clone https://github.com/nihalxofficial/student-management-system.git
cd student-management-system
```

### 2. Configure the Database
Create a MySQL database:
```sql
CREATE DATABASE student_management;
```

Update your DB credentials inside `server.go`:
```go
dsn := "root:yourpassword@tcp(localhost:3306)/student_management?parseTime=true"
```

### 3. Run the Server
```bash
go mod tidy
go run server.go
```

The app will be available at `http://localhost:3000`

> The Go server serves the `public/` folder as static files, so no separate frontend setup is needed.

---

## 📁 Project Structure

```
student-management-system/
├── public/
│   ├── index.html      # Main HTML file
│   ├── app.js          # ES6 JavaScript logic
│   └── style.css       # Custom styles (Tailwind + DaisyUI)
├── server.go           # Entire Go backend (Fiber + GORM + routes)
├── go.mod
├── go.sum
└── README.md
```

---

## 💡 What I Learned

- ⚙️ Building scalable REST APIs with **Go Fiber**
- 🗄️ Managing relational data using **GORM** and **MySQL**
- 🔗 Connecting a frontend to a backend via **fetch API**
- 🔍 Implementing multi-parameter filtering logic
- 🧱 Designing real-world CRUD systems with clean separation of concerns

---
