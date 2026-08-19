"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/regulatory-rules";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Messages } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export interface CheckRow {
  id: string;
  category: string;
  score: number;
  ad_copy: string;
  created_at: string;
}

function scoreBadgeClass(score: number) {
  if (score >= 80) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-red-500/10 text-red-600 dark:text-red-400";
}

export function DashboardTable({
  rows,
  activeCategory,
}: {
  rows: CheckRow[];
  activeCategory: string;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  function setCategory(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{t.dashboard.title}</h2>
        <Select value={activeCategory || "all"} onValueChange={setCategory}>
          <SelectTrigger className="w-56">
            <SelectValue>
              {(value: string) =>
                value === "all"
                  ? t.dashboard.filterAllCategories
                  : t.categories[value as keyof Messages["categories"]]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.dashboard.filterAllCategories}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {t.categories[c.id as keyof Messages["categories"]]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="sr-only">
          <CardTitle>{t.dashboard.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <p className="text-muted-foreground px-6 py-10 text-center text-sm">
              {t.dashboard.empty}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.dashboard.columnDate}</TableHead>
                  <TableHead>{t.dashboard.columnCategory}</TableHead>
                  <TableHead>{t.dashboard.columnScore}</TableHead>
                  <TableHead>{t.dashboard.columnAdCopy}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell>
                      {t.categories[row.category as keyof Messages["categories"]] ??
                        row.category}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("tabular-nums", scoreBadgeClass(row.score))}>
                        {row.score}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-sm truncate">{row.ad_copy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
