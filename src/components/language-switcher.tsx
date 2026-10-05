"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/lib/i18n/locale-context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger
        aria-label={t.languageLabel}
        className={cn(
          "w-fit",
          onDark &&
            "border-background/25 bg-transparent text-background hover:bg-background/10",
        )}
      >
        <SelectValue>{(value: Locale) => LOCALE_LABELS[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((l) => (
          <SelectItem key={l} value={l}>
            {LOCALE_LABELS[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
