"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Badge } from "./ui/badge";
import { useTranslations } from "@/app/_components/shared/translations-context"

export function MobileNav() {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex gap-2 w-full items-center overflow-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Open navigation">
            <MenuIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] rounded-lg flex flex-col flex-1 justify-start items-start overflow-y-auto p-6">
          <DialogHeader className="w-full">
            <DialogTitle className="w-full text-left text-2xl font-bold">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-2xl"
              >
                <div className="h-8 flex items-center">
                  <img 
                    src="/livingwell_logo_horizontal-02-01.png" 
                    alt="Healing AI Guide Logo" 
                    className="h-full object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="ml-2">{siteConfig.name}</span>
                </div>
              </Link>
            </DialogTitle>
          </DialogHeader>
          <h1 className="mt-6 text-xl font-bold">{t('header.title')}</h1>
          <p className="mt-2 text-muted-foreground text-start text-lg">
            {t('header.about')}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}