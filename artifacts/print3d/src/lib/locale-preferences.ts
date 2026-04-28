import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export const LOCALE_PREFERENCES_STORAGE_KEY = "synthix_locale_preferences";
export const LOCALE_PREFERENCES_CHANGE_EVENT = "synthix:locale-preferences";
const FX_CACHE_PREFIX = "synthix_fx_";
const FALLBACK_UPDATED_AT = "static";

export type LocalePreferenceState = {
  countryCode: string;
  languageCode: string;
  currencyCode: string;
};

type FxState = {
  rate: number;
  updatedAt: string;
  source: "live" | "fallback";
};

export const COUNTRY_OPTIONS = [
  { code: "US", label: "United States", defaultCurrency: "USD", defaultLanguage: "en-US" },
  { code: "GB", label: "United Kingdom", defaultCurrency: "GBP", defaultLanguage: "en-GB" },
  { code: "CA", label: "Canada", defaultCurrency: "CAD", defaultLanguage: "en-CA" },
  { code: "AU", label: "Australia", defaultCurrency: "AUD", defaultLanguage: "en-AU" },
  { code: "NZ", label: "New Zealand", defaultCurrency: "NZD", defaultLanguage: "en-NZ" },
  { code: "DE", label: "Germany", defaultCurrency: "EUR", defaultLanguage: "de-DE" },
  { code: "FR", label: "France", defaultCurrency: "EUR", defaultLanguage: "fr-FR" },
  { code: "ES", label: "Spain", defaultCurrency: "EUR", defaultLanguage: "es-ES" },
  { code: "IT", label: "Italy", defaultCurrency: "EUR", defaultLanguage: "it-IT" },
  { code: "JP", label: "Japan", defaultCurrency: "JPY", defaultLanguage: "ja-JP" },
] as const;

export const LANGUAGE_OPTIONS = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-CA", label: "English (Canada)" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "es-ES", label: "Spanish" },
  { code: "it-IT", label: "Italian" },
  { code: "ja-JP", label: "Japanese" },
] as const;

export const CURRENCY_OPTIONS = [
  { code: "USD", label: "US Dollar" },
  { code: "GBP", label: "British Pound" },
  { code: "EUR", label: "Euro" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "NZD", label: "New Zealand Dollar" },
  { code: "JPY", label: "Japanese Yen" },
] as const;

const USD_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.53,
  NZD: 1.66,
  JPY: 151,
};

export function countryCodeToFlag(countryCode: string) {
  const normalized = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return countryCode;
  return String.fromCodePoint(...normalized.split("").map((char) => 127397 + char.charCodeAt(0)));
}

function getStoredPreferences(): Partial<LocalePreferenceState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LOCALE_PREFERENCES_STORAGE_KEY) || "{}") as Partial<LocalePreferenceState>;
  } catch {
    return {};
  }
}

function inferDefaults(): LocalePreferenceState {
  const locale = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
  const region = locale.split("-")[1]?.toUpperCase() || "US";
  const country = COUNTRY_OPTIONS.find((option) => option.code === region) ?? COUNTRY_OPTIONS[0];
  return {
    countryCode: country.code,
    languageCode: locale,
    currencyCode: country.defaultCurrency,
  };
}

function getFxCacheKey(currencyCode: string) {
  return `${FX_CACHE_PREFIX}${currencyCode}`;
}

function readCachedFx(currencyCode: string): FxState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getFxCacheKey(currencyCode));
    return raw ? (JSON.parse(raw) as FxState) : null;
  } catch {
    return null;
  }
}

function persistFx(currencyCode: string, value: FxState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getFxCacheKey(currencyCode), JSON.stringify(value));
}

export function persistLocalePreferences(preferences: Partial<LocalePreferenceState>) {
  if (typeof window === "undefined") return;
  const current = getStoredPreferences();
  localStorage.setItem(LOCALE_PREFERENCES_STORAGE_KEY, JSON.stringify({ ...current, ...preferences }));
  window.dispatchEvent(new Event(LOCALE_PREFERENCES_CHANGE_EVENT));
}

export function useLocalePreferences() {
  const { user } = useAuth();
  const [stored, setStored] = useState<Partial<LocalePreferenceState>>(() => getStoredPreferences());

  useEffect(() => {
    const sync = () => setStored(getStoredPreferences());
    window.addEventListener("storage", sync);
    window.addEventListener(LOCALE_PREFERENCES_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LOCALE_PREFERENCES_CHANGE_EVENT, sync);
    };
  }, []);

  const fallback = inferDefaults();
  const countryCode = user?.countryCode ?? stored.countryCode ?? fallback.countryCode;
  const languageCode = user?.languageCode ?? stored.languageCode ?? fallback.languageCode;
  const currencyCode = user?.currencyCode ?? stored.currencyCode ?? fallback.currencyCode;

  const [fxState, setFxState] = useState<FxState>(() => {
    const cached = readCachedFx(currencyCode);
    return cached ?? {
      rate: USD_EXCHANGE_RATES[currencyCode] ?? 1,
      updatedAt: FALLBACK_UPDATED_AT,
      source: "fallback",
    };
  });

  useEffect(() => {
    const cached = readCachedFx(currencyCode);
    if (cached) {
      setFxState(cached);
    } else {
      setFxState({
        rate: USD_EXCHANGE_RATES[currencyCode] ?? 1,
        updatedAt: FALLBACK_UPDATED_AT,
        source: "fallback",
      });
    }

    // Live FX rate fetch disabled due to CORS limitations
    // Using static fallback rates instead
    if (currencyCode === "USD" || typeof window === "undefined") {
      setFxState({ rate: 1, updatedAt: new Date().toISOString(), source: "live" });
      return;
    }

    // Always use fallback rates to avoid CORS errors
    setFxState({
      rate: USD_EXCHANGE_RATES[currencyCode] ?? 1,
      updatedAt: FALLBACK_UPDATED_AT,
      source: "fallback",
    });
  }, [currencyCode]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(languageCode, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: currencyCode === "JPY" ? 0 : 2,
      }),
    [currencyCode, languageCode],
  );

  const convertPrice = useCallback(
    (amountUsd: number) => amountUsd * (fxState.rate || 1),
    [fxState.rate],
  );

  const formatPrice = useCallback(
    (amountUsd: number) => formatter.format(convertPrice(amountUsd)),
    [convertPrice, formatter],
  );

  const selectedCountry = COUNTRY_OPTIONS.find((option) => option.code === countryCode) ?? COUNTRY_OPTIONS[0];

  return {
    countryCode,
    languageCode,
    currencyCode,
    selectedCountry,
    formatPrice,
    convertPrice,
    fxRate: fxState.rate,
    fxSource: fxState.source,
    fxUpdatedAt: fxState.updatedAt,
  };
}
