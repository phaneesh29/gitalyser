"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { ProfileCard } from "@/components/profile-card";
import { SessionsCard } from "@/components/sessions-card";
import { DangerZone } from "@/components/danger-zone";
import { ServerStatus } from "@/components/server-status";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isPending } = useSession();

  // Not signed in → send to the login page.
  useEffect(() => {
    if (!isPending && !data) router.replace("/login");
  }, [isPending, data, router]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
        <Link href="/" className="text-lg font-semibold tracking-[-0.02em]">
          Gitalyser<span className="text-[#888]">.</span>
        </Link>
        <ServerStatus />
      </header>

      {isPending || !data ? (
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
          <ProfileCard user={data.user} />
          <SessionsCard currentToken={data.session.token} />
          <DangerZone />
        </main>
      )}
    </div>
  );
}
