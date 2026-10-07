# AI-Enabled Online Internship & Project Allocation System — MERN Stack

An intelligent allocation platform developed on the MERN stack (MongoDB, Express, React, Node.js) featuring Role-Based Access Control (RBAC), multi-factor AI scoring for student-opportunity matching, and automated PDF resume skill extraction.

---

## 🌟 Key Capabilities & Features

1. **Role-Based Access Control (RBAC)**:
   - **Student**: Profile management, PDF resume upload & parsing, explore postings, receive AI-ranked recommendations, submit applications, track allocation progress.
   - **Faculty**: Post research internships & capstone projects, manage vacancy status/capacity, inspect candidate profiles with AI match scores, transition application statuses, confirm student allocations.
   - **Admin**: System-wide institutional analytics, department vacancy distributions, top in-demand required skills, user directory inspection, dynamic role transitions.

2. **Intelligent AI Matching Engine**:
   - Scores compatibility (0–100%) between student profiles and opportunity requirements.
   - Evaluates:
     - **Technical Skill Overlap** (Self-declared + Resume AI parsed skills)
     - **Departmental Alignment**
     - **Career Domain Preferences**
   - Provides clear match reasoning breakdowns for every recommendation.

3. **Automated PDF Resume Parser**:
   - Parses uploaded PDF resumes using `pdf-parse`.
   - Matches candidate text against a comprehensive taxonomy of technical skills and frameworks.

4. **Interactive Dashboards & Analytics**:
   - Chart.js visualizations for application funnels and department allocation distributions.
   - Live notification system for real-time status updates.

---

## 📂 Project Architecture

```
internship-allocation-system/
├── server/                        # Express + Mongoose Backend
│   ├── config/db.js               # MongoDB connection
│   ├── models/                    # User, StudentProfile, FacultyProfile, Opportunity, Application, Allocation, Notification
│   ├── middleware/                # auth (JWT), roleCheck (RBAC), upload (Multer), errorHandler
│   ├── controllers/               # auth, student, faculty, opportunity, application, match, admin, notification
│   ├── routes/                    # API route definitions
│   ├── services/                  # resumeParser, matchingEngine, emailService
│   ├── utils/                     # generateToken, validators, seedData
│   ├── tests/regression.test.js   # Automated API regression test suite (47 tests)
│   ├── server.js                  # Express entry point
│   └── .env                       # Backend environment variables
│
└── client/                        # React + Vite Frontend
    ├── src/
    │   ├── context/AuthContext.jsx
    │   ├── services/              # Axios API service clients
    │   ├── components/            # Navbar, ProtectedRoute, OpportunityCard, ApplicationStatusBadge, NotificationBell, Charts
    │   ├── pages/                 # Login, Register, Student (5 pages), Faculty (4 pages), Admin (3 pages)
    │   ├── styles/globals.css     # Tailwind CSS styles
    │   ├── App.jsx                # Router & role-guarded routes
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI or local MongoDB instance

### 2. Backend Setup
```bash
cd server
npm install
# Configure your MongoDB URI in server/.env (Default: mongodb://127.0.0.1:27017/internship_allocation_db)
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Running Automated Regression Tests
```bash
cd server
npm test
```

---

## 🧪 Demo User Accounts (Pre-configured)

| Role | Email | Password |
|---|---|---|
| **Student** | `john.doe@student.edu` | `password123` |
| **Faculty** | `alan.turing@college.edu` | `password123` |
| **Admin** | `admin@college.edu` | `password123` |

*(You can also use the Quick Demo Fill buttons on the Login page for one-click testing.)*
