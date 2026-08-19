"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, ShieldCheck, Users2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/locale-context";
import type { CurrentAccount } from "@/lib/accounts";

export function SiteHeaderClient({
  account,
  showTagline,
}: {
  account: CurrentAccount | null;
  showTagline: boolean;
}) {
  const { t } = useLocale();
  const router = useRouter();

  return (
    <header className="flex items-start justify-between gap-4">
      <Link href="/" className="flex items-start gap-3">
        <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">AdCheck MY</h1>
          {showTagline && (
            <p className="text-muted-foreground max-w-md text-sm">{t.tagline}</p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {account ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="max-w-40 truncate">
                  {account.accountName}
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="truncate font-normal">
                {account.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard" />}>
                <LayoutDashboard /> {t.nav.dashboard}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/team" />}>
                <Users2 /> {t.dashboard.team}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/billing" />}>
                <Wallet /> {t.dashboard.billing}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  fetch("/api/auth/signout", { method: "POST" }).then(() => {
                    router.push("/");
                    router.refresh();
                  });
                }}
              >
                <LogOut /> {t.nav.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
          >
            {t.nav.signIn}
          </Button>
        )}
      </div>
    </header>
  );
}
