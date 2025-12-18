import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-2">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Account information (name, email, phone number)</li>
                <li>Profile information (skills, location, bio, photos)</li>
                <li>Job postings and bids</li>
                <li>Messages and communications</li>
                <li>Payment information (stored securely via Stripe)</li>
                <li>Reviews and ratings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide and maintain our platform services</li>
                <li>Process transactions and send confirmations</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Translate content between English and Spanish</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-muted-foreground">
                We share your information only in specific circumstances:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>With other users:</strong> Your public profile information, job postings, and reviews are visible to other platform users</li>
                <li><strong>Service providers:</strong> We share information with third-party service providers who perform services on our behalf (payment processing, data analytics, email delivery)</li>
                <li><strong>Legal compliance:</strong> We may disclose information if required by law or in response to legal process</li>
                <li><strong>Business transfers:</strong> Information may be transferred in connection with a merger, sale, or acquisition</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Payment Information</h2>
              <p className="text-muted-foreground">
                Payment card information is processed and stored securely by Stripe, our payment processor. Housecal Pro does not directly store full credit card numbers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-2">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Access and update your account information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of promotional communications</li>
                <li>Request a copy of your data</li>
                <li>Object to certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings, though disabling cookies may limit platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Housecal Pro is not intended for users under the age of 18. We do not knowingly collect information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. International Users</h2>
              <p className="text-muted-foreground">
                Housecal Pro is based in Texas, USA, and primarily serves users in Texas. Information collected may be stored and processed in the United States.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify users of significant changes by email or through a notice on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@housecalpro.com
                <br />
                Address: Housecal Pro, Texas, USA
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
