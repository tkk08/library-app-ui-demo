import { NextRequest, NextResponse } from 'next/server';

// Hardcoded users — replace with a DB query in production
const USERS = [
  { username: 'admin',     password: 'admin1234', name: 'Admin User',      role: 'admin'     },
  { username: 'librarian', password: 'lib1234',   name: 'Jane Librarian',  role: 'librarian' },
];

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = USERS.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid username or password.' },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ success: true, name: user.name, role: user.role });

  // Set a simple session cookie (httpOnly so JS can't read it)
  res.cookies.set('libris_session', Buffer.from(JSON.stringify({ username: user.username, name: user.name, role: user.role })).toString('base64'), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: 'lax',
  });

  return res;
}
