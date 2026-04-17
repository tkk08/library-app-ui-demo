import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  const db = getDB();
  const now = new Date();

  // Update overdue
  db.loans = db.loans.map(l => {
    if (l.status === 'active' && new Date(l.dueDate) < now) {
      return { ...l, status: 'overdue' as const };
    }
    return l;
  });

  const totalBooks = db.books.reduce((s, b) => s + b.totalCopies, 0);
  const availableBooks = db.books.reduce((s, b) => s + b.availableCopies, 0);
  const activeLoans = db.loans.filter(l => l.status === 'active').length;
  const overdueLoans = db.loans.filter(l => l.status === 'overdue').length;
  const totalMembers = db.members.length;

  const genreCount: Record<string, number> = {};
  db.books.forEach(b => { genreCount[b.genre] = (genreCount[b.genre] || 0) + 1; });

  const recentLoans = db.loans
    .sort((a, b) => new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime())
    .slice(0, 5)
    .map(l => ({
      ...l,
      book: db.books.find(b => b.id === l.bookId),
      member: db.members.find(m => m.id === l.memberId),
    }));

  return NextResponse.json({
    totalBooks,
    availableBooks,
    borrowedBooks: totalBooks - availableBooks,
    activeLoans,
    overdueLoans,
    totalMembers,
    totalTitles: db.books.length,
    genreCount,
    recentLoans,
  });
}
