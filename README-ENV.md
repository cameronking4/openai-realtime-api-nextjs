# Environment Setup Guide

This guide explains how to set up your development environment and import environment variables from Vercel.

## Prerequisites

- Node.js installed
- Vercel CLI installed (`npm install -g vercel`)
- Access to the Vercel project

## Setting Up Environment Variables

### Option 1: Automatic Setup (Recommended)

1. **Login to Vercel CLI**

   If you haven't already logged in to Vercel CLI, run:

   ```bash
   vercel login
   ```

2. **Run the Setup Script**

   This will pull environment variables from Vercel and check if all required variables are set:

   ```bash
   npm run setup
   ```

   This script will:
   - Pull environment variables from Vercel to a `.env.local` file
   - Check if all required environment variables are set
   - Warn about any placeholder values

### Option 2: Manual Setup

1. **Create a `.env.local` File**

   Create a `.env.local` file in the root directory with the following variables:

   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_DIRECT_MODE=False
   ```

2. **Check Environment Variables**

   Run the check script to verify that all required environment variables are set:

   ```bash
   npm run check-env
   ```

## Available Scripts

- `npm run pull-env`: Pull environment variables from Vercel to `.env.local`
- `npm run check-env`: Check if all required environment variables are set
- `npm run setup`: Run both scripts in sequence

## Troubleshooting

### Missing Environment Variables

If you see an error about missing environment variables:

1. Make sure these variables are set in your Vercel project
2. Run `npm run pull-env` again to pull the latest variables

### Placeholder Values

If you see a warning about placeholder values:

1. Replace these placeholder values with actual API keys in your Vercel project
2. Run `npm run pull-env` again to pull the updated variables

### Vercel CLI Not Installed

If you get an error about Vercel CLI not being installed:

```bash
npm install -g vercel
```

### Not Linked to Vercel Project

If you're not linked to the Vercel project:

```bash
vercel link
```

Follow the prompts to link to your project. 