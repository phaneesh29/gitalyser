"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Star,
  GitFork,
  CircleDot,
  GitPullRequest,
  ExternalLink,
  FileCode2,
  FlaskConical,
  Workflow,
  Container,
  Tag,
  Users,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { api, ApiError, timeAgo, type Analysis } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LANG_COLORS = ["#0070f3", "#7c3aed", "#10b981", "#f5a623", "#ee0000", "#06b6d4", "#ec4899", "#84cc16"];

const STATUS_COLOR: Record<string, string> = {
  active: "text-emerald-600",
  maintained: "text-[#0070f3]",
  stale: "text-[#f5a623]",
  abandoned: "text-[#888]",
  archived: "text-[#888]",
};

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data, isPending } = useSession();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const autoRefreshed = useRef(false);

  useEffect(() => {
    if (!isPending && !data) router.replace("/login");
  }, [isPending, data, router]);

  const doRefresh = useCallback(
    async (auto = false) => {
      setRefreshing(true);
      try {
        const a = await api<Analysis>(`/api/analyses/${id}/refresh`, { method: "POST" });
        setAnalysis(a);
        if (!auto) toast.success("Snapshot refreshed");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Refresh failed");
      } finally {
        setRefreshing(false);
      }
    },
    [id],
  );

  const load = useCallback(async () => {
    try {
      const a = await api<Analysis>(`/api/analyses/${id}`);
      setAnalysis(a);
      setStatus("ready");
      // Stale-while-revalidate: cached snapshot is shown immediately; if it's
      // past the 24h TTL, refresh in the background exactly once.
      if (a.isStale && !autoRefreshed.current) {
        autoRefreshed.current = true;
        doRefresh(true);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setStatus("notfound");
      } else {
        toast.error("Could not load this workspace.");
        setStatus("notfound");
      }
    }
  }, [id, doRefresh]);

  useEffect(() => {
    if (!data) return;
    let active = true;
    (async () => {
      if (active) await load();
    })();
    return () => {
      active = false;
    };
  }, [data, load]);

  async function handleDelete() {
    try {
      await api(`/api/analyses/${id}`, { method: "DELETE" });
      toast.success("Workspace deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Could not delete workspace.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#ebebeb] bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">
            Gitalyser<span className="text-[#888888]">.</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] text-[#4d4d4d] transition-colors hover:bg-black/5 hover:text-[#171717]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      {isPending || !data || status === "loading" ? (
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-[12px]" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-[12px]" />
        </main>
      ) : status === "notfound" ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-[24px] font-semibold tracking-[-0.6px] text-[#171717]">Workspace not found</h1>
          <p className="text-[14px] text-[#4d4d4d]">It may have been deleted, or it doesn’t belong to you.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </main>
      ) : (
        analysis && (
          <WorkspaceView
            analysis={analysis}
            refreshing={refreshing}
            onRefresh={() => doRefresh(false)}
            onDelete={handleDelete}
          />
        )
      )}
    </div>
  );
}

