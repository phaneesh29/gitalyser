"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, Monitor, Smartphone, ShieldX } from "lucide-react";
import { toast } from "sonner";

import {
  listSessions,
  revokeSession,
  revokeOtherSessions,
  type Session,
} from "@/lib/auth-client";
import { describeDevice } from "@/lib/user-agent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function SessionsCard({ currentToken }: { currentToken: string }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [busyToken, setBusyToken] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await listSessions();
    if (error) {
      toast.error(error.message || "Failed to load sessions");
      setSessions([]);
      return;
    }
    // Show the current device first, then most recently created.
    const sorted = [...(data ?? [])].sort((a, b) => {
      if (a.token === currentToken) return -1;
      if (b.token === currentToken) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSessions(sorted);
  }, [currentToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRevoke(token: string) {
    setBusyToken(token);
    const { error } = await revokeSession({ token });
    setBusyToken(null);
    if (error) {
      toast.error(error.message || "Could not revoke session");
      return;
    }
    toast.success("Device signed out");
    refresh();
  }

  async function handleRevokeOthers() {
    setRevokingOthers(true);
    const { error } = await revokeOtherSessions();
    setRevokingOthers(false);
    if (error) {
      toast.error(error.message || "Could not sign out other devices");
      return;
    }
    toast.success("Signed out of all other devices");
    refresh();
  }

  const otherCount = sessions?.filter((s) => s.token !== currentToken).length ?? 0;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <span className="eyebrow mb-1">Security</span>
        <CardTitle className="tracking-[-0.01em]">Active devices</CardTitle>
        <CardDescription>
          Sessions currently signed in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions === null ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        ) : (
          sessions.map((s) => {
            const device = describeDevice(s.userAgent);
            const isCurrent = s.token === currentToken;
            const Icon = device.os === "iOS" || device.os === "Android" ? Smartphone : Monitor;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {device.label}
                      </span>
                      {isCurrent && <Badge variant="secondary">This device</Badge>}
                    </div>
                    <p className="truncate font-mono text-xs text-[#888]">
                      {s.ipAddress || "unknown IP"} · signed in{" "}
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(s.token)}
                    disabled={busyToken === s.token}
                  >
                    {busyToken === s.token ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <LogOut />
                    )}
                    Revoke
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
      {otherCount > 0 && (
        <CardContent className="pt-0">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleRevokeOthers}
            disabled={revokingOthers}
          >
            {revokingOthers ? <Loader2 className="animate-spin" /> : <ShieldX />}
            Sign out of all other devices ({otherCount})
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
