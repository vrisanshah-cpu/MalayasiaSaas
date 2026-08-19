"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/lib/i18n/locale-context";

export interface MemberRow {
  user_id: string;
  email: string;
  role: "owner" | "member";
  created_at: string;
}

export function TeamPageClient({
  members,
  isOwner,
}: {
  members: MemberRow[];
  isOwner: boolean;
}) {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;

    setSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: t.team.inviteSuccess });
      setEmail("");
    } catch {
      setMessage({ type: "error", text: t.team.inviteErrorGeneric });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight">{t.team.title}</h2>

      {isOwner && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent>
            <form onSubmit={handleInvite} className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="invite-email">
                  {t.team.inviteButton}
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.team.inviteEmailPlaceholder}
                />
              </div>
              <Button type="submit" disabled={sending || !email.trim()}>
                {sending ? (
                  <>
                    <Loader2 className="animate-spin" /> {t.team.inviting}
                  </>
                ) : (
                  <>
                    <UserPlus /> {t.team.inviteButton}
                  </>
                )}
              </Button>
            </form>
            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"} className="mt-4">
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {!isOwner && (
        <Alert>
          <AlertDescription>{t.team.ownerOnlyNotice}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t.team.membersTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {members.map((m, i) => (
            <div key={m.user_id} className="contents">
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm">{m.email}</span>
                <Badge variant="secondary">
                  {m.role === "owner" ? t.team.roleOwner : t.team.roleMember}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
