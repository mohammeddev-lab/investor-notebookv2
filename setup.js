#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content);
  console.log(`✓ Created: ${filePath}`);
}

console.log('📦 Setting up Investor Notebook project...\n');

// Create essential directories
const dirs = [
  'app',
  'app/api',
  'app/api/types',
  'app/api/records', 
  'app/api/upload',
  'app/(pages)',
  'app/(pages)/new',
  'app/(pages)/old',
  'app/(pages)/type',
  'components',
  'lib',
  'public',
  'public/images',
  'public/images/defaults',
  'data',
];

dirs.forEach(dir => {
  const fullPath = path.join(ROOT, dir);
  ensureDir(fullPath);
});

// App globals.css
writeFile(
  path.join(ROOT, 'app/globals.css'),
  `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  direction: rtl;
  scroll-behavior: smooth;
}

body {
  background-color: #FFFAF5;
  color: #333333;
}

.notebook-card {
  @apply bg-white border border-notebook-border rounded-lg shadow-soft p-4 transition-shadow hover:shadow-soft-md;
}

.notebook-button {
  @apply px-6 py-3 bg-notebook-accent text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-soft;
}

.notebook-button-secondary {
  @apply px-6 py-3 bg-notebook-light border border-notebook-border text-notebook-text rounded-lg font-semibold hover:bg-white;
}

.notebook-input {
  @apply w-full px-4 py-2 border border-notebook-border rounded-lg focus:outline-none focus:ring-2 focus:ring-notebook-accent bg-white;
}
`
);

// App layout.tsx
writeFile(
  path.join(ROOT, 'app/layout.tsx'),
  `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مذكرة المستثمر - Investment Notebook',
  description: 'An electronic investment notebook to organize your investments and ideas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-notebook-cream min-h-screen">
        {children}
      </body>
    </html>
  )
}
`
);

// App page.tsx (Landing)
writeFile(
  path.join(ROOT, 'app/page.tsx'),
  `'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-notebook-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-notebook-accent mb-4">
          مذكرة المستثمر
        </h1>
        <p className="text-xl text-notebook-text mb-12 opacity-75">
          دفتر استثماراتك الإلكتروني
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/new"
            className="notebook-button text-2xl py-8 text-center hover:scale-105 transform transition-transform"
          >
            جديد
          </Link>
          <Link
            href="/old"
            className="notebook-button text-2xl py-8 text-center hover:scale-105 transform transition-transform"
          >
            السجلات القديمة
          </Link>
        </div>
      </div>
    </main>
  )
}
`
);

// API helpers
writeFile(
  path.join(ROOT, 'lib/db.ts'),
  `import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'notebook.db')
const db = new Database(dbPath)

db.pragma('foreign_keys = ON')

export function initializeDatabase() {
  // Types table
  db.exec(\`
    CREATE TABLE IF NOT EXISTS types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      last_opened_at DATETIME,
      last_edited_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  \`)

  // Records table
  db.exec(\`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      type_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL,
      problem TEXT,
      suggested_solution TEXT,
      status TEXT DEFAULT 'active',
      priority TEXT DEFAULT 'medium',
      date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE
    )
  \`)

  // Add demo data if empty
  const typeCount = db.prepare('SELECT COUNT(*) as count FROM types').get() as any
  if (typeCount.count === 0) {
    seedDemo()
  }
}

function seedDemo() {
  const types = [
    {
      id: 'type-1',
      name: 'عقارات',
      description: 'استثمارات عقارية وممتلكات',
      image_url: '/images/defaults/real-estate.svg',
    },
    {
      id: 'type-2',
      name: 'أسهم',
      description: 'محفظة الأسهم والأوراق المالية',
      image_url: '/images/defaults/stocks.svg',
    },
    {
      id: 'type-3',
      name: 'مشاريع تجارية',
      description: 'مشاريع وأفكار تجارية',
      image_url: '/images/defaults/business.svg',
    },
  ]

  const insertType = db.prepare(\`
    INSERT INTO types (id, name, description, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  \`)

  types.forEach(type => {
    insertType.run(type.id, type.name, type.description, type.image_url)
  })

  // Add sample records
  const insertRecord = db.prepare(\`
    INSERT INTO records (
      id, type_id, title, description, amount, problem, suggested_solution, 
      status, priority, date, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  \`)

  insertRecord.run(
    'rec-1',
    'type-1',
    'شقة للبيع بالدقي',
    'شقة 150 متر بموقع استراتيجي',
    500000,
    'تأخر في إنهاء التوثيق',
    'متابعة مع الموثق لتسريع الإجراءات',
    'active',
    'high',
    new Date().toISOString(),
    'فرصة استثمارية جيدة'
  )
}

export default db
`
);

