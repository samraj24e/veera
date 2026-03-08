-- Veera Group Employee Manager System - Supabase Schema

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  photo TEXT DEFAULT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company_name TEXT NOT NULL,
  department TEXT,
  designation TEXT,
  date_of_joining TEXT,
  aadhaar_number TEXT,
  pan_number TEXT,
  bank_name TEXT,
  ifsc_code TEXT,
  branch_name TEXT,
  account_number TEXT,
  salary DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  salary DOUBLE PRECISION DEFAULT 0,
  allowances DOUBLE PRECISION DEFAULT 0,
  deductions DOUBLE PRECISION DEFAULT 0,
  net_pay DOUBLE PRECISION DEFAULT 0,
  payment_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- Leaves Table
CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  approval_status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee_leave FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);
