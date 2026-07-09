import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CircleDot,
  Compass,
  Gauge,
  Layers3,
  ListChecks,
  LockKeyhole,
  Map,
  Radio,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { dashboardData } from "./generated-dashboard";

export const metadata: Metadata = {
  title: "CJ Cinco Private Dashboard",
  description: "Private CJ Cinco operator dashboard.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
};

const navIcons = [Gauge, Sparkles, Map, WalletCards, Activity, Radio, Compass, ShieldCheck];
const metricIcons = [LockKeyhole, Activity, Gauge, Layers3, ListChecks, WalletCards, ArrowUpRight, Radio];

const toneClasses: Record<string, { border: string; bg: string; text: string; soft: string; icon: string }> = {
  neutral: {
    border: "border-[#26364d]",
    bg: "bg-[#0f1726]",
    text: "text-[#f3f6f7]",
    soft: "bg-[#1a2d49]/45",
    icon: "text-[#aab8c8]",
  },
  good: {
    border: "border-[#64d98b]/45",
    bg: "bg-[#0d1f18]",
    text: "text-[#79d49d]",
    soft: "bg-[#14351f]",
    icon: "text-[#79d49d]",
  },
  green: {
    border: "border-[#64d98b]/45",
    bg: "bg-[#0d1f18]",
    text: "text-[#79d49d]",
    soft: "bg-[#14351f]",
    icon: "text-[#79d49d]",
  },
  watch: {
    border: "border-[#f4c84f]/45",
    bg: "bg-[#211d0e]",
    text: "text-[#f4c84f]",
    soft: "bg-[#332812]",
    icon: "text-[#f4c84f]",
  },
  alert: {
    border: "border-[#ff8a7c]/45",
    bg: "bg-[#241414]",
    text: "text-[#ff8a7c]",
    soft: "bg-[#371516]",
    icon: "text-[#ff8a7c]",
  },
  cyan: {
    border: "border-[#59d7e8]/45",
    bg: "bg-[#0a2028]",
    text: "text-[#59d7e8]",
    soft: "bg-[#122f3a]",
    icon: "text-[#59d7e8]",
  },
  gold: {
    border: "border-[#f3c748]/45",
    bg: "bg-[#211d0e]",
    text: "text-[#f3c748]",
    soft: "bg-[#352b0f]",
    icon: "text-[#f3c748]",
  },
  red: {
    border: "border-[#ff8a7c]/45",
    bg: "bg-[#241414]",
    text: "text-[#ff8a7c]",
    soft: "bg-[#371516]",
    icon: "text-[#ff8a7c]",
  },
};

function tone(toneName = "neutral") {
  return toneClasses[toneName] ?? toneClasses.neutral;
}

function stamp(value: string) {
  return value.replace("T", " ").replace(/:\d{2}(?:[+-]\d{2}:\d{2})?$/, "");
}

function StatusChip({
  label,
  value,
  toneName = "neutral",
}: {
  label: string;
  value: string;
  toneName?: string;
}) {
  const styles = tone(toneName);
  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} px-3 py-2`}>
      <p className="text-[0.67rem] font-bold uppercase leading-none text-[#aab8c8]">{label}</p>
      <strong className={`mt-2 block text-sm leading-tight ${styles.text}`}>{value}</strong>
    </div>
  );
}

function MetricCard({
  metric,
  index,
}: {
  metric: (typeof dashboardData.metrics)[number];
  index: number;
}) {
  const Icon = metricIcons[index] ?? CircleDot;
  const styles = tone(metric.tone);
  return (
    <article className={`min-h-40 rounded-lg border ${styles.border} bg-[#0f1726]/92 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.22)]`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${styles.soft}`}>
          <Icon className={styles.icon} size={18} aria-hidden="true" />
        </div>
        <span className={`rounded-full px-2 py-1 text-[0.66rem] font-bold uppercase leading-none ${styles.soft} ${styles.text}`}>
          {metric.tone}
        </span>
      </div>
      <p className="mt-5 text-xs font-bold uppercase leading-tight text-[#79899b]">{metric.label}</p>
      <h2 className="mt-2 break-words text-2xl font-black leading-none text-[#f3f6f7]">{metric.value}</h2>
      <p className="mt-3 text-sm leading-6 text-[#aab8c8]">{metric.detail}</p>
    </article>
  );
}

