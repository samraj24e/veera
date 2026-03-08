import { useState, useEffect } from 'react';
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  exportExcel, exportPDF
} from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiSearch, FiX } from 'react-icons/fi';

const DEPARTMENTS = ['HR', 'Engineering', 'Marketing', 'Finance', 'Sales', 'Operations', 'Design', 'Support'];

const emptyForm = {
  full_name: '', email: '', phone: '', company_name: '', department: '',
  designation: '', date_of_joining: '', aadhaar_number: '', pan_number: '',
  bank_name: '', ifsc_code: '', branch_name: '', account_number: '',
  salary: '', status: 'Active'
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEmployees(); }, [search, deptFilter]);

  const loadEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      const res = await getEmployees(params);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      full_name: emp.full_name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      company_name: emp.company_name || '',
      department: emp.department || '',
      designation: emp.designation || '',
      date_of_joining: emp.date_of_joining || '',
      aadhaar_number: emp.aadhaar_number || '',
      pan_number: emp.pan_number || '',
      bank_name: emp.bank_name || '',
      ifsc_code: emp.ifsc_code || '',
      branch_name: emp.branch_name || '',
      account_number: emp.account_number || '',
      salary: emp.salary || '',
      status: emp.status || 'Active'
    });
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (photoFile) formData.append('photo', photoFile);

      if (editingId) {
        await updateEmployee(editingId, formData);
        showToast('Employee updated successfully!');
      } else {
        await createEmployee(formData);
        showToast('Employee created successfully!');
      }
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee(id);
      showToast('Employee deleted successfully!');
      loadEmployees();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await exportExcel();
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employees.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await exportPDF();
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employees.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <h1>Employee Management</h1>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm" onClick={handleExportExcel}>
            <FiDownload /> Excel
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleExportPDF}>
            <FiDownload /> PDF
          </button>
          <button id="add-employee-btn" className="btn btn-primary" onClick={openAdd}>
            <FiPlus /> Add Employee
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-container">
        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee ID</th>
              <th>Photo</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? employees.map((emp, idx) => (
              <tr key={emp.id}>
                <td>{idx + 1}</td>
                <td><strong>{emp.employee_id}</strong></td>
                <td>
                  {emp.photo ? (
                    <img src={`http://localhost:5000${emp.photo}`} alt="" className="employee-avatar" />
                  ) : (
                    <div className="employee-avatar-placeholder">
                      {emp.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </td>
                <td>{emp.full_name}</td>
                <td>{emp.email}</td>
                <td>{emp.phone || '-'}</td>
                <td>{emp.company_name}</td>
                <td>{emp.department || '-'}</td>
                <td>{emp.designation || '-'}</td>
                <td>₹{Number(emp.salary || 0).toLocaleString()}</td>
                <td>
                  <span className={`badge ${emp.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(emp)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp.id)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  {loading ? 'Loading...' : 'No employees found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input type="text" value={form.company_name} onChange={(e) => setForm({...form, company_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <input type="text" value={form.designation} onChange={(e) => setForm({...form, designation: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Date of Joining</label>
                    <input type="date" value={form.date_of_joining} onChange={(e) => setForm({...form, date_of_joining: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Salary</label>
                    <input type="number" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Aadhaar Number</label>
                    <input type="text" value={form.aadhaar_number} onChange={(e) => setForm({...form, aadhaar_number: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>PAN Number</label>
                    <input type="text" value={form.pan_number} onChange={(e) => setForm({...form, pan_number: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input type="text" value={form.bank_name} onChange={(e) => setForm({...form, bank_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>IFSC Code</label>
                    <input type="text" value={form.ifsc_code} onChange={(e) => setForm({...form, ifsc_code: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Branch Name</label>
                    <input type="text" value={form.branch_name} onChange={(e) => setForm({...form, branch_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input type="text" value={form.account_number} onChange={(e) => setForm({...form, account_number: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
