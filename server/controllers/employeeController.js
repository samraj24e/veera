const { supabase } = require('../config/db');
const { generateEmployeeId } = require('../utils/employeeIdGenerator');

// Get all employees with optional search and filter
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    
    let query = supabase.from('employees').select('*');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }
    if (department) {
      query = query.eq('department', department);
    }
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('id', { ascending: false });

    const { data: employees, error } = await query;
    
    if (error) throw error;
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single employee
exports.getEmployee = async (req, res) => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', parseInt(req.params.id))
      .single();

    if (error || !employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
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
    const { data: existing, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'An employee with this email already exists.' });
    }

    const employee_id = await generateEmployeeId(company_name);
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const { data: newEmployee, error } = await supabase
      .from('employees')
      .insert([
        {
          employee_id, full_name, photo, email, phone: phone || '', 
          company_name, department: department || '',
          designation: designation || '', date_of_joining: date_of_joining || '', 
          aadhaar_number: aadhaar_number || '', pan_number: pan_number || '', 
          bank_name: bank_name || '', ifsc_code: ifsc_code || '', 
          branch_name: branch_name || '', account_number: account_number || '', 
          salary: parseFloat(salary) || 0, status: status || 'Active'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { data: currentEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', parseInt(req.params.id))
      .single();

    if (fetchError || !currentEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const {
      full_name, email, phone, company_name, department, designation,
      date_of_joining, aadhaar_number, pan_number, bank_name, ifsc_code,
      branch_name, account_number, salary, status
    } = req.body;

    const photo = req.file ? `/uploads/${req.file.filename}` : currentEmployee.photo;

    const { data: updatedEmployee, error } = await supabase
      .from('employees')
      .update({
        full_name: full_name || currentEmployee.full_name, 
        photo, 
        email: email || currentEmployee.email,
        phone: phone || currentEmployee.phone, 
        company_name: company_name || currentEmployee.company_name,
        department: department || currentEmployee.department, 
        designation: designation || currentEmployee.designation,
        date_of_joining: date_of_joining || currentEmployee.date_of_joining, 
        aadhaar_number: aadhaar_number || currentEmployee.aadhaar_number,
        pan_number: pan_number || currentEmployee.pan_number, 
        bank_name: bank_name || currentEmployee.bank_name, 
        ifsc_code: ifsc_code || currentEmployee.ifsc_code, 
        branch_name: branch_name || currentEmployee.branch_name,
        account_number: account_number || currentEmployee.account_number, 
        salary: salary != null ? parseFloat(salary) : currentEmployee.salary,
        status: status || currentEmployee.status, 
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(req.params.id))
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', parseInt(req.params.id));

    if (error) throw error;
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { count: total, error: totalErr } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    const { count: active, error: activeErr } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    const { count: inactive, error: inactiveErr } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Inactive');

    const { data: recentEmployees, error: recentErr } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Supabase doesn't support GROUP BY directly in the client builder
    // We'll perform a raw RPC call or just fetch all and process since it's a dashboard card
    // For small/medium scale, fetching and processing is fine.
    // However, we'll try to use a specialized query if possible.
    const { data: allDepts, error: deptErr } = await supabase
      .from('employees')
      .select('department');

    const departmentCounts = {};
    if (allDepts) {
      allDepts.forEach(e => {
        if (e.department && e.department !== '') {
          departmentCounts[e.department] = (departmentCounts[e.department] || 0) + 1;
        }
      });
    }
    const departments = Object.keys(departmentCounts).map(dept => ({
      department: dept,
      count: departmentCounts[dept]
    }));

    res.json({
      total: total || 0,
      active: active || 0,
      inactive: inactive || 0,
      recentEmployees: recentEmployees || [],
      departments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
