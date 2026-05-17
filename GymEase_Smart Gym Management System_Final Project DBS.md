# GymEase - Smart Gym Management System

## Overview

GymEase is a full-stack web-based gym management system developed as the Final Project for the Database Systems Practicum 2025/2026.

The application is designed to simplify gym operational management such as member management, trainer management, class booking, attendance tracking, and analytics monitoring through an integrated database system.

GymEase implements a modern full-stack architecture using React.js for the frontend, Express.js for the backend, PostgreSQL (Neon) as the primary relational database, and Neo4j as a supporting graph database.

---

# Features

## Authentication System
- User login authentication
- JWT-based authorization
- Password hashing using bcrypt
- Protected API routes

## Member Management
- Add members
- Edit member information
- Delete members
- View member list

## Trainer Management
- Add trainers
- Update trainer data
- Delete trainers
- Manage trainer specialization

## Class Management
- Create gym classes
- Schedule class sessions
- Manage class capacity
- Assign trainers to classes

## Booking System
- Book fitness classes
- Booking validation
- Capacity checking
- Booking status management

## Attendance System
- Attendance check-in
- Attendance tracking
- Attendance history monitoring

## Analytics Dashboard
- Booking statistics
- Attendance monitoring
- Gym activity visualization

---

# Technology Stack

## Frontend
- React.js
- Vite
- Tailwind CSS

## Backend
- Node.js
- Express.js

## Database
### Main Database
- PostgreSQL (Neon Cloud Database)

### Supporting Database
- Neo4j Graph Database

---

# Project Structure

```bash
GymEase/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── queries/
│   ├── routes/
│   ├── server.js
│   ├── schema_full.sql
│   ├── package.json
│
└── README.md
```

---

# System Architecture

```text
Frontend (React.js)
        ↓
REST API (Express.js)
        ↓
PostgreSQL (Neon Cloud Database)
        ↓
Neo4j Graph Database
```

The frontend communicates with the backend through REST APIs.  
The backend handles application logic and database operations using PostgreSQL and Neo4j.

---

# Database Design

The system contains several main entities:

- Members
- Trainers
- Classes
- Bookings
- Attendance

## Relationships
- One member can create many bookings
- One trainer can manage many classes
- One class can contain many bookings
- One booking generates one attendance record

---

# ERD
![Membership Management-2026-05-17-121345](https://hackmd.io/_uploads/BJOZ8LvyMe.png)

The ERD (Entity Relationship Diagram) represents the database structure and relationships between entities in GymEase.

Main entities:
- Members
- Trainers
- Classes
- Bookings
- Attendance

---

# UML Diagram
![Gym Membership Management-2026-05-17-122835](https://hackmd.io/_uploads/H19G8Uw1zg.png)

The UML Class Diagram represents the object-oriented structure of the application.

Main classes:
- Member
- Trainer
- GymClass
- Booking
- Attendance

---

# Flowchart
![Untitled diagram-2026-05-17-124047 (1)](https://hackmd.io/_uploads/HkiaI8DJfe.png)

The system workflow includes:
1. User login
2. Dashboard access
3. Member and class management
4. Booking process
5. Attendance check-in
6. Logout

---

# Installation Guide

## Prerequisites

Please install the following software:
- Node.js
- Neo4j Desktop
- npm

---

# Backend Setup

## 1. Navigate to backend folder

```bash
cd backend
```

---

## 2. Install backend dependencies

```bash
npm install
```

---

## 3. Configure `.env`

Create a `.env` file inside the backend folder:

```env
DATABASE_URL=postgresql://your_neon_database_url

PORT=3000

JWT_SECRET=your_secret_key

NEO4J_URI=neo4j://127.0.0.1:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
```

---

## 4. Start Neo4j Desktop

- Open Neo4j Desktop
- Create a local DBMS
- Start the database instance
- Make sure:
  - URI = `neo4j://127.0.0.1:7687`
  - Username = `neo4j`
  - Password matches `.env`

---

## 5. Run backend server

```bash
npm start
```

If successful:

```text
Server running on port 3000
✅ Connected to Neon PostgreSQL
✅ Connected to Neo4j
```

---

# Frontend Setup

## 1. Open a new terminal

Navigate to frontend folder:

```bash
cd frontend
```

---

## 2. Install frontend dependencies

```bash
npm install
```

---

## 3. Run frontend

```bash
npm run dev
```

---

## 4. Open browser

Usually:

```text
http://localhost:5173
```

---

# API Endpoints

## Authentication
- POST `/api/auth/login`

## Members
- GET `/api/members`
- POST `/api/members`
- PUT `/api/members/:id`
- DELETE `/api/members/:id`

## Trainers
- GET `/api/trainers`
- POST `/api/trainers`
- PUT `/api/trainers/:id`
- DELETE `/api/trainers/:id`

## Classes
- GET `/api/classes`
- POST `/api/classes`
- PUT `/api/classes/:id`
- DELETE `/api/classes/:id`

## Bookings
- GET `/api/bookings`
- POST `/api/bookings`

## Attendance
- GET `/api/attendance`
- POST `/api/attendance`

---

# Security Features

GymEase implements several security mechanisms:

- JWT Authentication
- Password Hashing with bcrypt
- Protected API Routes
- Middleware Authorization
- Environment Variable Configuration

---

# Code Quality

This project follows several software engineering principles:
- Modular backend architecture
- RESTful API structure
- Separation of concerns
- Middleware-based authorization
- Reusable frontend components
- Environment variable configuration

---

# Conclusion

GymEase successfully implements a modern full-stack gym management system using PostgreSQL (Neon), Neo4j, Express.js, and React.js.

The project demonstrates:
- Database systems implementation
- Full-stack web development
- REST API integration
- Authentication systems
- Relational and graph database integration

---

# Authors

Nayla Pramesti Adhina
Yohana Indah Nathania Br. Sihotang
Rafael Raditya Setyono
Ryan Gazendra Irawan

Project Name: GymEase