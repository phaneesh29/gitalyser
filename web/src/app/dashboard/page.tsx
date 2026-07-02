"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  LayoutDashboard,
  Settings,
  Star,
  Zap,
  Sparkles,
  Circle,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { api, LITE_BASE, timeAgo, type WorkspaceListResponse, type WorkspaceSummary } from "@/lib/api";
import { ServerStatus } from "@/components/server-status";
import { NewAnalysisDialog } from "@/components/new-analysis-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const LITE_QUOTA = 5;

const STATUS_COLOR: Record<string, string> = {
  active: "text-emerald-600",
  maintained: "text-[#0070f3]",
  stale: "text-[#f5a623]",
  abandoned: "text-[#888]",
  archived: "text-[#888]",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data, isPending } = useSession();

  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[] | null>(null);
  const [quota, setQuota] = useState(LITE_QUOTA);

  // Not signed in → send to the login page.
  useEffect(() => {
    if (!isPending && !data) router.replace("/login");
  }, [isPending, data, router]);

  const loadWorkspaces = useCallback(async () => {
    try {
      const res = await api<WorkspaceListResponse>(LITE_BASE);
      setWorkspaces(res.workspaces);
      setQuota(res.quota);
    } catch {
      toast.error("Could not load your workspaces.");
      setWorkspaces([]);
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    let active = true;
    (async () => {
      if (active) await loadWorkspaces();
    })();
    return () => {
      active = false;
    };
  }, [data, loadWorkspaces]);

  const liteCount = workspaces?.length ?? 0;

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
                {liteCount > 0
                  ? `${liteCount}/${quota} Lite workspaces used`
                  : "Ready to analyse some code today?"}
              </p>
            </div>
            <NewAnalysisDialog
              onCreated={loadWorkspaces}
              trigger={
                <Button className="h-[40px] rounded-full bg-[#171717] px-5 text-[14px] font-medium text-white hover:bg-[#383838]">
                  <Plus className="mr-2 h-4 w-4" />
                  New Analysis
                </Button>
              }
            />
          </div>

          {workspaces === null ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[132px] rounded-[12px]" />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
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
              <NewAnalysisDialog
                onCreated={loadWorkspaces}
                trigger={
                  <Button className="mt-6 h-[40px] rounded-[6px] bg-[#171717] px-5 text-[14px] font-medium text-white hover:bg-[#383838]">
                    <Plus className="mr-2 h-4 w-4" />
                    Analyse a Repository
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((w) => (
                <WorkspaceCard key={w.id} workspace={w} />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

function WorkspaceCard({ workspace: w }: { workspace: WorkspaceSummary }) {
  const isLite = w.analysisType === "lite_speed";
  return (
    <Link
      href={`/workspace/${w.id}`}
      className="group flex flex-col justify-between rounded-[12px] border border-[#ebebeb] bg-white p-5 shadow-sm transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[14px] font-medium text-[#171717]">{w.gitRepo}</span>
          <Badge variant="outline" className="shrink-0 gap-1">
            {isLite ? <Zap className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            {isLite ? "Lite" : "Deep"}
          </Badge>
        </div>
        <p className="mt-2 line-clamp-2 min-h-[40px] text-[13px] text-[#4d4d4d]">
          {w.description || "No description."}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px] text-[#888]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {w.stars.toLocaleString()}
          </span>
          {w.primaryLanguage && <span>{w.primaryLanguage}</span>}
          {w.activityStatus && (
            <span className={`flex items-center gap-1 ${STATUS_COLOR[w.activityStatus] ?? "text-[#888]"}`}>
              <Circle className="h-2 w-2 fill-current" />
              {w.activityStatus}
            </span>
          )}
        </div>
        <span>{w.isStale ? "stale" : timeAgo(w.fetchedAt)}</span>
      </div>
    </Link>
  );
}
