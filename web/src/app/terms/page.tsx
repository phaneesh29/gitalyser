import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions - Gitalyser",
  description: "Terms and conditions for using Gitalyser.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-24">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>
      
      <main className="rounded-xl border border-border bg-card p-8 shadow-card md:p-16">
        <h1 className="mb-4 text-4xl font-semibold tracking-[-1.28px] md:text-[48px] md:tracking-[-2.4px] md:leading-[48px]">
          Terms and Conditions.
        </h1>
        <p className="eyebrow mb-12">
          Last updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">1. Acceptance of Terms</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              By accessing and using Gitalyser, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">2. Description of Service</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              Gitalyser provides analytics and insights for GitHub repositories. We require access to your GitHub 
              account to fetch repository data and provide these insights. You are responsible for maintaining 
              the confidentiality of your account and password.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">3. User Conduct</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              You agree not to use the service for any illegal or unauthorized purpose. You must not, in the use of the 
              service, violate any laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">4. Disclaimer of Warranties</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              The service is provided on an "as is" and "as available" basis without any warranties of any kind. 
              We do not warrant that the service will be uninterrupted, timely, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">5. Limitation of Liability</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              In no event shall Gitalyser be liable for any direct, indirect, incidental, special, or consequential 
              damages resulting from the use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">6. Changes to Terms</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated 
              terms on the site. Your decision to continue to visit and make use of the site after such changes have been made 
              constitutes your formal acceptance of the new Terms of Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
