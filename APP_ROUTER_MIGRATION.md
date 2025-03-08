# App Router Migration and Refactoring Plan

This document outlines the step-by-step process for migrating to the Next.js App Router pattern and refactoring the codebase for better organization, performance, and maintainability.

## Phase 1: Project Structure Reorganization

### Step 1: Establish New Directory Structure ✅

```
app/
  (routes)/           # Route groups (won't affect URL)
    cancer-chat/      # Feature-specific routes
    (auth)/           # Authentication-related routes
    (dashboard)/      # Dashboard-related routes
  api/                # API routes
  layout.tsx          # Root layout
  page.tsx            # Home page
  globals.css         # Global styles
  error.tsx           # Global error handling
  loading.tsx         # Global loading state
  not-found.tsx       # 404 page

src/
  components/         # Shared components
    ui/               # UI components (buttons, inputs, etc.)
    layout/           # Layout components (header, footer, etc.)
    features/         # Feature-specific components that might be used across routes
  hooks/              # Custom hooks
  lib/                # Utility functions and services
  types/              # TypeScript types and interfaces
  context/            # Context providers (if needed)
  providers/          # Provider components
```

### Step 2: Move Existing Routes to App Directory ✅

- Migrate `/cancer-chat` route to `/app/(routes)/cancer-chat` ✅
- Ensure proper layout, loading, and error handling components ✅

### Step 3: Create Index Files for Component Exports ✅

- Create barrel files (index.ts) for all component directories ✅
- Use named exports for better tree-shaking ✅

## Phase 2: Component Architecture Improvement

### Step 1: Implement Server Components

- Review all components and convert appropriate ones to server components
- Move data fetching logic to server components
- Mark interactive components with `"use client"` directive

### Step 2: Optimize Component Structure

- Break down large components into smaller, focused components
- Implement proper component composition
- Create clear component interfaces

### Step 3: Implement Proper Layouts ✅

- Create a root layout in `/app/layout.tsx` ✅
- Implement feature-specific layouts where needed ✅
- Use route groups to share layouts without affecting URL structure ✅

## Phase 3: State Management Refactoring

### Step 1: Optimize Client Components

- Clearly mark client components with 'use client' ✅
- Implement proper state management
- Break down large state hooks into smaller, focused hooks

### Step 2: Implement Context Providers ✅

- Create a providers component for client-side context providers ✅
- Organize context providers by feature ✅
- Ensure proper type definitions for context values ✅

## Phase 4: Data Fetching Optimization

### Step 1: Implement Server-Side Data Fetching

- Use async/await in server components for data fetching
- Implement proper caching strategies with `fetch` options
- Use React's `cache` function for memoizing data requests

### Step 2: Optimize Client-Side Data Fetching

- Use React Query or SWR for client-side data fetching
- Implement proper loading and error states
- Set up optimistic updates for mutations

## Phase 5: Performance Optimization

### Step 1: Implement Next.js Image

- Replace all img tags with Next.js Image component
- Configure proper image optimization

### Step 2: Implement Code Splitting

- Use dynamic imports for large components
- Implement route-based code splitting
- Use Suspense for loading states

### Step 3: Optimize Rendering

- Use React.memo for pure components
- Implement useMemo and useCallback for expensive calculations
- Minimize unnecessary re-renders

## Phase 6: TypeScript Enhancement

### Step 1: Improve Type Definitions

- Create proper interfaces for all components
- Implement strict type checking
- Use generics for reusable components

### Step 2: Optimize TypeScript Configuration

- Consolidate tsconfig files
- Implement stricter TypeScript rules
- Set up path aliases for cleaner imports

## Implementation Checklist

### Phase 1: Project Structure
- [x] Create new directory structure
- [x] Move existing routes to app directory
- [x] Create index files for component exports

### Phase 2: Component Architecture
- [ ] Convert appropriate components to server components
- [ ] Break down large components
- [x] Implement proper layouts

### Phase 3: State Management
- [x] Mark client components with 'use client'
- [ ] Optimize state management
- [x] Implement context providers

### Phase 4: Data Fetching
- [ ] Implement server-side data fetching
- [ ] Optimize client-side data fetching
- [ ] Set up caching strategies

### Phase 5: Performance
- [ ] Implement Next.js Image
- [ ] Implement code splitting
- [ ] Optimize rendering

### Phase 6: TypeScript
- [ ] Improve type definitions
- [ ] Optimize TypeScript configuration
- [ ] Set up path aliases

## Migration Order

1. Start with the core infrastructure (layouts, providers) ✅
2. Migrate one route at a time, starting with simpler routes ✅
3. Refactor shared components
4. Optimize performance
5. Enhance TypeScript implementation

This approach ensures that the application remains functional throughout the migration process while gradually improving its architecture and performance. 