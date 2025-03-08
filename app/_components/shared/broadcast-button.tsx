import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { useTranslations } from "@/app/_components/shared/translations-context";

interface BroadcastButtonProps {
  isSessionActive: boolean
  onClick: () => void
}

export function BroadcastButton({ isSessionActive, onClick }: BroadcastButtonProps) {
  const { t } = useTranslations();
  return (
    <Button
      variant={isSessionActive ? "destructive" : "default"}
      className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2 motion-preset-shake"
      onClick={onClick}
    >
      {isSessionActive && (
        <Badge variant="secondary" className="animate-pulse bg-red-100 text-red-700">
          {t('broadcast.live')}
        </Badge>
      )}
      {isSessionActive ? t('broadcast.end') : t('broadcast.start')}
    </Button>
  )
} 