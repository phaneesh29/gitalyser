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

export default function SettingsPage() {
  const router = useRouter();
  const { data, isPending } = useSession();

  // Not signed in → send to the login page.
  useEffect(() => {
    if (!isPending && !data) router.replace("/login");
  }, [isPending, data, router]);

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#ebebeb] bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">
            Gitalyser<span className="text-[#888888]">.</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] text-[#4d4d4d] transition-colors hover:bg-black/5 hover:text-[#171717]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              Overview
            </Link>
            <Link href="/settings" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] text-[#171717] bg-black/5 font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ServerStatus />
        </div>
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
