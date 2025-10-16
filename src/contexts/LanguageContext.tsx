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
    // Navigation
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
    // Landing Page
    'landing.hero.title': 'Find Local Help for Any Task',
    'landing.hero.subtitle': 'Connect with trusted service providers in Texas. Post a job, get competitive bids, and hire the perfect professional.',
    'landing.hero.search': 'What service do you need? (e.g., house cleaning, moving help...)',
    'landing.hero.searchButton': 'Search',
    'landing.hero.postJob': 'Post a Job',
    'landing.hero.joinProvider': 'Join as Provider',
    'landing.stats.activeProviders': 'Active Providers',
    'landing.stats.jobsCompleted': 'Jobs Completed',
    'landing.stats.avgRating': 'Average Rating',
    'landing.stats.avgResponse': 'Avg Response Time',
    'landing.categories.title': 'Popular Services',
    'landing.categories.subtitle': 'Choose from our most requested service categories',
    'landing.categories.viewAll': 'View All Services',
    'landing.howItWorks.title': 'How It Works',
    'landing.howItWorks.subtitle': 'Get started in three simple steps',
    'landing.howItWorks.step1': 'Post Your Job',
    'landing.howItWorks.step1Desc': 'Describe what you need done and set your budget',
    'landing.howItWorks.step2': 'Review Bids',
    'landing.howItWorks.step2Desc': 'Compare proposals from local providers',
    'landing.howItWorks.step3': 'Get It Done',
    'landing.howItWorks.step3Desc': 'Hire the best provider and pay when complete',
    'landing.howItWorks.learnMore': 'Learn More',
    'landing.testimonials.title': 'What People Say',
    'landing.testimonials.subtitle': 'Trusted by thousands across Texas',
    'landing.testimonials.customer': 'Customer',
    'landing.testimonials.provider': 'Provider',
    'landing.cta.title': 'Ready to Get Started?',
    'landing.cta.subtitle': 'Join thousands of satisfied customers and top-rated service providers on Service HUB today.',
    'landing.cta.postJob': 'Post a Job Now',
    'landing.cta.becomeProvider': 'Become a Provider',
    // Services Page
    'services.title': 'Browse Open Jobs',
    'services.subtitle': 'Find jobs and start bidding - Login required to submit bids',
    'services.search': 'Search for jobs...',
    'services.allCategories': 'All Categories',
    'services.showing': 'Showing',
    'services.openJobs': 'open',
    'services.job': 'job',
    'services.jobs': 'jobs',
    'services.noJobs': 'No open jobs found',
    'services.adjustFilters': 'Try adjusting your search or filters',
    'services.beFirst': 'Be the first to post a job',
    'services.postJob': 'Post a Job',
    'services.cta.title': 'Need a Service Provider?',
    'services.cta.subtitle': 'Post your job and get competitive bids from local professionals',
    'services.cta.button': 'Post a Job Now',
    // How It Works Page
    'howItWorks.title': 'How Service HUB Works',
    'howItWorks.subtitle': 'A simple platform connecting customers with trusted local service providers',
    'howItWorks.customers.title': 'For Customers',
    'howItWorks.customers.subtitle': 'Get your tasks done by local professionals',
    'howItWorks.customers.step1': '1. Post Your Job',
    'howItWorks.customers.step1Desc': 'Create a detailed job posting with photos, budget, and location. Our system automatically translates to Spanish.',
    'howItWorks.customers.step2': '2. Review Provider Bids',
    'howItWorks.customers.step2Desc': 'Receive private bids from local providers. Compare prices, reviews, and proposals to find the perfect match.',
    'howItWorks.customers.step3': '3. Hire & Pay',
    'howItWorks.customers.step3Desc': 'Award the job to your chosen provider. Pay in cash when the work is complete. The platform fee is automatically collected.',
    'howItWorks.customers.step4': '4. Leave a Review',
    'howItWorks.customers.step4Desc': 'Rate your experience and help other customers find great providers.',
    'howItWorks.customers.cta': 'Post Your First Job',
    'howItWorks.providers.title': 'For Service Providers',
    'howItWorks.providers.subtitle': 'Grow your business with local customers',
    'howItWorks.providers.step1': '1. Create Your Profile',
    'howItWorks.providers.step1Desc': 'Showcase your skills, add portfolio photos, and set your service area. Build trust with potential customers.',
    'howItWorks.providers.step2': '2. Browse Jobs & Bid',
    'howItWorks.providers.step2Desc': 'Find jobs that match your skills. Submit competitive bids with detailed proposals to win work.',
    'howItWorks.providers.step3': '3. Get Hired',
    'howItWorks.providers.step3Desc': 'Communicate with customers, confirm details, and complete the job to their satisfaction.',
    'howItWorks.providers.step4': '4. Build Reputation',
    'howItWorks.providers.step4Desc': 'Collect 5-star reviews and grow your business through the platform.',
    'howItWorks.providers.cta': 'Join as Provider',
    'howItWorks.faq.title': 'Frequently Asked Questions',
    'howItWorks.faq.q1': 'How does the payment system work?',
    'howItWorks.faq.a1': 'Customers pay providers directly in cash when the job is completed. The platform automatically collects a 10% fee from both parties through saved payment methods.',
    'howItWorks.faq.q2': 'What categories are available?',
    'howItWorks.faq.a2': 'We support Cleaning, Moving, Landscaping, Handyman services, Events, and Other miscellaneous services across Texas.',
    'howItWorks.faq.q3': 'Is there a fee to use Service HUB?',
    'howItWorks.faq.a3': 'Posting jobs and browsing providers is free. We charge a 10% platform fee from both customers and providers only when a job is successfully completed.',
    'howItWorks.faq.q4': 'How are providers verified?',
    'howItWorks.faq.a4': 'Providers create detailed profiles with their skills and portfolio. They build reputation through customer reviews and ratings visible on their public profiles.',
    'howItWorks.faq.q5': 'Can I message providers before hiring?',
    'howItWorks.faq.a5': "Yes! Our in-app messaging system allows you to communicate with providers, ask questions, and clarify details before making a decision.",
  },
  es: {
    // Navigation
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
    // Landing Page
    'landing.hero.title': 'Encuentra Ayuda Local para Cualquier Tarea',
    'landing.hero.subtitle': 'Conéctate con proveedores de servicios confiables en Texas. Publica un trabajo, recibe ofertas competitivas y contrata al profesional perfecto.',
    'landing.hero.search': '¿Qué servicio necesitas? (ej., limpieza de casa, ayuda para mudanza...)',
    'landing.hero.searchButton': 'Buscar',
    'landing.hero.postJob': 'Publicar Trabajo',
    'landing.hero.joinProvider': 'Unirse como Proveedor',
    'landing.stats.activeProviders': 'Proveedores Activos',
    'landing.stats.jobsCompleted': 'Trabajos Completados',
    'landing.stats.avgRating': 'Calificación Promedio',
    'landing.stats.avgResponse': 'Tiempo de Respuesta Prom.',
    'landing.categories.title': 'Servicios Populares',
    'landing.categories.subtitle': 'Elige entre nuestras categorías de servicios más solicitadas',
    'landing.categories.viewAll': 'Ver Todos los Servicios',
    'landing.howItWorks.title': 'Cómo Funciona',
    'landing.howItWorks.subtitle': 'Comienza en tres simples pasos',
    'landing.howItWorks.step1': 'Publica Tu Trabajo',
    'landing.howItWorks.step1Desc': 'Describe lo que necesitas y establece tu presupuesto',
    'landing.howItWorks.step2': 'Revisa Ofertas',
    'landing.howItWorks.step2Desc': 'Compara propuestas de proveedores locales',
    'landing.howItWorks.step3': 'Hazlo Realidad',
    'landing.howItWorks.step3Desc': 'Contrata al mejor proveedor y paga cuando termine',
    'landing.howItWorks.learnMore': 'Saber Más',
    'landing.testimonials.title': 'Lo Que Dice la Gente',
    'landing.testimonials.subtitle': 'Confiado por miles en todo Texas',
    'landing.testimonials.customer': 'Cliente',
    'landing.testimonials.provider': 'Proveedor',
    'landing.cta.title': '¿Listo para Comenzar?',
    'landing.cta.subtitle': 'Únete a miles de clientes satisfechos y proveedores de servicios mejor calificados en Service HUB hoy.',
    'landing.cta.postJob': 'Publicar un Trabajo Ahora',
    'landing.cta.becomeProvider': 'Conviértete en Proveedor',
    // Services Page
    'services.title': 'Explorar Trabajos Abiertos',
    'services.subtitle': 'Encuentra trabajos y comienza a ofertar - Se requiere inicio de sesión para enviar ofertas',
    'services.search': 'Buscar trabajos...',
    'services.allCategories': 'Todas las Categorías',
    'services.showing': 'Mostrando',
    'services.openJobs': 'abiertos',
    'services.job': 'trabajo',
    'services.jobs': 'trabajos',
    'services.noJobs': 'No se encontraron trabajos abiertos',
    'services.adjustFilters': 'Intenta ajustar tu búsqueda o filtros',
    'services.beFirst': 'Sé el primero en publicar un trabajo',
    'services.postJob': 'Publicar un Trabajo',
    'services.cta.title': '¿Necesitas un Proveedor de Servicios?',
    'services.cta.subtitle': 'Publica tu trabajo y recibe ofertas competitivas de profesionales locales',
    'services.cta.button': 'Publicar un Trabajo Ahora',
    // How It Works Page
    'howItWorks.title': 'Cómo Funciona Service HUB',
    'howItWorks.subtitle': 'Una plataforma simple que conecta clientes con proveedores de servicios locales confiables',
    'howItWorks.customers.title': 'Para Clientes',
    'howItWorks.customers.subtitle': 'Haz que tus tareas sean realizadas por profesionales locales',
    'howItWorks.customers.step1': '1. Publica Tu Trabajo',
    'howItWorks.customers.step1Desc': 'Crea una publicación de trabajo detallada con fotos, presupuesto y ubicación. Nuestro sistema traduce automáticamente al español.',
    'howItWorks.customers.step2': '2. Revisa Ofertas de Proveedores',
    'howItWorks.customers.step2Desc': 'Recibe ofertas privadas de proveedores locales. Compara precios, reseñas y propuestas para encontrar la combinación perfecta.',
    'howItWorks.customers.step3': '3. Contrata y Paga',
    'howItWorks.customers.step3Desc': 'Asigna el trabajo a tu proveedor elegido. Paga en efectivo cuando el trabajo esté completo. La tarifa de plataforma se cobra automáticamente.',
    'howItWorks.customers.step4': '4. Deja una Reseña',
    'howItWorks.customers.step4Desc': 'Califica tu experiencia y ayuda a otros clientes a encontrar excelentes proveedores.',
    'howItWorks.customers.cta': 'Publica Tu Primer Trabajo',
    'howItWorks.providers.title': 'Para Proveedores de Servicios',
    'howItWorks.providers.subtitle': 'Haz crecer tu negocio con clientes locales',
    'howItWorks.providers.step1': '1. Crea Tu Perfil',
    'howItWorks.providers.step1Desc': 'Muestra tus habilidades, agrega fotos de portafolio y establece tu área de servicio. Construye confianza con clientes potenciales.',
    'howItWorks.providers.step2': '2. Explora Trabajos y Oferta',
    'howItWorks.providers.step2Desc': 'Encuentra trabajos que coincidan con tus habilidades. Envía ofertas competitivas con propuestas detalladas para ganar trabajo.',
    'howItWorks.providers.step3': '3. Sé Contratado',
    'howItWorks.providers.step3Desc': 'Comunícate con los clientes, confirma detalles y completa el trabajo a su satisfacción.',
    'howItWorks.providers.step4': '4. Construye Reputación',
    'howItWorks.providers.step4Desc': 'Recolecta reseñas de 5 estrellas y haz crecer tu negocio a través de la plataforma.',
    'howItWorks.providers.cta': 'Unirse como Proveedor',
    'howItWorks.faq.title': 'Preguntas Frecuentes',
    'howItWorks.faq.q1': '¿Cómo funciona el sistema de pago?',
    'howItWorks.faq.a1': 'Los clientes pagan a los proveedores directamente en efectivo cuando el trabajo se completa. La plataforma cobra automáticamente una tarifa del 10% de ambas partes a través de métodos de pago guardados.',
    'howItWorks.faq.q2': '¿Qué categorías están disponibles?',
    'howItWorks.faq.a2': 'Apoyamos Limpieza, Mudanza, Jardinería, servicios de Reparación, Eventos y Otros servicios misceláneos en todo Texas.',
    'howItWorks.faq.q3': '¿Hay una tarifa por usar Service HUB?',
    'howItWorks.faq.a3': 'Publicar trabajos y explorar proveedores es gratis. Cobramos una tarifa de plataforma del 10% a clientes y proveedores solo cuando un trabajo se completa exitosamente.',
    'howItWorks.faq.q4': '¿Cómo se verifican los proveedores?',
    'howItWorks.faq.a4': 'Los proveedores crean perfiles detallados con sus habilidades y portafolio. Construyen reputación a través de reseñas y calificaciones de clientes visibles en sus perfiles públicos.',
    'howItWorks.faq.q5': '¿Puedo enviar mensajes a proveedores antes de contratar?',
    'howItWorks.faq.a5': '¡Sí! Nuestro sistema de mensajería integrado te permite comunicarte con proveedores, hacer preguntas y aclarar detalles antes de tomar una decisión.',
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
