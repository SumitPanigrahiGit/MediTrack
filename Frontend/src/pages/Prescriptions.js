import React, { useState, useEffect } from 'react';
import { prescriptionsAPI } from '../utils/api';
import { FileText, Plus, Bell, Pill, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('prescriptions');
  const [reminderModal, setReminderModal] = useState(false);
  const [rForm, setRForm] = useState({ medicine: '', time: '08:00', frequency: 'Once daily', startDate: '', endDate: '' });

  useEffect(() => {
    Promise.all([prescriptionsAPI.getMyPrescriptions(), prescriptionsAPI.getReminders()])
      .then(([rxRes, remRes]) => {
        setPrescriptions(rxRes.prescriptions || []);
        setReminders(remRes.reminders || []);
      }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const addReminder = async () => {
    if (!rForm.medicine || !rForm.startDate) return toast.error('Medicine and start date required');
    try {
      const res = await prescriptionsAPI.addReminder(rForm);
      setReminders(p => [...p, res.reminder]);
      setReminderModal(false);
      setRForm({ medicine: '', time: '08:00', frequency: 'Once daily', startDate: '', endDate: '' });
      toast.success('Reminder added!');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="main-content"><div className="skeleton" style={{ height: 300, borderRadius: 20 }} /></div>;

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Prescriptions & Reminders</h1>
          <p>Your medical records and medication schedule</p>
        </div>
        {user.role === 'patient' && (
          <button className="btn btn-primary" onClick={() => setReminderModal(true)}>
            <Plus size={15} /> Add Reminder
          </button>
        )}
      </div>

      <div className="tab-pills" style={{ marginBottom: 24 }}>
        <button className={`tab-pill ${tab === 'prescriptions' ? 'active' : ''}`} onClick={() => setTab('prescriptions')}>
          Prescriptions ({prescriptions.length})
        </button>
        <button className={`tab-pill ${tab === 'reminders' ? 'active' : ''}`} onClick={() => setTab('reminders')}>
          Medication Reminders ({reminders.length})
        </button>
      </div>

      {tab === 'prescriptions' && (
        prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No prescriptions yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {prescriptions.map(rx => (
              <div key={rx.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Dr. {rx.doctorName}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rx.specialisation}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 10, marginBottom: 14 }}>
                  {(rx.medicines || []).map((med, i) => (
                    <div key={i} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <Pill size={14} color="var(--accent-teal)" />
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{med.name}</span>
                      </div>
                      {med.dosage && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Dosage: {med.dosage}</div>}
                      {med.duration && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Duration: {med.duration}</div>}
                      {med.timing && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{med.timing}</div>}
                    </div>
                  ))}
                </div>
                {rx.notes && (
                  <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(79,195,247,0.06)', border: '1px solid rgba(79,195,247,0.15)', fontSize: 13, color: 'var(--text-secondary)' }}>
                    📝 <strong>Doctor's Note:</strong> {rx.notes}
                  </div>
                )}
                {rx.followUpDate && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--accent-gold)' }}>⏰ Follow-up: {rx.followUpDate}</div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'reminders' && (
        reminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No medication reminders set</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setReminderModal(true)}>Add First Reminder</button>
          </div>
        ) : (
          <div className="grid-3">
            {reminders.map(r => (
              <div key={r.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Pill size={20} color="var(--accent-teal)" />
                  <span className={`badge ${r.active ? 'badge-success' : 'badge-muted'}`}>{r.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{r.medicine}</div>
                <div style={{ fontSize: 13, color: 'var(--accent-teal)', fontWeight: 600, marginBottom: 8 }}>{r.time}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.frequency}</div>
                {r.startDate && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>From: {r.startDate}{r.endDate ? ` to ${r.endDate}` : ''}</div>}
              </div>
            ))}
          </div>
        )
      )}

      {reminderModal && (
        <div className="modal-overlay" onClick={() => setReminderModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3>Add Medication Reminder</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setReminderModal(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Medicine Name</label>
                <input className="input" placeholder="e.g. Metformin 500mg" value={rForm.medicine} onChange={e => setRForm(p => ({ ...p, medicine: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Time</label>
                  <input className="input" type="time" value={rForm.time} onChange={e => setRForm(p => ({ ...p, time: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label>Frequency</label>
                  <select className="input" value={rForm.frequency} onChange={e => setRForm(p => ({ ...p, frequency: e.target.value }))}>
                    {['Once daily','Twice daily','Three times daily','After meals','Before meals','At bedtime','Every 8 hours','Weekly'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Start Date</label>
                  <input className="input" type="date" value={rForm.startDate} onChange={e => setRForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label>End Date (optional)</label>
                  <input className="input" type="date" value={rForm.endDate} onChange={e => setRForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={addReminder}><Bell size={15} /> Set Reminder</button>
                <button className="btn btn-ghost" onClick={() => setReminderModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
