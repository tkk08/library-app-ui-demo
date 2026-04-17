'use client';
import { useEffect, useState } from 'react';
import { BookOpen, Users, AlertTriangle, TrendingUp, BookMarked, Library } from 'lucide-react';

interface Stats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  activeLoans: number;
  overdueLoans: number;
  totalMembers: number;
  totalTitles: number;
  genreCount: Record<string, number>;
  recentLoans: Array<{
    id: string; status: string; borrowedAt: string; dueDate: string;
    book?: { title: string; author: string; coverColor: string };
    member?: { name: string };
  }>;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            {label}
          </div>
          <div className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={19} color="#0e0e0f" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div style={{ color: 'var(--muted)' }}>Loading…</div>
    </div>
  );

  const genres = Object.entries(stats.genreCount).sort((a, b) => b[1] - a[1]);
  const maxGenre = genres[0]?.[1] || 1;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon={Library} label="Total Volumes" value={stats.totalBooks} sub={`${stats.totalTitles} unique titles`} color="var(--accent)" />
        <StatCard icon={BookMarked} label="Active Loans" value={stats.activeLoans} sub={`${stats.availableBooks} copies available`} color="#5b8dee" />
        <StatCard icon={Users} label="Members" value={stats.totalMembers} sub="Registered members" color="#52c98a" />
        <StatCard icon={BookOpen} label="Borrowed" value={stats.borrowedBooks} sub="Currently checked out" color="#9b7fe8" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdueLoans} sub={stats.overdueLoans > 0 ? 'Needs attention' : 'All on time'} color={stats.overdueLoans > 0 ? 'var(--danger)' : 'var(--success)'} />
        <StatCard icon={TrendingUp} label="Availability" value={`${stats.totalBooks > 0 ? Math.round((stats.availableBooks / stats.totalBooks) * 100) : 100}%`} sub="Books available now" color="var(--warning)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card" style={{ padding: 22 }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Recent Activity
          </h2>
          {stats.recentLoans.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '16px 0', textAlign: 'center' }}>No recent loans</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.recentLoans.map(loan => (
                <div key={loan.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 44, borderRadius: 5, flexShrink: 0, background: loan.book?.coverColor || '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={11} color="rgba(255,255,255,0.4)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loan.book?.title || 'Unknown'}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{loan.member?.name || 'Unknown'}</div>
                  </div>
                  <span className={`badge badge-${loan.status}`}>{loan.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Genre Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {genres.map(([genre, count]) => (
              <div key={genre}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{genre}</span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{count}</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: `${(count / maxGenre) * 100}%`, opacity: 0.75 }} />
                </div>
              </div>
            ))}
            {genres.length === 0 && <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No books yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
