# OpenAI WebRTC Shadcn Next15 Starter
This is a WebRTC-based Voice AI stream application using `OpenAI`'s `Realtime API` and `WebRTC`. Project contains `/api` route and UI components developed with `Next.js` and `shadcn/ui`. It supports real-time audio conversations implented in [skrivov/openai-voice-webrtc-next](https://github.com/skrivov/openai-voice-webrtc-next) with the addition of a hook to abstract the WebRTC handling.

https://github.com/user-attachments/assets/ea9324af-5c18-48d2-b980-2b81baeea4c0

## Features
- **Next.js Framework**: Built with Next.js for server-side rendering and API routes.
- **Modern UI**: Animated using Tailwind CSS & Framer Motion & shadcn/ui.
- **Use-WebRTC Hook**: A hook to abstract the OpenAI WebRTC handling.
- **Tool Calling**: 6 example functions to demonstrate client side tools along with Realtime API: `getCurrentTime`, `partyMode`, `changeBackground`, `launchWebsite`, `copyToClipboard`, `scrapeWebsite` (requires FireCrawl API key)
- **Localization**: Select language for app strings and the voice agent (English, Spanish, French, Chinese)
- **Type Safety**: TypeScript with strict eslint rules (optional)

  
## Requirements
- **Deno runtime** or **Node.js**
- OpenAI API Key or Azure OpenAI API Key in `.env` file

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/cameronking4/openai-realtime-api-nextjs.git
cd openai-realtime-api-nextjs
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your-openai-api-key
```

### 3. Install Dependencies
If using **Node.js**:
```bash
npm install
```

If using **Deno**:
```bash
deno install
```

### 4. Run the Application

#### Using Node.js:
```bash
npm run dev
```

#### Using Deno:
```bash
deno task start
```

The application will be available at `http://localhost:3000`.

## Usage
1. Open the app in your browser: `http://localhost:3000`.
3. Select a voice and start the audio session.

## Deploy to Vercel
**Deploy in one-click**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcameronking4%2Fopenai-realtime-api-nextjs&env=OPENAI_API_KEY&envDescription=OpenAI%20Key%20(Realtime%20API%20Beta%20access)&envLink=https%3A%2F%2Fplatform.openai.com%2Fapi-keys&project-name=openai-rt-shadcn&repository-name=openai-realtime-api-nextjs-clone&demo-title=OpenAI%20Realtime%20API%20(WebRTC)%20x%20shadcn%2Fui&demo-description=Next.js%2015%20template%20to%20create%20beautiful%20Voice%20AI%20applications%20with%20OpenAI%20Realtime%20API%20Beta&demo-url=https%3A%2F%2Fopenai-rt-shadcn.vercel.app&demo-image=http%3A%2F%2Fopenai-rt-shadcn.vercel.app%2Fdemo.gif)

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgements
- [OpenAI](https://openai.com/) for their API and models.
- [Next.js](https://nextjs.org/) for the framework.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Simon Willison's Weblog](https://simonwillison.net/2024/Dec/17/openai-webrtc/) for inspiration
- [Originator: skrivov](https://github.com/skrivov/openai-voice-webrtc-next) for the WebRTC and Nextjs implementation

# Living Well AI

A Next.js application for cancer patient support with voice and text chat capabilities.

## Deployment to Vercel

### Prerequisites

- A Vercel account
- Access to the following API keys:
  - OpenAI API Key
  - Anthropic API Key
  - Perplexity API Key
  - Google Gemini API Key

### Deployment Steps

1. **Fork or Clone the Repository**

   Fork or clone this repository to your GitHub account.

2. **Connect to Vercel**

   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: ./

3. **Set Environment Variables**

   In the Vercel project settings, add the following environment variables:

   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `PERPLEXITY_API_KEY`: Your Perplexity API key
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `OPENAI_DIRECT_MODE`: Set to "False"
   
   For model configuration (optional):
   - `ANTHROPIC_SUGGESTION_MODEL`: Model for quick reply suggestions (default: claude-3-haiku-20240307)
   - `ANTHROPIC_ASSESSMENT_MODEL`: Model for assessments (default: claude-3-sonnet-20240229)
   - `ANTHROPIC_DEFAULT_MODEL`: Model for general API usage (default: claude-3-opus-20240229)
   
   See [MODEL_CONFIGURATION.md](MODEL_CONFIGURATION.md) for more details.

4. **Deploy**

   Click "Deploy" and wait for the build to complete.

## Local Development

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_DIRECT_MODE=False
   
   # Optional: Model Configuration
   ANTHROPIC_SUGGESTION_MODEL=claude-3-haiku-20240307
   ANTHROPIC_ASSESSMENT_MODEL=claude-3-sonnet-20240229
   ANTHROPIC_DEFAULT_MODEL=claude-3-opus-20240229
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Build for Production**

   ```bash
   npm run build
   ```

5. **Start Production Server**

   ```bash
   npm start
   ```

## Features

- Voice and text chat interface for cancer patients
- Real-time audio processing
- Psychological assessment generation
- Transcript management
- Suggested responses
- Configurable AI models for different tasks

## Technologies

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- WebRTC for audio processing

## Configuration

- See [MODEL_CONFIGURATION.md](MODEL_CONFIGURATION.md) for details on configuring AI models.

## Environment Variables

This project uses environment variables for configuration. Follow these steps to set up your environment:

### Local Development

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your actual API keys and database credentials.

3. The application will automatically use these environment variables during development.

### Environment Files

- `.env`: Default values, committed to version control. Contains no secrets.
- `.env.local`: Local development values with secrets. **Never commit this file**.
- `.env.production`: Production-specific settings without secrets.
- `.env.local.example`: Example file showing required variables.

### Vercel Deployment

When deploying to Vercel:

1. Set your production environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to the "Environment Variables" tab
   - Add all required variables (API keys, database credentials, etc.)

2. Vercel will automatically use these variables in your production environment.

### Required Variables

- `OPENAI_API_KEY`: Your OpenAI API key for LLM features
- `ANTHROPIC_API_KEY`: Your Anthropic API key (if using Claude)
- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_URL_UNPOOLED`: Non-pooled PostgreSQL connection string

See `.env.local.example` for a complete list of variables.
