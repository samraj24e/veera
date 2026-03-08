const { prepare } = require('../config/db');

// Get all payroll records
exports.getAllPayroll = (req, res) => {
  try {
    const payrolls = prepare(`
      SELECT p.*, e.full_name, e.department, e.designation, e.company_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.employee_id
      ORDER BY p.payment_date DESC
    `).all();
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create payroll entry
exports.createPayroll = (req, res) => {
  try {
    const { employee_id, salary, allowances, deductions, payment_date } = req.body;

    if (!employee_id || !payment_date) {
      return res.status(400).json({ message: 'Employee ID and payment date are required.' });
    }

    const employee = prepare('SELECT * FROM employees WHERE employee_id = ?').get(employee_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const salaryAmount = parseFloat(salary) || employee.salary || 0;
    const allowanceAmount = parseFloat(allowances) || 0;
    const deductionAmount = parseFloat(deductions) || 0;
    const net_pay = salaryAmount + allowanceAmount - deductionAmount;

    const result = prepare(`
      INSERT INTO payroll (employee_id, salary, allowances, deductions, net_pay, payment_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(employee_id, salaryAmount, allowanceAmount, deductionAmount, net_pay, payment_date);

    const newPayroll = prepare('SELECT * FROM payroll WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Payroll created successfully', payroll: newPayroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
