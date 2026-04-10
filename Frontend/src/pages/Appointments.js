import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI } from '../utils/api';
import { Calendar, Video, Building, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-success',
  completed: 'badge-info', cancelled: 'badge-danger'
};

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [jitsiRoom, setJitsiRoom] = useState(null);

  useEffect(() => {
    appointmentsAPI.getMyAppointments()
      .then(res => setAppointments(res.appointments || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.updateStatus(id, 'cancelled');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled');
    } catch (err) { toast.error(err.message); }
  };

  const filtered = appointments.filter(a => filter === 'all' || a.status === filter);
  const counts = { all: appointments.length };
  ['pending','confirmed','completed','cancelled'].forEach(s => { counts[s] = appointments.filter(a => a.status === s).length; });

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Appointments</h1>
          <p>{user.role === 'patient' ? 'Your medical appointments' : 'Patient appointments'}</p>
        </div>
        {user.role === 'patient' && (
          <Link to="/doctors" className="btn btn-primary"><Calendar size={15} /> Book New</Link>
        )}
      </div>

      <div className="tab-pills" style={{ marginBottom: 24 }}>
        {['all','pending','confirmed','completed','cancelled'].map(s => (
          <button key={s} className={`tab-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No {filter !== 'all' ? filter : ''} appointments found</p>
          {user.role === 'patient' && <Link to="/doctors" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Find a Doctor</Link>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(appt => {
            const otherPerson = user.role === 'patient' ? appt.doctor : appt.patient;
            const otherLabel = user.role === 'patient' ? appt.doctor?.specialisation : `Age: ${appt.patient?.age || '—'}`;
            return (
              <div key={appt.id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: appt.type === 'video' ? 'rgba(79,195,247,0.15)' : 'rgba(0,212,170,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {appt.type === 'video' ? <Video size={22} color="var(--accent-blue)" /> : <Building size={22} color="var(--accent-teal)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{otherPerson?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{otherLabel}</div>
                    {appt.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{appt.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700 }}>{appt.date}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{appt.time}</div>
                  </div>
                  <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-muted'}`}>{appt.status}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {appt.status === 'confirmed' && appt.type === 'video' && (
                      <button className="btn btn-outline btn-sm" onClick={() => setJitsiRoom(`meditrack-${appt.id.slice(0,8)}`)}>
                        <Video size={13} /> Join
                      </button>
                    )}
                    {appt.status === 'pending' && user.role === 'patient' && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(appt.id)}>
                        <X size={13} /> Cancel
                      </button>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: appt.paid ? 'var(--accent-teal)' : 'var(--accent-rose)' }}>
                      {appt.paid ? '✓ Paid' : '₹' + appt.fee}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {jitsiRoom && (
        <div className="modal-overlay" onClick={() => setJitsiRoom(null)}>
          <div className="modal" style={{ maxWidth: 800, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>Video Consultation</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setJitsiRoom(null)}>✕ Leave</button>
            </div>
            <iframe src={`https://meet.jit.si/${jitsiRoom}#config.startWithAudioMuted=false`}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ width: '100%', height: 480, border: 'none', borderRadius: 12 }} title="Video Call" />
          </div>
        </div>
      )}
    </div>
  );
}
