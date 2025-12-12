# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 Common Development Commands

### Installation & Setup
```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Run database migrations (local development)
npx prisma migrate dev --name init

# Reset database and apply migrations
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Deploy migrations to production
npx prisma migrate deploy
```

### Current Database Configuration
The project is configured to use **SQLite** for local development (`prisma/dev.db`). For production, use Vercel Postgres or Neon:
- Provider: `postgresql`
- Environment variable: `DATABASE_URL`

## 🏗️ Architecture Overview

This is a **Next.js 14 App Router** application with **TypeScript** and **Prisma ORM** for a pet health management system.

### High-Level Structure

```
pet-care-manager/
├── app/                          # Next.js App Router
│   ├── api/                      # REST API routes (route handlers)
│   │   ├── pets/route.ts         # GET, POST /api/pets
│   │   └── records/              # Health record APIs
│   │       ├── deworming/        # External deworming records
│   │       ├── internal/         # Internal deworming records
│   │       ├── bathing/          # Bathing records
│   │       ├── vaccine/          # Vaccination records
│   │       └── weight/           # Weight records
│   ├── pets/                     # Pet management pages
│   │   ├── page.tsx              # Pet list
│   │   ├── new/page.tsx          # Add pet form
│   │   └── [id]/page.tsx         # Pet detail page
│   ├── records/                  # Record management pages
│   │   ├── page.tsx              # Record list with filters
│   │   └── new/page.tsx          # Add record form
│   ├── charts/                   # Data visualization page
│   ├── layout.tsx                # Root layout with navigation
│   └── page.tsx                  # Home page (dashboard)
│
├── components/                   # Reusable React components
│   ├── Navigation.tsx            # Top navigation bar
│   ├── PetCard.tsx               # Pet display card
│   ├── RecordCard.tsx            # Health record card
│   ├── WeightChart.tsx           # Chart.js weight trend
│   └── Button.tsx                # Styled button component
│
├── lib/
│   └── prisma.ts                 # Prisma client singleton
│
├── prisma/
│   └── schema.prisma             # Database schema
│
└── public/                       # Static assets
```

### Key Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 4
- **Database**: Prisma ORM with PostgreSQL/SQLite
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Date handling**: date-fns

## 🗄️ Database Schema

### Core Models (Prisma)

**Pet** - Pet basic information
- `id`, `name`, `breed`, `birthday`, `gender`, `color`, `photo`, `notes`
- Relations to all health record types

**Health Record Types** (5 models):
1. **DewormingRecord** - External deworming (外驱)
2. **InternalDewormingRecord** - Internal deworming (内驱)
3. **BathingRecord** - Bathing records
4. **VaccineRecord** - Vaccination records
5. **WeightRecord** - Weight measurements

All record models include:
- `id`, `petId` (FK), `date`, `notes`, `createdAt`
- Type-specific fields (e.g., `brand`, `dosage`, `nextDueDate`)

### Database URL Configuration
- **Local**: SQLite at `file:./prisma/dev.db`
- **Production**: Set `DATABASE_URL` environment variable to PostgreSQL connection string

## 🎨 UI Architecture

### Design System
- **Primary gradient**: Pink (#ec4899) to Purple (#9333ea)
- **Background**: `bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50`
- **Typography**: Geist Sans/Mono fonts
- **All pages**: Client-side rendered (`'use client'` directive)

### Key UI Patterns
1. **Dashboard** (`app/page.tsx`): Home with pet list and upcoming reminders
2. **CRUD Pages**: Standard list/detail/create patterns
3. **Filterable Lists**: Record page supports pet/type filtering
4. **Responsive Grid**: Uses Tailwind grid (1-3 columns based on screen size)
5. **Reminder System**: 7-day countdown for upcoming due dates

### Component Structure
- **Navigation**: Fixed top bar with gradient background
- **Cards**: Consistent card pattern with shadows and rounded corners
- **Charts**: WeightChart.tsx renders line chart using Chart.js
- **Forms**: Direct POST to API routes (no form libraries)

## 🔌 API Design

### REST API Routes (app/api/*/route.ts)

**Pattern**: Each resource has `GET` (list) and `POST` (create)
- No `PUT`/`DELETE` implemented yet
- Filtering via query parameters (e.g., `/api/records/weight?petId=123`)

**Example API Structure**:
```
GET    /api/pets              # List all pets
POST   /api/pets              # Create pet

GET    /api/records/weight?petId=123  # Filter by pet
POST   /api/records/weight             # Create weight record
```

**Error Handling**: Consistent pattern with try/catch and `NextResponse.json({ error }, status)`

## 🔧 Development Notes

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Includes `.next/types/**/*.ts` for Next.js type generation

### Linting
- ESLint 9 with flat config
- Uses `eslint-config-next` presets
- Ignores `.next`, `build`, `out` directories

### Styling Approach
- Tailwind CSS 4 (beta)
- No custom CSS files (only `app/globals.css` for Tailwind)
- Gradient backgrounds on key elements
- Responsive by default

### Environment Variables
Required:
- `DATABASE_URL` - PostgreSQL connection string (production)

### Recent Changes
- Database changed from PostgreSQL → SQLite for local development
- `prisma/dev.db` is the local SQLite database file
- `prisma.config.ts` was deleted (not needed for this setup)

## 📊 Feature Highlights

1. **Pet Management**: Full CRUD for pet profiles with photo support
2. **Health Records**: 5 types of health records (deworming, vaccine, bathing, weight, internal deworming)
3. **Smart Reminders**: 7-day upcoming due date notifications
4. **Data Visualization**: Weight trends with Chart.js
5. **Filtering**: Filter records by pet and type
6. **Responsive Design**: Mobile-first Tailwind CSS

## 🚀 Deployment

Configured for **Vercel** deployment:
- Uses Vercel Postgres or Neon database
- `vercel.json` configured
- Environment variable: `DATABASE_URL`

## ⚠️ Known Limitations

1. **No Authentication**: Anyone can access all data
2. **No Update/Delete**: Records and pets cannot be edited/deleted
3. **No File Upload**: Photos are URL-based only
4. **Single User**: No multi-user support
5. **No Tests**: No test suite configured

## 🎯 Future Enhancement Suggestions

Based on README.md:
- Add NextAuth.js for authentication
- Implement edit/delete functionality
- Add data export (CSV/PDF)
- Cloud storage for photos
- User management system

## 📝 Important File Locations

- **Database Schema**: `prisma/schema.prisma`
- **Prisma Client**: `lib/prisma.ts`
- **Root Layout**: `app/layout.tsx`
- **Global Styles**: `app/globals.css`
- **Navigation**: `components/Navigation.tsx`
- **Home Page**: `app/page.tsx`

## 💡 Development Tips

1. **Database Changes**: After modifying `schema.prisma`, run `npx prisma generate && npx prisma migrate dev`
2. **Adding Records**: Use `/records/new?type=weight` pattern for quick form access
3. **Local DB**: Use `npx prisma studio` to view/edit SQLite database
4. **Styling**: Check `app/globals.css` for Tailwind imports and custom styles
5. **API Testing**: All APIs are RESTful and can be tested with curl or Postman

## 🔍 Code Patterns

- **Client Components**: Most pages use `'use client'` for state management
- **Fetching**: Use native `fetch()` for API calls (not SWR or React Query)
- **Error Handling**: Try/catch in all API routes
- **Type Safety**: Strict TypeScript with Prisma generated types
- **State**: React hooks (useState, useEffect) for client state