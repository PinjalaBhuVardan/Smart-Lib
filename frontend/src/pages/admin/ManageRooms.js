import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const AMENITIES_OPTIONS = ['WiFi', 'AC', 'Projector', 'Whiteboard', 'Power Outlets', 'Locker', 'CCTV', 'Fan'];

const defaultForm = { name: '', description: '', capacity: '', location: '', amenities: [], isActive: true };

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadRooms(); }, []);

  const loadRooms = async () => {
    try {
      const res = await axios.get('/api/rooms/all');
      setRooms(res.data);
    } catch (err) { toast.error('Failed to load rooms'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.capacity) return toast.error('Name and capacity are required');
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`/api/rooms/${editId}`, form);
        toast.success('Room updated!');
      } else {
        await axios.post('/api/rooms', form);
        toast.success('Room added!');
      }
      setShowForm(false);
      setForm(defaultForm);
      setEditId(null);
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setForm({ name: room.name, description: room.description, capacity: room.capacity, location: room.location, amenities: room.amenities || [], isActive: room.isActive });
    setEditId(room._id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete room "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/rooms/${id}`);
      toast.success('Room deleted');
      loadRooms();
    } catch (err) { toast.error('Delete failed'); }
  };

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a]
    }));
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">🏛️ Manage Rooms</h2>
          <p className="page-subtitle">Add, edit, or remove study rooms</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}>
          <FaPlus /> Add Room
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>{editId ? 'Edit Room' : 'Add New Room'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Room Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Library Hall A" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input className="form-control" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 20" required min="1" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Ground Floor, Block B" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the room" />
              </div>
              <div className="form-group">
                <label className="form-label">Amenities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {AMENITIES_OPTIONS.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      style={{ padding: '6px 14px', borderRadius: 20, border: `2px solid ${form.amenities.includes(a) ? '#1a237e' : '#e0e0e0'}`, background: form.amenities.includes(a) ? '#e8eaf6' : 'white', color: form.amenities.includes(a) ? '#1a237e' : '#555', fontSize: 13, cursor: 'pointer', fontWeight: form.amenities.includes(a) ? 600 : 400 }}>
                      {form.amenities.includes(a) ? '✓ ' : ''}{a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>Active Status</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: 14 }}>{form.isActive ? '✅ Active' : '❌ Inactive'}</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? 'Saving...' : editId ? '✏️ Update Room' : '➕ Add Room'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms grid */}
      <div className="grid grid-3">
        {rooms.map(room => (
          <div key={room._id} className="card" style={{ opacity: room.isActive ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h4 style={{ fontWeight: 700 }}>{room.name}</h4>
              <span className={`badge ${room.isActive ? 'badge-success' : 'badge-danger'}`}>
                {room.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{room.description}</p>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
              <span>👥 {room.capacity} seats</span>
              {room.location && <span style={{ marginLeft: 12 }}>📍 {room.location}</span>}
            </div>
            {room.amenities?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {room.amenities.map(a => <span key={a} style={{ background: '#f0f2f5', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{a}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleEdit(room)} className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                <FaEdit /> Edit
              </button>
              <button onClick={() => handleDelete(room._id, room.name)} className="btn btn-sm btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#6b7280' }}>No rooms added yet. Click "Add Room" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
