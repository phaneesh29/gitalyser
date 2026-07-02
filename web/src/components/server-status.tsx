"use client";

import { useEffect, useState } from "react";

import { SERVER_URL } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Health = {
  status: string;
  timestamp: string;
  uptime: number;
  ip: string;
};

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: Health }
  | { kind: "error"; message: string };

export function ServerStatus() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/health`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Health;
        if (active) setState({ kind: "ok", data });
      } catch (err) {
        if (active)
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : "unreachable",
          });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const online = state.kind === "ok";
  const label =
    state.kind === "loading"
      ? "Connecting to server…"
      : state.kind === "ok"
        ? `Server online · ${SERVER_URL}`
        : `Server unreachable · ${state.message}`;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className={cn(
          "size-2 rounded-full",
          state.kind === "loading" && "bg-amber-400 animate-pulse",
          online && "bg-emerald-500",
          state.kind === "error" && "bg-red-500",
        )}
      />
      {label}
    </div>
  );
}
