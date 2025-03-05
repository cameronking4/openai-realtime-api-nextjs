import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "@/components/translations-context"
import { Label } from "@/components/ui/label"

interface VoiceSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function VoiceSelector({ value, onValueChange }: VoiceSelectorProps) {
  const { t } = useTranslations()
  return (
    <div className="form-group space-y-2">
      <Label htmlFor="voiceSelect" className="text-sm font-medium">{t('voice.select')}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('voice.select')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="coral">{t('voice.coral')}</SelectItem>
          <SelectItem value="sage">{t('voice.sage')}</SelectItem>
          <SelectItem value="verse">{t('voice.verse')}</SelectItem>
          <SelectItem value="ash">{t('voice.ash')}</SelectItem>
          <SelectItem value="ballad">{t('voice.ballad')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 