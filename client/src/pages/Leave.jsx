import { useState, useEffect } from 'react';
import { getLeaves, createLeave, approveLeave, rejectLeave, getEmployees } from '../services/api';
import { FiPlus, FiCheck, FiXCircle, FiX } from 'react-icons/fi';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee_id: '', leave_type: '', start_date: '', end_date: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadLeaves();
    loadEmployees();
  }, []);

  const loadLeaves = async () => {
    try { const res = await getLeaves(); setLeaves(res.data); } catch (err) { console.error(err); }
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
      await createLeave(form);
      showToast('Leave request created!');
      setShowModal(false);
      setForm({ employee_id: '', leave_type: '', start_date: '', end_date: '' });
      loadLeaves();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveLeave(id);
      showToast('Leave approved!');
      loadLeaves();
    } catch (err) {
      showToast('Approval failed', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeave(id);
      showToast('Leave rejected!');
      loadLeaves();
    } catch (err) {
      showToast('Rejection failed', 'error');
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Approved': return 'badge-approved';
      case 'Rejected': return 'badge-rejected';
      default: return 'badge-pending';
    }
  };

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
      <div className="page-header">
        <h1>Leave Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Apply Leave
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
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Approval</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? leaves.map((lv, i) => (
              <tr key={lv.id}>
                <td>{i + 1}</td>
                <td><strong>{lv.employee_id}</strong></td>
                <td>{lv.full_name}</td>
                <td>{lv.department || '-'}</td>
                <td>{lv.leave_type}</td>
                <td>{lv.start_date}</td>
                <td>{lv.end_date}</td>
                <td><span className={`badge ${getBadgeClass(lv.status)}`}>{lv.status}</span></td>
                <td><span className={`badge ${getBadgeClass(lv.approval_status)}`}>{lv.approval_status}</span></td>
                <td>
                  {lv.approval_status === 'Pending' && (
                    <div className="actions-cell">
                      <button className="btn btn-sm btn-success" onClick={() => handleApprove(lv.id)} title="Approve">
                        <FiCheck />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleReject(lv.id)} title="Reject">
                        <FiXCircle />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No leave records found.
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
              <h2>Apply for Leave</h2>
              <button className="btn btn-icon btn-outline" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Employee *</label>
                  <select value={form.employee_id} onChange={(e) => setForm({...form, employee_id: e.target.value})} required>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.employee_id}>
                        {emp.employee_id} — {emp.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Leave Type *</label>
                  <select value={form.leave_type} onChange={(e) => setForm({...form, leave_type: e.target.value})} required>
                    <option value="">Select Leave Type</option>
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
