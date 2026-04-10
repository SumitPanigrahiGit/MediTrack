import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, Calendar, Shield, Star, ArrowRight, Heart, Zap, Users, Clock } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Symptom Checker', desc: 'Describe your symptoms and get instant AI-powered analysis with urgency assessment', color: '#00d4aa' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Book in-person or video consultations with top doctors in seconds', color: '#4fc3f7' },
  { icon: Shield, title: 'Secure Health Records', desc: 'All your prescriptions, reports and history in one encrypted place', color: '#b39ddb' },
  { icon: Zap, title: 'Jitsi Video Consults', desc: 'Free HD video consultations with no extra apps required', color: '#f5a623' },
];

const stats = [
  { value: '10,000+', label: 'Patients Served', icon: Users },
  { value: '500+', label: 'Verified Doctors', icon: Heart },
  { value: '4.9★', label: 'Average Rating', icon: Star },
  { value: '< 2min', label: 'Avg. Wait Time', icon: Clock },
];

const testimonials = [
  { name: 'Sneha R.', role: 'Patient', text: 'The AI symptom checker flagged my condition accurately before my appointment. Absolutely life-changing.', avatar: 'SR' },
  { name: 'Dr. Vikram M.', role: 'Cardiologist', text: 'MediTrack transformed how I manage patient queues. The digital prescription system is flawless.', avatar: 'VM' },
  { name: 'Arjun K.', role: 'Patient', text: 'Booked a dermatology video consult in under 3 minutes. The platform is incredibly intuitive.', avatar: 'AK' },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px 60px', flexDirection: 'column'
      }}>
        {/* Floating badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)',
          borderRadius: '100px', padding: '8px 20px', marginBottom: '32px',
          fontSize: '13px', fontWeight: 600, color: 'var(--accent-teal)',
          animation: 'fade-up 0.6s ease forwards'
        }}>
          <div className="ai-dot" />
          AI-Powered Healthcare Platform · Now in Beta
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: 'clamp(42px, 8vw, 88px)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: '24px',
          maxWidth: '900px',
          animation: 'fade-up 0.6s ease 0.1s both'
        }}>
          Healthcare that{' '}
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, #00d4aa, #4fc3f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>actually</span>
          {' '}understands you
        </h1>

        <p style={{
          fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '580px',
          lineHeight: 1.7, marginBottom: '48px',
          animation: 'fade-up 0.6s ease 0.2s both'
        }}>
          Connect with verified doctors, get AI-powered health insights, manage prescriptions,
          and consult via video — all in one beautifully designed platform.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fade-up 0.6s ease 0.3s both'
        }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: '16px', padding: '16px 36px' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg" style={{ fontSize: '16px', padding: '16px 36px' }}>
            Sign In
          </Link>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: '32px', padding: '16px 24px',
          background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)',
          borderRadius: '16px', animation: 'fade-up 0.6s ease 0.4s both'
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Demo Credentials</p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { role: 'Patient', email: 'patient@meditrack.com', color: 'var(--accent-teal)' },
              { role: 'Doctor', email: 'doctor@meditrack.com', color: 'var(--accent-blue)' },
              { role: 'Admin', email: 'admin@meditrack.com', color: 'var(--accent-gold)' },
            ].map(({ role, email, color }) => (
              <div key={role} style={{ fontSize: '13px', textAlign: 'center' }}>
                <span style={{ color, fontWeight: 700 }}>{role}</span>
                <div style={{ color: 'var(--text-secondary)' }}>{email}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Password: password</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          color: 'var(--text-muted)', fontSize: '12px', animation: 'fade-up 0.6s ease 0.5s both'
        }}>
          <span>Scroll to explore</span>
          <div style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(to bottom, var(--accent-teal), transparent)',
            animation: 'fade-in 1s ease infinite alternate'
          }} />
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="grid-4 stagger-children">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: '20px', padding: '32px 24px', textAlign: 'center',
              transition: 'all 200ms'
            }}>
              <Icon size={28} color="var(--accent-teal)" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Everything you need,{' '}
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--accent-teal)' }}>nothing you don't</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Built for the modern patient and doctor. Powerful AI meets simple, human-centered design.
          </p>
        </div>

        <div className="grid-2 stagger-children">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card" style={{ padding: '32px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '16px',
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Icon size={26} color={color} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Trusted by thousands
          </h2>
        </div>
        <div className="grid-3 stagger-children">
          {testimonials.map(({ name, role, text, avatar }) => (
            <div key={name} className="card" style={{ padding: '28px' }}>
              <div style={{ color: 'var(--accent-gold)', marginBottom: '16px', fontSize: '20px' }}>★★★★★</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>"{text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar" style={{
                  width: 40, height: 40, fontSize: '14px',
                  background: 'var(--bg-secondary)', color: 'var(--accent-teal)',
                  border: '1px solid var(--border-subtle)'
                }}>{avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(79,195,247,0.08))',
          border: '1px solid var(--border-medium)', borderRadius: '32px', padding: '64px 48px'
        }}>
          <Activity size={48} color="var(--accent-teal)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Your health, intelligently managed
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Join thousands who've made MediTrack their trusted healthcare companion.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)', padding: '32px 24px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Activity size={16} color="var(--accent-teal)" />
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>MediTrack</span>
        </div>
        Built for DevFusion Hackathon · Problem Statement 5 · #26ENMT5
      </footer>
    </div>
  );
}
