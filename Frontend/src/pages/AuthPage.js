import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Activity, Eye, EyeOff, User, Stethoscope, Shield } from 'lucide-react';

const roles = [
  { id: 'patient', label: 'Patient', icon: User, desc: 'Book appointments & manage health', color: 'var(--accent-teal)' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients & consultations', color: 'var(--accent-blue)' },
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Platform management & analytics', color: 'var(--accent-gold)' },
];

export default function AuthPage({ mode }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    specialisation: '', location: '', experience: '', fee: '', bio: '',
    age: '', bloodGroup: '', phone: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        await register({ ...form, role: selectedRole });
        toast.success(selectedRole === 'doctor'
          ? 'Registration submitted! Awaiting admin approval.'
          : 'Account created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '16px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-teal)66)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={28} color="var(--text-on-accent)" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            {isLogin ? 'Sign in to your MediTrack account' : 'Join thousands on MediTrack'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          {/* Role picker (register only) */}
          {!isLogin && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>I am a</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {roles.map(({ id, label, icon: Icon, color }) => (
                  <button key={id} type="button" onClick={() => setSelectedRole(id)} style={{
                    padding: '12px 8px', borderRadius: '12px', cursor: 'pointer', border: 'none',
                    background: selectedRole === id ? `${color}15` : 'var(--bg-secondary)',
                    outline: selectedRole === id ? `2px solid ${color}` : '1px solid var(--border-subtle)',
                    color: selectedRole === id ? color : 'var(--text-secondary)',
                    transition: 'all 200ms', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)'
                  }}>
                    <Icon size={18} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input className="input" type="text" placeholder="Dr. Aisha Sharma" required
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" required minLength={6}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Doctor-specific fields */}
            {!isLogin && selectedRole === 'doctor' && (
              <>
                <div className="grid-2">
                  <div className="input-group">
                    <label>Specialisation</label>
                    <select className="input" value={form.specialisation} onChange={e => set('specialisation', e.target.value)} required>
                      <option value="">Select...</option>
                      {['Cardiology','Neurology','Dermatology','Orthopedics','Pediatrics','Psychiatry','ENT','Ophthalmology','General Medicine','Gynecology'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input className="input" placeholder="Mumbai" value={form.location} onChange={e => set('location', e.target.value)} required />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label>Experience (years)</label>
                    <input className="input" type="number" min="0" placeholder="5" value={form.experience} onChange={e => set('experience', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Consultation Fee (₹)</label>
                    <input className="input" type="number" min="0" placeholder="500" value={form.fee} onChange={e => set('fee', e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Short Bio</label>
                  <textarea className="input" placeholder="Brief description of your expertise..." rows={3}
                    value={form.bio} onChange={e => set('bio', e.target.value)} style={{ resize: 'vertical', minHeight: 80 }} />
                </div>
              </>
            )}

            {/* Patient-specific fields */}
            {!isLogin && selectedRole === 'patient' && (
              <div className="grid-2">
                <div className="input-group">
                  <label>Age</label>
                  <input className="input" type="number" min="1" placeholder="28" value={form.age} onChange={e => set('age', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Blood Group</label>
                  <select className="input" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                    <option value="">Select...</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '4px' }}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{
              background: 'none', border: 'none', color: 'var(--accent-teal)',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px'
            }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Demo hint */}
        {isLogin && (
          <div style={{
            marginTop: '16px', padding: '16px', textAlign: 'center',
            background: 'rgba(0,212,170,0.05)', border: '1px solid var(--border-subtle)',
            borderRadius: '16px', fontSize: '13px', color: 'var(--text-muted)'
          }}>
            Demo: <strong style={{ color: 'var(--accent-teal)' }}>patient@meditrack.com</strong> / password
          </div>
        )}
      </div>
    </div>
  );
}
