import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center">
              <img src={logo} alt="Housecal Pro" className="h-8 sm:h-10 w-auto" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3 text-sm sm:text-base">{t('footer.company')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-sm sm:text-base">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-sm sm:text-base">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="text-muted-foreground break-words">
                {t('footer.email')}: support@housecalpro.com
              </li>
              <li className="text-muted-foreground">
                {t('footer.location')}: {t('footer.locationValue')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Housecal Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
