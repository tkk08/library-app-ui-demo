import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const loan = db.loans.find(l => l.id === id);
  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
  if (loan.status === 'returned') return NextResponse.json({ error: 'Already returned' }, { status: 400 });

  loan.returnedAt = new Date().toISOString();
  loan.status = 'returned';

  const book = db.books.find(b => b.id === loan.bookId);
  if (book) book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);

  const member = db.members.find(m => m.id === loan.memberId);
  if (member) member.activeLoans = Math.max(0, member.activeLoans - 1);

  saveDB(db);
  return NextResponse.json({ ...loan, book, member });
}
