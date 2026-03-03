import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBook, FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/book', label: 'Book Room' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/complaints', label: 'Complaints' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/scanner', label: '📷 QR Scanner' },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/rooms', label: 'Rooms' },
    { to: '/admin/redlist', label: '🚫 Red List' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/analytics', label: 'Analytics' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FaBook />
        <span>Smart Library</span>
        {user?.role === 'admin' && (
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>ADMIN</span>
        )}
      </div>

      <div className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end={l.to === '/dashboard' || l.to === '/admin'}>
            {l.label}
          </NavLink>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
            <FaUser style={{ marginRight: 4 }} />{user?.name?.split(' ')[0]}
          </span>
          <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
