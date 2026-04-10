import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../utils/api';
import { CreditCard, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function PaymentHistory() {
  const { user } = useAuth();
  const [data, setData] = useState({ payments: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.getHistory()
      .then(res => setData(res))
      .catch(() => toast.error('Failed to load billing history'))
      .finally(() => setLoading(false));
  }, []);

  const label = user.role === 'doctor' ? 'Earnings' : 'Amount Paid';

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Billing History</h1>
        <p>{user.role === 'doctor' ? 'Your consultation earnings' : 'Your payment records'}</p>
      </div>

      {/* Summary card */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,212,170,0.1)' }}><TrendingUp size={22} color="var(--accent-teal)" /></div>
          <div className="stat-value" style={{ color: 'var(--accent-teal)', fontSize: 28 }}>₹{(data.total || 0).toLocaleString()}</div>
          <div className="stat-label">Total {label}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79,195,247,0.1)' }}><CheckCircle size={22} color="var(--accent-blue)" /></div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{data.payments?.filter(p => p.status === 'paid').length || 0}</div>
          <div className="stat-label">Successful Transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,166,35,0.1)' }}><CreditCard size={22} color="var(--accent-gold)" /></div>
          <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{data.payments?.length || 0}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>{user.role === 'doctor' ? 'Patient' : 'Doctor'}</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : data.payments?.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                  <CreditCard size={40} style={{ marginBottom: 12, opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                  No transactions yet
                </td></tr>
              ) : (
                data.payments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <code style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: 6 }}>
                        {p.transactionId?.slice(0, 20) || '—'}
                      </code>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {user.role === 'doctor' ? p.appointment?.patientId?.slice(0, 8) || '—' : p.doctorName || '—'}
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-teal)', fontSize: 16 }}>₹{p.amount?.toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {p.method === 'razorpay_sandbox' ? '🔒 Razorpay Sandbox' : p.method}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                        {p.status === 'paid' ? '✓ Paid' : p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: '14px 20px', borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)' }}>
        🔒 All transactions are processed through Razorpay Sandbox. No real money is involved in this prototype.
      </div>
    </div>
  );
}
