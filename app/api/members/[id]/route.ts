import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const idx = db.members.findIndex(m => m.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  db.members[idx] = { ...db.members[idx], ...body, id, joinedAt: db.members[idx].joinedAt };
  saveDB(db);
  return NextResponse.json(db.members[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const hasActive = db.loans.some(l => l.memberId === id && l.status !== 'returned');
  if (hasActive) return NextResponse.json({ error: 'Member has active loans' }, { status: 400 });
  db.members = db.members.filter(m => m.id !== id);
  saveDB(db);
  return NextResponse.json({ success: true });
}
