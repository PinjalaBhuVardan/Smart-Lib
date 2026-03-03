import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBan, FaSearch, FaUnlock, FaLock } from 'react-icons/fa';

const RedList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ reason: '', duration: '' });
  const [tab, setTab] = useState('redlisted');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleAddToRedList = async () => {
    if (!form.reason) return toast.error('Please provide a reason');
    try {
      await axios.put(`/api/admin/users/${selectedUser.rollNo}/redlist`, form);
      toast.success(`${selectedUser.name} added to Restricted Access List`);
      setShowModal(false);
      setForm({ reason: '', duration: '' });
      loadUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveFromRedList = async (rollNo, name) => {
    if (!window.confirm(`Remove ${name} from restricted list?`)) return;
    try {
      await axios.put(`/api/admin/users/${rollNo}/unredlist`);
      toast.success(`${name}'s access restored`);
      loadUsers();
    } catch { toast.error('Failed'); }
  };

  const redListed = users.filter(u => u.isRedListed);
  const normalUsers = users.filter(u => !u.isRedListed);

  const displayed = (tab === 'redlisted' ? redListed : normalUsers).filter(u =>
    !search || u.rollNo.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title"><FaBan style={{ marginRight: 8, color: '#c62828' }} />Restricted Access List</h2>
        <p className="page-subtitle">Manage students with disciplinary restrictions</p>
      </div>

      <div className="alert alert-danger" style={{ marginBottom: 20 }}>
        🚫 Students on this list <strong>cannot book rooms</strong>. They are notified by email when added.
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('redlisted')} className={`btn${tab === 'redlisted' ? ' btn-danger' : ' btn-outline'}`}>
          🚫 Restricted ({redListed.length})
        </button>
        <button onClick={() => setTab('all')} className={`btn${tab === 'all' ? ' btn-primary' : ' btn-outline'}`}>
          👥 All Students ({normalUsers.length})
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input className="form-control" placeholder="Search by roll no or name..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  {tab === 'redlisted' && <th>Reason</th>}
                  {tab === 'redlisted' && <th>Until</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 700 }}>{u.rollNo}</td>
                    <td>{u.name}</td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td style={{ fontSize: 13 }}>{u.department || '—'}</td>
                    {tab === 'redlisted' && <td style={{ fontSize: 12, color: '#c62828', maxWidth: 200 }}>{u.redListReason}</td>}
                    {tab === 'redlisted' && <td style={{ fontSize: 12 }}>{u.redListDuration ? new Date(u.redListDuration).toLocaleDateString() : 'Indefinite'}</td>}
                    <td>
                      {u.isRedListed ? (
                        <button onClick={() => handleRemoveFromRedList(u.rollNo, u.name)} className="btn btn-sm btn-success">
                          <FaUnlock /> Restore Access
                        </button>
                      ) : (
                        <button onClick={() => { setSelectedUser(u); setShowModal(true); }} className="btn btn-sm btn-danger">
                          <FaLock /> Restrict
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {displayed.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                    {tab === 'redlisted' ? 'No restricted students 🎉' : 'No students found'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#c62828' }}>🚫 Restrict Access</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ background: '#ffebee', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <p><strong>{selectedUser.name}</strong> ({selectedUser.rollNo})</p>
              <p style={{ fontSize: 13, color: '#666' }}>{selectedUser.email}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Restriction *</label>
              <textarea className="form-control" rows={3} placeholder="e.g. Damaged study table, repeated late no-shows..."
                value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Restriction Until (leave empty for indefinite)</label>
              <input type="date" className="form-control" value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleAddToRedList} className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                🚫 Add to Restricted List
              </button>
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedList;
