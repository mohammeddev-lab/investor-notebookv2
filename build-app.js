#!/usr/bin/env node
/**
 * Investor Notebook - Complete Project Setup
 */

const fs = require('fs');
const path = require('path');

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function write(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
}

const ROOT = process.cwd();

console.log('\n📦 Setting up مذكرة المستثمر...\n');

// ============================================================================
// COMPONENTS
// ============================================================================
write(`${ROOT}/components/Header.tsx`, `'use client'

import Link from 'next/link'

interface HeaderProps {
  title: string
  showBack?: boolean
  backHref?: string
}

export function Header({ title, showBack = false, backHref = '/' }: HeaderProps) {
  return (
    <header className="bg-white border-b border-notebook-border shadow-soft sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {showBack && (
          <Link href={backHref} className="text-notebook-accent hover:opacity-75 font-semibold">
            ← رجوع
          </Link>
        )}
        <h1 className="text-3xl font-bold text-notebook-accent">{title}</h1>
        <div className="w-20" />
      </div>
    </header>
  )
}
`);

write(`${ROOT}/components/TypeCard.tsx`, `'use client'

interface TypeCardProps {
  id: string
  name: string
  description: string
  image_url: string
}

export function TypeCard({ id, name, description, image_url }: TypeCardProps) {
  return (
    <div className="notebook-card flex flex-col h-full">
      <div className="w-full h-48 bg-gradient-to-br from-notebook-light to-notebook-border rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        {image_url ? (
          <img src={image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl opacity-50">📓</div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-notebook-text mb-2">{name}</h3>
      <p className="text-notebook-text opacity-75 text-sm mb-4 flex-grow">{description}</p>
    </div>
  )
}
`);

write(`${ROOT}/components/RecordCard.tsx`, `'use client'

interface RecordCardProps {
  record: any
  onEdit: (record: any) => void
  onDelete: (id: string) => void
}

export function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  return (
    <div className="notebook-card">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-notebook-text flex-grow">{record.title}</h4>
        <div className="flex gap-2">
          <button onClick={() => onEdit(record)} className="text-blue-500 hover:text-blue-700">
            تعديل
          </button>
          <button onClick={() => onDelete(record.id)} className="text-red-500 hover:text-red-700">
            حذف
          </button>
        </div>
      </div>
      <p className="text-sm text-notebook-text opacity-75 mb-3">{record.description}</p>
      <div className="flex gap-4 mb-3 text-sm">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{record.status}</span>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">{record.priority}</span>
        {record.amount && <span className="font-semibold">{record.amount}</span>}
      </div>
    </div>
  )
}
`);

// ============================================================================
// LIB FILES
// ============================================================================
write(`${ROOT}/lib/db.ts`, `import Database from 'better-sqlite3'
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
    );
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
    );
  \`)

  try {
    const count = (db.prepare('SELECT COUNT(*) as c FROM types').get() as any).c
    if (count === 0) seedData()
  } catch (e) {
    seedData()
  }
}

function seedData() {
  const types = [
    { id: 'type-1', name: 'عقارات', description: 'استثمارات عقارية', image_url: '/images/defaults/real-estate.svg' },
    { id: 'type-2', name: 'أسهم', description: 'محفظة الأسهم', image_url: '/images/defaults/stocks.svg' },
    { id: 'type-3', name: 'مشاريع', description: 'أفكار تجارية', image_url: '/images/defaults/business.svg' },
  ]
  
  const ins = db.prepare('INSERT INTO types VALUES (?, ?, ?, ?, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
  types.forEach(t => ins.run(t.id, t.name, t.description, t.image_url))
  
  const rec = db.prepare('INSERT INTO records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
  rec.run('rec-1', 'type-1', 'شقة بالدقي', 'شقة 150 متر', 500000, 'التوثيق', 'متابعة مع الموثق', 'active', 'high', new Date().toISOString(), 'فرصة جيدة')
}

export default db
`);

