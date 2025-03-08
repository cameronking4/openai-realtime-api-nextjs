# Source Directory Structure

This directory contains the source code for the application, organized according to modern React and Next.js best practices.

## Directory Structure

```
src/
  components/         # Shared components
    ui/               # UI components (buttons, inputs, etc.)
    layout/           # Layout components (header, footer, etc.)
    features/         # Feature-specific components
      cancer-chat/    # Cancer chat feature components
    shared/           # Shared components across features
  hooks/              # Custom hooks
  lib/                # Utility functions and services
  types/              # TypeScript types and interfaces
  utils/              # Utility functions
  providers/          # Provider components
```

## Import Conventions

The project uses path aliases to make imports cleaner and more maintainable. Here are the available aliases:

- `@/components/*` - Components from both `./components/*` and `./src/components/*`
- `@/ui/*` - UI components from `./components/ui/*` and `./src/components/ui/*`
- `@/layout/*` - Layout components from `./components/layout/*` and `./src/components/layout/*`
- `@/features/*` - Feature-specific components from `./src/components/features/*`
- `@/shared/*` - Shared components from `./src/components/shared/*`
- `@/hooks/*` - Custom hooks from `./hooks/*` and `./src/hooks/*`
- `@/lib/*` - Utility functions and services from `./lib/*` and `./src/lib/*`
- `@/utils/*` - Utility functions from `./src/utils/*`
- `@/types/*` - TypeScript types and interfaces from `./types/*` and `./src/types/*`
- `@/contexts/*` - Context providers from `./contexts/*` and `./src/contexts/*`
- `@/providers/*` - Provider components from `./src/providers/*`
- `@/app/*` - App directory components from `./app/*`

## Component Organization

Components are organized into the following categories:

### UI Components

Basic UI components that are used throughout the application. These are the building blocks of the UI and should be as generic as possible.

### Layout Components

Components that define the layout of the application, such as headers, footers, and navigation.

### Feature Components

Components that are specific to a feature, such as the cancer chat feature. These components are organized by feature to make it easier to find and maintain them.

### Shared Components

Components that are shared across features but are more specific than UI components.

## Server vs. Client Components

The application uses Next.js App Router, which supports both server and client components:

- **Server Components**: Components that render on the server and don't include client-side interactivity. These components don't need the `"use client"` directive.

- **Client Components**: Components that include client-side interactivity, such as state, effects, or event handlers. These components need the `"use client"` directive at the top of the file.

## Best Practices

- Use named exports for components to enable better tree-shaking.
- Use the appropriate path alias for imports to make the code more maintainable.
- Keep components small and focused on a single responsibility.
- Use TypeScript interfaces to define component props.
- Use server components for static content and data fetching.
- Use client components for interactivity.
- Use the App Router pattern for routing. 