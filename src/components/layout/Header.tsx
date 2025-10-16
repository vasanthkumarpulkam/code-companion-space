import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">SH</span>
            </div>
            <span className="text-xl font-bold">Service HUB</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/services" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Services
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link to="/support" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Support
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth/signup">Sign Up</Link>
            </Button>
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
            <Link
              to="/services"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/how-it-works"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </Link>
            <Link
              to="/support"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild onClick={() => setMobileMenuOpen(false)}>
                <Link to="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
