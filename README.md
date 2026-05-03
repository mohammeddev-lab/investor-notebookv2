# مذكرة المستثمر - Investment Notebook

A complete full-stack RTL Arabic web application for organizing investments, problems, notes, and categories/types. Built with Next.js, React, Tailwind CSS, and SQLite.

## ✨ Features

- 📔 **Digital Investment Notebook** - Clean, elegant interface inspired by traditional notebooks
- 🏷️ **Custom Categories** - Create unlimited investment types/categories
- 📝 **Detailed Records** - Rich record management with 9+ fields
- 🔍 **Smart Search** - Full-text search across all records
- 🎛️ **Advanced Filters** - Filter by type, status, priority
- 🖼️ **Image Support** - Add images to each investment type
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop
- 🌐 **RTL Arabic** - Complete right-to-left support
- 💾 **Local Database** - SQLite for fast, reliable data storage
- 📊 **Demo Data** - Pre-loaded sample data for testing

## 🚀 Quick Start

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Build the complete app (creates all files)
node build-app.js

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

That's it! The app will be ready to use with demo data included.

## 📋 What Gets Created

Running `node build-app.js` generates:
- ✅ Full Next.js app structure
- ✅ React components (Header, TypeCard, RecordCard)
- ✅ API routes (Types & Records endpoints)
- ✅ Page components (Landing, New, Old, Type Details)
- ✅ Database schema & initialization
- ✅ Sample data (3 types + 1 demo record)
- ✅ Tailwind CSS styles
- ✅ Default SVG images

## 🎯 Pages & Functionality

### 🏠 Landing Page (`/`)
Two main buttons for navigation:
- **جديد** (New) - Browse and manage investment types
- **السجلات القديمة** (Old) - View all records with search/filter

### ➕ New Page (`/new`)
- Grid display of all investment types
- Stats showing last opened and edited types
- Button to create new investment type
- Click any type card to open details

### 📂 Type Details Page (`/type/[id]`)
View and manage records for a specific type:
- Add new records with comprehensive form
- View all records for the type
- Edit and delete record buttons
- Record fields: Title, Description, Amount, Problem, Solution, Status, Priority, Date, Notes

### 📚 Old Page (`/old`)
Browse all records across all types:
- **Search Bar** - Full-text search in title/description
- **Type Filter** - Filter records by investment type
- **Status Filter** - Filter by record status
- **Record Cards** - Display with edit/delete actions

## 🗄️ Database

### Types Table
Stores investment categories with:
- Name, Description, Image URL
- Last opened/edited timestamps
- Auto-generated ID and timestamps

### Records Table
Stores investment records with:
- Title, Description (required)
- Amount, Date, Problem, Suggested Solution
- Status (active/inactive/completed)
- Priority (low/medium/high)
- Notes, Timestamps

**Auto-seeding:** 3 demo types (Real Estate, Stocks, Business) + 1 sample record

## 🔌 API Endpoints

### Types
```
GET    /api/types              → List all types
POST   /api/types              → Create new type
GET    /api/types/[id]         → Get type details
PUT    /api/types/[id]         → Update type
DELETE /api/types/[id]         → Delete type
```

### Records
```
GET    /api/records            → List all records (with filters)
GET    /api/records?typeId=... → Filter by type
GET    /api/records?search=... → Search records
GET    /api/records?status=... → Filter by status
POST   /api/records            → Create new record
GET    /api/records/[id]       → Get record details
PUT    /api/records/[id]       → Update record
DELETE /api/records/[id]       → Delete record
```

## 🎨 Design System

| Element | Color | Purpose |
|---------|-------|---------|
| Background | #FFFAF5 | Cream notebook color |
| Cards | #FFFFFF | White content areas |
| Borders | #E8E6E1 | Soft, subtle borders |
| Text | #333333 | Dark, readable text |
| Accent | #8B7355 | Brown for buttons/links |

## 📁 Project Structure

