"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileNav } from "./mobile-nav";
import { Badge } from "./ui/badge";
import { siteConfig } from "@/config/site";
import { TwitterIcon, StarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "@/components/translations-context";
import { SidePanel } from "./side-panel";
import { useVoiceContext } from "@/contexts/voice-context";

export function Header() {
  const { t } = useTranslations();
  const { voice, setVoice } = useVoiceContext();
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full sticky top-0 z-50 border-b bg-background"
    >
      <div className="container mx-auto px-4 h-12 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SidePanel voice={voice} onVoiceChange={setVoice} />
          <MobileNav />
        </div>
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-md:hidden flex items-center"
        >
          <Link href="/" className="flex gap-3 items-center">
            <motion.div 
              className="h-8 flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src="/livingwell_logo_horizontal-02-01.png" 
                alt="Living Well Assistant Logo" 
                className="h-full object-contain"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <motion.h1 
                className="text-lg font-medium tracking-tighter flex gap-1 items-center ml-2"
              >
                {t('header.logo')}
              </motion.h1>
            </motion.div>
          </Link>
        </motion.nav>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 items-center justify-end ml-auto"
        >
          <LanguageSwitcher />
          <ThemeSwitcher />
        </motion.div>
      </div>
    </motion.header>
  );
}
