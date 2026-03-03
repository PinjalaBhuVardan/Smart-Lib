import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSearch, FaTimesCircle, FaFilter } from 'react-icons/fa';

const statusColors = {
  confirmed: 'badge-success',
  'checked-in': 'badge-info',
  cancelled: 'badge-danger',
  expired: 'badge-secondary',
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ date: '', status: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { loadBookings(); }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.date) params.append('date', filter.date);
      if (filter.status) params.append('status', filter.status);
      const res = await axios.get(`/api/admin/bookings?${params}&limit=50`);
      setBookings(res.data.bookings);
    } catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation:');
    if (reason === null) return;
    try {
      await axios.put(`/api/admin/bookings/${id}/cancel`, { reason: reason || 'Cancelled by admin' });
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) { toast.error('Failed to cancel'); }
  };

  const filtered = bookings.filter(b =>
    !search || b.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.bookingId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">📋 Manage Bookings</h2>
        <p className="page-subtitle">View and manage all room bookings</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">Search</label>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="form-control" placeholder="Search by roll no, name, ID..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
        </div>
        <div>
          <label className="form-label">Date</label>
          <input type="date" className="form-control" value={filter.date} onChange={e => setFilter({ ...filter, date: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-control" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => { setFilter({ date: '', status: '' }); setSearch(''); }}>
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.bookingId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.user?.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{b.rollNo}</div>
                    </td>
                    <td>{b.room?.name}</td>
                    <td>{b.date}</td>
                    <td style={{ fontSize: 13 }}>{b.timeSlot}</td>
                    <td><span className={`badge ${statusColors[b.status] || 'badge-secondary'}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'confirmed' && (
                        <button onClick={() => handleCancel(b._id)} className="btn btn-sm btn-danger">
                          <FaTimesCircle /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
