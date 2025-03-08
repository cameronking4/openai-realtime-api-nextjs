# App Directory Structure

This project follows the Next.js 13+ App Router pattern, with all application code organized within the `/app` directory.

## Directory Structure

```
app/
  (routes)/           # Route groups (won't affect URL)
    cancer-chat/      # Cancer chat feature route
    ...               # Other routes
  
  _components/        # All components (underscore prevents Next.js from treating as routes)
    ui/               # UI components (buttons, inputs, etc.)
    layout/           # Layout components (header, footer, etc.)
    features/         # Feature-specific components
      cancer-chat/    # Cancer chat feature components
    shared/           # Shared components across features
  
  _hooks/             # Custom hooks
  _lib/               # Utility functions and services
  _types/             # TypeScript types and interfaces
  _utils/             # Utility functions
  
  layout.tsx          # Root layout
  page.tsx            # Home page
  globals.css         # Global styles
  error.tsx           # Global error handling
  loading.tsx         # Global loading state
  not-found.tsx       # 404 page
```

## Key Concepts

### Underscore Prefix

Directories starting with an underscore (`_`) are not treated as routes by Next.js. This allows us to organize our code within the `/app` directory without creating additional routes.

### Route Groups

Directories in parentheses `(routes)` are route groups. They're used to organize routes without affecting the URL structure.

### Component Organization

Components are organized into categories:

- **UI Components**: Basic UI components like buttons, inputs, etc.
- **Layout Components**: Components that define the layout of the application
- **Feature Components**: Components specific to features like cancer-chat
- **Shared Components**: Components shared across features

### Server vs. Client Components

The App Router supports both server and client components:

- **Server Components**: Default in the App Router. They render on the server and don't include client-side interactivity.
- **Client Components**: Components that include client-side interactivity. They need the `"use client"` directive at the top of the file.

## Import Conventions

When importing from these directories, use the following pattern:

```typescript
// Import from UI components
import { Button } from '@/app/_components/ui/button';

// Import from feature components
import { CancerChatInterface } from '@/app/_components/features/cancer-chat/CancerChatInterface';

// Import from hooks
import { useToast } from '@/app/_hooks/use-toast';
```

## Best Practices

- Use named exports for components to enable better tree-shaking
- Keep components small and focused on a single responsibility
- Use TypeScript interfaces to define component props
- Use server components for static content and data fetching
- Use client components for interactivity
- Leverage route groups to organize routes without affecting URLs 