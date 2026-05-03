'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/AppHeader';
import TypeCard from '../../components/TypeCard';
import { clearTypesImages, getRecords, getTypes, getUsage, updateType } from '../../lib/storage';

export default function NewPage() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [types, setTypes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [usage, setUsage] = useState({ lastOpened: null, lastEdited: null });
  const [recordsCount, setRecordsCount] = useState(0);
  const [editForm, setEditForm] = useState({ name: '', description: '', imageLabel: '', imageData: '' });
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadedTypes = getTypes();
    setTypes(loadedTypes);
    setSelectedId(loadedTypes[0]?.id || '');
    setUsage(getUsage());
    setRecordsCount(getRecords().length);
  }, []);

  const selectedType = useMemo(() => types.find((item) => item.id === selectedId) || types[0], [types, selectedId]);

  useEffect(() => {
    if (!selectedType) return;
    setEditForm({
      name: selectedType.name || '',
      description: selectedType.description || '',
      imageLabel: selectedType.imageLabel || '',
      imageData: selectedType.imageData || ''
    });
  }, [selectedType]);

  const stats = useMemo(() => [
    { label: 'إجمالي السجلات', value: recordsCount },
    { label: 'عدد الكروت', value: types.length || 10 },
    { label: 'آخر نوع مفتوح', value: usage.lastOpened?.name || '—' },
    { label: 'آخر نوع محفوظ', value: usage.lastEdited?.name || '—' }
  ], [usage, recordsCount, types]);

  function scrollCards(direction) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 320, behavior: 'smooth' });
  }

  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const maxSize = 520;
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.62));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrorMessage('');

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('الصورة كبيرة جدًا. اختر صورة أصغر من 3MB.');
      return;
    }

    try {
      const imageData = await resizeImage(file);
      setEditForm((old) => ({ ...old, imageData }));
    } catch {
      setErrorMessage('لم أستطع قراءة الصورة. جرّب صورة أخرى.');
    }
  }

  function saveTypeChanges() {
    if (!selectedType) return;
    const updated = {
      ...selectedType,
      name: editForm.name || selectedType.name,
      description: editForm.description,
      imageLabel: editForm.imageLabel || 'صورة',
      imageData: editForm.imageData
    };
    const { types: nextTypes, result } = updateType(updated);
    setTypes(nextTypes);
    if (!result.ok) {
      setErrorMessage('مساحة المتصفح امتلأت، لذلك تم حفظ الاسم والوصف بدون الصورة. استخدم صورة أصغر.');
    } else {
      setErrorMessage('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="page-shell">
      <section className="app-card">
        <AppHeader
          title="New"
          description="اضغط على أي كارد لتعديله، أو اضغط فتح لإضافة سجل جديد داخله."
          backHref="/"
        />

        <div className="app-body">
          <h2 className="section-title">نظرة سريعة</h2>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-box" key={stat.label}>
                <small>{stat.label}</small>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="cards-header">
            <div>
              <h2 className="section-title">كروت الأنواع</h2>
              <p className="section-note">يوجد 10 كروت في سطر واحد. استخدم الأسهم للانتقال يمين ويسار.</p>
            </div>
            <div className="scroll-actions">
              <button className="btn" onClick={() => scrollCards(1)}>يمين</button>
              <button className="btn" onClick={() => scrollCards(-1)}>يسار</button>
            </div>
          </div>

          <div className="types-scroll" ref={scrollRef}>
            {types.map((type) => (
              <TypeCard
                key={type.id}
                type={type}
                active={type.id === selectedId}
                onClick={() => setSelectedId(type.id)}
                onOpen={() => router.push(`/new/${type.id}`)}
              />
            ))}
          </div>

          {selectedType ? (
            <div className="edit-layout">
              <div className="form-card">
                <h2 className="section-title">تعديل الكارد المحدد</h2>
                <p className="section-note">عدّل اسم النوع والوصف والصورة، ثم اضغط حفظ.</p>

                <div className="form-group">
                  <label className="form-label">اسم النوع</label>
                  <input className="input" value={editForm.name} onChange={(e) => setEditForm((old) => ({ ...old, name: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">وصف النوع</label>
                  <textarea className="textarea" value={editForm.description} onChange={(e) => setEditForm((old) => ({ ...old, description: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">نص يظهر عند عدم وجود صورة</label>
                  <input className="input" value={editForm.imageLabel} onChange={(e) => setEditForm((old) => ({ ...old, imageLabel: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">إضافة صورة للكارد</label>
                  <input className="input" type="file" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div className="button-row">
                  <button className="btn btn-primary" onClick={saveTypeChanges}>حفظ تعديل الكارد</button>
                  <button className="btn" onClick={() => router.push(`/new/${selectedType.id}`)}>فتح النوع</button>
                  <button className="btn btn-danger" onClick={() => setEditForm((old) => ({ ...old, imageData: '' }))}>حذف الصورة</button>
                  {saved ? <span className="success-text">تم حفظ التعديل</span> : null}
                  {errorMessage ? <span className="error-text">{errorMessage}</span> : null}
                </div>
              </div>

              <div className="form-card">
                <h2 className="section-title">معاينة الكارد</h2>
                <TypeCard type={{ ...selectedType, ...editForm }} active compact />
                <p className="muted">الصور يتم تصغيرها تلقائيًا قبل الحفظ حتى لا تمتلئ مساحة المتصفح.</p>
                <button className="btn btn-danger" onClick={() => { const cleaned = clearTypesImages(); setTypes(cleaned); setErrorMessage('تم حذف صور الأنواع لتفريغ مساحة المتصفح.'); }}>تفريغ صور كل الكروت</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