// ============================================================================
// API ROUTES
// ============================================================================
write(`${ROOT}/app/api/types/route.ts`, `import { NextRequest, NextResponse } from 'next/server'
import db, { initializeDatabase } from '@/lib/db'

initializeDatabase()

export async function GET() {
  try {
    const types = db.prepare('SELECT * FROM types ORDER BY updated_at DESC').all()
    return NextResponse.json({ success: true, data: types })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = 'type-' + Date.now()
    db.prepare('INSERT INTO types (id, name, description, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
      .run(id, body.name, body.description || '', body.image_url || '')
    const created = db.prepare('SELECT * FROM types WHERE id = ?').get(id)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
`);

write(`${ROOT}/app/api/types/[id]/route.ts`, `import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const type = db.prepare('SELECT * FROM types WHERE id = ?').get(params.id)
    if (!type) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    db.prepare('UPDATE types SET last_opened_at = CURRENT_TIMESTAMP WHERE id = ?').run(params.id)
    return NextResponse.json({ success: true, data: type })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    db.prepare('UPDATE types SET name = ?, description = ?, image_url = ?, last_edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(body.name, body.description || '', body.image_url || '', params.id)
    const updated = db.prepare('SELECT * FROM types WHERE id = ?').get(params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    db.prepare('DELETE FROM types WHERE id = ?').run(params.id)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
`);

write(`${ROOT}/app/api/records/route.ts`, `import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const typeId = request.nextUrl.searchParams.get('typeId')
    const search = request.nextUrl.searchParams.get('search')
    const status = request.nextUrl.searchParams.get('status')
    
    let query = 'SELECT * FROM records WHERE 1=1'
    const params: any[] = []
    
    if (typeId) { query += ' AND type_id = ?'; params.push(typeId) }
    if (status) { query += ' AND status = ?'; params.push(status) }
    if (search) { query += ' AND (title LIKE ? OR description LIKE ?)'; params.push('%' + search + '%', '%' + search + '%') }
    
    query += ' ORDER BY created_at DESC'
    const records = db.prepare(query).all(...params)
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = 'rec-' + Date.now()
    db.prepare('INSERT INTO records (id, type_id, title, description, amount, problem, suggested_solution, status, priority, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
      .run(id, body.type_id, body.title, body.description || '', body.amount || null, body.problem || '', body.suggested_solution || '', body.status || 'active', body.priority || 'medium', body.date || new Date().toISOString(), body.notes || '')
    const created = db.prepare('SELECT * FROM records WHERE id = ?').get(id)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
`);

write(`${ROOT}/app/api/records/[id]/route.ts`, `import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const record = db.prepare('SELECT * FROM records WHERE id = ?').get(params.id)
    if (!record) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    db.prepare('UPDATE records SET title = ?, description = ?, amount = ?, problem = ?, suggested_solution = ?, status = ?, priority = ?, date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(body.title, body.description || '', body.amount || null, body.problem || '', body.suggested_solution || '', body.status || 'active', body.priority || 'medium', body.date || new Date().toISOString(), body.notes || '', params.id)
    const updated = db.prepare('SELECT * FROM records WHERE id = ?').get(params.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    db.prepare('DELETE FROM records WHERE id = ?').run(params.id)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}
`);

// ============================================================================
// APP FILES
// ============================================================================
write(`${ROOT}/app/globals.css`, `@tailwind base;
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
  @apply bg-white border border-notebook-border rounded-lg shadow-soft p-4 transition-all hover:shadow-soft-md;
}

.notebook-button {
  @apply px-6 py-3 bg-notebook-accent text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-soft cursor-pointer;
}

.notebook-button-secondary {
  @apply px-6 py-3 bg-notebook-light border border-notebook-border text-notebook-text rounded-lg font-semibold hover:bg-white transition-all cursor-pointer;
}

.notebook-button-danger {
  @apply px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all cursor-pointer;
}

.notebook-input {
  @apply w-full px-4 py-2 border border-notebook-border rounded-lg focus:outline-none focus:ring-2 focus:ring-notebook-accent bg-white text-right;
}

.notebook-textarea {
  @apply w-full px-4 py-2 border border-notebook-border rounded-lg focus:outline-none focus:ring-2 focus:ring-notebook-accent bg-white resize-vertical text-right;
}

.notebook-select {
  @apply w-full px-4 py-2 border border-notebook-border rounded-lg focus:outline-none focus:ring-2 focus:ring-notebook-accent bg-white;
}

.form-group { @apply mb-4; }
.form-label { @apply block text-sm font-semibold text-notebook-text mb-2; }
.grid-auto { @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6; }
`);

