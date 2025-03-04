import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/components/translations-context"

export const Welcome = () => {
  const { t } = useTranslations()
  
  return (
    <div className="text-center mb-8 rounded-lg p-4">
      <h1 className="text-4xl font-bold mb-4 motion-preset-slide-up-lg">
        {t('hero.title')}
      </h1>
      <p className="max-w-2xl mx-auto motion-preset-slide-down">
        {t('hero.subtitle')}
      </p>
    </div>
  )
} 

export default Welcome;