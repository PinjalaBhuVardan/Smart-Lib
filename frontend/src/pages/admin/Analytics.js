import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics').then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!data) return <p>Failed to load analytics</p>;

  const { dailyBookings, slotStats, roomStats, summary } = data;

  const formatSlotLabel = (slot) => {
    if (!slot) return slot;
    const [start] = slot.split('-');
    const [h] = start.split(':');
    const ampm = +h >= 12 ? 'PM' : 'AM';
    return `${+h % 12 || 12}${ampm}`;
  };

  const slotData = slotStats.map(s => ({ name: formatSlotLabel(s._id), bookings: s.count, fullSlot: s._id }));
  const roomData = roomStats.map(r => ({ name: r.name, bookings: r.count }));
  const statusData = [
    { name: 'Total', value: summary.totalBookings, color: '#1a237e' },
    { name: 'Cancelled', value: summary.cancelledBookings, color: '#ef5350' },
    { name: 'Active', value: summary.totalBookings - summary.cancelledBookings, color: '#4caf50' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">📊 Analytics Dashboard</h2>
        <p className="page-subtitle">Insights and statistics for the Smart Library system</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Bookings', value: summary.totalBookings, color: '#e8eaf6', icon: '📊' },
          { label: "Today's Bookings", value: summary.todayBookings, color: '#e8f5e9', icon: '📅' },
          { label: 'Checked In Today', value: summary.checkedInToday, color: '#e3f2fd', icon: '✅' },
          { label: 'Cancelled', value: summary.cancelledBookings, color: '#ffebee', icon: '❌' },
          { label: 'Total Students', value: summary.totalStudents, color: '#f3e5f5', icon: '👥' },
          { label: 'Restricted', value: summary.redListCount, color: '#fff3e0', icon: '🚫' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color, fontSize: 22 }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Bookings Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>📈 Daily Bookings (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyBookings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#1a237e" strokeWidth={3} dot={{ r: 5, fill: '#1a237e' }} name="Bookings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Slot Popularity */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>⏰ Bookings by Time Slot</h3>
          {slotData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={slotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name, props) => [value, `Slot: ${props.payload.fullSlot}`]} />
                <Bar dataKey="bookings" fill="#1a237e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No data yet</p>}
        </div>

        {/* Room Popularity */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>🏛️ Bookings by Room</h3>
          {roomData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roomData} dataKey="bookings" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {roomData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No data yet</p>}
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>📋 Booking Status Overview</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {statusData.map(s => (
            <div key={s.name} style={{ flex: 1, minWidth: 140, background: '#f8fafc', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.name} Bookings</div>
              <div style={{ height: 4, background: s.color, borderRadius: 2, marginTop: 12, opacity: 0.7 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
