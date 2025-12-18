import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Home, ArrowLeft, Award } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  hideBackButton?: boolean;
}

export const Header = ({ hideBackButton = false }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo with conditional Back Button */}
          <div className="flex items-center gap-1 sm:gap-2">
            {!hideBackButton && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-accent h-9 w-9 sm:h-10 sm:w-10"
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Housecal Pro" className="h-10 sm:h-12 w-auto" />
              <span className="hidden sm:inline-block font-bold text-lg text-primary">Housecal Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              {t('nav.home')}
            </Link>
            <Link to="/services" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              {t('jobs.findJobs')}
            </Link>
            <Link to="/top-providers" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1">
              <Award className="h-4 w-4" />
              Top Providers
            </Link>
            <Link to="/providers" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              {t('header.findProviders')}
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              {t('nav.howItWorks')}
            </Link>
            <Link to="/support" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              {t('header.support')}
            </Link>
          </nav>

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <LanguageSwitcher />
            {user ? (
              <>
                <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 lg:h-10 lg:w-10">
                    <User className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background z-[100]">
                  <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer text-sm">{t('nav.dashboard')}</Link>
                  </DropdownMenuItem>
                  {userRole === 'provider' && (
                    <DropdownMenuItem asChild>
                      <Link to="/provider-dashboard" className="cursor-pointer text-sm">Provider Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`} className="cursor-pointer text-sm">{t('nav.profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/edit" className="cursor-pointer text-sm">Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer text-sm">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chats" className="cursor-pointer text-sm">{t('nav.messages')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-quotes" className="cursor-pointer text-sm">My Quotes</Link>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer text-sm">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive text-sm">
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-sm h-9 lg:h-10">
                  <Link to="/auth/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild className="text-sm h-9 lg:h-10">
                  <Link to="/auth/signup">{t('nav.signup')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationBell />}
            <button
              className="md:hidden p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <div className="flex justify-end mb-2">
              <LanguageSwitcher />
            </div>
            <Link
              to="/"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              {t('nav.home')}
            </Link>
            <Link
              to="/services"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('jobs.findJobs')}
            </Link>
            <Link
              to="/providers"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.findProviders')}
            </Link>
            <Link
              to="/how-it-works"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.howItWorks')}
            </Link>
            <Link
              to="/support"
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.support')}
            </Link>
            <div className="flex flex-col space-y-2 pt-3 border-t">
              {user ? (
                <>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                    <Link to="/dashboard">{t('nav.dashboard')}</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                    <Link to={`/profile/${user.id}`}>{t('nav.profile')}</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                    <Link to="/profile/edit">Edit Profile</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                    <Link to="/settings">Settings</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                    <Link to="/chats">{t('nav.messages')}</Link>
                  </Button>
                  {userRole === 'admin' && (
                    <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                      <Link to="/admin">Admin Panel</Link>
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="justify-start h-11"
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                    <Link to="/auth/login">{t('nav.login')}</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)} className="justify-start h-11">
                    <Link to="/auth/signup">{t('nav.signup')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
