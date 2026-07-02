"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, LayoutDashboard, Settings } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { ServerStatus } from "@/components/server-status";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
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
            <Link href="/dashboard" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] text-[#171717] bg-black/5 font-medium transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/settings" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] text-[#4d4d4d] transition-colors hover:bg-black/5 hover:text-[#171717]">
              <Settings className="h-4 w-4" />
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
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-semibold tracking-[-1.28px] text-[#171717]">
                Welcome back, {data.user.name?.split(" ")[0] || "Developer"}
              </h1>
              <p className="mt-2 text-[16px] text-[#4d4d4d]">
                Ready to analyse some code today?
              </p>
            </div>
            <Button className="h-[40px] rounded-full bg-[#171717] px-5 text-[14px] font-medium text-white hover:bg-[#383838]">
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>

          <div className="mt-8 rounded-[12px] border border-dashed border-[#ebebeb] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fafafa] border border-[#ebebeb] text-[#171717]">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.6px] text-[#171717]">
              No analyses yet
            </h3>
            <p className="mt-2 text-[14px] text-[#4d4d4d]">
              Get started by analysing your first GitHub repository.
            </p>
            <Button className="mt-6 h-[40px] rounded-[6px] bg-[#171717] px-5 text-[14px] font-medium text-white hover:bg-[#383838]">
              <Plus className="mr-2 h-4 w-4" />
              Analyse a Repository
            </Button>
          </div>
        </main>
      )}
    </div>
  );
}
