import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    toast({
      title: newLang === 'en' ? 'Language changed to English' : 'Idioma cambiado a Español',
      description: newLang === 'en' ? 'Interface language updated' : 'Idioma de la interfaz actualizado',
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageChange}
      className="gap-2"
      title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{language === 'en' ? 'ES' : 'EN'}</span>
    </Button>
  );
}
