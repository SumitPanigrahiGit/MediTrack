import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, prescriptionsAPI, paymentsAPI, doctorsAPI } from '../utils/api';
import { Activity, Users, Clock, CheckCircle, FileText, Video, DollarSign, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  pending: { cls: 'badge-warning', label: 'Pending' },
  confirmed: { cls: 'badge-success', label: 'Confirmed' },
  completed: { cls: 'badge-info', label: 'Completed' },
  cancelled: { cls: 'badge-danger', label: 'Cancelled' }
};

export default function DoctorDashboard() {
  const { user, updateUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [prescriptionModal, setPrescriptionModal] = useState(null);
  const [rxForm, setRxForm] = useState({ medicines: [{ name: '', dosage: '', duration: '', timing: '' }], notes: '' });
  const [availForm, setAvailForm] = useState({
    slots: user.slots || [],
    availableDays: user.availableDays || [],
    available: user.available ?? true
  });
  const [jitsiRoom, setJitsiRoom] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, payRes] = await Promise.all([
          appointmentsAPI.getMyAppointments(),
          paymentsAPI.getHistory()
        ]);
        setAppointments(apptRes.appointments || []);
        setPayments(payRes.payments || []);
      } catch (err) {
        toast.error('Failed to load data');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const pending = appointments.filter(a => a.status === 'pending');
  const totalEarnings = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const handleStatus = async (id, status) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status}`);
    } catch (err) { toast.error(err.message); }
  };

  const submitPrescription = async () => {
    if (!prescriptionModal) return;
    try {
      await prescriptionsAPI.create({
        appointmentId: prescriptionModal.id,
        patientId: prescriptionModal.patient?.id,
        medicines: rxForm.medicines.filter(m => m.name),
        notes: rxForm.notes
      });
      toast.success('Prescription written!');
      setPrescriptionModal(null);
      setRxForm({ medicines: [{ name: '', dosage: '', duration: '', timing: '' }], notes: '' });
      setAppointments(prev => prev.map(a => a.id === prescriptionModal.id ? { ...a, status: 'completed' } : a));
    } catch (err) { toast.error(err.message); }
  };

  const saveAvailability = async () => {
    try {
      await doctorsAPI.updateAvailability(availForm);
      updateUser(availForm);
      toast.success('Availability updated!');
    } catch (err) { toast.error(err.message); }
  };

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

  if (loading) return <div className="main-content"><div className="skeleton" style={{ height: 300, borderRadius: 20 }} /></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome back, Dr. {user.name?.split(' ').slice(-1)[0]} · {user.specialisation}</p>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger-children" style={{ marginBottom: 32 }}>
        {[
          { label: "Today's Patients", value: todayAppts.length, icon: Users, color: 'var(--accent-teal)', bg: 'rgba(0,212,170,0.1)' },
          { label: 'Pending Approval', value: pending.length, icon: Clock, color: 'var(--accent-gold)', bg: 'rgba(245,166,35,0.1)' },
          { label: 'Total Consultations', value: appointments.length, icon: Activity, color: 'var(--accent-blue)', bg: 'rgba(79,195,247,0.1)' },
          { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'var(--accent-purple)', bg: 'rgba(179,157,219,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
            <div className="stat-value" style={{ color, fontSize: typeof value === 'string' ? 24 : 32 }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-pills" style={{ marginBottom: 24 }}>
        {['queue', 'all', 'availability'].map(t => (
          <button key={t} className={`tab-pill ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'queue' ? "Today's Queue" : t === 'all' ? 'All Appointments' : 'My Availability'}
          </button>
        ))}
      </div>

      {/* Queue / Appointments */}
      {(activeTab === 'queue' || activeTab === 'all') && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'queue' ? todayAppts : appointments).map(appt => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{appt.patient?.name || 'Patient'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Age: {appt.patient?.age || '—'} · {appt.patient?.phone || ''}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{appt.date}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{appt.time}</div>
                    </td>
                    <td>
                      <span className={`badge ${appt.type === 'video' ? 'badge-info' : 'badge-muted'}`}>
                        {appt.type === 'video' ? '📹 Video' : '🏥 In-Person'}
                      </span>
                    </td>
                    <td style={{ color: appt.paid ? 'var(--accent-teal)' : 'var(--accent-rose)', fontWeight: 600 }}>
                      ₹{appt.fee} {appt.paid ? '✓' : '(Pending)'}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[appt.status]?.cls || 'badge-muted'}`}>
                        {STATUS_BADGE[appt.status]?.label || appt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {appt.status === 'pending' && (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => handleStatus(appt.id, 'confirmed')}>Confirm</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatus(appt.id, 'cancelled')}>Reject</button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <>
                            {appt.type === 'video' && (
                              <button className="btn btn-outline btn-sm" onClick={() => setJitsiRoom(`meditrack-${appt.id.slice(0,8)}`)}>
                                <Video size={13} /> Join Call
                              </button>
                            )}
                            <button className="btn btn-outline btn-sm" onClick={() => setPrescriptionModal(appt)}>
                              <FileText size={13} /> Prescribe
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'queue' ? todayAppts : appointments).length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No appointments {activeTab === 'queue' ? 'today' : 'found'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Availability Settings */}
      {activeTab === 'availability' && (
        <div className="card">
          <h3 style={{ marginBottom: 24 }}>Manage Your Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Available Days</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DAYS.map(day => {
                  const on = availForm.availableDays.includes(day);
                  return (
                    <button key={day} type="button" onClick={() => setAvailForm(p => ({
                      ...p, availableDays: on ? p.availableDays.filter(d => d !== day) : [...p.availableDays, day]
                    }))} style={{
                      padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
                      background: on ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                      color: on ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                      outline: on ? 'none' : '1px solid var(--border-subtle)'
                    }}>{day.slice(0, 3)}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Available Time Slots</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SLOTS.map(slot => {
                  const on = availForm.slots.includes(slot);
                  return (
                    <button key={slot} type="button" onClick={() => setAvailForm(p => ({
                      ...p, slots: on ? p.slots.filter(s => s !== slot) : [...p.slots, slot]
                    }))} style={{
                      padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
                      background: on ? 'rgba(0,212,170,0.15)' : 'var(--bg-secondary)',
                      color: on ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      outline: on ? '1px solid rgba(0,212,170,0.3)' : '1px solid var(--border-subtle)'
                    }}>{slot}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Accepting patients:</label>
              <button type="button" onClick={() => setAvailForm(p => ({ ...p, available: !p.available }))} style={{
                width: 48, height: 26, borderRadius: 13, border: 'none',
                background: availForm.available ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                cursor: 'pointer', position: 'relative', transition: 'all 200ms',
                outline: availForm.available ? 'none' : '1px solid var(--border-subtle)'
              }}>
                <span style={{
                  position: 'absolute', top: 3, width: 20, height: 20, borderRadius: 10,
                  background: 'white', transition: 'all 200ms',
                  left: availForm.available ? 25 : 3
                }} />
              </button>
              <span style={{ fontSize: 13, color: availForm.available ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                {availForm.available ? 'Online' : 'Offline'}
              </span>
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={saveAvailability}>
              <Settings size={15} /> Save Availability
            </button>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {prescriptionModal && (
        <div className="modal-overlay" onClick={() => setPrescriptionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3 style={{ marginBottom: 6 }}>Write Prescription</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Patient: {prescriptionModal.patient?.name || 'Unknown'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rxForm.medicines.map((med, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 8 }}>
                  <input className="input" placeholder="Medicine name" value={med.name}
                    onChange={e => setRxForm(p => ({ ...p, medicines: p.medicines.map((m, j) => j === i ? { ...m, name: e.target.value } : m) }))} />
                  <input className="input" placeholder="Dosage" value={med.dosage}
                    onChange={e => setRxForm(p => ({ ...p, medicines: p.medicines.map((m, j) => j === i ? { ...m, dosage: e.target.value } : m) }))} />
                  <input className="input" placeholder="Duration" value={med.duration}
                    onChange={e => setRxForm(p => ({ ...p, medicines: p.medicines.map((m, j) => j === i ? { ...m, duration: e.target.value } : m) }))} />
                  <input className="input" placeholder="Timing (e.g. After meals)" value={med.timing}
                    onChange={e => setRxForm(p => ({ ...p, medicines: p.medicines.map((m, j) => j === i ? { ...m, timing: e.target.value } : m) }))} />
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}
                onClick={() => setRxForm(p => ({ ...p, medicines: [...p.medicines, { name: '', dosage: '', duration: '', timing: '' }] }))}>
                + Add Medicine
              </button>
              <textarea className="input" placeholder="Doctor's notes / advice..." rows={3}
                value={rxForm.notes} onChange={e => setRxForm(p => ({ ...p, notes: e.target.value }))} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={submitPrescription}>Submit Prescription</button>
                <button className="btn btn-ghost" onClick={() => setPrescriptionModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Video Modal */}
      {jitsiRoom && (
        <div className="modal-overlay" onClick={() => setJitsiRoom(null)}>
          <div className="modal" style={{ maxWidth: 800, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Video Consultation</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setJitsiRoom(null)}>✕ End</button>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
              <iframe
                src={`https://meet.jit.si/${jitsiRoom}#config.startWithAudioMuted=false&config.startWithVideoMuted=false`}
                allow="camera; microphone; fullscreen; display-capture"
                style={{ width: '100%', height: '480px', border: 'none' }}
                title="Video Consultation"
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
              Room: {jitsiRoom} · Share this room name with your patient
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
