import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, aiAPI, prescriptionsAPI } from '../utils/api';
import { Activity, Calendar, FileText, Brain, ArrowRight, Heart, Zap, Bell, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  completed: 'badge-info',
  cancelled: 'badge-danger'
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [healthTips, setHealthTips] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, rxRes, reminderRes] = await Promise.all([
          appointmentsAPI.getMyAppointments(),
          prescriptionsAPI.getMyPrescriptions(),
          prescriptionsAPI.getReminders()
        ]);
        setAppointments(apptRes.appointments || []);
        setPrescriptions(rxRes.prescriptions || []);
        setReminders(reminderRes.reminders || []);

        // Load AI health tips async
        aiAPI.getHealthTips({ medicalHistory: user.bloodGroup ? `Blood group: ${user.bloodGroup}` : '' })
          .then(res => setHealthTips(res.healthTips))
          .catch(() => {});
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const upcoming = appointments.filter(a => !['cancelled', 'completed'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed').length;

  if (loading) return (
    <div className="main-content">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name?.split(' ')[0]} 👋</h1>
          <p>Here's your health overview for today</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/symptom-checker" className="btn btn-outline btn-sm">
            <Brain size={15} /> AI Symptom Check
          </Link>
          <Link to="/doctors" className="btn btn-primary btn-sm">
            <Calendar size={15} /> Book Appointment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger-children" style={{ marginBottom: 32 }}>
        {[
          { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'var(--accent-teal)', bg: 'rgba(0,212,170,0.1)' },
          { label: 'Completed', value: completed, icon: Activity, color: 'var(--accent-blue)', bg: 'rgba(79,195,247,0.1)' },
          { label: 'Prescriptions', value: prescriptions.length, icon: FileText, color: 'var(--accent-purple)', bg: 'rgba(179,157,219,0.1)' },
          { label: 'Reminders', value: reminders.filter(r => r.active).length, icon: Bell, color: 'var(--accent-gold)', bg: 'rgba(245,166,35,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Upcoming appointments */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18 }}>Upcoming Appointments</h3>
              <Link to="/appointments" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <Calendar size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p>No upcoming appointments</p>
                <Link to="/doctors" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Find a Doctor</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcoming.slice(0, 4).map(appt => (
                  <div key={appt.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 16px', borderRadius: 12,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(0,212,170,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Activity size={20} color="var(--accent-teal)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{appt.doctor?.name || 'Doctor'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{appt.doctor?.specialisation}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{appt.date}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{appt.time}</div>
                    </div>
                    <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-muted'}`}>{appt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18 }}>Recent Prescriptions</h3>
              <Link to="/prescriptions" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
            </div>
            {prescriptions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No prescriptions yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prescriptions.slice(0, 3).map(rx => (
                  <div key={rx.id} style={{
                    padding: '14px 16px', borderRadius: 12, background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {rx.doctorName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rx.medicines?.length || 0} medicine(s) · {new Date(rx.createdAt).toLocaleDateString()}</div>
                    </div>
                    <FileText size={16} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* AI Health Tips */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.06), rgba(79,195,247,0.06))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div className="ai-indicator"><div className="ai-dot" /> AI Health Tips</div>
            </div>
            {healthTips ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(healthTips.tips || []).slice(0, 4).map((tip, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '10px 12px', borderRadius: 10, background: 'var(--bg-glass-light)'
                    }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon || '💡'}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tip.category}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>{tip.tip}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {healthTips.weeklyGoal && (
                  <div style={{ marginTop: 14, padding: '12px', borderRadius: 10, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>🎯 Weekly Goal</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{healthTips.weeklyGoal}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}
              </div>
            )}
          </div>

          {/* Medication Reminders */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16 }}>Medication Reminders</h3>
              <Link to="/prescriptions" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>+ Add</Link>
            </div>
            {reminders.filter(r => r.active).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No active reminders</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reminders.filter(r => r.active).slice(0, 4).map(r => (
                  <div key={r.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)'
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.medicine}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.frequency}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--accent-teal)', fontWeight: 600 }}>{r.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/doctors', label: 'Book Appointment', icon: Calendar, color: 'var(--accent-teal)' },
                { to: '/symptom-checker', label: 'Check Symptoms (AI)', icon: Brain, color: 'var(--accent-blue)' },
                { to: '/prescriptions', label: 'View Prescriptions', icon: FileText, color: 'var(--accent-purple)' },
                { to: '/payments', label: 'Billing History', icon: TrendingUp, color: 'var(--accent-gold)' },
              ].map(({ to, label, icon: Icon, color }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                  textDecoration: 'none', transition: 'all 200ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={15} style={{ color }} /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
