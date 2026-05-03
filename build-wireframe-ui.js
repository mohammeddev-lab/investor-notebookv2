#!/usr/bin/env node

/**
 * Build Wireframe-Matched UI
 * Converts wireframes into working pages
 */

const fs = require('fs');
const path = require('path');

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function write(file, content) {
  mkdir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf-8');
}

const ROOT = process.cwd();

console.log('🎨 Building Wireframe-Matched UI...\n');

// Create directories
['app', 'app/api', 'app/api/types', 'app/api/records', 'components', 'lib', 'public/images/defaults', 'data'].forEach(dir => mkdir(path.join(ROOT, dir)));

// ============================================================================
// GLOBAL STYLES
// ============================================================================
write(path.join(ROOT, 'app/globals.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  direction: rtl;
  scroll-behavior: smooth;
}

body {
  background-color: #fafafa;
  color: #333;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Wireframe Style - Minimal Borders */
.wireframe-box {
  @apply border border-gray-300 bg-white;
}

.wireframe-card {
  @apply border border-gray-300 bg-white rounded-sm;
}

.wireframe-input {
  @apply w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-right;
}

.wireframe-button {
  @apply px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer font-medium;
}

.header-bar {
  @apply border-b border-gray-300 py-3 px-4 text-center font-semibold text-lg mb-4;
}

.sidebar-box {
  @apply w-12 h-20 border border-gray-300 bg-white;
}

.type-card {
  @apply flex-1 h-20 border border-gray-300 bg-white mx-2;
}

.type-card.selected {
  @apply border-2 border-gray-400;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 bg-white my-2 text-right;
}

.notes-section {
  @apply space-y-2 mt-4 text-gray-600 text-sm;
}

.notes-line {
  @apply border-b border-gray-300 h-6;
}

.helper-text {
  @apply text-xs text-blue-500 mt-4 px-4 text-right;
}
`);

// ============================================================================
// LAYOUT
// ============================================================================
write(path.join(ROOT, 'app/layout.tsx'), `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مذكرة المستثمر',
  description: 'دفتر الاستثمارات الرقمي',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-right">
        {children}
      </body>
    </html>
  )
}
`);

// ============================================================================
// LANDING PAGE
// ============================================================================
write(path.join(ROOT, 'app/page.tsx'), `'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="border-2 border-gray-300 p-8 w-full max-w-sm">
        <div className="space-y-4">
          <Link
            href="/new"
            className="block w-full py-4 border-2 border-gray-300 bg-white text-center font-semibold hover:bg-gray-50 text-lg"
          >
            جديد
          </Link>
          <Link
            href="/old"
            className="block w-full py-4 border-2 border-gray-300 bg-white text-center font-semibold hover:bg-gray-50 text-lg"
          >
            القديم
          </Link>
        </div>
      </div>
    </main>
  )
}
`);

// ============================================================================
// NEW PAGE - TYPE SELECTION
// ============================================================================
write(path.join(ROOT, 'app/new/page.tsx'), `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Type {
  id: string
  name: string
  image_url?: string
}

