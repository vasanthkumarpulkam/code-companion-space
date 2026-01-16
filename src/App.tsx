import React, { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Critical pages loaded immediately
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Lazy load non-critical pages for better performance
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Services = lazy(() => import("./pages/Services"));
const ServiceCategory = lazy(() => import("./pages/ServiceCategory"));
const Support = lazy(() => import("./pages/Support"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const Providers = lazy(() => import("./pages/Providers"));
const TopProviders = lazy(() => import("./pages/TopProviders"));
const Jobs = lazy(() => import("./pages/jobs/Jobs"));
const NewJob = lazy(() => import("./pages/jobs/NewJob"));
const JobDetail = lazy(() => import("./pages/jobs/JobDetail"));
const Chats = lazy(() => import("./pages/Chats"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RequestService = lazy(() => import("./pages/RequestService"));
const ServiceRequestWizard = lazy(() => import("./pages/ServiceRequestWizard"));
const MyQuotes = lazy(() => import("./pages/MyQuotes"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/services" element={<Services />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/top-providers" element={<TopProviders />} />
            <Route path="/services/:category" element={<ServiceCategory />} />
            <Route path="/support" element={<Support />} />
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider-dashboard" 
              element={
                <ProtectedRoute>
                  <ProviderDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/request-service" element={<RequestService />} />
            <Route path="/request-service/:category" element={<RequestService />} />
            <Route path="/request-service/:category/:subcategory" element={<ServiceRequestWizard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route 
              path="/jobs/new" 
              element={
                <ProtectedRoute>
                  <NewJob />
                </ProtectedRoute>
              } 
            />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route 
              path="/chats" 
              element={
                <ProtectedRoute>
                  <Chats />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-quotes" 
              element={
                <ProtectedRoute>
                  <MyQuotes />
                </ProtectedRoute>
              } 
            />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
