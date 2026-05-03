'use client';

import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import { deleteRecord, getRecords, getTypes } from '../../lib/storage';

const statusMap = { open: 'مفتوحة', progress: 'قيد المتابعة', closed: 'مغلقة' };
const priorityMap = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };

export default function OldPage() {
  const [records, setRecords] = useState([]);
  const [types, setTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setRecords(getRecords());
    setTypes(getTypes());
  }, []);

  const stats = useMemo(() => ({
    total: records.length,
    open: records.filter((r) => r.status === 'open').length,
    progress: records.filter((r) => r.status === 'progress').length,
    closed: records.filter((r) => r.status === 'closed').length
  }), [records]);

  const filtered = useMemo(() => records.filter((record) => {
    const haystack = [record.title, record.description, record.problem, record.solution, record.typeName, record.notes].join(' ').toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || record.typeId === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }), [records, search, typeFilter, statusFilter]);

  function handleDelete(id) {
    const next = deleteRecord(id);
    setRecords(next);
  }

  return (
    <main className="page-shell">
      <section className="app-card">
        <AppHeader
          title="Old"
          description="راجع السجلات السابقة، وابحث فيها أو احذف أي عنصر لم تعد بحاجة إليه."
          backHref="/"
        />

        <div className="app-body">
          <div className="stats-grid" style={{ marginBottom: 18 }}>
            <div className="stat-box"><small>إجمالي السجلات</small><strong>{stats.total}</strong></div>
            <div className="stat-box"><small>مفتوحة</small><strong>{stats.open}</strong></div>
            <div className="stat-box"><small>قيد المتابعة</small><strong>{stats.progress}</strong></div>
            <div className="stat-box"><small>مغلقة</small><strong>{stats.closed}</strong></div>
          </div>

          <div className="toolbar">
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالعنوان أو الوصف أو المشكلة" />
            <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">كل الأنواع</option>
              {types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="open">مفتوحة</option>
              <option value="progress">قيد المتابعة</option>
              <option value="closed">مغلقة</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>لا توجد سجلات مطابقة</h3>
              <p>ابدأ بإضافة سجل جديد من صفحة New ثم ارجع هنا لمراجعته.</p>
            </div>
          ) : (
            <div className="records-grid">
              {filtered.map((record) => (
                <article className="record-card" key={record.id}>
                  <h3>{record.title || 'بدون عنوان'}</h3>
                  <div className="record-meta">
                    <span className="badge type">{record.typeName}</span>
                    <span className={`badge ${record.status}`}>{statusMap[record.status] || 'مفتوحة'}</span>
                    <span className={`badge ${record.priority}`}>{priorityMap[record.priority] || 'متوسطة'}</span>
                  </div>
                  {record.amount ? <div><strong>المبلغ:</strong> {record.amount}</div> : null}
                  {record.description ? <div><strong>الوصف:</strong> {record.description}</div> : null}
                  {record.problem ? <div><strong>المشكلة:</strong> {record.problem}</div> : null}
                  {record.solution ? <div><strong>الحل:</strong> {record.solution}</div> : null}
                  {record.notes ? <div><strong>ملاحظات:</strong> {record.notes}</div> : null}
                  <small className="muted">{record.createdAt}</small>
                  <div className="card-actions">
                    <button className="btn btn-danger" onClick={() => handleDelete(record.id)}>حذف</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
