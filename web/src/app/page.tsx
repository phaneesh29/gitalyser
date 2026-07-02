"use client";

import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { SignInCard } from "@/components/sign-in-card";
import { ProfileCard } from "@/components/profile-card";
import { SessionsCard } from "@/components/sessions-card";
import { DangerZone } from "@/components/danger-zone";
import { ServerStatus } from "@/components/server-status";

export default function Home() {
  const { data, isPending } = useSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">Gitalyser</span>
        <ServerStatus />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
        {isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center">
            <SignInCard />
          </div>
        ) : (
          <>
            <ProfileCard user={data.user} />
            <SessionsCard currentToken={data.session.token} />
            <DangerZone />
          </>
        )}
      </main>
    </div>
  );
}
