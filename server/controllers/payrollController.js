const { supabase } = require('../config/db');

// Get all payroll records
exports.getAllPayroll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payroll')
      .select(`
        *,
        employees (full_name, department, designation, company_name)
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    // Flatten the result to match previous structure
    const flattened = data.map(p => ({
      ...p,
      full_name: p.employees?.full_name,
      department: p.employees?.department,
      designation: p.employees?.designation,
      company_name: p.employees?.company_name
    }));

    res.json(flattened);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create payroll entry
exports.createPayroll = async (req, res) => {
  try {
    const { employee_id, salary, allowances, deductions, payment_date } = req.body;

    if (!employee_id || !payment_date) {
      return res.status(400).json({ message: 'Employee ID and payment date are required.' });
    }

    const { data: employee, error: empErr } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employee_id)
      .single();

    if (empErr || !employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const salaryAmount = parseFloat(salary) || employee.salary || 0;
    const allowanceAmount = parseFloat(allowances) || 0;
    const deductionAmount = parseFloat(deductions) || 0;
    const net_pay = salaryAmount + allowanceAmount - deductionAmount;

    const { data: newPayroll, error } = await supabase
      .from('payroll')
      .insert([
        { employee_id, salary: salaryAmount, allowances: allowanceAmount, deductions: deductionAmount, net_pay, payment_date }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Payroll created successfully', payroll: newPayroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
