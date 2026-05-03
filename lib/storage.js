export const DEFAULT_TYPES = [
  { id: 'type-1', name: 'استثمار عقاري', imageLabel: 'عقار', description: 'أراضٍ، مبانٍ، شقق، وتأجير عقاري.', imageData: '' },
  { id: 'type-2', name: 'استثمار تجاري', imageLabel: 'تجارة', description: 'محلات، توزيع، منتجات، وأنشطة بيع.', imageData: '' },
  { id: 'type-3', name: 'مشروع تقني', imageLabel: 'تقنية', description: 'تطبيقات، مواقع، أنظمة، وحلول رقمية.', imageData: '' },
  { id: 'type-4', name: 'مشكلة مالية', imageLabel: 'مالية', description: 'ديون، سيولة، خسائر، ومصاريف.', imageData: '' },
  { id: 'type-5', name: 'مشكلة إدارية', imageLabel: 'إدارة', description: 'موظفين، تنظيم، مهام، ومسؤوليات.', imageData: '' },
  { id: 'type-6', name: 'مشكلة تسويقية', imageLabel: 'تسويق', description: 'مبيعات، إعلانات، عملاء، وانتشار.', imageData: '' },
  { id: 'type-7', name: 'مشكلة قانونية', imageLabel: 'قانون', description: 'عقود، تراخيص، التزامات، ومستندات.', imageData: '' },
  { id: 'type-8', name: 'شراكة', imageLabel: 'شراكة', description: 'شركاء، اتفاقيات، نسب، ومتابعة.', imageData: '' },
  { id: 'type-9', name: 'مصروفات', imageLabel: 'مصروف', description: 'تكاليف تشغيلية ومصاريف شهرية.', imageData: '' },
  { id: 'type-10', name: 'أفكار جديدة', imageLabel: 'فكرة', description: 'أفكار، فرص، وملاحظات للتطوير.', imageData: '' }
];

export const TYPES = DEFAULT_TYPES;

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetItem(key, value) {
  if (typeof window === 'undefined') return { ok: true };
  try {
    localStorage.setItem(key, value);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function withoutImages(types) {
  return types.map((type) => ({ ...type, imageData: '' }));
}

export function getTypes() {
  if (typeof window === 'undefined') return DEFAULT_TYPES;
  const saved = localStorage.getItem('types');
  if (!saved) {
    safeSetItem('types', JSON.stringify(DEFAULT_TYPES));
    return DEFAULT_TYPES;
  }
  const parsed = safeParse(saved, DEFAULT_TYPES);
  if (!Array.isArray(parsed)) return DEFAULT_TYPES;
  if (parsed.length < 10) {
    const existing = new Set(parsed.map((item) => item.id));
    const merged = [...parsed, ...DEFAULT_TYPES.filter((item) => !existing.has(item.id))];
    saveTypes(merged);
    return merged;
  }
  return parsed;
}

export function saveTypes(types) {
  if (typeof window === 'undefined') return { ok: true };
  const result = safeSetItem('types', JSON.stringify(types));
  if (result.ok) return result;

  // If the browser storage quota is full, keep the names/descriptions and remove images.
  const fallback = withoutImages(types);
  const fallbackResult = safeSetItem('types', JSON.stringify(fallback));
  if (fallbackResult.ok) {
    return { ok: false, reason: 'quota', fallbackSaved: true };
  }

  return { ok: false, reason: 'quota', fallbackSaved: false };
}

export function updateType(updatedType) {
  const types = getTypes().map((type) => type.id === updatedType.id ? { ...type, ...updatedType } : type);
  const result = saveTypes(types);
  return { types: getTypes(), result };
}

export function getTypeById(id) {
  const types = getTypes();
  return types.find((item) => item.id === id) || types[0];
}

export function getRecords() {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem('records'), []);
}

export function saveRecords(records) {
  if (typeof window === 'undefined') return { ok: true };
  return safeSetItem('records', JSON.stringify(records));
}

export function addRecord(record) {
  const current = getRecords();
  const next = [record, ...current];
  return saveRecords(next);
}

export function deleteRecord(id) {
  const next = getRecords().filter((item) => item.id !== id);
  saveRecords(next);
  return next;
}

export function updateUsage(type) {
  if (typeof window === 'undefined') return;
  safeSetItem('lastOpenedType', JSON.stringify(type));
}

export function updateLastEdited(type) {
  if (typeof window === 'undefined') return;
  safeSetItem('lastEditedType', JSON.stringify(type));
}

export function getUsage() {
  if (typeof window === 'undefined') return { lastOpened: null, lastEdited: null };
  return {
    lastOpened: safeParse(localStorage.getItem('lastOpenedType'), null),
    lastEdited: safeParse(localStorage.getItem('lastEditedType'), null)
  };
}

export function clearTypesImages() {
  if (typeof window === 'undefined') return DEFAULT_TYPES;
  const cleaned = withoutImages(getTypes());
  safeSetItem('types', JSON.stringify(cleaned));
  return cleaned;
}
