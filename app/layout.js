import './globals.css';

export const metadata = {
  title: 'مذكرة المستثمر',
  description: 'دفتر إلكتروني بسيط لإدارة الاستثمارات والمشاكل'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
