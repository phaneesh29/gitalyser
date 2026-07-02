"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Zap, Sparkles } from "lucide-react";

import { api, ApiError, type Analysis, type AnalysisType } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function NewAnalysisDialog({
  trigger,
  onCreated,
}: {
  trigger: React.ReactNode;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode] = useState<AnalysisType>("lite_speed");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const value = input.trim();
    if (!value) {
      toast.error("Enter a repository URL or owner/repo.");
      return;
    }

    setSubmitting(true);
    try {
      const ws = await api<Analysis>("/api/analyses", {
        method: "POST",
        body: JSON.stringify({ input: value, analysisType: mode }),
      });
      toast.success("Workspace created");
      setOpen(false);
      setInput("");
      onCreated?.();
      router.push(`/workspace/${ws.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          const existingId = (err.body as { id?: string })?.id;
          toast.error("You already have a workspace for this repo.", {
            action: existingId
              ? { label: "Open", onClick: () => router.push(`/workspace/${existingId}`) }
              : undefined,
          });
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="sm:place-items-start sm:text-left">
          <AlertDialogTitle>New analysis</AlertDialogTitle>
          <AlertDialogDescription>
            Paste a GitHub repository URL or <span className="font-mono">owner/repo</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !submitting) handleSubmit();
            }}
            placeholder="https://github.com/honojs/hono"
            className="h-10 w-full rounded-[8px] border border-[#ebebeb] bg-[#fafafa] px-3 text-[14px] text-[#171717] outline-none transition-colors placeholder:text-[#888] focus:border-[#171717]"
          />

          {/* Mode selector — Lite active, Deep coming soon. */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-[8px] border border-[#171717] bg-black/[0.03] px-3 py-2">
              <Zap className="h-4 w-4 text-[#171717]" />
              <div className="text-left">
                <div className="text-[13px] font-medium text-[#171717]">Lite / Speed</div>
                <div className="text-[11px] text-[#888]">Fast API snapshot</div>
              </div>
            </div>
            <div
              className={cn(
                "flex cursor-not-allowed items-center gap-2 rounded-[8px] border border-dashed border-[#ebebeb] px-3 py-2 opacity-70",
              )}
            >
              <Sparkles className="h-4 w-4 text-[#888]" />
              <div className="text-left">
                <div className="text-[13px] font-medium text-[#4d4d4d]">Deep Research</div>
                <div className="text-[11px] text-[#888]">Coming soon</div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing…
              </>
            ) : (
              "Analyse"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
