"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { SignInCard } from "@/components/sign-in-card";

export default function LoginPage() {
  const router = useRouter();
  const { data, isPending } = useSession();

  // Already signed in → skip the login screen.
  useEffect(() => {
    if (!isPending && data) router.replace("/dashboard");
  }, [isPending, data, router]);

  return (
    <div className="flex min-h-full flex-col">
      {/* Vercel-style Nav */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#ebebeb] bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">
            Gitalyser<span className="text-[#888888]">.</span>
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
        <div className="mesh-hero pointer-events-none absolute inset-x-0 top-0 h-[65%]" />
        {isPending || data ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <SignInCard />
        )}
      </main>
    </div>
  );
}