function WorkspaceView({
  analysis,
  refreshing,
  onRefresh,
  onDelete,
}: {
  analysis: Analysis;
  refreshing: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const { context: ctx } = analysis;
  const { meta, health, activity, structure, derived } = ctx;
  const languages = Object.entries(ctx.languages).sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={meta.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-[22px] font-semibold tracking-[-0.5px] text-[#171717] hover:underline"
              >
                {meta.fullName}
                <ExternalLink className="h-4 w-4 text-[#888]" />
              </a>
              <Badge variant="outline" className="gap-1">
                {analysis.analysisType === "lite_speed" ? "Lite" : "Deep"}
              </Badge>
              {derived.activityStatus && (
                <span className={`text-[13px] font-medium ${STATUS_COLOR[derived.activityStatus] ?? "text-[#888]"}`}>
                  {derived.activityStatus}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-[15px] text-[#4d4d4d]">{meta.description || "No description."}</p>
            {meta.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {meta.topics.slice(0, 8).map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#888]">
              {analysis.isStale ? "stale" : `updated ${timeAgo(analysis.fetchedAt)}`}
            </span>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <DeleteButton repo={meta.fullName} onDelete={onDelete} />
          </div>
        </div>

        {(meta.license || meta.defaultBranch || derived.stackSummary) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-[#4d4d4d]">
            {derived.stackSummary && <span>{derived.stackSummary}</span>}
            {meta.license && <span>License: {meta.license}</span>}
            {meta.defaultBranch && <span className="font-mono text-[12px]">{meta.defaultBranch}</span>}
            <span>Type: {derived.projectType}</span>
          </div>
        )}
      </div>

      {/* Health stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Star className="h-4 w-4" />} label="Stars" value={health.stars} />
        <StatCard icon={<GitFork className="h-4 w-4" />} label="Forks" value={health.forks} />
        <StatCard icon={<CircleDot className="h-4 w-4" />} label="Open issues" value={health.openIssues} />
        <StatCard icon={<GitPullRequest className="h-4 w-4" />} label="Open PRs" value={health.openPRs} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Languages */}
        <Section title="Languages">
          {languages.length === 0 ? (
            <Empty>No language data.</Empty>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                {languages.slice(0, 8).map(([name, pct], i) => (
                  <div
                    key={name}
                    style={{ width: `${pct}%`, backgroundColor: LANG_COLORS[i % LANG_COLORS.length] }}
                    title={`${name} ${pct}%`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {languages.slice(0, 8).map(([name, pct], i) => (
                  <span key={name} className="flex items-center gap-1.5 text-[13px] text-[#4d4d4d]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: LANG_COLORS[i % LANG_COLORS.length] }}
                    />
                    {name} <span className="text-[#888]">{pct}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Structure */}
        <Section title="Structure & health">
          <div className="flex flex-col gap-3 text-[13px] text-[#4d4d4d]">
            <div className="flex flex-wrap gap-2">
              <Signal ok={structure.keyFiles.hasTests} icon={<FlaskConical className="h-3.5 w-3.5" />} label="Tests" />
              <Signal ok={structure.keyFiles.hasCI} icon={<Workflow className="h-3.5 w-3.5" />} label="CI" />
              <Signal ok={structure.keyFiles.dockerized} icon={<Container className="h-3.5 w-3.5" />} label="Docker" />
            </div>
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-[#888]" />
              {structure.entryCount.toLocaleString()} files
              {structure.treeTruncated && <span className="text-[#888]">(truncated)</span>}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#888]" />
              Bus factor: {derived.busFactor}
            </div>
            <div>{activity.commitCount.toLocaleString()} total commits</div>
            {Object.keys(ctx.manifests).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(ctx.manifests).map((f) => (
                  <Badge key={f} variant="outline" className="font-mono">
                    {f}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Recent commits */}
        <Section title="Recent commits">
          {activity.recentCommits.length === 0 ? (
            <Empty>No commits.</Empty>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {activity.recentCommits.slice(0, 8).map((c) => (
                <li key={c.sha} className="flex items-start justify-between gap-3 text-[13px]">
                  <span className="min-w-0 flex-1 truncate text-[#171717]">{c.message}</span>
                  <span className="shrink-0 font-mono text-[11px] text-emerald-600">+{c.additions}</span>
                  <span className="shrink-0 font-mono text-[11px] text-[#ee0000]">−{c.deletions}</span>
                  <span className="shrink-0 text-[11px] text-[#888]">{c.author}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Contributors + release */}
        <Section title="Contributors">
          {activity.contributors.length === 0 ? (
            <Empty>No contributor data.</Empty>
          ) : (
            <div className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2">
                {activity.contributors.slice(0, 6).map((c) => (
                  <li key={c.login} className="flex items-center justify-between text-[13px]">
                    <span className="font-mono text-[#171717]">{c.login}</span>
                    <span className="text-[#888]">{c.commits} recent</span>
                  </li>
                ))}
              </ul>
              {activity.lastRelease && (
                <div className="flex items-center gap-2 border-t border-[#ebebeb] pt-3 text-[13px] text-[#4d4d4d]">
                  <Tag className="h-3.5 w-3.5 text-[#888]" />
                  Latest: <span className="font-mono text-[#171717]">{activity.lastRelease.tagName}</span>
                  <span className="text-[#888]">{timeAgo(activity.lastRelease.publishedAt)}</span>
                </div>
              )}
            </div>
          )}
        </Section>
      </div>

      {/* Open issues / PRs */}
      {(activity.openIssueTitles.length > 0 || activity.openPRTitles.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title="Open issues">
            {activity.openIssueTitles.length === 0 ? (
              <Empty>None open.</Empty>
            ) : (
              <ul className="flex flex-col gap-2 text-[13px]">
                {activity.openIssueTitles.map((it) => (
                  <li key={it.number} className="flex gap-2">
                    <span className="font-mono text-[#888]">#{it.number}</span>
                    <span className="min-w-0 flex-1 truncate text-[#171717]">{it.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title="Open pull requests">
            {activity.openPRTitles.length === 0 ? (
              <Empty>None open.</Empty>
            ) : (
              <ul className="flex flex-col gap-2 text-[13px]">
                {activity.openPRTitles.map((it) => (
                  <li key={it.number} className="flex gap-2">
                    <span className="font-mono text-[#888]">#{it.number}</span>
                    <span className="min-w-0 flex-1 truncate text-[#171717]">{it.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </main>
  );
}

// ── Small building blocks ────────────────────────────────────────────────────
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-[12px] border border-[#ebebeb] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-semibold tracking-[-0.5px] text-[#171717]">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[#ebebeb] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[13px] font-medium uppercase tracking-[0.04em] text-[#888]">{title}</h2>
      {children}
    </div>
  );
}

function Signal({ ok, icon, label }: { ok: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#ebebeb] bg-[#fafafa] text-[#888]"
      }`}
    >
      {icon}
      {label}
      {ok ? "" : " ✕"}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-[#888]">{children}</p>;
}

function DeleteButton({ repo, onDelete }: { repo: string; onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the analysis for <span className="font-mono">{repo}</span> and frees a slot. You can
            re-create it any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
