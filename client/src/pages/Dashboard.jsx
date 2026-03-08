import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { FiUsers, FiUserCheck, FiUserX, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b5bdb', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, recentEmployees: [], departments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FiUsers /></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiUserCheck /></div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><FiUserX /></div>
          <div className="stat-info">
            <h3>{stats.inactive}</h3>
            <p>Inactive Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><FiActivity /></div>
          <div className="stat-info">
            <h3>{stats.departments.length}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-grid">
        <div className="chart-card">
          <h3>Employees by Department</h3>
          {stats.departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.departments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b5bdb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No department data available</p>
          )}
        </div>
        <div className="chart-card">
          <h3>Department Distribution</h3>
          {stats.departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.departments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="department"
                  label={({ department }) => department}
                >
                  {stats.departments.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No department data available</p>
          )}
        </div>
      </div>

      {/* Recent Employees */}
      <div className="table-container">
        <div style={{ padding: '20px 20px 12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Latest Employee Updates</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentEmployees.length > 0 ? stats.recentEmployees.map((emp) => (
              <tr key={emp.id}>
                <td><strong>{emp.employee_id}</strong></td>
                <td>{emp.full_name}</td>
                <td>{emp.email}</td>
                <td>{emp.department || '-'}</td>
                <td>
                  <span className={`badge ${emp.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                    {emp.status}
                  </span>
                </td>
                <td>{emp.date_of_joining || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No employees found. Add your first employee!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
