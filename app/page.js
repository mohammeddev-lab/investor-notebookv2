import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="center-shell">
      <section className="hero-box">
        <div className="hero-brand">مذكرة المستثمر</div>
        <h1>نظّم استثماراتك ومشاكلك في مكان واحد</h1>
        <p>
          واجهة بسيطة باللغة العربية لحفظ الاستثمارات، تدوين التحديات، ومراجعة السجلات القديمة.
          مناسبة كنسخة أولية أنيقة وسهلة العرض على العميل.
        </p>

        <div className="home-actions">
          <Link href="/new" className="big-link primary">
            <div>
              <strong>New</strong>
              <span>إضافة سجل جديد أو اختيار نوع</span>
            </div>
            <div>＋</div>
          </Link>

          <Link href="/old" className="big-link">
            <div>
              <strong>Old</strong>
              <span>مراجعة السجلات المحفوظة والبحث فيها</span>
            </div>
            <div>↶</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
