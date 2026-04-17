import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const book = db.books.find(b => b.id === id);
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(book);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const idx = db.books.findIndex(b => b.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const existing = db.books[idx];
  const diff = (body.totalCopies ?? existing.totalCopies) - existing.totalCopies;
  db.books[idx] = {
    ...existing,
    ...body,
    availableCopies: existing.availableCopies + diff,
    id: existing.id,
    createdAt: existing.createdAt,
  };
  saveDB(db);
  return NextResponse.json(db.books[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const hasActive = db.loans.some(l => l.bookId === id && l.status !== 'returned');
  if (hasActive) return NextResponse.json({ error: 'Book has active loans' }, { status: 400 });
  db.books = db.books.filter(b => b.id !== id);
  saveDB(db);
  return NextResponse.json({ success: true });
}
