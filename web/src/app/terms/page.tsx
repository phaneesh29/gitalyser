import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions - Gitalyser",
  description: "Terms and conditions for using Gitalyser.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Terms and Conditions
        </h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Gitalyser, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">2. Description of Service</h2>
          <p>
            Gitalyser provides analytics and insights for GitHub repositories. We require access to your GitHub 
            account to fetch repository data and provide these insights. You are responsible for maintaining 
            the confidentiality of your account and password.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">3. User Conduct</h2>
          <p>
            You agree not to use the service for any illegal or unauthorized purpose. You must not, in the use of the 
            service, violate any laws in your jurisdiction.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">4. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "as is" and "as available" basis without any warranties of any kind. 
            We do not warrant that the service will be uninterrupted, timely, secure, or error-free.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
          <p>
            In no event shall Gitalyser be liable for any direct, indirect, incidental, special, or consequential 
            damages resulting from the use or inability to use the service.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated 
            terms on the site. Your decision to continue to visit and make use of the site after such changes have been made 
            constitutes your formal acceptance of the new Terms of Service.
          </p>
        </section>
      </div>
    </div>
  );
}
