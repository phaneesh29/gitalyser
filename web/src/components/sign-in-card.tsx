"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.575.106.785-.25.785-.556 0-.274-.01-1-.015-1.965-3.196.695-3.87-1.54-3.87-1.54-.523-1.33-1.277-1.684-1.277-1.684-1.044-.714.08-.699.08-.699 1.154.081 1.762 1.185 1.762 1.185 1.026 1.758 2.693 1.25 3.35.955.104-.743.401-1.25.73-1.538-2.552-.29-5.236-1.276-5.236-5.68 0-1.255.448-2.28 1.183-3.085-.119-.29-.513-1.458.112-3.04 0 0 .965-.309 3.163 1.178a10.98 10.98 0 0 1 2.88-.388c.977.004 1.96.132 2.88.388 2.196-1.487 3.16-1.178 3.16-1.178.626 1.582.232 2.75.114 3.04.737.805 1.18 1.83 1.18 3.085 0 4.415-2.688 5.386-5.25 5.67.413.355.78 1.056.78 2.13 0 1.538-.014 2.778-.014 3.157 0 .308.207.667.79.554A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function SignInCard() {
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function handleSignIn() {
    if (!termsAccepted) {
      toast.error("You must accept the Terms & Conditions and Privacy Policy");
      return;
    }
    setLoading(true);
    await signIn.social(
      {
        provider: "github",
        callbackURL: `${window.location.origin}/dashboard`,
      },
      {
        onError: ({ error }) => {
          setLoading(false);
          toast.error(error.message || "Sign in failed");
        },
      },
    );
  }

  return (
    <Card className="relative z-10 w-full max-w-[480px] gap-6 rounded-[12px] border border-[#ebebeb] bg-white p-10 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04),0_24px_32px_-8px_rgba(0,0,0,0.04)] sm:p-12">
      <div className="mb-8 text-center">
        <span className="mb-4 block font-mono text-[12px] uppercase tracking-[0.04em] text-[#888888]">
          Gitalyser
        </span>
        <h1 className="mb-3 text-[32px] font-semibold tracking-[-1.28px] text-[#171717]">
          Sign in to continue.
        </h1>
        <p className="text-[16px] leading-relaxed text-[#4d4d4d]">
          Connect your GitHub account to start analysing repositories.
        </p>
      </div>
      <div className="space-y-8">
        <div className="flex items-start space-x-3 rounded-[8px] border border-[#ebebeb] bg-[#fafafa] p-4">
          <Checkbox 
            id="terms" 
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            disabled={loading}
            className="mt-1"
          />
          <div className="grid gap-1.5">
            <label
              htmlFor="terms"
              className="text-[14px] font-medium leading-none text-[#171717] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
            <p className="text-[14px] leading-relaxed text-[#888888]">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-[#171717] underline decoration-[#ebebeb] underline-offset-4 hover:decoration-[#171717]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#171717] underline decoration-[#ebebeb] underline-offset-4 hover:decoration-[#171717]">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <Button
          className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[6px] bg-[#171717] text-[16px] font-medium text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] transition-colors hover:bg-[#383838]"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin text-white" size={18} />
          ) : (
            <GithubIcon className="size-5" />
          )}
          Continue with GitHub
        </Button>
      </div>
    </Card>
  );
}
