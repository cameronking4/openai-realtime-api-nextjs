import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/app/_lib/utils";
import { siteConfig } from "@/config/site";
import { Toaster } from "@/app/_components/ui/sonner"
import { Analytics } from "@vercel/analytics/react"
import { TranslationsProvider } from "@/app/_components/shared/translations-context"
import { Banner } from "@/app/_components/shared/banner";
import { AppProviders } from "@/app/_components/providers/app-providers";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your Healing Check-in | Cancer Chat",
  description: "A supportive chat interface for cancer patients to express their feelings and receive guidance.",
  authors: [{ name: siteConfig.author, url: siteConfig.links.twitter }],
  creator: siteConfig.author,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    images: "/opengraph-image.png",
  },
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["AI Blocks", "OpenAI Blocks", "Blocks", "OpenAI Realtime API", "OpenAI Realtime", "OpenAI WebRTC", "Livekit", "OpenAI Realtime WebRTC", "Healing AI Guide", "Voice AI", "Voice AI components", "web components", "UI components", "UI Library", "shadcn", "aceternity", "AI", "Next.js", "React", "Tailwind CSS", "Framer Motion", "TypeScript", "Design engineer", "shadcn ai"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-dvh bg-background font-sans antialiased", poppins.variable)}>
        <AppProviders>
          <TranslationsProvider>
            <div className="relative flex min-h-dvh flex-col bg-white items-center">
              <Banner />
              {children}
            </div>
            <Toaster />
          </TranslationsProvider>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
