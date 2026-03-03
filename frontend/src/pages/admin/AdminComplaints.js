import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editModal, setEditModal] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', adminNote: '' });

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    try {
      const res = await axios.get('/api/complaints/all');
      setComplaints(res.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/complaints/${editModal._id}`, updateForm);
      toast.success('Complaint updated');
      setEditModal(null);
      loadComplaints();
    } catch { toast.error('Update failed'); }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const statusColors = { Pending: 'badge-secondary', 'In Progress': 'badge-warning', Resolved: 'badge-success' };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title"><FaExclamationTriangle style={{ marginRight: 8 }} />Room Complaints</h2>
        <p className="page-subtitle">View and resolve student-reported issues</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'Pending', 'In Progress', 'Resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm${filter === f ? ' btn-primary' : ' btn-outline'}`}>
            {f} ({f === 'all' ? complaints.length : complaints.filter(c => c.status === f).length})
          </button>
        ))}
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => (
            <div key={c._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h4 style={{ fontWeight: 700 }}>{c.issueType}</h4>
                    <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: 13 }}>
                    📍 {c.room?.name} &nbsp;|&nbsp; 👤 {c.reportedBy?.name} ({c.rollNo}) &nbsp;|&nbsp; 📅 {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  {c.description && <p style={{ marginTop: 8, fontSize: 14, color: '#555' }}>{c.description}</p>}
                  {c.adminNote && (
                    <div style={{ background: '#e8f5e9', borderRadius: 6, padding: '8px 12px', marginTop: 8, fontSize: 13 }}>
                      <strong>Your Note:</strong> {c.adminNote}
                    </div>
                  )}
                </div>
                <button onClick={() => { setEditModal(c); setUpdateForm({ status: c.status, adminNote: c.adminNote || '' }); }}
                  className="btn btn-sm btn-outline">
                  ✏️ Update
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <FaCheckCircle style={{ fontSize: 40, color: '#4caf50', marginBottom: 8 }} />
              <p style={{ color: '#6b7280' }}>No complaints in this category 🎉</p>
            </div>
          )}
        </div>
      )}

      {/* Update Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Update Complaint</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ background: '#f0f2f5', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <p><strong>{editModal.issueType}</strong> — {editModal.room?.name}</p>
              <p style={{ fontSize: 13, color: '#6b7280' }}>Reported by: {editModal.reportedBy?.name}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Note</label>
              <textarea className="form-control" rows={3} placeholder="Add a note for the student..."
                value={updateForm.adminNote} onChange={e => setUpdateForm({ ...updateForm, adminNote: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleUpdate} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                ✅ Save Update
              </button>
              <button onClick={() => setEditModal(null)} className="btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
