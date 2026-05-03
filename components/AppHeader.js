import Link from 'next/link';

export default function AppHeader({ title, description, backHref = '/', backLabel = 'رجوع' }) {
  return (
    <header className="app-header">
      <div className="header-title">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <Link href={backHref} className="back-link">{backLabel}</Link>
    </header>
  );
}
