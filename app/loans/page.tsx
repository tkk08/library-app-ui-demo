'use client';
import { useEffect, useState } from 'react';
import { Plus, RotateCcw, X, BookOpen, AlertTriangle, Check } from 'lucide-react';

interface Book { id: string; title: string; author: string; availableCopies: number; coverColor: string; }
interface Member { id: string; name: string; membershipType: string; activeLoans: number; }
interface Loan {
  id: string; status: string; borrowedAt: string; dueDate: string; returnedAt: string | null;
  book?: Book; member?: Member;
}

function BorrowModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bookId, setBookId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [duration, setDuration] = useState(14);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/books').then(r => r.json()).then((data: Book[]) => setBooks(data.filter(b => b.availableCopies > 0)));
    fetch('/api/members').then(r => r.json()).then(setMembers);
  }, []);

  async function handleSubmit() {
    if (!bookId || !memberId) { setError('Please select a book and member'); return; }
    setSaving(true);
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, memberId, durationDays: duration }),
    });
    if (res.ok) { onSave(); onClose(); }
    else { const d = await res.json(); setError(d.error || 'Failed'); }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Borrow a Book</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 8px', border: 'none' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 7, fontSize: '0.82rem' }}>{error}</div>}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Select Book</label>
            <select className="input" value={bookId} onChange={e => setBookId(e.target.value)}>
              <option value="">— Choose a book —</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} by {b.author} ({b.availableCopies} avail.)</option>
              ))}
            </select>
            {books.length === 0 && <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: 5 }}>No books currently available</div>}
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Select Member</label>
            <select className="input" value={memberId} onChange={e => setMemberId(e.target.value)}>
              <option value="">— Choose a member —</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.membershipType}, {m.activeLoans} active loans)</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Loan Duration</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[7, 14, 21, 30].map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  flex: 1, padding: '9px 4px', borderRadius: 8,
                  border: `1px solid ${duration === d ? 'var(--accent)' : 'var(--border)'}`,
                  background: duration === d ? 'rgba(201,168,76,0.08)' : 'var(--surface2)',
                  color: duration === d ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500,
                  transition: 'all 0.15s',
                }}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Due date: <span style={{ color: 'var(--text)', fontWeight: 500 }}>
              {new Date(Date.now() + duration * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Processing…' : 'Confirm Loan'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysLeft(dueDate: string) {
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showBorrow, setShowBorrow] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    const data = await fetch(`/api/loans${params}`).then(r => r.json());
    setLoans(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function handleReturn(id: string) {
    setReturning(id);
    const res = await fetch(`/api/loans/${id}/return`, { method: 'POST' });
    if (res.ok) {
      setReturnSuccess(id);
      setTimeout(() => setReturnSuccess(null), 2000);
      load();
    }
    setReturning(null);
  }

  const tabs = [
    { key: '', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'returned', label: 'Returned' },
  ];

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>Loans</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{loans.length} {filter || 'total'} loans</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }} onClick={() => setShowBorrow(true)}>
          <Plus size={15} /> Borrow Book
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: filter === tab.key ? 'var(--surface2)' : 'transparent',
            color: filter === tab.key ? 'var(--text)' : 'var(--muted)',
            fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: filter === tab.key ? 500 : 400,
            transition: 'all 0.15s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loans list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Book', 'Member', 'Borrowed', 'Due Date', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.73rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</td></tr>
            ) : loans.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>No loans found</td></tr>
            ) : loans.map(loan => {
              const days = daysLeft(loan.dueDate);
              const isActive = loan.status !== 'returned';
              return (
                <tr key={loan.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 40, borderRadius: 4, background: loan.book?.coverColor || '#333', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={11} color="rgba(255,255,255,0.4)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)' }}>{loan.book?.title || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{loan.book?.author}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text)' }}>{loan.member?.name || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDate(loan.borrowedAt)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.82rem', color: loan.status === 'overdue' ? 'var(--danger)' : loan.status === 'returned' ? 'var(--muted)' : 'var(--text)' }}>
                      {formatDate(loan.dueDate)}
                    </div>
                    {isActive && (
                      <div style={{ fontSize: '0.72rem', color: days < 0 ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'var(--muted)', marginTop: 2 }}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                      </div>
                    )}
                    {loan.returnedAt && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>Returned {formatDate(loan.returnedAt)}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {loan.status === 'overdue' && <AlertTriangle size={13} color="var(--danger)" />}
                      <span className={`badge badge-${loan.status}`}>{loan.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {isActive && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        disabled={returning === loan.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
                          background: returnSuccess === loan.id ? 'rgba(82,201,138,0.1)' : 'transparent',
                          color: returnSuccess === loan.id ? 'var(--success)' : 'var(--muted)',
                          cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 500,
                          transition: 'all 0.15s',
                        }}
                      >
                        {returnSuccess === loan.id ? <><Check size={13} /> Done</> : <><RotateCcw size={13} /> Return</>}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showBorrow && <BorrowModal onClose={() => setShowBorrow(false)} onSave={load} />}
    </div>
  );
}