```
investor-notebook/
├── app/
│   ├── api/
│   │   ├── types/[id]/route.ts      # Type endpoints
│   │   ├── types/route.ts           # Types CRUD
│   │   ├── records/[id]/route.ts    # Record endpoints
│   │   └── records/route.ts         # Records CRUD
│   ├── (pages)/
│   │   ├── new/page.tsx             # Types page
│   │   ├── old/page.tsx             # Records page
│   │   └── type/[id]/page.tsx       # Type details
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Landing page
├── components/
│   ├── Header.tsx                   # Page header
│   ├── TypeCard.tsx                 # Type display card
│   └── RecordCard.tsx               # Record display card
├── lib/
│   └── db.ts                        # Database setup
├── public/
│   └── images/defaults/             # SVG icons
├── data/                            # SQLite database (created at runtime)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── build-app.js                     # Auto-setup script
└── README.md
```

## 🛠️ Scripts

```bash
npm run dev         # Start development server (port 3000)
npm run build       # Create production build
npm start           # Run production server
npm run lint        # Run ESLint
```

## 🌐 RTL Arabic Support

✅ Full right-to-left implementation:
- HTML `dir="rtl"` attribute
- Right-aligned text and inputs
- Proper spacing and margins for RTL
- Arabic font support
- Arabic number formatting

## 📦 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 14.0+ |
| UI Library | React | 18.2+ |
| Styling | Tailwind CSS | 3.4+ |
| Database | SQLite | 3.x |
| ORM | better-sqlite3 | 9.0+ |
| Language | TypeScript/JavaScript | Latest |

## 🚀 Deployment

### Vercel (Recommended)
```bash
npx vercel
```

### Docker
```bash
docker build -t notebook .
docker run -p 3000:3000 notebook
```

### Traditional Server
```bash
npm install
npm run build
npm start
```

## 💡 Sample Data

Includes 3 demo types:
1. **عقارات** (Real Estate) - with 1 sample property record
2. **أسهم** (Stocks) - empty, ready for entries
3. **مشاريع تجارية** (Business Projects) - empty, ready for entries

## 🔄 Workflow

1. **Landing:** Choose "جديد" to browse types or "السجلات القديمة" for all records
2. **Create Type:** Click "+ إضافة نوع جديد" to create new investment category
3. **Add Record:** Open a type and click "+ إضافة سجل جديد" to add investment details
4. **Manage:** Edit, delete, search, and filter records anytime
5. **Track:** View last opened/edited types on the New page

## ⚙️ Configuration

No complex setup needed! The app automatically:
- Creates SQLite database on first run
- Seeds demo data if database is empty
- Initializes all tables with proper schema
- Generates default SVG images

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found" | Run: `npm install` then `node build-app.js` |
| Port 3000 in use | Run: `npm run dev -- -p 3001` |
| Database errors | Delete `data/notebook.db` and restart |
| Build fails | Clear `node_modules` and `.next`, reinstall |

## 🎓 Learning Resources

This project demonstrates:
- Next.js 14 App Router
- React Hooks (useState, useEffect)
- TypeScript in React
- Tailwind CSS styling
- SQLite database integration
- REST API design
- RTL web design
- File-based routing
- Component composition

## 📈 Future Enhancements

- [ ] User authentication
- [ ] Cloud image storage
- [ ] PDF export
- [ ] Data backup & sync
- [ ] Dark mode
- [ ] Real-time collaboration
- [ ] Mobile app
- [ ] Advanced analytics

## 📜 License

MIT - Free to use and modify

## 🤝 Support

- 📖 See `COMPLETE_GUIDE.md` for detailed documentation
- 💬 Check GitHub issues for common questions
- 🐛 Report bugs with clear reproduction steps

---

## Quick Reference

```bash
# Complete setup (recommended first time)
npm install && node build-app.js

# Development
npm run dev           # http://localhost:3000

# Production
npm run build && npm start

# Check structure
ls -la app/api/types/
ls -la components/
```

---

**مذكرة المستثمر** - Your Digital Investment Notebook

*دفتر استثماراتك الإلكتروني الذي ينظم أفكارك واستثماراتك*

**Built with ❤️ for Arabic investors worldwide**
