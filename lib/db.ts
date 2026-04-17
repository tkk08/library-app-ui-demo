import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'library.json');

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
  coverColor: string;
  description: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'basic' | 'premium';
  joinedAt: string;
  activeLoans: number;
}

export interface Loan {
  id: string;
  bookId: string;
  memberId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: 'active' | 'returned' | 'overdue';
}

interface DB {
  books: Book[];
  members: Member[];
  loans: Loan[];
}

const COVER_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#2d6a4f', '#1b4332', '#3d405b', '#81171b',
  '#4a4e69', '#22223b', '#6d2b3d', '#1f4e5f'
];

const SEED_DATA: DB = {
  books: [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', genre: 'Fiction', year: 1925, totalCopies: 3, availableCopies: 2, coverColor: '#1a1a2e', description: 'A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.', createdAt: new Date().toISOString() },
    { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061935466', genre: 'Fiction', year: 1960, totalCopies: 4, availableCopies: 3, coverColor: '#2d6a4f', description: 'The story of racial injustice and the loss of innocence in the American South.', createdAt: new Date().toISOString() },
    { id: '3', title: '1984', author: 'George Orwell', isbn: '9780451524935', genre: 'Dystopian', year: 1949, totalCopies: 5, availableCopies: 4, coverColor: '#81171b', description: 'A chilling prophecy about the future with Big Brother watching every move.', createdAt: new Date().toISOString() },
    { id: '4', title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', genre: 'Sci-Fi', year: 1965, totalCopies: 3, availableCopies: 1, coverColor: '#3d405b', description: 'An epic saga set in a distant future on the desert planet Arrakis.', createdAt: new Date().toISOString() },
    { id: '5', title: 'The Hitchhiker\'s Guide', author: 'Douglas Adams', isbn: '9780345391803', genre: 'Sci-Fi', year: 1979, totalCopies: 2, availableCopies: 2, coverColor: '#533483', description: 'A humorous sci-fi comedy series following the last human on Earth.', createdAt: new Date().toISOString() },
    { id: '6', title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', genre: 'Non-Fiction', year: 2011, totalCopies: 4, availableCopies: 3, coverColor: '#1f4e5f', description: 'A brief history of humankind from the Stone Age to the modern era.', createdAt: new Date().toISOString() },
  ],
  members: [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101', membershipType: 'premium', joinedAt: '2024-01-15T00:00:00Z', activeLoans: 1 },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-0102', membershipType: 'basic', joinedAt: '2024-03-22T00:00:00Z', activeLoans: 1 },
    { id: '3', name: 'Carol White', email: 'carol@example.com', phone: '+1-555-0103', membershipType: 'premium', joinedAt: '2023-11-08T00:00:00Z', activeLoans: 0 },
  ],
  loans: [
    { id: '1', bookId: '1', memberId: '1', borrowedAt: new Date(Date.now() - 7 * 86400000).toISOString(), dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), returnedAt: null, status: 'active' },
    { id: '2', bookId: '4', memberId: '2', borrowedAt: new Date(Date.now() - 20 * 86400000).toISOString(), dueDate: new Date(Date.now() - 6 * 86400000).toISOString(), returnedAt: null, status: 'overdue' },
  ]
};

function ensureDB(): DB {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED_DATA, null, 2));
    return SEED_DATA;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveDB(data: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getDB(): DB {
  return ensureDB();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function getRandomCoverColor(): string {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}

export { saveDB };
