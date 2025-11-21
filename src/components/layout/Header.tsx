import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Home, ArrowLeft, Award } from "lucide-react";
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

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Back Button and Logo */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-accent"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">SH</span>
              </div>
              <span className="text-xl font-bold">Service HUB</span>
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
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <>
                <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">{t('nav.dashboard')}</Link>
                  </DropdownMenuItem>
                  {userRole === 'provider' && (
                    <DropdownMenuItem asChild>
                      <Link to="/provider-dashboard" className="cursor-pointer">Provider Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`} className="cursor-pointer">{t('nav.profile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/edit" className="cursor-pointer">Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chats" className="cursor-pointer">{t('nav.messages')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-quotes" className="cursor-pointer">My Quotes</Link>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/signup">{t('nav.signup')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            <div className="flex justify-end mb-2">
              <LanguageSwitcher />
            </div>
            <Link
              to="/"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              {t('nav.home')}
            </Link>
            <Link
              to="/services"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('jobs.findJobs')}
            </Link>
            <Link
              to="/providers"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.findProviders')}
            </Link>
            <Link
              to="/how-it-works"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.howItWorks')}
            </Link>
            <Link
              to="/support"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.support')}
            </Link>
            <div className="flex flex-col space-y-2 pt-4 border-t">
              {user ? (
                <>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/dashboard">{t('nav.dashboard')}</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to={`/profile/${user.id}`}>{t('nav.profile')}</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/profile/edit">Edit Profile</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/settings">Settings</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/chats">{t('nav.messages')}</Link>
                  </Button>
                  {userRole === 'admin' && (
                    <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/admin">Admin Panel</Link>
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/auth/login">{t('nav.login')}</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)}>
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
