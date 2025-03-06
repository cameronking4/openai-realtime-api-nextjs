# Cursor Configuration for LW-AI Project

This document provides information about the Cursor configuration for the LW-AI project.

## Cursor Configuration Files

The following configuration files have been set up for Cursor:

1. `.cursorignore` - Specifies files and directories to be ignored by Cursor's indexing.
2. `.cursorsettings` - Contains project-specific settings for Cursor.
3. `.cursor-search-config.json` - Configures search functionality in Cursor.
4. `.cursor-snippets.json` - Defines custom code snippets for the project.

## Project Structure

The LW-AI project is a Next.js application with the following structure:

- `app/` - Next.js app directory containing pages and API routes
- `components/` - React components used throughout the application
- `lib/` - Utility functions and services
- `hooks/` - Custom React hooks
- `contexts/` - React context providers
- `types/` - TypeScript type definitions
- `public/` - Static assets
- `prompts/` - AI prompt templates

## Custom Commands

The following custom commands are configured in Cursor:

- `dev` - Start the development server
- `build` - Build the application for production
- `start` - Start the production server
- `lint` - Run ESLint
- `logs-backend` - View backend logs

## Custom Snippets

Several custom snippets have been configured for this project:

- `rc` - Create a React functional component with TypeScript
- `us` - React useState hook with TypeScript
- `ue` - React useEffect hook with cleanup
- `npage` - Create a Next.js page component
- `logs` - Command to view backend logs

## Using Backend Logs

To view backend logs, you can:

1. Use the `logs-backend` command in Cursor
2. Run `make logs-backend-tail` in the terminal

## Editor Settings

The following editor settings have been configured:

- Format on save: Enabled
- Tab size: 2 spaces
- Insert spaces: Enabled
- Detect indentation: Enabled
- Trim trailing whitespace: Enabled
- Insert final newline: Enabled

## Next Steps

To enhance your Cursor configuration further, you might want to add:

1. **Editor Settings** - Add editor settings to `.cursorsettings` for consistent formatting:
   ```json
   "editor": {
     "formatOnSave": true,
     "tabSize": 2,
     "insertSpaces": true,
     "detectIndentation": true,
     "trimTrailingWhitespace": true,
     "insertFinalNewline": true
   }
   ```

2. **Indexing Configuration** - Add indexing configuration to `.cursorsettings` for better file indexing:
   ```json
   "indexing": {
     "excludePatterns": [
       "node_modules/**",
       ".next/**",
       "logs/**",
       ".env*",
       "*.lock",
       "*.log",
       ".DS_Store",
       "*.png",
       "*.jpg",
       "*.jpeg",
       "*.gif",
       "*.ico"
     ],
     "includePatterns": [
       "app/**",
       "components/**",
       "lib/**",
       "hooks/**",
       "contexts/**",
       "types/**",
       "public/**",
       "config/**",
       "prompts/**",
       "*.ts",
       "*.tsx",
       "*.js",
       "*.jsx",
       "*.json",
       "*.md"
     ]
   }
   ```

3. **Custom Snippets** - Create a `.cursor-snippets.json` file for custom code snippets. 