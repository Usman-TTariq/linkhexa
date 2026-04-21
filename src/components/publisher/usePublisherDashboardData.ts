"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type Profile = { username: string; email: string; role: string };

export type GoLinkSummary = {
  slug: string;
  shortUrl: string;
  targetUrl: string;
  deepLink: boolean;
  createdAt: string;
  clickCount: number;
  programmeId: number;
  brandName: string | null;
};

export type EarningsApi = {
  days: number;
  from: string;
  series: { date: string; currency: string; commission: number; sale: number; transactions: number }[];
  totals: { commissionByCurrency: Record<string, number>; saleByCurrency: Record<string, number>; transactions: number };
  source?: string;
  reconcileError?: string | null;
  debug?: Record<string, unknown>;
};

export function utcTodayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ymdAddDays(ymd: string, delta: number): string {
  const d = new Date(`${ymd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function pickPrimaryCurrency(
  commissionByCurrency: Record<string, number>,
  saleByCurrency?: Record<string, number>
): string {
  const scores = new Map<string, number>();
  for (const [k, v] of Object.entries(commissionByCurrency)) {
    scores.set(k, (scores.get(k) ?? 0) + Number(v));
  }
  if (saleByCurrency) {
    for (const [k, v] of Object.entries(saleByCurrency)) {
      scores.set(k, (scores.get(k) ?? 0) + Number(v));
    }
  }
  const entries = [...scores.entries()].filter(([, v]) => v > 0);
  if (entries.length === 0) return "USD";
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function hasLinksButNoMatchingAwinRows(debug: Record<string, unknown>): boolean {
  const links = Number(debug.yourPublisherGoLinks ?? 0);
  if (links <= 0) return false;
  const a = Number(debug.awinTransactionsWithYourPublisherId ?? 0);
  const b = Number(debug.awinTransactionsWhereGoLinkSlugInYourSlugs ?? 0);
  const c = Number(debug.awinTransactionsClickRefContainsFirstSlug ?? 0);
  return a === 0 && b === 0 && c === 0;
}

export function sumCommissionRange(
  series: EarningsApi["series"],
  currency: string,
  minInclusive: string,
  maxInclusive: string
): number {
  return series
    .filter((s) => s.currency === currency && s.date >= minInclusive && s.date <= maxInclusive)
    .reduce((a, s) => a + s.commission, 0);
}

export function sumSaleRange(
  series: EarningsApi["series"],
  currency: string,
  minInclusive: string,
  maxInclusive: string
): number {
  return series
    .filter((s) => s.currency === currency && s.date >= minInclusive && s.date <= maxInclusive)
    .reduce((a, s) => a + s.sale, 0);
}

export function usePublisherDashboardData() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goLinks, setGoLinks] = useState<GoLinkSummary[]>([]);
  const [goLinksLoading, setGoLinksLoading] = useState(false);
  const [goLinksError, setGoLinksError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsApi | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsError, setEarningsError] = useState<string | null>(null);
  const [earningsReconcileError, setEarningsReconcileError] = useState<string | null>(null);
  const [earningsDebug, setEarningsDebug] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/publisher/session", { credentials: "include" });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = (await res.json().catch(() => ({}))) as {
          username?: string;
          email?: string;
          role?: string;
        };
        setProfile({
          username: typeof data.username === "string" ? data.username : "User",
          email: typeof data.email === "string" ? data.email : "",
          role: typeof data.role === "string" ? data.role : "publisher",
        });
        setLoading(false);
      } catch {
        router.replace("/login");
      }
    };
    void load();
  }, [router]);

  useEffect(() => {
    if (loading || profile?.role !== "publisher") return;
    let cancelled = false;
    void (async () => {
      setGoLinksLoading(true);
      setGoLinksError(null);
      try {
        const res = await fetch("/api/publisher/go-links", { credentials: "include" });
        const data = (await res.json().catch(() => ({}))) as { error?: string; links?: GoLinkSummary[] };
        if (!res.ok) {
          if (!cancelled) setGoLinksError(data.error ?? "Could not load tracking links.");
          return;
        }
        if (!cancelled) setGoLinks(Array.isArray(data.links) ? data.links : []);
      } catch {
        if (!cancelled) setGoLinksError("Could not load tracking links.");
      } finally {
        if (!cancelled) setGoLinksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, profile?.role]);

  useEffect(() => {
    if (loading || profile?.role !== "publisher") return;
    let cancelled = false;
    void (async () => {
      setEarningsLoading(true);
      setEarningsError(null);
      setEarningsReconcileError(null);
      setEarningsDebug(null);
      try {
        const res = await fetch("/api/publisher/earnings?days=730&debug=1", { credentials: "include" });
        const data = (await res.json().catch(() => ({}))) as EarningsApi & { error?: string };
        if (!res.ok) {
          if (!cancelled) {
            setEarningsError(data.error ?? "Could not load earnings.");
            setEarningsReconcileError(null);
            setEarningsDebug(null);
          }
          return;
        }
        if (!cancelled) {
          setEarnings(data);
          setEarningsReconcileError(
            typeof data.reconcileError === "string" && data.reconcileError.trim()
              ? data.reconcileError.trim()
              : null
          );
          setEarningsDebug(
            data.debug && typeof data.debug === "object" && !Array.isArray(data.debug)
              ? (data.debug as Record<string, unknown>)
              : null
          );
        }
      } catch {
        if (!cancelled) {
          setEarningsError("Could not load earnings.");
          setEarningsReconcileError(null);
          setEarningsDebug(null);
        }
      } finally {
        if (!cancelled) setEarningsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, profile?.role]);

  const primaryCurrency = useMemo(
    () =>
      earnings
        ? pickPrimaryCurrency(earnings.totals.commissionByCurrency, earnings.totals.saleByCurrency)
        : "USD",
    [earnings]
  );

  const windowTotalCommissionPrimary = useMemo(
    () => (earnings ? Number(earnings.totals.commissionByCurrency[primaryCurrency] ?? 0) : 0),
    [earnings, primaryCurrency]
  );

  const windowTotalSalePrimary = useMemo(
    () => (earnings ? Number(earnings.totals.saleByCurrency[primaryCurrency] ?? 0) : 0),
    [earnings, primaryCurrency]
  );

  const commissionToday = useMemo(() => {
    if (!earnings) return 0;
    const t = utcTodayYmd();
    return sumCommissionRange(earnings.series, primaryCurrency, t, t);
  }, [earnings, primaryCurrency]);

  const commissionYesterday = useMemo(() => {
    if (!earnings) return 0;
    const y = ymdAddDays(utcTodayYmd(), -1);
    return sumCommissionRange(earnings.series, primaryCurrency, y, y);
  }, [earnings, primaryCurrency]);

  const commissionLast7 = useMemo(() => {
    if (!earnings) return 0;
    const end = utcTodayYmd();
    const start = ymdAddDays(end, -6);
    return sumCommissionRange(earnings.series, primaryCurrency, start, end);
  }, [earnings, primaryCurrency]);

  const commissionLast30 = useMemo(() => {
    if (!earnings) return 0;
    const end = utcTodayYmd();
    const start = ymdAddDays(end, -29);
    return sumCommissionRange(earnings.series, primaryCurrency, start, end);
  }, [earnings, primaryCurrency]);

  const saleLast30 = useMemo(() => {
    if (!earnings) return 0;
    const end = utcTodayYmd();
    const start = ymdAddDays(end, -29);
    return sumSaleRange(earnings.series, primaryCurrency, start, end);
  }, [earnings, primaryCurrency]);

  const sparklinePoints = useMemo(() => {
    if (!earnings) return [];
    const end = utcTodayYmd();
    const start = ymdAddDays(end, -27);
    const pts: number[] = [];
    for (let d = start; d <= end; d = ymdAddDays(d, 1)) {
      const v = earnings.series
        .filter((s) => s.date === d && s.currency === primaryCurrency)
        .reduce((a, s) => a + s.commission, 0);
      pts.push(v);
    }
    return pts;
  }, [earnings, primaryCurrency]);

  /** Last 31 days (inclusive) for main performance chart */
  const performanceChartSeries = useMemo(() => {
    if (!earnings) return [];
    const end = utcTodayYmd();
    const start = ymdAddDays(end, -30);
    const out: { date: string; commission: number; sale: number; transactions: number }[] = [];
    for (let d = start; d <= end; d = ymdAddDays(d, 1)) {
      const dayRows = earnings.series.filter((s) => s.date === d && s.currency === primaryCurrency);
      out.push({
        date: d,
        commission: dayRows.reduce((a, s) => a + s.commission, 0),
        sale: dayRows.reduce((a, s) => a + s.sale, 0),
        transactions: dayRows.reduce((a, s) => a + s.transactions, 0),
      });
    }
    return out;
  }, [earnings, primaryCurrency]);

  const displayName = profile?.username?.trim() || profile?.email?.split("@")[0] || "there";
  const isPublisher = profile?.role === "publisher";

  const totalLinkClicks = useMemo(
    () => goLinks.reduce((sum, l) => sum + Number(l.clickCount ?? 0), 0),
    [goLinks]
  );

  const currencyBreakdown = useMemo(() => {
    if (!earnings) return [];
    const keys = new Set([
      ...Object.keys(earnings.totals.commissionByCurrency),
      ...Object.keys(earnings.totals.saleByCurrency),
    ]);
    return [...keys]
      .sort()
      .map((c) => ({
        currency: c,
        commission: earnings.totals.commissionByCurrency[c] ?? 0,
        sale: earnings.totals.saleByCurrency[c] ?? 0,
      }))
      .filter((row) => row.commission > 0 || row.sale > 0);
  }, [earnings]);

  const topBrandsByClicks = useMemo(() => {
    return [...goLinks].sort((a, b) => Number(b.clickCount ?? 0) - Number(a.clickCount ?? 0)).slice(0, 5);
  }, [goLinks]);

  const newestLinks = useMemo(() => {
    return [...goLinks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [goLinks]);

  return {
    loading,
    profile,
    isPublisher,
    displayName,
    goLinks,
    goLinksLoading,
    goLinksError,
    earnings,
    earningsLoading,
    earningsError,
    earningsReconcileError,
    earningsDebug,
    primaryCurrency,
    windowTotalCommissionPrimary,
    windowTotalSalePrimary,
    commissionToday,
    commissionYesterday,
    commissionLast7,
    commissionLast30,
    saleLast30,
    sparklinePoints,
    performanceChartSeries,
    totalLinkClicks,
    currencyBreakdown,
    topBrandsByClicks,
    newestLinks,
  };
}
