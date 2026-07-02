"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
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
  { n: "01", t: "Input URL", d: "Paste a public or authorised private GitHub repository." },
  { n: "02", t: "Fetch Data", d: "We pull metadata, files, issues, PRs, and commit logs." },
  { n: "03", t: "Parse AST", d: "The engine evaluates syntax trees and dependency graphs." },
  { n: "04", t: "Analyse", d: "Metrics like churn, heatmaps, and complexity are aggregated." },
  { n: "05", t: "Render UI", d: "Findings become interactive charts, graphs, and code maps." },
];

export default function Landing() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] selection:bg-[#171717] selection:text-[#f2f2f2]">
      {/* Vercel-style Nav */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#ebebeb] bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">
            Gitalyser<span className="text-[#888888]">.</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <Link href="#features" className="rounded-full px-3 py-1.5 text-[14px] text-[#4d4d4d] transition-colors hover:bg-black/5 hover:text-[#171717]">
              Features
            </Link>
            <Link href="#how-it-works" className="rounded-full px-3 py-1.5 text-[14px] text-[#4d4d4d] transition-colors hover:bg-black/5 hover:text-[#171717]">
              How it works
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Button asChild className="h-[32px] rounded-[6px] bg-[#171717] px-3 text-[14px] font-medium text-white hover:bg-[#383838]">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="h-[32px] rounded-[6px] px-3 text-[14px] font-medium text-[#171717] hover:bg-black/5">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="h-[32px] rounded-[6px] bg-[#171717] px-3 text-[14px] font-medium text-white hover:bg-[#383838]">
                <Link href="/login">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Mesh Gradient */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden pt-[120px] pb-[192px]">
          <div className="mesh-hero pointer-events-none absolute inset-x-0 top-0 h-[800px] w-full opacity-60" />
          
          <div className="relative z-10 mx-auto max-w-[1000px] px-6 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full border border-[#ebebeb] bg-white px-3 py-1 text-[12px] font-medium tracking-[0.04em] text-[#888888] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] uppercase font-mono">
              GitHub Repository Analyser
            </div>
            
            <h1 className="mb-8 text-[40px] font-semibold leading-[1.1] tracking-[-1.6px] text-[#171717] sm:text-[64px] sm:tracking-[-3.2px]">
              Understand any repository at a glance.
            </h1>
            
            <p className="mx-auto mb-10 max-w-[640px] text-[18px] leading-[32px] text-[#4d4d4d]">
              Gitalyser turns commit history, code complexity, dependencies, and
              collaboration patterns into actionable insight — so you can ship
              better code, faster.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild className="h-[48px] rounded-full bg-[#171717] px-8 text-[16px] font-medium text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:bg-[#383838] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] transition-all">
                <Link href={session ? "/dashboard" : "/login"}>
                  {session ? "Go to Dashboard" : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-[48px] rounded-full border-[#ebebeb] bg-white px-8 text-[16px] font-medium text-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-[#fafafa]">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Grid (card-marketing) */}
        <section id="features" className="bg-[#fafafa] py-[128px]">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mb-16 text-center">
              <h2 className="text-[32px] font-semibold tracking-[-1.28px] text-[#171717]">
                Everything you need to read a codebase.
              </h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-[8px] border border-[#ebebeb] bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_-2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_24px_-4px_rgba(0,0,0,0.06)]"
                >
                  <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#f5f5f5] text-[#171717] ring-1 ring-inset ring-[#ebebeb]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-[20px] font-semibold tracking-[-0.6px] text-[#171717]">
                    {title}
                  </h3>
                  <p className="text-[16px] leading-[24px] text-[#4d4d4d]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* showcase-band-dark (Polarity-flipped) */}
        <section id="how-it-works" className="bg-[#171717] py-[192px] text-white">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mb-20 max-w-3xl">
              <span className="mb-4 block font-mono text-[12px] uppercase tracking-[0.04em] text-[#a1a1a1]">
                How it works
              </span>
              <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-1.6px] sm:text-[48px] sm:tracking-[-2.4px]">
                From URL to insight <br className="hidden sm:block" />in five steps.
              </h2>
            </div>
            
            <ol className="grid gap-x-8 gap-y-12 border-t border-[#333333] pt-12 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((s) => (
                <li key={s.n} className="relative">
                  <span className="mb-4 block font-mono text-[13px] text-[#888888]">{s.n}</span>
                  <h3 className="mb-2 text-[18px] font-medium tracking-[-0.02em]">{s.t}</h3>
                  <p className="text-[14px] leading-[22px] text-[#a1a1a1]">{s.d}</p>
                </li>
              ))}
            </ol>
            
            <div className="mt-20 flex justify-start">
              <Button asChild className="h-[48px] rounded-full bg-white px-8 text-[16px] font-medium text-[#171717] hover:bg-[#ebebeb]">
                <Link href={session ? "/dashboard" : "/login"}>
                  {session ? "Go to Dashboard" : "Analyse your first repo"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#ebebeb]">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-8 px-6 py-16 md:flex-row md:items-start md:py-24">
          <div className="flex flex-col gap-4">
            <span className="text-[20px] font-semibold tracking-[-0.04em] text-[#171717]">
              Gitalyser<span className="text-[#888888]">.</span>
            </span>
            <p className="max-w-xs text-[14px] leading-[24px] text-[#888888]">
              The standard for reading codebases, measuring health, and shipping faster.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-2 md:gap-24">
            <div className="flex flex-col gap-3">
              <span className="mb-2 font-mono text-[12px] uppercase tracking-[0.04em] text-[#a1a1a1]">Legal</span>
              <Link href="/terms" className="text-[14px] text-[#4d4d4d] hover:text-[#171717]">Terms of Service</Link>
              <Link href="/privacy" className="text-[14px] text-[#4d4d4d] hover:text-[#171717]">Privacy Policy</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-2 font-mono text-[12px] uppercase tracking-[0.04em] text-[#a1a1a1]">Platform</span>
              {session ? (
                <Link href="/dashboard" className="text-[14px] text-[#4d4d4d] hover:text-[#171717]">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="text-[14px] text-[#4d4d4d] hover:text-[#171717]">Log In</Link>
                  <Link href="/login" className="text-[14px] text-[#4d4d4d] hover:text-[#171717]">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-[#ebebeb] bg-[#fafafa] py-6 text-center">
          <p className="font-mono text-[12px] text-[#888888]">
            © {new Date().getFullYear()} Gitalyser Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
