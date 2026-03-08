const { prepare } = require('../config/db');

// Get all leaves
exports.getAllLeaves = (req, res) => {
  try {
    const leaves = prepare(`
      SELECT l.*, e.full_name, e.department, e.designation
      FROM leaves l
      JOIN employees e ON l.employee_id = e.employee_id
      ORDER BY l.created_at DESC
    `).all();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create leave request
exports.createLeave = (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date } = req.body;

    if (!employee_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const employee = prepare('SELECT * FROM employees WHERE employee_id = ?').get(employee_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const result = prepare(`
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, status, approval_status)
      VALUES (?, ?, ?, ?, 'Pending', 'Pending')
    `).run(employee_id, leave_type, start_date, end_date);

    const newLeave = prepare('SELECT * FROM leaves WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Leave request created', leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve leave
exports.approveLeave = (req, res) => {
  try {
    const leave = prepare('SELECT * FROM leaves WHERE id = ?').get(parseInt(req.params.id));
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found.' });
    }

    prepare("UPDATE leaves SET status = 'Approved', approval_status = 'Approved' WHERE id = ?").run(parseInt(req.params.id));
    const updated = prepare('SELECT * FROM leaves WHERE id = ?').get(parseInt(req.params.id));

    res.json({ message: 'Leave approved', leave: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject leave
exports.rejectLeave = (req, res) => {
  try {
    const leave = prepare('SELECT * FROM leaves WHERE id = ?').get(parseInt(req.params.id));
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found.' });
    }

    prepare("UPDATE leaves SET status = 'Rejected', approval_status = 'Rejected' WHERE id = ?").run(parseInt(req.params.id));
    const updated = prepare('SELECT * FROM leaves WHERE id = ?').get(parseInt(req.params.id));

    res.json({ message: 'Leave rejected', leave: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