// API route for types
writeFile(
  path.join(ROOT, 'app/api/types/route.ts'),
  `import { NextRequest, NextResponse } from 'next/server'
import db, { initializeDatabase } from '@/lib/db'
import { v4 as uuidv4 } from 'crypto'

initializeDatabase()

export async function GET() {
  try {
    const types = db.prepare('SELECT * FROM types ORDER BY updated_at DESC').all()
    return NextResponse.json({ success: true, data: types })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = 'type-' + Date.now()
    
    const stmt = db.prepare(\`
      INSERT INTO types (id, name, description, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    \`)
    
    stmt.run(id, body.name, body.description || '', body.image_url || '')
    
    const created = db.prepare('SELECT * FROM types WHERE id = ?').get(id)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create type' },
      { status: 500 }
    )
  }
}
`
);

// API route for specific type
writeFile(
  path.join(ROOT, 'app/api/types/[id]/route.ts'),
  `import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const type = db.prepare('SELECT * FROM types WHERE id = ?').get(params.id)
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: type })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch type' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const stmt = db.prepare(\`
      UPDATE types 
      SET name = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    \`)
    stmt.run(body.name, body.description || '', body.image_url || '', params.id)
    
    const updated = db.prepare('SELECT * FROM types WHERE id = ?').get(params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update type' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    db.prepare('DELETE FROM types WHERE id = ?').run(params.id)
    return NextResponse.json({ success: true, message: 'Type deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete type' },
      { status: 500 }
    )
  }
}
`
);

// Records API
writeFile(
  path.join(ROOT, 'app/api/records/route.ts'),
  `import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const typeId = request.nextUrl.searchParams.get('typeId')
    const search = request.nextUrl.searchParams.get('search')
    
    let query = 'SELECT * FROM records WHERE 1=1'
    const params: any[] = []
    
    if (typeId) {
      query += ' AND type_id = ?'
      params.push(typeId)
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)'
      params.push('%' + search + '%', '%' + search + '%')
    }
    
    query += ' ORDER BY created_at DESC'
    const stmt = db.prepare(query)
    const records = stmt.all(...params)
    
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = 'rec-' + Date.now()
    
    const stmt = db.prepare(\`
      INSERT INTO records (
        id, type_id, title, description, amount, problem, suggested_solution,
        status, priority, date, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    \`)
    
    stmt.run(
      id,
      body.type_id,
      body.title,
      body.description || '',
      body.amount || null,
      body.problem || '',
      body.suggested_solution || '',
      body.status || 'active',
      body.priority || 'medium',
      body.date || new Date().toISOString(),
      body.notes || ''
    )
    
    const created = db.prepare('SELECT * FROM records WHERE id = ?').get(id)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create record' },
      { status: 500 }
    )
  }
}
`
);

// Records update/delete
writeFile(
  path.join(ROOT, 'app/api/records/[id]/route.ts'),
  `import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = db.prepare('SELECT * FROM records WHERE id = ?').get(params.id)
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const stmt = db.prepare(\`
      UPDATE records 
      SET title = ?, description = ?, amount = ?, problem = ?, 
          suggested_solution = ?, status = ?, priority = ?, date = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    \`)
    stmt.run(
      body.title,
      body.description || '',
      body.amount || null,
      body.problem || '',
      body.suggested_solution || '',
      body.status || 'active',
      body.priority || 'medium',
      body.date || new Date().toISOString(),
      body.notes || '',
      params.id
    )
    
    const updated = db.prepare('SELECT * FROM records WHERE id = ?').get(params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    db.prepare('DELETE FROM records WHERE id = ?').run(params.id)
    return NextResponse.json({ success: true, message: 'Record deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}
`
);

console.log('\n✅ Project setup completed successfully!')
console.log('\nNext steps:')
console.log('1. npm install')
console.log('2. npm run dev')
`
);

// Execute setup
fs.mkdirSync(path.join(ROOT, 'app'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'app/api'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'app/api/types'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'app/api/records'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'components'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'lib'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public/images/defaults'), { recursive: true });

// Placeholder SVGs for default images
const svgPlaceholder = (name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f0f0f0"/>
  <text x="100" y="100" dominant-baseline="middle" text-anchor="middle" fill="#999">
    ${name}
  </text>
</svg>`;

fs.writeFileSync(path.join(ROOT, 'public/images/defaults/real-estate.svg'), svgPlaceholder('عقارات'));
fs.writeFileSync(path.join(ROOT, 'public/images/defaults/stocks.svg'), svgPlaceholder('أسهم'));
fs.writeFileSync(path.join(ROOT, 'public/images/defaults/business.svg'), svgPlaceholder('مشاريع'));

console.log('All directories and files created successfully!');
