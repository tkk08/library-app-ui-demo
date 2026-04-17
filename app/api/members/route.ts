import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB, generateId, Member } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDB();
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';
  let members = db.members;
  if (search) {
    members = members.filter(m =>
      m.name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search)
    );
  }
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const db = getDB();
  const body = await req.json();
  const member: Member = {
    id: generateId(),
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    membershipType: body.membershipType || 'basic',
    joinedAt: new Date().toISOString(),
    activeLoans: 0,
  };
  db.members.push(member);
  saveDB(db);
  return NextResponse.json(member, { status: 201 });
}
