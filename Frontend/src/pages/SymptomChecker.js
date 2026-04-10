import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI } from '../utils/api';
import { Brain, AlertCircle, CheckCircle, AlertTriangle, XCircle, ArrowRight, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const URGENCY_CONFIG = {
  Immediate: { icon: XCircle, color: 'var(--accent-rose)', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.25)', label: '🚨 Immediate Attention Required' },
  Urgent: { icon: AlertCircle, color: 'var(--accent-gold)', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.25)', label: '⚠️ Urgent Care Needed' },
  'Non-urgent': { icon: AlertTriangle, color: '#ffd93d', bg: 'rgba(255,217,61,0.1)', border: 'rgba(255,217,61,0.25)', label: '⏰ Monitor Symptoms' },
  Monitor: { icon: CheckCircle, color: 'var(--accent-teal)', bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.25)', label: '✅ Low Urgency' },
};

const LIKELIHOOD_COLORS = {
  High: 'var(--accent-rose)',
  Medium: 'var(--accent-gold)',
  Low: 'var(--accent-teal)'
};

const QUICK_SYMPTOMS = [
  'Severe chest pain and breathlessness',
  'Persistent headache and fever',
  'Skin rash and itching',
  'Stomach pain and nausea',
  'Joint pain and stiffness',
  'Anxiety and sleep problems'
];

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const analyze = async () => {
    if (!symptoms.trim()) return toast.error('Please describe your symptoms');
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.checkSymptoms(symptoms);
      setResult(res.analysis);
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const urgencyConfig = result ? (URGENCY_CONFIG[result.urgencyLevel] || URGENCY_CONFIG.Monitor) : null;
  const UrgencyIcon = urgencyConfig?.icon;

  return (
    <div className="main-content" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '20px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(79,195,247,0.2))',
          border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Brain size={32} color="var(--accent-teal)" />
        </div>
        <h1>AI Symptom Checker</h1>
        <p>Describe how you're feeling and get an instant AI health assessment</p>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '14px 20px', borderRadius: 14, marginBottom: 24,
        background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
        display: 'flex', gap: 10, alignItems: 'flex-start'
      }}>
        <AlertCircle size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--accent-gold)' }}>Medical Disclaimer:</strong> This tool provides general information only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
        </p>
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div className="ai-indicator"><div className="ai-dot" /> Powered by Claude AI</div>
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label>Describe your symptoms in detail</label>
          <textarea className="input" rows={5} value={symptoms} onChange={e => setSymptoms(e.target.value)}
            placeholder="E.g. I've had a persistent headache for 3 days, with fever of 101°F, sore throat, and mild dizziness. The headache is worse in the morning..."
            style={{ resize: 'vertical', minHeight: 120 }} />
        </div>

        {/* Quick select */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Select:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_SYMPTOMS.map(s => (
              <button key={s} type="button" onClick={() => setSymptoms(s)} style={{
                padding: '6px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer', border: 'none',
                background: symptoms === s ? 'rgba(0,212,170,0.15)' : 'var(--bg-secondary)',
                color: symptoms === s ? 'var(--accent-teal)' : 'var(--text-secondary)',
                outline: symptoms === s ? '1px solid rgba(0,212,170,0.3)' : '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-body)', transition: 'all 200ms'
              }}>{s}</button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={analyze} disabled={loading || !symptoms.trim()}
          style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? (
            <><div className="ai-dot" style={{ width: 10, height: 10 }} /> Analyzing symptoms...</>
          ) : (
            <><Brain size={18} /> Analyze Symptoms</>
          )}
        </button>
      </div>

      {/* Loading animation */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: 6, background: 'var(--accent-teal)',
                animation: `ai-pulse ${0.8 + i * 0.15}s ease infinite`,
                animationDelay: `${i * 0.1}s`
              }} />
            ))}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>AI is analyzing your symptoms</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cross-referencing with medical knowledge base...</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fade-up 0.5s ease' }}>
          {/* Urgency Banner */}
          <div style={{
            padding: '20px 24px', borderRadius: 20,
            background: urgencyConfig.bg, border: `1px solid ${urgencyConfig.border}`,
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <UrgencyIcon size={32} color={urgencyConfig.color} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: urgencyConfig.color }}>{urgencyConfig.label}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{result.urgencyMessage}</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Possible Conditions */}
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Possible Conditions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(result.possibleConditions || []).map((c, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 12, background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: `${LIKELIHOOD_COLORS[c.likelihood]}18`, color: LIKELIHOOD_COLORS[c.likelihood] }}>
                        {c.likelihood}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Advice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 14 }}>General Advice</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(result.generalAdvice || []).map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <CheckCircle size={14} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              {result.recommendedSpecialists?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: 16, marginBottom: 14 }}>Recommended Specialists</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {result.recommendedSpecialists.map(spec => (
                      <span key={spec} className="badge badge-info">{spec}</span>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => navigate('/doctors')}>
                    <Stethoscope size={14} /> Find These Specialists <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: '14px 20px', borderRadius: 14,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
            fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {result.disclaimer}
          </div>

          {/* New Analysis */}
          <button className="btn btn-outline" style={{ alignSelf: 'center' }} onClick={() => { setResult(null); setSymptoms(''); }}>
            Start New Analysis
          </button>
        </div>
      )}
    </div>
  );
}

