const { prepare, saveDb } = require('../config/db');
const { generateEmployeeId } = require('../utils/employeeIdGenerator');

// Get all employees with optional search and filter
exports.getAllEmployees = (req, res) => {
  try {
    const { search, department, status } = req.query;
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY id DESC';
    const employees = prepare(query).all(...params);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single employee
exports.getEmployee = (req, res) => {
  try {
    const employee = prepare('SELECT * FROM employees WHERE id = ?').get(parseInt(req.params.id));
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create employee
exports.createEmployee = (req, res) => {
  try {
    const {
      full_name, email, phone, company_name, department, designation,
      date_of_joining, aadhaar_number, pan_number, bank_name, ifsc_code,
      branch_name, account_number, salary, status
    } = req.body;

    if (!full_name || !email || !company_name) {
      return res.status(400).json({ message: 'Full name, email, and company name are required.' });
    }

    // Check duplicate email
    const existing = prepare('SELECT id FROM employees WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'An employee with this email already exists.' });
    }

    const employee_id = generateEmployeeId(company_name);
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const result = prepare(`
      INSERT INTO employees (employee_id, full_name, photo, email, phone, company_name, department,
        designation, date_of_joining, aadhaar_number, pan_number, bank_name, ifsc_code,
        branch_name, account_number, salary, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      employee_id, full_name, photo, email, phone || '', company_name, department || '',
      designation || '', date_of_joining || '', aadhaar_number || '', pan_number || '',
      bank_name || '', ifsc_code || '', branch_name || '', account_number || '',
      parseFloat(salary) || 0, status || 'Active'
    );

    const newEmployee = prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employee
exports.updateEmployee = (req, res) => {
  try {
    const employee = prepare('SELECT * FROM employees WHERE id = ?').get(parseInt(req.params.id));
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const {
      full_name, email, phone, company_name, department, designation,
      date_of_joining, aadhaar_number, pan_number, bank_name, ifsc_code,
      branch_name, account_number, salary, status
    } = req.body;

    const photo = req.file ? `/uploads/${req.file.filename}` : employee.photo;

    prepare(`
      UPDATE employees SET
        full_name = ?, photo = ?, email = ?, phone = ?, company_name = ?,
        department = ?, designation = ?, date_of_joining = ?, aadhaar_number = ?,
        pan_number = ?, bank_name = ?, ifsc_code = ?, branch_name = ?,
        account_number = ?, salary = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      full_name || employee.full_name, photo, email || employee.email,
      phone || employee.phone, company_name || employee.company_name,
      department || employee.department, designation || employee.designation,
      date_of_joining || employee.date_of_joining, aadhaar_number || employee.aadhaar_number,
      pan_number || employee.pan_number, bank_name || employee.bank_name,
      ifsc_code || employee.ifsc_code, branch_name || employee.branch_name,
      account_number || employee.account_number, salary != null ? parseFloat(salary) : employee.salary,
      status || employee.status, parseInt(req.params.id)
    );

    const updated = prepare('SELECT * FROM employees WHERE id = ?').get(parseInt(req.params.id));
    res.json({ message: 'Employee updated successfully', employee: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete employee
exports.deleteEmployee = (req, res) => {
  try {
    const employee = prepare('SELECT * FROM employees WHERE id = ?').get(parseInt(req.params.id));
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    prepare('DELETE FROM employees WHERE id = ?').run(parseInt(req.params.id));
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = (req, res) => {
  try {
    const total = prepare('SELECT COUNT(*) as count FROM employees').get().count;
    const active = prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'").get().count;
    const inactive = prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'Inactive'").get().count;
    const recentEmployees = prepare('SELECT * FROM employees ORDER BY created_at DESC LIMIT 5').all();
    const departments = prepare('SELECT department, COUNT(*) as count FROM employees WHERE department IS NOT NULL AND department != "" GROUP BY department').all();

    res.json({ total, active, inactive, recentEmployees, departments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
