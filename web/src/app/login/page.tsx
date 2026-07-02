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
      <header className="flex h-16 items-center border-b border-border bg-card/80 px-6 backdrop-blur-sm">
        <Link href="/" className="text-lg font-semibold tracking-[-0.02em]">
          Gitalyser<span className="text-[#888]">.</span>
        </Link>
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
