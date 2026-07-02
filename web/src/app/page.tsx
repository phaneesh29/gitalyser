import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Code2,
  Sparkles,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BarChart3,
    title: "Repository health",
    body: "Stars, forks, issue and PR trends, language breakdown, and file-size distribution at a glance.",
  },
  {
    icon: Activity,
    title: "Activity & contribution",
    body: "Commit-frequency heatmaps, per-author breakdowns, and code churn over time.",
  },
  {
    icon: Code2,
    title: "Code quality",
    body: "AST-based cyclomatic complexity, structure visualisation, and source-vs-comment metrics.",
  },
  {
    icon: ShieldCheck,
    title: "Dependency audits",
    body: "Dependency-tree visualisation, vulnerability scans for outdated packages, and license checks.",
  },
  {
    icon: Users,
    title: "Team dynamics",
    body: "PR lifecycle metrics, review turnaround, and bus-factor to surface knowledge silos.",
  },
  {
    icon: Sparkles,
    title: "AI summaries",
    body: "LLM-generated architectural walkthroughs and milestone summaries from commit history.",
  },
];

const steps = [
  { n: "01", t: "Input", d: "Paste a public or authorised private GitHub repository URL." },
  { n: "02", t: "Fetch", d: "We pull metadata, files, issues, PRs, and commit logs from GitHub." },
  { n: "03", t: "Parse", d: "The AST engine evaluates syntax trees and dependency listings." },
  { n: "04", t: "Analyse", d: "Metrics like churn, heatmaps, and complexity are aggregated." },
  { n: "05", t: "Render", d: "Findings become interactive charts, graphs, and code maps." },
];

export default function Landing() {
  return (
    <div className="flex min-h-full flex-col">
      {/* nav-bar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
        <span className="text-lg font-semibold tracking-[-0.02em]">
          Gitalyser<span className="text-[#888]">.</span>
        </span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* hero-band with mesh gradient backdrop */}
        <section className="relative overflow-hidden">
          <div className="mesh-hero pointer-events-none absolute inset-x-0 top-0 h-[440px]" />
          <div className="relative mx-auto max-w-3xl px-6 pt-24 pb-20 text-center">
            <span className="eyebrow">GitHub Repository Analyser</span>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl sm:leading-[1.05]">
              Understand any repository at a glance.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-balance">
              Gitalyser turns commit history, code complexity, dependencies, and
              collaboration patterns into actionable insight — so you can ship
              better code, faster.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Get started
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">See what it does</a>
              </Button>
            </div>
          </div>
        </section>

        {/* feature grid */}
        <section id="features" className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Features</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              Everything you need to read a codebase.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 shadow-card"
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-secondary text-foreground">
                  <Icon className="size-4.5" />
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* how it works — polarity-flipped dark band */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="max-w-2xl">
              <span className="eyebrow text-[#a1a1a1]">How it works</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                From URL to insight in five steps.
              </h2>
            </div>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((s) => (
                <li key={s.n}>
                  <span className="font-mono text-sm text-[#888]">{s.n}</span>
                  <h3 className="mt-2 text-base font-medium">{s.t}</h3>
                  <p className="mt-1 text-sm text-[#a1a1a1]">{s.d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12">
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">
                  Analyse your first repo
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
          <span className="text-sm font-semibold tracking-[-0.02em]">
            Gitalyser<span className="text-[#888]">.</span>
          </span>
          <p className="font-mono text-xs text-[#888]">
            © {new Date().getFullYear()} Gitalyser — GitHub Repository Analyser
          </p>
        </div>
      </footer>
    </div>
  );
}