write(`${ROOT}/app/layout.tsx`, `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مذكرة المستثمر',
  description: 'دفتر استثماراتك الإلكتروني',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-notebook-cream min-h-screen text-right">
        {children}
      </body>
    </html>
  )
}
`);

write(`${ROOT}/app/page.tsx`, `'use client'

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
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
`);

// ============================================================================
// PAGE COMPONENTS
// ============================================================================
write(`${ROOT}/app/(pages)/new/page.tsx`, `'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { TypeCard } from '@/components/TypeCard'

interface Type {
  id: string
  name: string
  description: string
  image_url: string
}

export default function NewPage() {
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', image_url: '' })

  useEffect(() => {
    fetch('/api/types')
      .then(r => r.json())
      .then(j => j.success && setTypes(j.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const json = await res.json()
    if (json.success) {
      setTypes([...types, json.data])
      setForm({ name: '', description: '', image_url: '' })
      setShowForm(false)
    }
  }

  return (
    <>
      <Header title="جديد" showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => setShowForm(!showForm)} className="notebook-button mb-8">
          + إضافة نوع جديد
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="notebook-card max-w-2xl mx-auto mb-8 p-6">
            <h3 className="text-2xl font-semibold mb-4">إضافة نوع جديد</h3>
            <div className="form-group">
              <label className="form-label">الاسم</label>
              <input type="text" required className="notebook-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: عقارات" />
            </div>
            <div className="form-group">
              <label className="form-label">الوصف</label>
              <textarea className="notebook-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف موجز" />
            </div>
            <div className="form-group">
              <label className="form-label">رابط الصورة</label>
              <input type="url" className="notebook-input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="notebook-button flex-1">حفظ</button>
              <button type="button" onClick={() => setShowForm(false)} className="notebook-button-secondary flex-1">إلغاء</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-center text-notebook-text opacity-75">جاري التحميل...</p>
        ) : (
          <div className="grid-auto">
            {types.map((type) => (
              <Link key={type.id} href={`/type/${type.id}`}>
                <TypeCard {...type} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
`);

write(`${ROOT}/app/(pages)/old/page.tsx`, `'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { RecordCard } from '@/components/RecordCard'

export default function OldPage() {
  const [records, setRecords] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/types').then(r => r.json()),
      fetch('/api/records').then(r => r.json()),
    ]).then(([typesRes, recordsRes]) => {
      if (typesRes.success) setTypes(typesRes.data)
      if (recordsRes.success) setRecords(recordsRes.data)
      setLoading(false)
    })
  }, [])

  const filtered = records.filter(r => {
    if (typeFilter && r.type_id !== typeFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (search && !r.title.includes(search) && !r.description.includes(search)) return false
    return true
  })

  async function handleDelete(id: string) {
    if (confirm('هل أنت متأكد؟')) {
      await fetch(`/api/records/${id}`, { method: 'DELETE' })
      setRecords(records.filter(r => r.id !== id))
    }
  }

  return (
    <>
      <Header title="السجلات القديمة" showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="notebook-input"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="notebook-select">
              <option value="">جميع الأنواع</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="notebook-select">
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-notebook-text opacity-75">لا توجد سجلات</p>
        ) : (
          <div className="space-y-4">
            {filtered.map(record => (
              <RecordCard key={record.id} record={record} onEdit={() => {}} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
`);

