import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Service HUB, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Platform Description</h2>
              <p className="text-muted-foreground">
                Service HUB is a marketplace platform that connects customers with local service providers across Texas. We facilitate job postings, bidding, and connections but are not directly involved in the service delivery or payment transactions between users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground mb-2">
                Users must create an account to access platform features. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Platform Fees</h2>
              <p className="text-muted-foreground">
                Service HUB charges a 10% platform fee from both customers and service providers upon successful job completion. This fee is automatically collected from saved payment methods when both parties mark the job as completed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. User Conduct</h2>
              <p className="text-muted-foreground mb-2">
                Users agree not to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to bypass platform fees</li>
                <li>Use the platform for any illegal purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Content and Intellectual Property</h2>
              <p className="text-muted-foreground">
                Users retain ownership of content they post but grant Service HUB a license to use, display, and distribute such content on the platform. All platform features, design, and functionality remain the exclusive property of Service HUB.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Service HUB acts solely as a platform connecting customers and providers. We are not responsible for the quality, safety, or legality of services provided, the ability of providers to deliver services, or the ability of customers to pay for services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                Disputes between users should first be resolved directly. If resolution cannot be reached, users may contact our support team for mediation assistance. All disputes will be governed by the laws of the State of Texas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these terms. Users may also delete their accounts at any time through account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                Service HUB reserves the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at legal@servicehub.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
