"use client";

import React from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { useTranslations } from "@/components/translations-context";
import Image from "next/image";
import { VoiceSelector } from "@/components/voice-select";
import { ToolsEducation } from "@/components/tools-education";
import { SidePanelTokenUsage } from "./side-panel-token-usage";

export interface SidePanelProps {
  voice: string;
  onVoiceChange: (value: string) => void;
}

export function SidePanel({ voice, onVoiceChange }: SidePanelProps) {
  const { t } = useTranslations();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="md:flex hidden"
          aria-label="Open side panel"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2">
            <Image
              src="/livingwell_logo_horizontal-02-01.png"
              alt="Living Well Logo"
              width={150}
              height={40}
              className="h-auto object-contain"
            />
          </div>
          <SheetTitle className="text-xl mt-6">{t('header.title')}</SheetTitle>
          <SheetDescription className="text-base">
            {t('header.about')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">{t('voice.select')}</h3>
            <div className="p-2">
              <VoiceSelector value={voice} onValueChange={onVoiceChange} />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">{t('sidePanel.settings')}</h3>
            <div className="space-y-2">
              <div className="p-2 rounded-md hover:bg-muted transition-colors">
                {t('sidePanel.language')}: {t('language')}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">{t('tokenUsage.usage')}</h3>
            <div className="p-2">
              <SidePanelTokenUsage />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="p-2">
              <ToolsEducation />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 