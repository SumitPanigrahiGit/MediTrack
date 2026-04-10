import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity, Calendar, FileText, CreditCard, Search,
  LogOut, Menu, X, User, Shield, Stethoscope, Brain
} from 'lucide-react';

const navItems = {
  patient: [
    { to: '/dashboard', icon: Activity, label: 'Dashboard' },
    { to: '/doctors', icon: Search, label: 'Find Doctors' },
    { to: '/symptom-checker', icon: Brain, label: 'AI Symptom Check' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/prescriptions', icon: FileText, label: 'Prescriptions' },
    { to: '/payments', icon: CreditCard, label: 'Billing' },
  ],
  doctor: [
    { to: '/dashboard', icon: Activity, label: 'Dashboard' },
    { to: '/appointments', icon: Calendar, label: 'My Patients' },
    { to: '/prescriptions', icon: FileText, label: 'Prescriptions' },
    { to: '/payments', icon: CreditCard, label: 'Earnings' },
  ],
  admin: [
    { to: '/dashboard', icon: Shield, label: 'Admin Panel' },
    { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
  ]
};

const roleColors = {
  patient: 'var(--accent-teal)',
  doctor: 'var(--accent-blue)',
  admin: 'var(--accent-gold)'
};

const roleLabels = { patient: 'Patient', doctor: 'Doctor', admin: 'Admin' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems[user?.role] || [];
  const roleColor = roleColors[user?.role] || 'var(--accent-teal)';

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6, 13, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center',
        height: '64px', gap: '24px'
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={20} color="var(--text-on-accent)" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
            Medi<span style={{ color: roleColor }}>Track</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto' }} className="hide-mobile">
          {items.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                fontSize: '13px', fontWeight: active ? 600 : 500,
                color: active ? roleColor : 'var(--text-secondary)',
                background: active ? `${roleColor}15` : 'transparent',
                border: `1px solid ${active ? `${roleColor}30` : 'transparent'}`,
                transition: 'all 200ms', whiteSpace: 'nowrap',
                textDecoration: 'none'
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-glass-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }} className="hide-mobile">
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: roleColor, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              {roleLabels[user?.role]}
            </div>
          </div>

          <div className="avatar" style={{
            width: 38, height: 38, fontSize: '14px',
            background: `linear-gradient(135deg, ${roleColor}40, ${roleColor}20)`,
            border: `2px solid ${roleColor}40`,
            color: roleColor
          }}>{initials}</div>

          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ padding: '8px' }} title="Logout">
            <LogOut size={16} />
          </button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
            className="show-mobile">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {items.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '10px',
              color: location.pathname === to ? roleColor : 'var(--text-secondary)',
              background: location.pathname === to ? `${roleColor}15` : 'transparent',
              textDecoration: 'none', fontSize: '14px', fontWeight: 500
            }}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '10px',
              color: 'var(--accent-rose)', background: 'none',
              border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, width: '100%'
            }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

