'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '../../../components/AppHeader';
import TypeCard from '../../../components/TypeCard';
import { addRecord, getTypes, updateLastEdited, updateUsage } from '../../../lib/storage';

const STATUS_OPTIONS = [
  { value: 'open', label: 'مفتوحة' },
  { value: 'progress', label: 'قيد المتابعة' },
  { value: 'closed', label: 'مغلقة' }
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'عالية' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'low', label: 'منخفضة' }
];

export default function DetailsPage({ params }) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    problem: '',
    solution: '',
    notes: '',
    status: 'open',
    priority: 'medium'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTypes(getTypes());
  }, []);

  const selectedType = useMemo(() => types.find((item) => item.id === params.id) || types[0], [types, params.id]);

  useEffect(() => {
    if (!selectedType) return;
    updateUsage({ id: selectedType.id, name: selectedType.name });
  }, [selectedType]);

  function scrollCards(direction) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 320, behavior: 'smooth' });
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    if (!selectedType) return;
    const record = {
      id: String(Date.now()),
      typeId: selectedType.id,
      typeName: selectedType.name,
      createdAt: new Date().toLocaleString('ar'),
      ...form
    };
    addRecord(record);
    updateLastEdited({ id: selectedType.id, name: selectedType.name });
    setSaved(true);
    setForm({ title: '', description: '', amount: '', problem: '', solution: '', notes: '', status: 'open', priority: 'medium' });
    setTimeout(() => setSaved(false), 1800);
  }

  if (!selectedType) return null;

  return (
    <main className="page-shell">
      <section className="app-card">
        <AppHeader
          title="New"
          description={`إضافة سجل جديد ضمن: ${selectedType.name}`}
          backHref="/new"
        />

        <div className="app-body">
          <div className="cards-header">
            <div>
              <h2 className="section-title">اختيار النوع</h2>
              <p className="section-note">الكروت تظهر في سطر واحد ويمكن التحريك يمين ويسار.</p>
            </div>
            <div className="scroll-actions">
              <button className="btn" onClick={() => scrollCards(1)}>يمين</button>
              <button className="btn" onClick={() => scrollCards(-1)}>يسار</button>
            </div>
          </div>

          <div className="types-scroll" ref={scrollRef}>
            {types.map((type) => (
              <TypeCard key={type.id} type={type} active={type.id === selectedType.id} onClick={() => router.push(`/new/${type.id}`)} compact />
            ))}
          </div>

          <div className="form-layout">
            <div className="form-card">
              <h2 className="section-title">تفاصيل السجل</h2>
              <p className="section-note">املأ الحقول التالية ثم اضغط حفظ.</p>

              <div className="form-group"><label className="form-label">العنوان</label><input className="input" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="مثال: مشروع عقار في جدة" /></div>
              <div className="form-group"><label className="form-label">الوصف</label><textarea className="textarea" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="وصف مختصر للاستثمار أو الحالة" /></div>
              <div className="form-group"><label className="form-label">المبلغ</label><input className="input" value={form.amount} onChange={(e) => updateField('amount', e.target.value)} placeholder="مثال: 50,000" /></div>
              <div className="form-group"><label className="form-label">المشكلة أو التحدي</label><textarea className="textarea" value={form.problem} onChange={(e) => updateField('problem', e.target.value)} placeholder="اكتب المشكلة التي ظهرت" /></div>
              <div className="form-group"><label className="form-label">الحل المقترح</label><textarea className="textarea" value={form.solution} onChange={(e) => updateField('solution', e.target.value)} placeholder="اكتب الحل أو الإجراء المطلوب" /></div>
              <div className="form-group"><label className="form-label">ملاحظات إضافية</label><textarea className="textarea" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="أي ملاحظات أخرى" /></div>

              <div className="toolbar" style={{ marginTop: 10 }}>
                <select className="select" value={form.status} onChange={(e) => updateField('status', e.target.value)}>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
                <select className="select" value={form.priority} onChange={(e) => updateField('priority', e.target.value)}>{PRIORITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
                <button className="btn" onClick={() => router.push('/old')}>عرض السجلات القديمة</button>
              </div>

              <div className="button-row">
                <button className="btn btn-primary" onClick={onSave}>حفظ السجل</button>
                <button className="btn" onClick={() => router.push('/new')}>تعديل كروت الأنواع</button>
                {saved ? <span className="success-text">تم الحفظ بنجاح</span> : null}
              </div>
            </div>

            <div className="form-card">
              <h2 className="section-title">معاينة النوع</h2>
              <div className="preview-hero preview-image-box">
                {selectedType.imageData ? <img src={selectedType.imageData} alt={selectedType.name} /> : <span>{selectedType.imageLabel}<br />{selectedType.name}</span>}
              </div>
              <p className="muted">{selectedType.description}</p>
              <button className="btn" onClick={() => router.push('/new')}>تعديل الاسم أو الصورة</button>

              <div className="note-lines"><div></div><div></div><div></div><div></div><div></div></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
