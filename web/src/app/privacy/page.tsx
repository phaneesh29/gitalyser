import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Gitalyser",
  description: "Privacy policy for Gitalyser.",
};

export default function PrivacyPage() {
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
          Privacy Policy.
        </h1>
        <p className="eyebrow mb-12">
          Last updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">1. Information We Collect</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              When you use Gitalyser, we collect information that you provide to us directly, such as when you create an 
              account using GitHub. This includes your GitHub profile information, email address, and repository data 
              necessary to provide our analytics services.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">2. How We Use Your Information</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-[#4d4d4d]">
              We use the information we collect to:
            </p>
            <ul className="list-inside list-disc space-y-2 text-[16px] leading-relaxed text-[#4d4d4d]">
              <li>Provide, maintain, and improve our services.</li>
              <li>Analyze your GitHub repositories and generate insights.</li>
              <li>Communicate with you regarding your account or our services.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">3. Information Sharing</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-[#4d4d4d]">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-inside list-disc space-y-2 text-[16px] leading-relaxed text-[#4d4d4d]">
              <li>With your consent or at your direction.</li>
              <li>To comply with legal obligations.</li>
              <li>To protect the rights, property, or safety of Gitalyser, our users, or others.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">4. Data Security</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, 
              disclosure, alteration, and destruction. However, no internet or electronic storage system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">5. Your Data Rights</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              You have the right to access, update, or delete your account information at any time. You can also revoke our 
              access to your GitHub account directly from your GitHub settings.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-[24px] font-semibold tracking-[-0.96px] text-foreground">6. Changes to this Policy</h2>
            <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
              We may change this privacy policy from time to time. If we make changes, we will notify you by revising the date 
              at the top of the policy and, in some cases, we may provide you with additional notice.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
