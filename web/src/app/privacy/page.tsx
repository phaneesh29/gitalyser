import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Gitalyser",
  description: "Privacy policy for Gitalyser.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>
            When you use Gitalyser, we collect information that you provide to us directly, such as when you create an 
            account using GitHub. This includes your GitHub profile information, email address, and repository data 
            necessary to provide our analytics services.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services.</li>
            <li>Analyze your GitHub repositories and generate insights.</li>
            <li>Communicate with you regarding your account or our services.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With your consent or at your direction.</li>
            <li>To comply with legal obligations.</li>
            <li>To protect the rights, property, or safety of Gitalyser, our users, or others.</li>
          </ul>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, 
            disclosure, alteration, and destruction. However, no internet or electronic storage system is 100% secure.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">5. Your Data Rights</h2>
          <p>
            You have the right to access, update, or delete your account information at any time. You can also revoke our 
            access to your GitHub account directly from your GitHub settings.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold">6. Changes to this Policy</h2>
          <p>
            We may change this privacy policy from time to time. If we make changes, we will notify you by revising the date 
            at the top of the policy and, in some cases, we may provide you with additional notice.
          </p>
        </section>
      </div>
    </div>
  );
}
