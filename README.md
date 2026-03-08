# Veera Group Employee Manager System

A modern, full-stack enterprise Employee Management System built with React, Node.js, and Supabase.

## 🚀 Features

- **Admin Dashboard**: Real-time stats and data visualization using Recharts.
- **Employee Management**: Full CRUD operations with automatic Employee ID generation (e.g., VVT0001).
- **Payroll Management**: Track salaries, allowances, and net pay.
- **Leave Management**: Employee leave requests with Admin approve/reject functionality.
- **Data Export**: Export employee records to professional **Excel** and **PDF** formats.
- **Responsive Design**: Mobile-friendly glassmorphism UI.
- **Cloud Database**: Powered by Supabase (PostgreSQL) for global accessibility.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Axios, Lucide React, Recharts.
- **Backend**: Node.js, Express, Supabase Client, JWT.
- **Database**: Supabase (PostgreSQL).

## 🏁 Quick Start

### 1. Prerequisites
- Node.js installed.
- A Supabase project created.

### 2. Setup Database
- Open the **SQL Editor** in Supabase.
- Copy and run the content of `server/schema.sql` to create the required tables.

### 3. Configure Environment
Create a `.env` file in the `server` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & Run
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Seed the admin user
cd ../server
node seed.js

# Start the application
cd ..
.\run-app.ps1
```

## 🔑 Default Credentials
- **Email**: `admin@veeragroup.com`
- **Password**: `admin123`

## 📱 Mobile Access
Access the dashboard on your local network using your machine's IP (e.g., `http://192.168.31.161:5173`).
