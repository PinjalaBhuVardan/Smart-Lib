import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaBook, FaLock, FaIdCard, FaEye, FaEyeSlash } from 'react-icons/fa';

const INSTRUCTIONS = [
  { icon: '⏰', text: 'Arrive 10 minutes before your booking time for QR scan.' },
  { icon: '📱', text: 'Show your QR code to admin at the desk for entry.' },
  { icon: '⛔', text: 'Late arrival beyond 10 min will AUTO-CANCEL your booking.' },
  { icon: '🤫', text: 'Maintain complete silence inside the study room.' },
  { icon: '🛡️', text: 'Do not damage any property or equipment.' },
  { icon: '🚫', text: 'Misbehavior leads to Restricted Access (Red List).' },
  { icon: '📋', text: 'Repeated no-shows may result in permanent restriction.' },
];

const Login = () => {
  const [form, setForm] = useState({ rollNo: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rollNo || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.rollNo, form.password);
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)', display: 'flex', alignItems: 'stretch' }}>
      {/* Instructions Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 40px', color: 'white' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <FaBook style={{ fontSize: 40 }} />
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700 }}>Smart Library</h1>
              <p style={{ opacity: 0.8, fontSize: 14 }}>Study Room Booking System</p>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ Important Instructions
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {INSTRUCTIONS.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, opacity: 0.92 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div style={{ width: 420, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, background: '#1a237e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
              <FaBook style={{ color: 'white' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a237e' }}>Student Login</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Enter your credentials to access</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label"><FaIdCard style={{ marginRight: 6 }} />Roll Number</label>
              <input
                className="form-control"
                placeholder="e.g. 21CS101"
                value={form.rollNo}
                onChange={e => setForm({ ...form, rollNo: e.target.value.toUpperCase() })}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label"><FaLock style={{ marginRight: 6 }} />Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Logging in...</> : '🔐 Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
            New student?{' '}
            <Link to="/register" style={{ color: '#1a237e', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
            Admin: Use ADMIN001 / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
