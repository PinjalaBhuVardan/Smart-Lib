import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaQrcode, FaBook, FaBan, FaExclamationTriangle, FaUsers, FaChartBar, FaCalendarCheck, FaTimesCircle } from 'react-icons/fa';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics').then(res => setAnalytics(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const s = analytics?.summary || {};

  const quickLinks = [
    { to: '/admin/scanner', icon: <FaQrcode />, label: 'QR Scanner', desc: 'Scan student QR codes for check-in', color: '#1a237e', bg: '#e8eaf6' },
    { to: '/admin/bookings', icon: <FaBook />, label: 'Manage Bookings', desc: 'View, cancel and manage all bookings', color: '#1565c0', bg: '#e3f2fd' },
    { to: '/admin/rooms', icon: '🏛️', label: 'Manage Rooms', desc: 'Add, edit or remove study rooms', color: '#2e7d32', bg: '#e8f5e9' },
    { to: '/admin/redlist', icon: <FaBan />, label: 'Red List', desc: 'Manage restricted students', color: '#c62828', bg: '#ffebee' },
    { to: '/admin/complaints', icon: <FaExclamationTriangle />, label: 'Complaints', desc: 'Handle room issue complaints', color: '#e65100', bg: '#fff3e0' },
    { to: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics', desc: 'View charts and statistics', color: '#6a1b9a', bg: '#f3e5f5' },
  ];

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', color: 'white', borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>🛡️ Admin Dashboard</h2>
        <p style={{ opacity: 0.85, marginTop: 4 }}>Smart Library Management System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: s.totalStudents, icon: '👥', color: '#e8eaf6' },
          { label: "Today's Bookings", value: s.todayBookings, icon: '📅', color: '#e8f5e9' },
          { label: 'Checked In Today', value: s.checkedInToday, icon: '✅', color: '#e3f2fd' },
          { label: 'Red List Members', value: s.redListCount, icon: '🚫', color: '#ffebee' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color, fontSize: 24 }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value ?? '—'}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-3">
        {quickLinks.map(ql => (
          <Link key={ql.to} to={ql.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: 48, height: 48, background: ql.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: ql.color, marginBottom: 12 }}>
                {ql.icon}
              </div>
              <h4 style={{ fontWeight: 700, color: '#1a1a2e' }}>{ql.label}</h4>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{ql.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent slot stats */}
      {analytics?.slotStats?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16 }}>📊 Most Popular Time Slots</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analytics.slotStats.slice(0, 5).map(s => (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, width: 120, flexShrink: 0 }}>{s._id}</span>
                <div style={{ flex: 1, height: 20, background: '#f0f2f5', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(s.count / (analytics.slotStats[0]?.count || 1)) * 100}%`,
                    background: 'linear-gradient(90deg, #1a237e, #3949ab)',
                    borderRadius: 10,
                    transition: 'width 1s ease'
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, width: 32 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
