import { NextRequest, NextResponse } from 'next/server';
import { getDB, saveDB, generateId, getRandomCoverColor, Book } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDB();
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';
  const genre = req.nextUrl.searchParams.get('genre') || '';

  let books = db.books;
  if (search) {
    books = books.filter(b =>
      b.title.toLowerCase().includes(search) ||
      b.author.toLowerCase().includes(search) ||
      b.isbn.includes(search)
    );
  }
  if (genre) {
    books = books.filter(b => b.genre === genre);
  }
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const db = getDB();
  const body = await req.json();
  const book: Book = {
    id: generateId(),
    title: body.title,
    author: body.author,
    isbn: body.isbn || '',
    genre: body.genre || 'General',
    year: Number(body.year) || new Date().getFullYear(),
    totalCopies: Number(body.totalCopies) || 1,
    availableCopies: Number(body.totalCopies) || 1,
    coverColor: getRandomCoverColor(),
    description: body.description || '',
    createdAt: new Date().toISOString(),
  };
  db.books.push(book);
  saveDB(db);
  return NextResponse.json(book, { status: 201 });
}
