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
    'dashboard.welcome': 'Welcome back',
    'dashboard.customer.subtitle': 'Manage your posted jobs and find local service providers',
    'dashboard.provider.subtitle': 'Browse available jobs and manage your bids',
    'dashboard.admin.subtitle': 'Platform administration and oversight',
    'dashboard.stats.activeJobs': 'Active Jobs',
    'dashboard.stats.jobsOpen': 'Jobs currently open',
    'dashboard.stats.totalSpent': 'Total Spent',
    'dashboard.stats.onCompleted': 'On completed jobs',
    'dashboard.stats.reviewsGiven': 'Reviews Given',
    'dashboard.stats.providerReviews': 'Provider reviews',
    'dashboard.stats.activeBids': 'Active Bids',
    'dashboard.stats.pendingProposals': 'Pending proposals',
    'dashboard.stats.totalEarned': 'Total Earned',
    'dashboard.stats.fromCompleted': 'From completed jobs',
    'dashboard.stats.yourRating': 'Your Rating',
    'dashboard.stats.noReviews': 'No reviews yet',
    'dashboard.postJob.title': 'Post a New Job',
    'dashboard.postJob.description': 'Describe your task and get bids from local providers',
    'dashboard.postJob.button': 'Create Job Posting',
    'dashboard.findProviders.title': 'Find Providers',
    'dashboard.findProviders.description': 'Browse available service providers in your area',
    'dashboard.findProviders.button': 'Browse Services',
    'dashboard.yourJobs.title': 'Your Jobs',
    'dashboard.yourJobs.description': 'View and manage your job postings',
    'dashboard.yourJobs.empty': "You haven't posted any jobs yet",
    'dashboard.yourJobs.firstJob': 'Post Your First Job',
    'dashboard.recommended.title': 'Recommended for You',
    'dashboard.recommended.description': 'Jobs matching your skills and location',
    'dashboard.recommended.empty': 'Complete your profile to see recommended jobs',
    'dashboard.recommended.complete': 'Complete Profile',
    'dashboard.recommended.browse': 'Browse All Jobs',
    'dashboard.yourBids.title': 'Your Bids',
    'dashboard.yourBids.description': 'Track your active and past proposals',
    'dashboard.yourBids.empty': "You haven't submitted any bids yet",
    'dashboard.yourBids.browse': 'Browse Jobs',
    'dashboard.profile.viewProfile': 'View Profile',
    'dashboard.profile.edit': 'Edit',
    'dashboard.profile.memberSince': 'Member since',
    'dashboard.profile.skills': 'Skills:',
    'dashboard.profile.complete': 'Complete your profile',
    'dashboard.admin.totalUsers': 'Total Users',
    'dashboard.admin.activeJobs': 'Active Jobs',
    'dashboard.admin.platformFees': 'Platform Fees',
    'dashboard.admin.reports': 'Reports',
    'dashboard.admin.tools': 'Admin Tools',
    'dashboard.admin.toolsDescription': 'Platform management and oversight',
    'dashboard.admin.goToPanel': 'Go to Admin Panel',
    'dashboard.tabs.recommended': 'Recommended Jobs',
    'dashboard.tabs.mybids': 'My Bids',
    'jobs.postJob': 'Post a Job',
    'jobs.findJobs': 'Browse Jobs',
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
    'dashboard.welcome': 'Bienvenido de nuevo',
    'dashboard.customer.subtitle': 'Gestiona tus trabajos publicados y encuentra proveedores locales',
    'dashboard.provider.subtitle': 'Navega trabajos disponibles y gestiona tus ofertas',
    'dashboard.admin.subtitle': 'Administración y supervisión de la plataforma',
    'dashboard.stats.activeJobs': 'Trabajos Activos',
    'dashboard.stats.jobsOpen': 'Trabajos abiertos',
    'dashboard.stats.totalSpent': 'Total Gastado',
    'dashboard.stats.onCompleted': 'En trabajos completados',
    'dashboard.stats.reviewsGiven': 'Reseñas Dadas',
    'dashboard.stats.providerReviews': 'Reseñas de proveedores',
    'dashboard.stats.activeBids': 'Ofertas Activas',
    'dashboard.stats.pendingProposals': 'Propuestas pendientes',
    'dashboard.stats.totalEarned': 'Total Ganado',
    'dashboard.stats.fromCompleted': 'De trabajos completados',
    'dashboard.stats.yourRating': 'Tu Calificación',
    'dashboard.stats.noReviews': 'Sin reseñas aún',
    'dashboard.postJob.title': 'Publicar un Trabajo',
    'dashboard.postJob.description': 'Describe tu tarea y recibe ofertas de proveedores locales',
    'dashboard.postJob.button': 'Crear Publicación',
    'dashboard.findProviders.title': 'Buscar Proveedores',
    'dashboard.findProviders.description': 'Navega proveedores de servicios disponibles en tu área',
    'dashboard.findProviders.button': 'Explorar Servicios',
    'dashboard.yourJobs.title': 'Tus Trabajos',
    'dashboard.yourJobs.description': 'Ver y gestionar tus publicaciones de trabajo',
    'dashboard.yourJobs.empty': 'No has publicado ningún trabajo aún',
    'dashboard.yourJobs.firstJob': 'Publica Tu Primer Trabajo',
    'dashboard.recommended.title': 'Recomendados Para Ti',
    'dashboard.recommended.description': 'Trabajos que coinciden con tus habilidades y ubicación',
    'dashboard.recommended.empty': 'Completa tu perfil para ver trabajos recomendados',
    'dashboard.recommended.complete': 'Completar Perfil',
    'dashboard.recommended.browse': 'Ver Todos los Trabajos',
    'dashboard.yourBids.title': 'Tus Ofertas',
    'dashboard.yourBids.description': 'Rastrea tus propuestas activas y pasadas',
    'dashboard.yourBids.empty': 'No has enviado ninguna oferta aún',
    'dashboard.yourBids.browse': 'Explorar Trabajos',
    'dashboard.profile.viewProfile': 'Ver Perfil',
    'dashboard.profile.edit': 'Editar',
    'dashboard.profile.memberSince': 'Miembro desde',
    'dashboard.profile.skills': 'Habilidades:',
    'dashboard.profile.complete': 'Completa tu perfil',
    'dashboard.admin.totalUsers': 'Usuarios Totales',
    'dashboard.admin.activeJobs': 'Trabajos Activos',
    'dashboard.admin.platformFees': 'Tarifas de Plataforma',
    'dashboard.admin.reports': 'Reportes',
    'dashboard.admin.tools': 'Herramientas Admin',
    'dashboard.admin.toolsDescription': 'Gestión y supervisión de la plataforma',
    'dashboard.admin.goToPanel': 'Ir al Panel de Admin',
    'dashboard.tabs.recommended': 'Trabajos Recomendados',
    'dashboard.tabs.mybids': 'Mis Ofertas',
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
