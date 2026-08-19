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

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger aria-label={t.languageLabel} className="w-fit">
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
