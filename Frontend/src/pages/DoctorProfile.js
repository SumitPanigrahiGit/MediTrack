import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI, paymentsAPI } from '../utils/api';
import { MapPin, Clock, Star, Video, Building, CheckCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ date: '', time: '', type: 'in-person' });
  const [step, setStep] = useState('select'); // select | confirm | payment | done
  const [appointment, setAppointment] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    doctorsAPI.getById(id)
      .then(res => setDoctor(res.doctor))
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!booking.date || !booking.time) return toast.error('Select date and time');
    try {
      const res = await appointmentsAPI.book({ doctorId: id, ...booking });
      setAppointment(res.appointment);
      setStep('confirm');
    } catch (err) { toast.error(err.message); }
  };

  const handlePayment = async () => {
    if (!appointment) return;
    setPayLoading(true);
    try {
      const orderRes = await paymentsAPI.initiate(appointment.id);
      // Simulate Razorpay sandbox
      await new Promise(r => setTimeout(r, 1500));
      await paymentsAPI.confirm({
        appointmentId: appointment.id,
        paymentId: `pay_sandbox_${Date.now()}`,
        orderId: orderRes.order?.id
      });
      setStep('done');
      toast.success('Payment successful! Appointment confirmed.');
    } catch (err) { toast.error(err.message); }
    finally { setPayLoading(false); }
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  if (loading) return <div className="main-content"><div className="skeleton" style={{ height: 400, borderRadius: 20 }} /></div>;
  if (!doctor) return <div className="main-content"><p>Doctor not found.</p></div>;

  return (
    <div className="main-content">
      <button onClick={() => navigate('/doctors')} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        ← Back to Doctors
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Doctor Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
              <div className="avatar" style={{
                width: 80, height: 80, fontSize: '28px', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(79,195,247,0.2), rgba(0,212,170,0.2))',
                color: 'var(--accent-teal)', border: '2px solid rgba(0,212,170,0.3)'
              }}>
                {doctor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: 6 }}>{doctor.name}</h2>
                <span className="badge badge-info" style={{ fontSize: 12 }}>{doctor.specialisation}</span>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> {doctor.location || 'N/A'}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {doctor.experience || 0} years
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} fill="currentColor" /> {doctor.rating ? doctor.rating.toFixed(1) : 'New'}
                  </span>
                </div>
              </div>
            </div>

            {doctor.bio && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>About</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{doctor.bio}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Available Days
            </h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
                const full = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i];
                const on = (doctor.availableDays || []).includes(full);
                return (
                  <div key={d} style={{
                    width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: on ? 'rgba(0,212,170,0.15)' : 'var(--bg-secondary)',
                    color: on ? 'var(--accent-teal)' : 'var(--text-muted)',
                    border: on ? '1px solid rgba(0,212,170,0.3)' : '1px solid var(--border-subtle)'
                  }}>{d}</div>
                );
              })}
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 12px' }}>
              Consultation Fee
            </h4>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent-teal)' }}>
              ₹{doctor.fee || 0}
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}> per consultation</span>
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div style={{ position: 'sticky', top: 80 }}>
          {step === 'done' ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <CheckCircle size={56} color="var(--accent-teal)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>Booking Confirmed!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Your appointment with {doctor.name} is confirmed for {appointment?.date} at {appointment?.time}.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/appointments')}>View Appointments</button>
            </div>
          ) : step === 'confirm' || step === 'payment' ? (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ marginBottom: 20 }}>Confirm Booking</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Doctor', value: doctor.name },
                  { label: 'Specialisation', value: doctor.specialisation },
                  { label: 'Date', value: appointment?.date },
                  { label: 'Time', value: appointment?.time },
                  { label: 'Type', value: booking.type === 'video' ? '📹 Video Call' : '🏥 In-Person' },
                  { label: 'Consultation Fee', value: `₹${doctor.fee || 0}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(0,212,170,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                🔒 Sandbox payment — no real money charged
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
                onClick={handlePayment} disabled={payLoading}>
                {payLoading ? 'Processing...' : `Pay ₹${doctor.fee || 0} (Sandbox)`}
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('select')}>
                ← Back
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ marginBottom: 6 }}>Book Appointment</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Available slots below</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Consultation Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { id: 'in-person', label: '🏥 In-Person', icon: Building },
                      { id: 'video', label: '📹 Video Call', icon: Video }
                    ].map(({ id, label }) => (
                      <button key={id} type="button" onClick={() => setBooking(p => ({ ...p, type: id }))} style={{
                        flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', border: 'none',
                        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                        background: booking.type === id ? 'rgba(0,212,170,0.15)' : 'var(--bg-secondary)',
                        color: booking.type === id ? 'var(--accent-teal)' : 'var(--text-secondary)',
                        outline: booking.type === id ? '1px solid rgba(0,212,170,0.3)' : '1px solid var(--border-subtle)'
                      }}>{label}</button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label>Date</label>
                  <input className="input" type="date" min={getMinDate()}
                    value={booking.date} onChange={e => setBooking(p => ({ ...p, date: e.target.value, time: '' }))} />
                </div>

                {booking.date && (
                  <div className="input-group">
                    <label>Time Slot</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(doctor.slots || []).length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No slots configured</p>
                      ) : (doctor.slots || []).map(slot => (
                        <button key={slot} type="button" onClick={() => setBooking(p => ({ ...p, time: slot }))} style={{
                          padding: '8px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
                          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                          background: booking.time === slot ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                          color: booking.time === slot ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                          outline: booking.time === slot ? 'none' : '1px solid var(--border-subtle)'
                        }}>{slot}</button>
                      ))}
                    </div>
                  </div>
                )}

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  onClick={handleBook} disabled={!booking.date || !booking.time}>
                  <Calendar size={15} /> Confirm Slot
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
