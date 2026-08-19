"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { MESSAGES } from "./messages";
import { DEFAULT_LOCALE, LOCALES, type Locale, type Messages } from "./types";

const STORAGE_KEY = "adcheck-my-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // Reads localStorage/navigator.language (unavailable during SSR), so the
    // initial render must stay at DEFAULT_LOCALE on both server and client
    // to avoid a hydration mismatch, then sync from that external system
    // once mounted. This one-time sync-from-external-storage is the case
    // React's docs call out as a legitimate effect + setState use.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
      return;
    }
    const browserLang = window.navigator.language.slice(0, 2);
    if (isLocale(browserLang)) {
      setLocaleState(browserLang);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo(
    () => ({ locale, setLocale, t: MESSAGES[locale] }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