function DensePanel({
  title,
  kicker,
  items,
  toneName = "neutral",
}: {
  title: string;
  kicker: string;
  items: ReadonlyArray<{
    label: string;
    value: string;
    detail: string;
    tone: string;
  }>;
  toneName?: string;
}) {
  const styles = tone(toneName);
  return (
    <article className={`rounded-lg border ${styles.border} bg-[#0f1726]/94 p-4`}>
      <p className={`text-xs font-bold uppercase leading-none ${styles.text}`}>{kicker}</p>
      <h3 className="mt-3 text-xl font-black leading-tight text-[#f3f6f7]">{title}</h3>
      <div className="mt-4 divide-y divide-[#26364d]">
        {items.map((item) => {
          const itemTone = tone(item.tone);
          return (
            <div key={`${item.label}-${item.value}`} className="grid gap-2 py-3 sm:grid-cols-[140px_1fr]">
              <span className="text-xs font-bold uppercase leading-5 text-[#79899b]">{item.label}</span>
              <div className="min-w-0">
                <strong className={`block break-words text-base leading-5 ${itemTone.text}`}>{item.value}</strong>
                {item.detail ? <p className="mt-1 text-sm leading-6 text-[#aab8c8]">{item.detail}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function AreaCard({ area }: { area: (typeof dashboardData.areas)[number] }) {
  const areaStatus = String(area.status);
  const styles = tone(areaStatus === "red" ? "alert" : area.queue.open > 0 ? "watch" : "cyan");
  return (
    <article className={`rounded-lg border ${styles.border} bg-[#0f1726]/94 p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase leading-none text-[#79899b]">{area.tier}</p>
          <h3 className="mt-2 break-words text-xl font-black leading-tight text-[#f3f6f7]">{area.name}</h3>
        </div>
        <div className={`rounded-lg border ${styles.border} ${styles.soft} px-3 py-2 text-right`}>
          <span className={`block text-lg font-black leading-none ${styles.text}`}>{area.scorecard.grade}</span>
          <small className="mt-1 block text-[0.65rem] font-bold uppercase text-[#aab8c8]">{area.status}</small>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatusChip label="Momentum" value={area.scorecard.momentum} toneName="cyan" />
        <StatusChip label="Queue" value={`${area.queue.open} open`} toneName={area.queue.open > 0 ? "watch" : "good"} />
      </div>
      <p className="mt-4 text-sm font-bold leading-6 text-[#f3f6f7]">{area.oneThing.current}</p>
      <p className="mt-3 text-sm leading-6 text-[#aab8c8]">{area.scorecard.upgrade}</p>
    </article>
  );
}

function QueueBoard() {
  return (
    <section className="rounded-lg border border-[#26364d] bg-[#0f1726]/94 p-4" aria-label="Queue counts">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase leading-none text-[#59d7e8]">Queue Counts</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[#f3f6f7]">No row payloads exported</h2>
        </div>
        <ListChecks className="shrink-0 text-[#59d7e8]" size={24} aria-hidden="true" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardData.queues.map((queue) => (
          <div key={queue.label} className="rounded-lg border border-[#26364d] bg-[#09111f] px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold leading-tight text-[#f3f6f7]">{queue.label}</span>
              <strong className={queue.count > 0 ? "text-[#f4c84f]" : "text-[#79d49d]"}>{queue.count}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AreaStatePage() {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {dashboardData.areas.map((area) => (
        <AreaCard key={area.slug} area={area} />
      ))}
    </div>
  );
}

function WealthBudgetGrid() {
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {dashboardData.wealth.budget.categories.map((category) => (
        <div key={category.label} className="rounded-lg border border-[#26364d] bg-[#09111f] p-3">
          <span className="text-xs font-bold uppercase text-[#79899b]">{category.type}</span>
          <strong className="mt-2 block text-lg leading-none text-[#f3f6f7]">{category.value}</strong>
          <p className="mt-2 text-sm text-[#aab8c8]">{category.label}</p>
        </div>
      ))}
    </div>
  );
}

function ContentWeekGrid() {
  return (
    <div className="mt-5 grid gap-2 lg:grid-cols-4">
      {dashboardData.contentSocial.weekRows.map((week) => (
        <div key={week.dateRange} className="rounded-lg border border-[#26364d] bg-[#09111f] p-3">
          <span className="text-xs font-bold uppercase text-[#79899b]">{week.label}</span>
          <strong className="mt-2 block text-base leading-tight text-[#f3f6f7]">{week.dateRange}</strong>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <span className="rounded-md bg-[#14351f] px-2 py-2 text-[#79d49d]">{week.scheduled} sched</span>
            <span className="rounded-md bg-[#122f3a] px-2 py-2 text-[#59d7e8]">{week.posted} post</span>
            <span className="rounded-md bg-[#371516] px-2 py-2 text-[#ff8a7c]">{week.blocked} block</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PageExtras({ pageKey }: { pageKey: string }) {
  if (pageKey === "areas") return <AreaStatePage />;
  if (pageKey === "overview") return <QueueBoard />;
  if (pageKey === "wealth") return <WealthBudgetGrid />;
  if (pageKey === "content") return <ContentWeekGrid />;
  return null;
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030711] text-[#f3f6f7]">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[linear-gradient(90deg,rgba(89,215,232,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(112,167,255,0.04)_1px,transparent_1px),linear-gradient(180deg,#07101f_0%,#030711_48%,#01030a_100%)] bg-[length:28px_28px,28px_28px,auto]"
      />
      <div className="relative z-10 mx-auto w-[min(1500px,calc(100%_-_40px))] py-5 md:py-6">
        <nav className="grid gap-2 md:grid-cols-4 xl:grid-cols-8" aria-label="Private dashboard sections">
          {dashboardData.nav.map((item, index) => {
            const Icon = navIcons[index] ?? CircleDot;
            return (
              <a
                key={item.key}
                href={`#${item.key}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#26364d] bg-white/[0.03] px-3 text-center text-sm font-bold leading-tight text-[#aab8c8] transition hover:-translate-y-0.5 hover:border-[#59d7e8]/70 hover:text-[#f3f6f7]"
              >
                <Icon size={15} aria-hidden="true" />
                {item.title}
              </a>
            );
          })}
        </nav>

        <header className="mt-4 grid gap-3 rounded-lg border border-[#59d7e8]/30 bg-[#0b1422]/96 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,auto)]">
          <div className="rounded-lg border border-[#26364d] bg-[#0f1726] p-4">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase leading-none text-[#59d7e8]">
              <LockKeyhole size={15} aria-hidden="true" />
              Private CJ Cinco route
            </p>
            <h1 className="mt-3 break-words text-4xl font-black leading-none text-[#f3f6f7] md:text-5xl">
              {dashboardData.title}
            </h1>
            <p className="mt-4 max-w-4xl text-base leading-7 text-[#aab8c8]">{dashboardData.summary}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <StatusChip label={dashboardData.access.label} value={dashboardData.access.value} toneName="green" />
            <StatusChip label="Freshness" value={dashboardData.freshness.label} toneName={dashboardData.freshness.status === "stale" ? "watch" : "good"} />
            <StatusChip label={dashboardData.privacy.label} value={dashboardData.privacy.status} toneName="cyan" />
            <div className="rounded-lg border border-[#26364d] bg-[#09111f] p-3 sm:col-span-3">
              <p className="text-[0.67rem] font-bold uppercase leading-none text-[#79899b]">Generated</p>
              <strong className="mt-2 block text-sm leading-tight text-[#f3f6f7]">
                {stamp(dashboardData.generatedAt)} from local data date {dashboardData.dataDate}
              </strong>
            </div>
          </div>
        </header>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Dashboard metrics">
          {dashboardData.metrics.map((metric, index) => (
            <MetricCard key={metric.label} metric={metric} index={index} />
          ))}
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]" aria-label="Current command readout">
          <DensePanel
            title="Captain One Thing"
            kicker={dashboardData.captain.status}
            toneName="gold"
            items={[
              {
                label: "Current",
                value: dashboardData.captain.oneThing.current,
                detail: dashboardData.captain.oneThing.supports,
                tone: "gold",
              },
              {
                label: "Done when",
                value: "Proof visible",
                detail: dashboardData.captain.oneThing.doneWhen,
                tone: "green",
              },
            ]}
          />
          <DensePanel
            title="Protection Contract"
            kicker="Privacy"
            toneName="cyan"
            items={dashboardData.privacy.checks.map((check, index) => ({
              label: `Check ${index + 1}`,
              value: check,
              detail: index === 0 ? dashboardData.privacy.detail : "",
              tone: "cyan",
            }))}
          />
        </section>

        <div className="mt-6 space-y-6">
          {dashboardData.pages.map((page) => (
            <section id={page.key} key={page.key} className="scroll-mt-5 rounded-lg border border-[#26364d] bg-[#07101f]/86 p-4 md:p-5">
              <div className="flex flex-col gap-2 border-b border-[#26364d] pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase leading-none text-[#59d7e8]">{page.kicker}</p>
                  <h2 className="mt-2 text-3xl font-black leading-none text-[#f3f6f7]">{page.title}</h2>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-[#aab8c8]">{page.summary}</p>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {page.sections.map((item) => (
                  <DensePanel
                    key={`${page.key}-${item.title}`}
                    title={item.title}
                    kicker={item.kicker}
                    toneName={item.tone}
                    items={item.items}
                  />
                ))}
              </div>
              <PageExtras pageKey={page.key} />
            </section>
          ))}
        </div>

        <footer className="mt-6 flex flex-col gap-3 border-t border-[#26364d] py-5 text-sm text-[#79899b] sm:flex-row sm:items-center sm:justify-between">
          <p>Private static export. Access remains enforced outside this app.</p>
          <Link href="/" className="inline-flex w-max items-center gap-2 text-[#aab8c8] transition hover:text-[#f3f6f7]">
            Return to public site
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
