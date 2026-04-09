# 🎓 Student Result Management System

**EduResult Pro** is a **full-stack web application** built with **Node.js + Express + MongoDB** to manage student records, marks, and result generation.  

It is designed for **educational institutions**, **teachers**, and **developers** to understand how a result management system handles data organization, authentication, and relational operations using a modern tech stack.

All operations are **secure** with JWT-based authentication, and the system is **fully functional offline** (local MongoDB).

---

## ✨ Key Principles

1. **Secure Authentication** – JWT-based admin login with bcrypt password hashing  
2. **Modular Architecture** – Separation of concerns (routes, models, middleware, config)  
3. **Automated Grade Calculation** – Server-side grade logic based on percentage  
4. **Public Result Access** – Students can check results without login  

This project is **educational yet practical**, showcasing how real-world result systems are built using REST APIs and database relationships.

---

## 🧩 System Overview

The system is built around three core MongoDB collections:

### 👤 Admin
- Handles authentication and access control  
- Stores hashed password (bcrypt)  
- Default admin created via `/api/auth/setup`

### 🧑‍🎓 Student
- Stores student personal and academic details  
- Fields: rollNo, name, course, semester, gender, email  

### 📊 Result
- Stores marks for 5 subjects per student per year  
- Auto-calculates: total, percentage, grade, result status (PASS/FAIL)  

---

## 🔗 Relationships

- One-to-Many relationship between **Student** and **Result** (via `rollNo`)  
- Each result is linked to a student using `rollNo` as a reference  

> Ensures proper data integrity and easy retrieval.

---

## ⚙️ Backend Features

- REST API with Express.js  
- MongoDB with Mongoose ODM  
- JWT-based protected routes  
- Auto-grade calculation logic  
- Centralized error handling  
- Environment variable configuration (.env)  

---

## 📁 Project Structure

```bash
Student-Result-Management-System/
│
├── assets/                   # Screenshots
├── config/
│   └── db.js                 # MongoDB connection
│
├── middleware/
│   └── auth.js               # Authentication middleware
│
├── models/
│   ├── Admin.js              # Admin schema
│   ├── Student.js            # Student schema
│   ├── Subject.js            # Subject schema
│   └── Result.js             # Result schema
│
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── students.js           # Student CRUD routes
│   ├── subjects.js           # Subject CRUD routes
│   └── results.js            # Result CRUD routes
│
├── public/
│   ├── index.html            # Frontend (served by Express)
│   ├── style.css             # Frontend styles
│   └── app.js                # Frontend logic
│
├── .env                      # Environment variables
├── LICENCE
├── server.js                 # Entry point
├── package.json              # Dependencies
├── yarn.lock                 # Auto-generated lock file
└── README.md                 # Project documentation
```

---


> Database operations are managed through Mongoose models for modularity.

---

## 🚀 Getting Started

#### 1️⃣ Prerequisites

