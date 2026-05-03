# Investor Notebook - Wireframe UI Implementation

## Overview

A minimalist Arabic RTL investment notebook web application built from wireframe designs. Features a clean, simple interface following the provided wireframes closely.

## Pages

### 1. Landing Page (`/`)
- Two large buttons: "جديد" (New) and "القديم" (Old)
- Centered, minimal design

### 2. New Page (`/new`)
- Header: "جديد"
- Top row with 4 type selection boxes:
  - Sidebar box (left)
  - 3 type cards (عقارات, أسهم, مشاريع)
- Shows last opened type section
- Shows last edited type section

### 3. Type Details Page (`/new/[id]`)
- Header with type selection cards
- Large image preview box (right side)
- Form fields:
  - Title (العنوان)
  - Description (الوصف)
  - Amount (المبلغ)
  - Problem (المشكلة)
  - Solution (الحل)
- Notes section with lines
- Helper text at bottom
- Save/Cancel buttons

### 4. Old Page (`/old`)
- Header: "السجلات القديمة"
- List of saved records
- Add new button

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Build the UI:**
```bash
node build-wireframe-ui.js
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
Navigate to `http://localhost:3000`

## Project Structure

```
investor-notebook/
├── app/
│   ├── globals.css          Global styles (wireframe design)
│   ├── layout.tsx           Root layout
│   ├── page.tsx             Landing page
│   ├── new/
│   │   ├── page.tsx         Type selection page
│   │   └── [id]/page.tsx    Type details page
│   ├── old/
│   │   └── page.tsx         Old records page
│   └── api/                 API routes
├── components/
│   └── Navigation.tsx       Navigation component
├── lib/
│   └── db.ts               SQLite database setup
├── public/                  Static files
├── build-wireframe-ui.js    Build script
└── package.json            Dependencies
```

## Design

- **Style:** Minimal wireframe style with thin borders
- **Colors:** White background, gray borders
- **Language:** Arabic (RTL)
- **Responsive:** Mobile and desktop friendly

## Features

✅ Landing page with navigation
✅ Type selection and viewing
✅ Form for investment data entry
✅ Old records display
✅ SQLite database integration
✅ Full RTL Arabic support
✅ Clean, minimal UI matching wireframes

## Database

Uses SQLite with two tables:
- **types:** Investment categories
- **records:** Investment records

Auto-initializes with 3 demo types:
1. عقارات (Real Estate)
2. أسهم (Stocks)
3. مشاريع (Projects)

## Development

### Edit Styles
- Global styles in `app/globals.css`
- Utility classes: `wireframe-box`, `wireframe-input`, `wireframe-button`, etc.

### Edit Pages
- Landing: `app/page.tsx`
- New: `app/new/page.tsx`
- Details: `app/new/[id]/page.tsx`
- Old: `app/old/page.tsx`

### API Routes
- Types: `app/api/types/route.ts`
- Records: `app/api/records/route.ts`

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **Database:** SQLite (better-sqlite3)
- **Language:** TypeScript/JavaScript

## Notes

- Built directly from wireframe images
- Minimal styling maintains wireframe aesthetic
- All text in Arabic with RTL support
- Database auto-initializes on first run
- No external authentication required

## Support

For issues or questions, refer to the wireframe images for design reference.

---

مذكرة المستثمر - Your Digital Investment Notebook
