import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/components/translations-context"
import Image from "next/image"

export const Welcome = () => {
  const { t } = useTranslations()
  
  return (
    <div className="text-center mb-8 rounded-lg p-4">
      <div className="flex justify-center items-center mx-auto gap-2 h-full w-full mb-2">
        <Badge className="px-4 py-3 bg-transparent border-none shadow-none motion-preset-slide-left-md">
          <Image 
            src="/livingwell_logo_horizontal-02-01.png"
            alt="Living Well Logo"
            width={200}
            height={50}
            className="h-auto object-contain"
            priority
          />
        </Badge>
      </div>
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