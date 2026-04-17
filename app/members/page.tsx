'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, User, Mail, Phone, Crown } from 'lucide-react';

interface Member {
  id: string; name: string; email: string; phone: string;
  membershipType: 'basic' | 'premium'; joinedAt: string; activeLoans: number;
}

const emptyForm = { name: '', email: '', phone: '', membershipType: 'basic' as const };

function MemberModal({ member, onClose, onSave }: {
  member: Partial<Member> | null; onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState(
    member ? { name: member.name!, email: member.email!, phone: member.phone!, membershipType: member.membershipType! } : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!member?.id;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return; }
    setSaving(true);
    const url = isEdit ? `/api/members/${member!.id}` : '/api/members';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { onSave(); onClose(); } else { const d = await res.json(); setError(d.error || 'Failed'); }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{isEdit ? 'Edit Member' : 'Add Member'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 8px', border: 'none' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 7, fontSize: '0.82rem' }}>{error}</div>}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Full Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Email *</label>
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Phone</label>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1-555-0100" />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Membership Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['basic', 'premium'] as const).map(type => (
                <button key={type} onClick={() => set('membershipType', type)} style={{
                  padding: '12px 14px', borderRadius: 9, border: `1px solid ${form.membershipType === type ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.membershipType === type ? 'rgba(201,168,76,0.08)' : 'var(--surface2)',
                  color: form.membershipType === type ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
                    {type === 'premium' ? <Crown size={14} /> : <User size={14} />}
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize' }}>{type}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', marginTop: 4, opacity: 0.7 }}>
                    {type === 'premium' ? 'Up to 5 loans' : 'Up to 3 loans'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Member> | null | 'new'>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const data = await fetch(`/api/members?${params}`).then(r => r.json());
    setMembers(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [search]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); load(); }
    else { const d = await res.json(); setDeleteError(d.error || 'Cannot delete'); }
  }

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColor = (name: string) => {
    const colors = ['#5b8dee', '#9b7fe8', '#52c98a', '#e8c97a', '#e05252', '#5bc8d6'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>Members</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{members.length} registered members</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }} onClick={() => setModal('new')}>
          <Plus size={15} /> Add Member
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 340, marginBottom: 22 }}>
        <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input className="input" style={{ paddingLeft: 34 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
        ) : members.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>No members found</div>
        ) : members.map(member => (
          <div key={member.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: avatarColor(member.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#0e0e0f', flexShrink: 0 }}>
                {initials(member.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>{member.name}</span>
                  <span className={`badge badge-${member.membershipType}`}>{member.membershipType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: '0.78rem' }}>
                  <Mail size={11} /> {member.email}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button className="btn-ghost" style={{ padding: '5px 7px', border: 'none' }} onClick={() => setModal(member)}><Edit2 size={13} /></button>
                <button className="btn-ghost" style={{ padding: '5px 7px', border: 'none', color: 'var(--danger)' }} onClick={() => { setDeleteId(member.id); setDeleteError(''); }}><Trash2 size={13} /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Loans</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: member.activeLoans > 0 ? 'var(--accent)' : 'var(--text)' }}>{member.activeLoans}</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
                  {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
            {member.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'var(--muted)', fontSize: '0.78rem' }}>
                <Phone size={11} /> {member.phone}
              </div>
            )}
          </div>
        ))}
      </div>

      {modal !== null && (
        <MemberModal
          member={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ padding: '28px 24px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(224,82,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 size={20} color="var(--danger)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Remove Member?</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: deleteError ? 12 : 20 }}>This action cannot be undone.</p>
              {deleteError && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 7, fontSize: '0.82rem', marginBottom: 14 }}>{deleteError}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.875rem' }}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
