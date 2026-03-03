import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaExclamationCircle, FaCheckCircle, FaClock, FaSpinner } from 'react-icons/fa';

const ISSUE_TYPES = ['Fan not working', 'Light not working', 'WiFi issue', 'AC not working', 'Projector issue', 'Cleanliness', 'Others'];

const Complaints = () => {
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ roomId: '', issueType: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('submit');

  useEffect(() => {
    axios.get('/api/rooms').then(res => setRooms(res.data));
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const res = await axios.get('/api/complaints/my-complaints');
      setComplaints(res.data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomId || !form.issueType) return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await axios.post('/api/complaints', form);
      toast.success('Complaint submitted! Admin will look into it.');
      setForm({ roomId: '', issueType: '', description: '' });
      loadComplaints();
      setTab('history');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (s) => s === 'Resolved' ? <FaCheckCircle color="#2e7d32" /> : s === 'In Progress' ? <FaSpinner color="#f57f17" /> : <FaClock color="#6b7280" />;
  const statusClass = (s) => s === 'Resolved' ? 'badge-success' : s === 'In Progress' ? 'badge-warning' : 'badge-secondary';

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h2 className="page-title"><FaExclamationCircle style={{ marginRight: 8 }} />Room Complaints</h2>
        <p className="page-subtitle">Report issues with study rooms</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['submit', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn${tab === t ? ' btn-primary' : ' btn-outline'}`}>
            {t === 'submit' ? '📝 Submit Complaint' : `📋 My Complaints (${complaints.length})`}
          </button>
        ))}
      </div>

      {tab === 'submit' && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Report an Issue</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Room *</label>
              <select className="form-control" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} required>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Issue Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {ISSUE_TYPES.map(type => (
                  <button key={type} type="button"
                    onClick={() => setForm({ ...form, issueType: type })}
                    style={{
                      padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                      border: `2px solid ${form.issueType === type ? '#1a237e' : '#e0e0e0'}`,
                      background: form.issueType === type ? '#e8eaf6' : 'white',
                      color: form.issueType === type ? '#1a237e' : '#444',
                      fontWeight: form.issueType === type ? 600 : 400, transition: 'all 0.2s'
                    }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Describe the issue in detail..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Submitting...' : '📤 Submit Complaint'}
            </button>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {complaints.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#6b7280' }}>No complaints submitted yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {complaints.map(c => (
                <div key={c._id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {statusIcon(c.status)}
                        <h4 style={{ fontWeight: 700 }}>{c.issueType}</h4>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: 13 }}>📍 {c.room?.name} &nbsp;|&nbsp; {new Date(c.createdAt).toLocaleDateString()}</p>
                      {c.description && <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{c.description}</p>}
                      {c.adminNote && (
                        <div style={{ background: '#e8f5e9', borderRadius: 6, padding: '8px 12px', marginTop: 8, fontSize: 13 }}>
                          <strong>Admin Response:</strong> {c.adminNote}
                        </div>
                      )}
                    </div>
                    <span className={`badge ${statusClass(c.status)}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Complaints;