write(`${ROOT}/app/(pages)/type/[id]/page.tsx`, `'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { RecordCard } from '@/components/RecordCard'

export default function TypePage({ params }: { params: { id: string } }) {
  const [type, setType] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    problem: '',
    suggested_solution: '',
    status: 'active',
    priority: 'medium',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    Promise.all([
      fetch(\`/api/types/\${params.id}\`).then(r => r.json()),
      fetch(\`/api/records?typeId=\${params.id}\`).then(r => r.json()),
    ]).then(([typeRes, recordsRes]) => {
      if (typeRes.success) setType(typeRes.data)
      if (recordsRes.success) setRecords(recordsRes.data)
      setLoading(false)
    })
  }, [params.id])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type_id: params.id, amount: form.amount ? parseFloat(form.amount) : null }),
    })
    const json = await res.json()
    if (json.success) {
      setRecords([json.data, ...records])
      setForm({ title: '', description: '', amount: '', problem: '', suggested_solution: '', status: 'active', priority: 'medium', date: new Date().toISOString().split('T')[0], notes: '' })
      setShowForm(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('حذف هذا السجل؟')) {
      await fetch(\`/api/records/\${id}\`, { method: 'DELETE' })
      setRecords(records.filter(r => r.id !== id))
    }
  }

  if (loading) return <><Header title="جاري التحميل..." showBack /></>
  if (!type) return <><Header title="نوع غير موجود" showBack /></>

  return (
    <>
      <Header title={type.name} showBack />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => setShowForm(!showForm)} className="notebook-button mb-8">
          + إضافة سجل جديد
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="notebook-card max-w-2xl mx-auto mb-8 p-6">
            <h3 className="text-2xl font-semibold mb-4">إضافة سجل جديد</h3>
            <div className="form-group">
              <label className="form-label">العنوان</label>
              <input type="text" required className="notebook-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">الوصف</label>
              <textarea className="notebook-textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">المبلغ</label>
                <input type="number" className="notebook-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">التاريخ</label>
                <input type="date" className="notebook-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">المشكلة</label>
              <textarea className="notebook-textarea" rows={2} value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">الحل المقترح</label>
              <textarea className="notebook-textarea" rows={2} value={form.suggested_solution} onChange={(e) => setForm({ ...form, suggested_solution: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select className="notebook-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="completed">مكتمل</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الأولوية</label>
                <select className="notebook-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea className="notebook-textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="notebook-button flex-1">حفظ</button>
              <button type="button" onClick={() => setShowForm(false)} className="notebook-button-secondary flex-1">إلغاء</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {records.length === 0 ? (
            <p className="text-center text-notebook-text opacity-75">لا توجد سجلات في هذا النوع</p>
          ) : (
            records.map(record => (
              <RecordCard key={record.id} record={record} onEdit={() => {}} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>
    </>
  )
}
`);

// ============================================================================
// STATIC IMAGES
// ============================================================================
const svgTemplate = (label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B7355;stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:#8B7355;stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#grad)" stroke="#E8E6E1" stroke-width="2"/>
  <text x="100" y="100" font-family="Arial, sans-serif" font-size="18" font-weight="bold" dominant-baseline="middle" text-anchor="middle" fill="#8B7355">
    ${label}
  </text>
</svg>`;

mkdirp(`${ROOT}/public/images/defaults`);
fs.writeFileSync(`${ROOT}/public/images/defaults/real-estate.svg`, svgTemplate('عقارات'));
fs.writeFileSync(`${ROOT}/public/images/defaults/stocks.svg`, svgTemplate('أسهم'));
fs.writeFileSync(`${ROOT}/public/images/defaults/business.svg`, svgTemplate('مشاريع'));
console.log('✓ public/images/defaults/*.svg');

console.log('\n✅ Setup complete!');
console.log('\n📋 Next steps:');
console.log('   npm install');
console.log('   npm run dev');
console.log('   Open http://localhost:3000\n');
`);

console.log('✓ Complete setup script created!');
console.log('\nRun: node build-app.js\n');