export default function NewPage() {
  const [types, setTypes] = useState<Type[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)

  useEffect(() => {
    // Initialize with demo types
    const demoTypes: Type[] = [
      { id: 'type-1', name: 'عقارات', image_url: '🏠' },
      { id: 'type-2', name: 'أسهم', image_url: '📈' },
      { id: 'type-3', name: 'مشاريع', image_url: '💼' },
    ]
    setTypes(demoTypes)
  }, [])

  return (
    <main className="min-h-screen bg-white p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="header-bar border-b border-gray-300">جديد</div>

      {/* Type Cards Row */}
      <div className="flex gap-0 mb-6 h-20">
        {/* Sidebar */}
        <div className="sidebar-box" />
        
        {/* Type Cards */}
        {types.map((type) => (
          <Link
            key={type.id}
            href={\`/new/\${type.id}\`}
            className={\`flex-1 border border-gray-300 bg-white mx-1 p-2 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition \${selectedType === type.id ? 'border-2 border-gray-400' : ''}\`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className="text-2xl">{type.image_url}</div>
            <div className="text-xs mt-1 text-center">{type.name}</div>
          </Link>
        ))}
      </div>

      {/* Last Opened Section */}
      <div className="mb-6">
        <div className="text-sm font-medium mb-2 text-right">آخر نوع تم فتحه</div>
        <div className="border border-gray-300 bg-white h-32" />
      </div>

      {/* Last Edited Section */}
      <div className="mb-6">
        <div className="text-sm font-medium mb-2 text-right">آخر نوع تم تعديله</div>
        <div className="border border-gray-300 bg-white h-32" />
      </div>

      {selectedType && (
        <div className="text-center mt-8">
          <Link
            href={\`/new/\${selectedType}\`}
            className="inline-block px-6 py-2 border border-gray-300 bg-white hover:bg-gray-50"
          >
            فتح النوع
          </Link>
        </div>
      )}
    </main>
  )
}
`);

// ============================================================================
// NEW DETAILS PAGE
// ============================================================================
write(path.join(ROOT, 'app/new/[id]/page.tsx'), `'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DetailPageProps {
  params: { id: string }
}

export default function DetailPage({ params }: DetailPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    problem: '',
    solution: '',
  })
  const [notes, setNotes] = useState('')

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const typeIcons: Record<string, string> = {
    'type-1': '🏠',
    'type-2': '📈',
    'type-3': '💼',
  }

  const typeNames: Record<string, string> = {
    'type-1': 'عقارات',
    'type-2': 'أسهم',
    'type-3': 'مشاريع',
  }

  return (
    <main className="min-h-screen bg-white p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between header-bar border-b border-gray-300">
        <Link href="/new" className="text-blue-500 text-sm hover:underline">← رجوع</Link>
        <span>جديد</span>
        <div />
      </div>

      {/* Type Cards Row */}
      <div className="flex gap-0 mb-6 h-20">
        {/* Sidebar */}
        <div className="sidebar-box" />
        
        {/* Type Cards */}
        {['type-1', 'type-2', 'type-3'].map((typeId) => (
          <div
            key={typeId}
            className={\`flex-1 border border-gray-300 bg-white mx-1 p-2 flex flex-col items-center justify-center \${params.id === typeId ? 'border-2 border-gray-400' : ''}\`}
          >
            <div className="text-2xl">{typeIcons[typeId]}</div>
            <div className="text-xs mt-1">{typeNames[typeId]}</div>
          </div>
        ))}

        {/* Image Box - Right side */}
        <div className="w-40 border-2 border-gray-300 bg-white ml-2 flex items-center justify-center">
          <div className="text-6xl">{typeIcons[params.id]}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {/* Title Input */}
        <input
          type="text"
          placeholder="العنوان"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="wireframe-input mb-3 h-10"
        />

        {/* Description Input */}
        <input
          type="text"
          placeholder="الوصف"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="wireframe-input mb-3 h-10"
        />

        {/* Amount Input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="المبلغ"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="wireframe-input h-10"
          />
          <div className="absolute left-3 top-2 text-gray-400">△</div>
        </div>

        {/* Problem Input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="المشكلة"
            value={formData.problem}
            onChange={(e) => handleChange('problem', e.target.value)}
            className="wireframe-input h-10"
          />
          <div className="absolute left-3 top-2 text-gray-400">△</div>
        </div>

        {/* Solution Input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="الحل"
            value={formData.solution}
            onChange={(e) => handleChange('solution', e.target.value)}
            className="wireframe-input h-10"
          />
          <div className="absolute left-3 top-2 text-gray-400">△</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6 mt-4">
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1 hover:bg-gray-50">
            <span className="text-lg">+</span>
            <span className="text-sm">تعديل</span>
          </button>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <div className="notes-line"></div>
          <div className="notes-line"></div>
          <div className="notes-line"></div>
        </div>

        {/* Helper Text */}
        <div className="helper-text">
          عند حفظ البيانات سيتم تخزين المعلومات بشكل آمن
        </div>

        {/* Save Button */}
        <div className="mt-6 flex gap-4">
          <button className="flex-1 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium">
            حفظ
          </button>
          <button className="flex-1 py-2 border border-gray-300 bg-white hover:bg-gray-50 font-medium">
            إلغاء
          </button>
        </div>
      </div>
    </main>
  )
}
`);

// ============================================================================
// OLD PAGE
// ============================================================================
write(path.join(ROOT, 'app/old/page.tsx'), `'use client'

import Link from 'next/link'

interface Record {
  id: string
  title: string
  type: string
  date: string
}

export default function OldPage() {
  const records: Record[] = [
    { id: '1', title: 'استثمار عقاري', type: 'عقارات', date: '2024-01-15' },
    { id: '2', title: 'محفظة أسهم', type: 'أسهم', date: '2024-01-10' },
  ]

  return (
    <main className="min-h-screen bg-white p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between header-bar border-b border-gray-300">
        <Link href="/" className="text-blue-500 text-sm hover:underline">← رجوع</Link>
        <span>السجلات القديمة</span>
        <div />
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد سجلات
          </div>
        ) : (
          records.map(record => (
            <div
              key={record.id}
              className="border border-gray-300 bg-white p-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{record.date}</span>
                <span className="text-sm text-gray-500">{record.type}</span>
                <span className="font-medium">{record.title}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Button */}
      <div className="mt-6">
        <Link
          href="/new"
          className="block w-full py-3 border border-gray-300 bg-white text-center hover:bg-gray-50 font-medium"
        >
          + إضافة جديد
        </Link>
      </div>
    </main>
  )
}
`);

// ============================================================================
// COMPONENTS
// ============================================================================
write(path.join(ROOT, 'components/Navigation.tsx'), `'use client'

import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="border-b border-gray-300 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 justify-end">
        <Link href="/" className="text-sm hover:text-blue-500">الرئيسية</Link>
      </div>
    </nav>
  )
}
`);

// ============================================================================
// DATABASE
// ============================================================================
write(path.join(ROOT, 'lib/db.ts'), `import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(path.join(dataDir, 'notebook.db'))
db.pragma('foreign_keys = ON')

export function initializeDatabase() {
  db.exec(\`
    CREATE TABLE IF NOT EXISTS types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      type_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL,
      problem TEXT,
      solution TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE
    );
  \`)

  try {
    const count = (db.prepare('SELECT COUNT(*) as c FROM types').get() as any).c
    if (count === 0) {
      const ins = db.prepare('INSERT INTO types (id, name, image_url) VALUES (?, ?, ?)')
      ins.run('type-1', 'عقارات', '🏠')
      ins.run('type-2', 'أسهم', '📈')
      ins.run('type-3', 'مشاريع', '💼')
    }
  } catch (e) {}
}

export default db
`);

// ============================================================================
// API ROUTES
// ============================================================================
write(path.join(ROOT, 'app/api/types/route.ts'), `import { NextResponse } from 'next/server'
import db, { initializeDatabase } from '@/lib/db'

initializeDatabase()

export async function GET() {
  try {
    const types = db.prepare('SELECT * FROM types').all()
    return NextResponse.json({ success: true, data: types })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
`);

write(path.join(ROOT, 'app/api/records/route.ts'), `import { NextResponse, NextRequest } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const typeId = request.nextUrl.searchParams.get('typeId')
    let query = 'SELECT * FROM records'
    if (typeId) query += ' WHERE type_id = ?'
    const records = db.prepare(query).all(typeId || undefined)
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = 'rec-' + Date.now()
    db.prepare(\`INSERT INTO records (id, type_id, title, description, amount, problem, solution, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)\`)
      .run(id, body.type_id, body.title, body.description, body.amount, body.problem, body.solution, body.notes)
    return NextResponse.json({ success: true, data: { id } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
`);

console.log('✅ Wireframe UI built successfully!\n');
console.log('Run these commands:');
console.log('  npm install');
console.log('  npm run dev\n');
`);

module.exports = {};
