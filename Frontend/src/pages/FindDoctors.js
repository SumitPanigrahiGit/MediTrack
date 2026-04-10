import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI, aiAPI } from '../utils/api';
import { Search, MapPin, Star, Clock, Brain, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specs, setSpecs] = useState([]);
  const [filters, setFilters] = useState({ search: '', specialisation: '', location: '', available: false });
  const [aiQuery, setAiQuery] = useState('');
  const [aiRecs, setAiRecs] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [docRes, specRes] = await Promise.all([doctorsAPI.getAll(), doctorsAPI.getSpecialisations()]);
        setDoctors(docRes.doctors || []);
        setSpecs(specRes.specialisations || []);
      } catch { toast.error('Failed to load doctors'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const fetchWithFilters = async () => {
    setLoading(true);
    try {
      const res = await doctorsAPI.getAll({ ...filters, available: filters.available || undefined });
      setDoctors(res.doctors || []);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWithFilters(); }, [filters]);

  const handleAiRecommend = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiRecs(null);
    try {
      const res = await aiAPI.recommendDoctors({ symptoms: aiQuery });
      setAiRecs(res.data);
    } catch { toast.error('AI recommendation failed'); }
    finally { setAiLoading(false); }
  };

  const renderStars = (rating) => {
    const r = Math.round(rating || 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p>Search from {doctors.length} verified specialists</p>
      </div>

      {/* AI Recommendation Banner */}
      <div className="card" style={{
        marginBottom: 28, background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(79,195,247,0.08))',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div className="ai-indicator"><div className="ai-dot" /> AI Doctor Finder</div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Describe your symptoms and let AI recommend the right specialist for you.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" placeholder="E.g. I have chest pain and shortness of breath..."
            value={aiQuery} onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAiRecommend()}
            style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={handleAiRecommend} disabled={aiLoading}>
            <Brain size={15} /> {aiLoading ? 'Finding...' : 'Find'}
          </button>
        </div>

        {aiRecs && (
          <div style={{ marginTop: 16 }}>
            {aiRecs.generalAdvice && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(0,212,170,0.08)', marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                💡 {aiRecs.generalAdvice}
              </div>
            )}
            {aiRecs.recommendations?.map((rec, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px', borderRadius: 12, background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)', marginBottom: 8
              }}>
                <span style={{ fontSize: 18 }}>#{rec.priority}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{rec.doctorName}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent-teal)', marginBottom: 2 }}>{rec.doctor?.specialisation}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rec.reason}</div>
                </div>
                {rec.doctor && (
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/doctors/${rec.doctor.id}`)}>
                    Book
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by name or specialisation..."
            value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            style={{ paddingLeft: 38 }} />
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 180 }}
          value={filters.specialisation} onChange={e => setFilters(p => ({ ...p, specialisation: e.target.value }))}>
          <option value="">All Specialisations</option>
          {specs.map(s => <option key={s}>{s}</option>)}
        </select>
        <input className="input" placeholder="City..." style={{ width: 140 }}
          value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))} />
        <button className={`btn ${filters.available ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilters(p => ({ ...p, available: !p.available }))}>
          {filters.available ? '✓' : ''} Available Now
        </button>
        {(filters.search || filters.specialisation || filters.location || filters.available) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ search: '', specialisation: '', location: '', available: false })}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="grid-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 20 }} />)}
        </div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Search size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No doctors found with the current filters</p>
        </div>
      ) : (
        <div className="grid-3 stagger-children">
          {doctors.map(doc => (
            <div key={doc.id} className="card" style={{ padding: '24px', cursor: 'pointer' }}
              onClick={() => navigate(`/doctors/${doc.id}`)}>
              {/* Header */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div className="avatar" style={{
                  width: 56, height: 56, fontSize: '20px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(79,195,247,0.2), rgba(0,212,170,0.2))',
                  color: 'var(--accent-teal)', border: '2px solid rgba(0,212,170,0.2)'
                }}>
                  {doc.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>{doc.specialisation || 'General'}</span>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <MapPin size={13} /> {doc.location || 'Location N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Clock size={13} /> {doc.experience || 0} years experience
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--accent-gold)' }}>{renderStars(doc.rating)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{doc.rating ? doc.rating.toFixed(1) : 'New'}</span>
                </div>
              </div>

              {doc.bio && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.bio}
                </p>
              )}

              <div className="divider" style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-teal)' }}>₹{doc.fee || 0}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}> /consult</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${doc.available ? 'badge-success' : 'badge-muted'}`} style={{ fontSize: 10 }}>
                    {doc.available ? '● Available' : '○ Unavailable'}
                  </span>
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/doctors/${doc.id}`); }}>
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