- Node.js (v18 or higher) → [Download](https://nodejs.org)
- MongoDB Community Edition → [Download](https://www.mongodb.com/try/download/community)

#### 2️⃣ Clone Repository

```bash
git clone https://github.com/ShakalBhau0001/Student-Result-Management-System.git
cd Student-Result-Management-System
```

#### 3️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

#### 4️⃣ Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/resultdb
JWT_SECRET=your_super_secret_key_change_this
```

#### 5️⃣ Start MongoDB Service

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

#### 6️⃣ Run Application

```bash
npm start
# or
yarn start
```

You should see:

```text
✅ MongoDB Connected: 127.0.0.1
🌐 Server running on http://localhost:5000
📡 API: http://localhost:5000/api
```

#### 7️⃣ Create Default Admin (FIRST TIME ONLY)

Open browser or Postman and call:

```text
POST http://localhost:5000/api/auth/setup
````

This creates a default admin with:
- Username: **`admin`** | Password: **`admin123`**

#### 8️⃣ Open the App

```text
http://localhost:5000
```

---

## 🔑 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/login | Admin login → returns JWT token |
| POST | /api/auth/setup | Create default admin (first time) |

### Students (🔐 Protected)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/students | Get all students |
| GET | /api/students/:rollNo | Get one student |
| POST | /api/students | Add new student |
| PUT | /api/students/:rollNo | Update student |
| DELETE | /api/students/:rollNo | Delete student |

### Results
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/results | Get all results (🔐 Protected) |
| GET | /api/results/stats | Dashboard stats (🔐 Protected) |
| GET | /api/results/:rollNo | Get result by roll no (Public) |
| POST | /api/results | Add/update result (🔐 Protected) |
| PUT | /api/results/:rollNo | Update result (🔐 Protected) |
| DELETE | /api/results/:rollNo | Delete result (🔐 Protected) |

---

## 🧪 Test with Postman

### 1. Login
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```
Copy the token from response.

### 2. Add Student (with Bearer token)
```json
POST /api/students
Authorization: Bearer <token>
{
  "rollNo": "101",
  "name": "Rahul Patil",
  "course": "BSc IT",
  "semester": "Semester 3",
  "gender": "Male",
  "email": "rahul@email.com"
}
```

### 3. Add Result (with Bearer token)
```json
POST /api/results
Authorization: Bearer <token>
{
  "rollNo": "101",
  "year": "2025",
  "subs": [
    { "sub": "Maths",      "val": 85 },
    { "sub": "Physics",    "val": 78 },
    { "sub": "Java",       "val": 90 },
    { "sub": "DBMS",       "val": 88 },
    { "sub": "Networking", "val": 82 }
  ]
}
```

### 4. Check Result (Public - No token needed)
```
GET /api/results/101
```

---

## ⚙️ Grade Logic (Auto-calculated by server)

| Percentage | Grade |
|-----------|-------|
| 90 - 100  | O     |
| 75 - 89   | A+    |
| 60 - 74   | A     |
| 50 - 59   | B     |
| 40 - 49   | C     |
| Below 40  | F     |
| Below 35% | FAIL  |

> If any subject is below 35, overall result is FAIL regardless of percentage.

---

## 🔧 Development Mode (auto-restart)

```bash
yarn dev
```

(Uses nodemon — restarts server on file save)

---

## 🗄️ Database Schema (MongoDB)


#### Admin Collection

```json
{
"_id": ObjectId,
"username": "admin",
"password": "$2b$10$..." // bcrypt hashed
}
```

#### Student Collection

```json
{
"_id": ObjectId,
"rollNo": "101",
"name": "Rahul Patil",
"course": "BSc IT",
"semester": "Semester 3",
"gender": "Male",
"email": "rahul@email.com"
}
```

#### Result Collection

```json
{
"_id": ObjectId,
"rollNo": "101",
"year": "2025",
"subs": [
{ "sub": "Maths", "val": 85 },
{ "sub": "Physics", "val": 78 }
],
"total": 423,
"percentage": 84.6,
"grade": "A+",
"result": "PASS"
}
```

> Designed for **flexibility** and **scalability**.

---

## 🖼️ Screenshots

### 1. Admin Login
![Admin Login](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Admin%20Portal.jpeg)

### 2. Add Student
![Add Student](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Add%20New%20Student.jpeg)

### 3. Add Subject
![Add Subject](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Add%20New%20Subject.jpeg)

### 4. List Of Records
![List Of Records](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/List%20of%20Students%20.jpeg)

### 5. Dashboard Stats
![Dashboard Stats](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Dashboard.jpeg)

### 6. Check Result
![Check Result](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Check%20Result.jpeg)

### 7. Edit Result
![Edit Result](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Edit%20Result.jpeg)

### 8. Edit Student
![Edit Student](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Edit%20Student.jpeg)

### 9. Add Marks
![Add Marks](https://github.com/ShakalBhau0001/Student-Result-Management-System/blob/main/assets/Enter%20Marks.jpeg)

---

## ⚠️ Disclaimer

This project is for **educational purposes** only. It is not intended for production use without further enhancements, security audits, and optimizations.
Always follow best practices when deploying applications in real-world scenarios.
It is **not production-ready** and lacks advanced security features like rate limiting, HTTPS, and XSS protection.

---

## 🛣️ Roadmap / Future Improvements
- Student login portal (view own results only)
- PDF result download
- Bulk student upload via Excel
- Email notifications for result publication
- Multi-semester result aggregation
- Role-based access (admin, teacher, student)
- Advanced dashboard with chart

---

## 🙏 Acknowledgments

- Node.js & Express.js community
- MongoDB & Mongoose
- JWT for authentication
- All contributors and testers

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Contributors

> Developer: **Shakal Bhau** & **Rajlaxmi Patil**
 
> GitHub: **[ShakalBhau0001](https://github.com/ShakalBhau0001) & [Rajlaxmi-1307](https://github.com/Rajlaxmi-1307)**

---
