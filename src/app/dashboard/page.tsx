import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Sparkles,
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

const metricIcons = [Radio, LockKeyhole, Sparkles, ShieldCheck];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#090907] px-5 py-6 text-[#f4efe3] md:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-[#d8b45f]">
                <LockKeyhole size={16} aria-hidden="true" />
                Private CJ Cinco view
              </p>
              <h1 className="mt-4 font-display text-5xl leading-none text-[#f4efe3] md:text-7xl">
                CJ Cinco Dashboard
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#d8d1c0] md:text-lg">
                {dashboardData.summary}
              </p>
            </div>
            <div className="w-full rounded-lg border border-[#d8b45f]/30 bg-[#12110d] p-5 lg:w-[360px]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9c927f]">
                {dashboardData.status.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#f4efe3]">
                {dashboardData.status.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#bdb5a2]">
                {dashboardData.status.detail}
              </p>
            </div>
          </div>
        </header>

        <section aria-label="Dashboard summary" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dashboardData.metrics.map((metric, index) => {
            const Icon = metricIcons[index] || CheckCircle2;
            return (
              <article
                key={metric.label}
                className="min-h-44 rounded-lg border border-white/10 bg-[#11100d] p-5"
              >
                <Icon className="text-[#6fb7a7]" size={22} aria-hidden="true" />
                <p className="mt-6 text-sm text-[#9c927f]">{metric.label}</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#f4efe3]">{metric.value}</h2>
                <p className="mt-3 text-sm leading-6 text-[#bdb5a2]">{metric.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-2" aria-label="Operator sections">
          {dashboardData.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-white/10 bg-[#0f0f0c] p-5 md:p-6"
            >
              <p className="text-sm text-[#c97656]">{section.kicker}</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#f4efe3]">{section.title}</h2>
              <ul className="mt-6 space-y-4">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-[#d8d1c0]">
                    <CheckCircle2
                      className="mt-1 shrink-0 text-[#6fb7a7]"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]" aria-label="Protection contract">
          <article className="rounded-lg border border-[#6fb7a7]/25 bg-[#0e1512] p-5 md:p-6">
            <p className="text-sm text-[#6fb7a7]">Access Plan</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#f4efe3]">
              Cloudflare protects the route.
            </h2>
            <ol className="mt-6 space-y-4">
              {dashboardData.accessPlan.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-[#d8d1c0]">
                  <ShieldCheck className="mt-1 shrink-0 text-[#d8b45f]" size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-lg border border-[#d8b45f]/25 bg-[#15120e] p-5 md:p-6">
            <p className="text-sm text-[#d8b45f]">Generator Contract</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#f4efe3]">
              Online output stays separate.
            </h2>
            <ul className="mt-6 space-y-4">
              {dashboardData.sourceContract.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-[#d8d1c0]">
                  <Sparkles className="mt-1 shrink-0 text-[#c97656]" size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-5 text-sm text-[#9c927f] sm:flex-row sm:items-center sm:justify-between">
          <p>Generated {dashboardData.updated} from the online-safe source file.</p>
          <Link
            href="/"
            className="inline-flex w-max items-center gap-2 text-[#d8d1c0] transition hover:text-[#f4efe3]"
          >
            Return to public site
            <ExternalLink size={15} aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
