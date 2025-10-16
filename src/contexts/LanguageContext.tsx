import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.howItWorks': 'How it Works',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'jobs.postJob': 'Post a Job',
    'jobs.findJobs': 'Find Jobs',
    'jobs.title': 'Title',
    'jobs.description': 'Description',
    'jobs.budget': 'Budget',
    'jobs.location': 'Location',
    'jobs.category': 'Category',
    'jobs.search': 'Search jobs...',
    'jobs.noJobs': 'No jobs found',
    'bids.submit': 'Submit Bid',
    'bids.amount': 'Bid Amount',
    'bids.proposal': 'Proposal',
    'bids.noBids': 'No bids yet',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.dashboard': 'Panel',
    'nav.messages': 'Mensajes',
    'nav.profile': 'Perfil',
    'nav.logout': 'Cerrar Sesión',
    'jobs.postJob': 'Publicar Trabajo',
    'jobs.findJobs': 'Buscar Trabajos',
    'jobs.title': 'Título',
    'jobs.description': 'Descripción',
    'jobs.budget': 'Presupuesto',
    'jobs.location': 'Ubicación',
    'jobs.category': 'Categoría',
    'jobs.search': 'Buscar trabajos...',
    'jobs.noJobs': 'No se encontraron trabajos',
    'bids.submit': 'Enviar Oferta',
    'bids.amount': 'Monto de Oferta',
    'bids.proposal': 'Propuesta',
    'bids.noBids': 'Aún no hay ofertas',
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load user's language preference
    const loadLanguagePreference = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', user.id)
          .single();

        if (data?.language_preference) {
          setLanguageState(data.language_preference as Language);
        }
      } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'es') {
          setLanguageState('es');
        }
      }
    };

    loadLanguagePreference();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    // Save to user profile if logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ language_preference: lang })
        .eq('id', user.id);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
