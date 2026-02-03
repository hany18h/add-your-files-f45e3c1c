# LUNAR - EPUB Novel Reader

## Overview

LUNAR is a web-based EPUB novel reader application that allows users to upload, manage, and read EPUB novels. The application supports both vertical scroll and horizontal flip reading modes, multi-language content (English and Indonesian), and includes user authentication with admin capabilities for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR
- **React Router** for client-side routing with multiple pages (Index, Reader, Admin, Auth, Profile, etc.)

### UI Component System
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom CSS variables for theming
- **Lucide React** for consistent iconography
- Components are organized in `src/components/ui/` following shadcn conventions

### State Management
- **Zustand** with persist middleware for client-side state (novel store)
- **TanStack React Query** for server state management and caching
- **localStorage** for data persistence (novels, chapters, user authentication)
- Custom hooks pattern (`useNovels`, `useAuth`, `useFavorites`) for encapsulating business logic

### EPUB Processing
- **JSZip** for extracting EPUB archive contents
- Custom `epubParser.ts` utility that extracts metadata (title, author, cover) and chapter content from EPUB files
- HTML content is parsed and rendered using `dangerouslySetInnerHTML` for proper formatting

### Authentication System
- Local authentication implementation stored in localStorage
- Admin role check against hardcoded admin credentials
- `AuthProvider` context wraps the entire application for auth state access

### Reading Experience
- Two reading modes: vertical scroll and horizontal page flip
- Touch gesture support for horizontal mode navigation
- Chapter navigation with language switching (English/Indonesian)
- Reading progress tracked per novel

### Data Models
- **Novel**: id, title, cover_url, description, author, genre, status, view_count, timestamps
- **Chapter**: id, novel_id, number, title, content_en, content_id, epub URLs, timestamps
- Data stored in localStorage with helper functions for CRUD operations

## External Dependencies

### Core Libraries
- `@supabase/supabase-js` - Supabase client (integration ready but currently using localStorage)
- `jszip` - EPUB file extraction
- `epubjs` - Additional EPUB parsing capabilities
- `react-day-picker` - Calendar component for date selection
- `vaul` - Drawer component primitives
- `embla-carousel-react` - Carousel functionality

### UI Framework
- `@radix-ui/*` - Full suite of accessible UI primitives
- `class-variance-authority` - Component variant management
- `tailwind-merge` and `clsx` - Tailwind class utilities
- `next-themes` - Theme management (light/dark mode ready)

### Form & Validation
- `react-hook-form` with `@hookform/resolvers` - Form state management
- `zod` - Schema validation (implied by resolver dependency)

### Development
- `vitest` with `jsdom` environment for testing
- `@testing-library/jest-dom` for DOM assertions
- `lovable-tagger` - Development component tagging plugin

## Deployment & Production

### Deployment
To publish your site for public access on Replit:
1. Click the "Publish" button in the top right corner of the Replit editor.
2. Follow the steps to set up a deployment (Autoscale is recommended for web apps).
3. Once deployed, you will get a public URL for your site.

### Database Setup
The app currently uses `localStorage` for simplicity and instant state. For a production-ready application:
1. **Supabase Integration**: The codebase includes `@supabase/supabase-js`. You can connect a real Supabase project by providing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Secrets tab.
2. **Persistence**: You would need to update `useNovels.tsx` and `useAuth.tsx` to fetch/store data from Supabase instead of `localStorage`.
3. **Admin Controls**: Ensure only authorized emails can access the admin dashboard by updating the `isAdmin` logic in `useAuth.tsx`.

### Is it ready?
The app is a fully functional MVP (Minimum Viable Product). For a "Official" professional release:
- **Scalability**: Move from `localStorage` to a real database (Supabase/PostgreSQL).
- **Security**: Implement server-side authentication checks.
- **Assets**: Use a CDN or Cloud Storage (like Supabase Storage) for EPUB files and covers instead of relying on local storage limits.
- **Testing**: Run the existing tests and add more edge case coverage.