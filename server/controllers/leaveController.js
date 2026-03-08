const { supabase } = require('../config/db');

// Get all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leaves')
      .select(`
        *,
        employees (full_name, department, designation)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flattening results for frontend compatibility
    const flattened = data.map(l => ({
      ...l,
      full_name: l.employees?.full_name,
      department: l.employees?.department,
      designation: l.employees?.designation
    }));

    res.json(flattened);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create leave request
exports.createLeave = async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date } = req.body;

    if (!employee_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const { data: employee, error: empErr } = await supabase
      .from('employees')
      .select('id')
      .eq('employee_id', employee_id)
      .single();

    if (empErr || !employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const { data: newLeave, error } = await supabase
      .from('leaves')
      .insert([
        { employee_id, leave_type, start_date, end_date, status: 'Pending', approval_status: 'Pending' }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Leave request created', leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve leave
exports.approveLeave = async (req, res) => {
  try {
    const { data: updated, error } = await supabase
      .from('leaves')
      .update({ status: 'Approved', approval_status: 'Approved' })
      .eq('id', parseInt(req.params.id))
      .select()
      .single();

    if (error || !updated) {
      return res.status(404).json({ message: 'Leave not found.' });
    }
    res.json({ message: 'Leave approved', leave: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject leave
exports.rejectLeave = async (req, res) => {
  try {
    const { data: updated, error } = await supabase
      .from('leaves')
      .update({ status: 'Rejected', approval_status: 'Rejected' })
      .eq('id', parseInt(req.params.id))
      .select()
      .single();

    if (error || !updated) {
      return res.status(404).json({ message: 'Leave not found.' });
    }
    res.json({ message: 'Leave rejected', leave: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
