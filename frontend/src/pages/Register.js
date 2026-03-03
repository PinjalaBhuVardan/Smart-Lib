import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBook, FaCheckCircle } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({
    rollNo: '', name: '', email: '', password: '', confirmPassword: '',
    phone: '', department: '', year: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'MBA', 'MCA', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', form);
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <FaCheckCircle style={{ fontSize: 60, color: '#2e7d32', marginBottom: 16 }} />
          <h2 style={{ color: '#2e7d32', marginBottom: 8 }}>Registration Successful!</h2>
          <p style={{ color: '#555', marginBottom: 20 }}>
            We've sent a verification email to <strong>{form.email}</strong>.<br />
            Please check your inbox and verify your email to activate your account.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <FaBook style={{ fontSize: 36, color: '#1a237e' }} />
          <h1>Smart Library</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Create your student account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input className="form-control" placeholder="e.g. 21CS101" value={form.rollNo}
                onChange={e => setForm({ ...form, rollNo: e.target.value.toUpperCase() })} required style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" placeholder="Your full name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-control" type="email" placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-control" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                <option value="">Select Year</option>
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" placeholder="10-digit phone number" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-control" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input className="form-control" type="password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Registering...</> : '🎓 Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#1a237e', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
