"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { signOut, type User } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileCard({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          // useSession re-reads and the page swaps back to the sign-in view.
          toast.success("Signed out");
        },
        onError: ({ error }) => {
          setLoading(false);
          toast.error(error.message || "Sign out failed");
        },
      },
    });
  }

  const initials =
    user.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-base tracking-[-0.01em]">
              {user.name}
            </CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <CardAction>
          <Button variant="outline" onClick={handleSignOut} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <LogOut />}
            Sign out
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <span className="eyebrow">
          {user.emailVerified ? "Email verified" : "Email not verified"}
        </span>
      </CardContent>
    </Card>
  );
}
