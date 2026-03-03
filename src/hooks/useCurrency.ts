import { useState, useEffect } from "react";

export type Currency = "USD" | "HKD" | "RMB" | "GBP";

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  HKD: 7.8,
  RMB: 7.2,
  GBP: 0.79,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  HKD: "HK$",
  RMB: "¥",
  GBP: "£",
};

function detectCurrencyFromTimezone(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith("Asia/Hong_Kong")) return "HKD";
    if (tz.startsWith("Asia/Shanghai") || tz.startsWith("Asia/Chongqing") || tz.startsWith("Asia/Beijing")) return "RMB";
    if (tz.startsWith("Europe/London")) return "GBP";
  } catch {}
  return "USD";
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    if (detected) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Rough geolocation-to-currency mapping
        if (latitude > 22.1 && latitude < 22.6 && longitude > 113.8 && longitude < 114.4) {
          setCurrency("HKD");
        } else if (latitude > 18 && latitude < 54 && longitude > 73 && longitude < 135) {
          setCurrency("RMB");
        } else if (latitude > 49.8 && latitude < 60.9 && longitude > -8.7 && longitude < 1.8) {
          setCurrency("GBP");
        } else {
          setCurrency("USD");
        }
        setDetected(true);
      },
      () => setDetected(true),
      { timeout: 5000 }
    );
  }, [detected]);

  const convert = (usdAmount: number): string => {
    const rate = EXCHANGE_RATES[currency];
    const converted = Math.round(usdAmount * rate);
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString()}`;
  };

  const formatFixed = (amount: number, cur: Currency): string => {
    return `${CURRENCY_SYMBOLS[cur]}${amount.toLocaleString()}`;
  };

  return { currency, setCurrency, convert, formatFixed, symbol: CURRENCY_SYMBOLS[currency] };
}
