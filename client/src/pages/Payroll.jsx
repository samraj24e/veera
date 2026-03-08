import { useState, useEffect } from 'react';
import { getPayroll, createPayroll, getEmployees } from '../services/api';
import { FiPlus, FiDollarSign, FiX } from 'react-icons/fi';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee_id: '', salary: '', allowances: '', deductions: '', payment_date: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadPayroll();
    loadEmployees();
  }, []);

  const loadPayroll = async () => {
    try { const res = await getPayroll(); setPayrolls(res.data); } catch (err) { console.error(err); }
  };
  const loadEmployees = async () => {
    try { const res = await getEmployees(); setEmployees(res.data); } catch (err) { console.error(err); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPayroll(form);
      showToast('Payroll entry created!');
      setShowModal(false);
      setForm({ employee_id: '', salary: '', allowances: '', deductions: '', payment_date: '' });
      loadPayroll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleEmployeeSelect = (empId) => {
    const emp = employees.find(e => e.employee_id === empId);
    setForm({ ...form, employee_id: empId, salary: emp ? emp.salary : '' });
  };

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      <div className="page-header">
        <h1>Payroll Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Create Payroll
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.length > 0 ? payrolls.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td><strong>{p.employee_id}</strong></td>
                <td>{p.full_name}</td>
                <td>{p.department || '-'}</td>
                <td>₹{Number(p.salary).toLocaleString()}</td>
                <td style={{ color: '#059669' }}>+₹{Number(p.allowances).toLocaleString()}</td>
                <td style={{ color: '#dc2626' }}>-₹{Number(p.deductions).toLocaleString()}</td>
                <td><strong>₹{Number(p.net_pay).toLocaleString()}</strong></td>
                <td>{p.payment_date}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 520 }}>
            <div className="modal-header">
              <h2><FiDollarSign /> Create Payroll Entry</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Employee *</label>
                  <select value={form.employee_id} onChange={(e) => handleEmployeeSelect(e.target.value)} required>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.employee_id}>
                        {emp.employee_id} — {emp.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Salary</label>
                    <input type="number" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Allowances</label>
                    <input type="number" value={form.allowances} onChange={(e) => setForm({...form, allowances: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Deductions</label>
                    <input type="number" value={form.deductions} onChange={(e) => setForm({...form, deductions: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Payment Date *</label>
                    <input type="date" value={form.payment_date} onChange={(e) => setForm({...form, payment_date: e.target.value})} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
