'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, BookOpen, X, Filter } from 'lucide-react';

interface Book {
  id: string; title: string; author: string; isbn: string; genre: string;
  year: number; totalCopies: number; availableCopies: number;
  coverColor: string; description: string;
}

const GENRES = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Dystopian', 'Biography', 'History', 'Science', 'Mystery', 'Romance', 'General'];

const emptyForm = { title: '', author: '', isbn: '', genre: 'Fiction', year: new Date().getFullYear(), totalCopies: 1, description: '' };

function BookModal({ book, onClose, onSave }: {
  book: Partial<Book> | null; onClose: () => void; onSave: () => void;
}) {
  const [form, setForm] = useState<typeof emptyForm>(
    book ? { title: book.title!, author: book.author!, isbn: book.isbn!, genre: book.genre!, year: book.year!, totalCopies: book.totalCopies!, description: book.description! } : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!book?.id;

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.title.trim() || !form.author.trim()) { setError('Title and author are required'); return; }
    setSaving(true);
    const url = isEdit ? `/api/books/${book!.id}` : '/api/books';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { onSave(); onClose(); } else { const d = await res.json(); setError(d.error || 'Failed'); }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{isEdit ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 8px', border: 'none' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 7, fontSize: '0.82rem' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Title *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Book title" />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Author *</label>
              <input className="input" value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name" />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>ISBN</label>
              <input className="input" value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-..." />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Genre</label>
              <select className="input" value={form.genre} onChange={e => set('genre', e.target.value)}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Year</label>
              <input className="input" type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Copies</label>
              <input className="input" type="number" min={1} value={form.totalCopies} onChange={e => set('totalCopies', Number(e.target.value))} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description…" style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Book'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [modal, setModal] = useState<Partial<Book> | null | 'new'>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (genre) params.set('genre', genre);
    const data = await fetch(`/api/books?${params}`).then(r => r.json());
    setBooks(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [search, genre]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (res.ok) { setDeleteId(null); load(); }
    else { const d = await res.json(); setDeleteError(d.error || 'Cannot delete'); }
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>Books</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{books.length} {books.length === 1 ? 'title' : 'titles'} in catalog</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }} onClick={() => setModal('new')}>
          <Plus size={15} /> Add Book
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search books, authors, ISBN…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
          <select className="input" style={{ paddingLeft: 30, width: 'auto' }} value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">All Genres</option>
            {GENRES.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Book', 'Genre', 'Year', 'Copies', 'Availability', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.73rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>No books found</td></tr>
            ) : books.map(book => (
              <tr key={book.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 42, borderRadius: 4, background: book.coverColor, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={12} color="rgba(255,255,255,0.4)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text)' }}>{book.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{book.author}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '3px 9px', borderRadius: 20 }}>{book.genre}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--muted)' }}>{book.year}</td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text)' }}>{book.totalCopies}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                      <div style={{ height: '100%', borderRadius: 3, background: book.availableCopies === 0 ? 'var(--danger)' : 'var(--success)', width: `${(book.availableCopies / book.totalCopies) * 100}%`, opacity: 0.8 }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: book.availableCopies === 0 ? 'var(--danger)' : 'var(--muted)' }}>
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn-ghost" style={{ padding: '5px 8px', border: 'none' }} onClick={() => setModal(book)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn-ghost" style={{ padding: '5px 8px', border: 'none', color: 'var(--danger)' }} onClick={() => { setDeleteId(book.id); setDeleteError(''); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal !== null && (
        <BookModal
          book={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ padding: '28px 24px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(224,82,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 size={20} color="var(--danger)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Delete Book?</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: deleteError ? 12 : 20 }}>This action cannot be undone.</p>
              {deleteError && <div style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 7, fontSize: '0.82rem', marginBottom: 14 }}>{deleteError}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.875rem' }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
