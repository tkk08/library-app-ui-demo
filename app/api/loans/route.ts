import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB, generateId, Loan } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDB();
  const status = req.nextUrl.searchParams.get('status') || '';
  const memberId = req.nextUrl.searchParams.get('memberId') || '';

  // Update overdue status
  const now = new Date();
  db.loans = db.loans.map(l => {
    if (l.status === 'active' && new Date(l.dueDate) < now) {
      return { ...l, status: 'overdue' as const };
    }
    return l;
  });
  saveDB(db);

  let loans = db.loans;
  if (status) loans = loans.filter(l => l.status === status);
  if (memberId) loans = loans.filter(l => l.memberId === memberId);

  // Enrich with book and member info
  const enriched = loans.map(l => ({
    ...l,
    book: db.books.find(b => b.id === l.bookId),
    member: db.members.find(m => m.id === l.memberId),
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const db = getDB();
  const body = await req.json();
  const { bookId, memberId, durationDays = 14 } = body;

  const book = db.books.find(b => b.id === bookId);
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  if (book.availableCopies < 1) return NextResponse.json({ error: 'No copies available' }, { status: 400 });

  const member = db.members.find(m => m.id === memberId);
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const maxLoans = member.membershipType === 'premium' ? 5 : 3;
  if (member.activeLoans >= maxLoans) {
    return NextResponse.json({ error: `Member has reached loan limit (${maxLoans})` }, { status: 400 });
  }

  const dueDate = new Date(Date.now() + durationDays * 86400000);
  const loan: Loan = {
    id: generateId(),
    bookId,
    memberId,
    borrowedAt: new Date().toISOString(),
    dueDate: dueDate.toISOString(),
    returnedAt: null,
    status: 'active',
  };

  db.loans.push(loan);
  book.availableCopies -= 1;
  member.activeLoans += 1;
  saveDB(db);

  return NextResponse.json({ ...loan, book, member }, { status: 201 });
}
