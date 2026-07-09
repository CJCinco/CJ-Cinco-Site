"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Mail,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import {
  contactLinks,
  focusAreas,
  navItems,
  siteContent,
  soundCards,
  ventures,
} from "./content";

function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [formStatus, setFormStatus] = useState("");

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      setFormStatus("Add your name, email, and message first.");
      return;
    }

    const subject = encodeURIComponent(`CJ Cinco inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );

    setFormStatus("Opening an email draft.");
    window.location.href = `mailto:${siteContent.email}?subject=${subject}&body=${body}`;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080806] text-[#f4efe3]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#080806]/78 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#home" className="font-display text-2xl text-[#f4efe3]">
            CJ Cinco
          </a>
          <div className="hidden items-center gap-7 text-sm text-[#d8d1c0] md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-[#f4efe3]"
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d8b45f]/40 px-4 text-sm text-[#f4efe3] transition hover:border-[#d8b45f] hover:bg-[#d8b45f]/12"
          >
            <Mail size={16} aria-hidden="true" />
            Contact
          </a>
        </nav>
      </header>

      <section
        id="home"
        className="relative flex min-h-[92vh] items-end overflow-hidden px-5 pb-14 pt-28 md:px-8 lg:pb-20"
      >
        <Image
          src="/visuals/cj-cinco-hero.png"
          alt="Abstract dark studio texture with warm sound-wave light and teal healing tones"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,6,0.92)_0%,rgba(8,8,6,0.68)_42%,rgba(8,8,6,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#080806_0%,rgba(8,8,6,0)_100%)]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-5 max-w-max border-l-2 border-[#d8b45f] pl-4 text-sm text-[#d8d1c0]">
              {siteContent.tagline}
            </p>
            <h1 className="font-display text-7xl leading-none text-[#f4efe3] md:text-8xl lg:text-9xl">
              {siteContent.name}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8d1c0] md:text-2xl md:leading-9">
              {siteContent.supportingLine}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#sound"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#f4efe3] px-5 text-sm font-semibold text-[#080806] transition hover:bg-[#d8b45f]"
              >
                Explore My Work
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/18 px-5 text-sm font-semibold text-[#f4efe3] transition hover:border-[#6fb7a7] hover:bg-white/8"
              >
                Contact
              </a>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-3 sm:grid-cols-2 lg:mb-3"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {focusAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className="min-h-36 rounded-lg border border-white/12 bg-[#10100d]/68 p-5 backdrop-blur-md"
                >
                  <Icon className="mb-5 text-[#d8b45f]" size={24} aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-[#f4efe3]">{area.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#bdb5a2]">{area.text}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section
        id="about"
        className="border-t border-white/10 bg-[#0d0d0a] px-5 py-20 md:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Reveal>
            <p className="text-sm text-[#6fb7a7]">About</p>
            <h2 className="mt-4 font-display text-5xl leading-none text-[#f4efe3] md:text-6xl">
              A public identity for the creative, grounded, and useful work.
            </h2>
          </Reveal>
          <Reveal className="space-y-8">
            <p className="text-xl leading-9 text-[#d8d1c0]">{siteContent.bio}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {["New dad", "Music producer", "Reiki practitioner"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-[#f4efe3]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="sound" className="px-5 py-20 md:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="text-sm text-[#d8b45f]">Music / Sound</p>
            <h2 className="mt-4 font-display text-5xl leading-none text-[#f4efe3] md:text-7xl">
              A studio lane for sound, texture, rhythm, and intentional release.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#bdb5a2]">
              The CJ Cinco artist identity starts as a flexible sound home:
              releases, beats, production work, and future links as the catalog
              becomes ready for public use.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {soundCards.map((card) => {
              const Icon = card.icon;
              return (
                <Reveal
                  key={card.title}
                  className="group min-h-80 rounded-lg border border-white/10 bg-[#10100d] p-6 transition hover:border-[#d8b45f]/50"
                >
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <Icon className="text-[#6fb7a7]" size={32} aria-hidden="true" />
                      <p className="mt-8 text-sm text-[#c97656]">{card.label}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-[#f4efe3]">
                        {card.title}
                      </h3>
                    </div>
                    <p className="mt-10 text-base leading-7 text-[#bdb5a2]">{card.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="healing"
        className="bg-[#ece4d5] px-5 py-20 text-[#15120e] md:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <p className="text-sm text-[#6b7e43]">Healing / Green Bodyworks</p>
            <h2 className="mt-4 font-display text-5xl leading-none md:text-7xl">
              Calm sessions for grounding, reset, and reconnection.
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-xl leading-9 text-[#393227]">
              Green Bodyworks is the healing lane for Reiki, bodywork, Lucia
              Light support, and grounded session work. The tone stays calm,
              practical, and human: less performance, more presence.
            </p>
            <a
              href="mailto:hello@cjcinco.com?subject=Green%20Body%20Works%20inquiry"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-[#15120e] px-5 text-sm font-semibold text-[#f4efe3] transition hover:bg-[#2d2922]"
            >
              Book / Inquire
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>

      <section
        id="ventures"
        className="border-y border-white/10 bg-[#0d0d0a] px-5 py-20 md:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm text-[#6fb7a7]">Ventures</p>
              <h2 className="mt-4 font-display text-5xl leading-none text-[#f4efe3] md:text-7xl">
                Connected work, separate lanes.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-[#bdb5a2]">
              CJ Cinco is the hub. The businesses stay cleanly separated so
              each project can keep its own audience, purpose, and operating
              rhythm.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {ventures.map((venture) => (
              <Reveal
                key={venture.title}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#6fb7a7]/50"
              >
                <div className="flex min-h-64 flex-col justify-between gap-10">
                  <div>
                    <p className="text-sm text-[#d8b45f]">{venture.type}</p>
                    <h3 className="mt-4 text-3xl font-semibold text-[#f4efe3]">
                      {venture.title}
                    </h3>
                    <p className="mt-5 text-base leading-7 text-[#bdb5a2]">
                      {venture.text}
                    </p>
                  </div>
                  <a
                    href={venture.href}
                    target={venture.href.startsWith("http") ? "_blank" : undefined}
                    rel={venture.href.startsWith("http") ? "noreferrer" : undefined}
                    className="inline-flex w-max items-center gap-2 text-sm font-semibold text-[#f4efe3] transition hover:text-[#d8b45f]"
                  >
                    {venture.href.startsWith("http") ? "Visit site" : "Explore"}
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-5 py-20 md:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="text-sm text-[#c97656]">Contact</p>
            <h2 className="mt-4 font-display text-5xl leading-none text-[#f4efe3] md:text-7xl">
              Sound, sessions, projects, or collaborations.
            </h2>
            <div className="mt-9 space-y-4 text-[#d8d1c0]">
              <a
                href={`mailto:${siteContent.email}`}
                className="flex items-center gap-3 transition hover:text-[#f4efe3]"
              >
                <Mail size={20} aria-hidden="true" />
                {siteContent.email}
              </a>
              <p className="flex items-center gap-3">
                <MapPin size={20} aria-hidden="true" />
                Vero Beach, Florida
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                if (!link.href) {
                  return (
                    <span
                      key={link.label}
                      aria-label={`${link.label} coming soon`}
                      className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-[#8f8777]"
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span className="hidden text-xs sm:inline">{link.label}</span>
                    </span>
                  );
                }

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={link.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 text-[#f4efe3] transition hover:border-[#d8b45f] hover:bg-white/8"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </Reveal>

          <Reveal>
            <form
              className="rounded-lg border border-white/12 bg-[#10100d] p-5 md:p-7"
              onSubmit={handleContactSubmit}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-[#bdb5a2]">
                  Your Name
                  <input
                    name="name"
                    className="mt-2 h-12 w-full rounded-lg border border-white/12 bg-[#080806] px-4 text-[#f4efe3] outline-none transition placeholder:text-[#7d7464] focus:border-[#d8b45f]"
                    placeholder="Name"
                    type="text"
                    required
                    suppressHydrationWarning
                  />
                </label>
                <label className="text-sm text-[#bdb5a2]">
                  Email Address
                  <input
                    name="email"
                    className="mt-2 h-12 w-full rounded-lg border border-white/12 bg-[#080806] px-4 text-[#f4efe3] outline-none transition placeholder:text-[#7d7464] focus:border-[#d8b45f]"
                    placeholder="you@example.com"
                    type="email"
                    required
                    suppressHydrationWarning
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm text-[#bdb5a2]">
                Message
                <textarea
                  name="message"
                  className="mt-2 min-h-40 w-full resize-none rounded-lg border border-white/12 bg-[#080806] px-4 py-3 text-[#f4efe3] outline-none transition placeholder:text-[#7d7464] focus:border-[#d8b45f]"
                  placeholder="Tell me what you are reaching out about."
                  required
                  suppressHydrationWarning
                />
              </label>
              <button
                type="submit"
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-lg bg-[#d8b45f] px-5 text-sm font-semibold text-[#080806] transition hover:bg-[#f4efe3]"
              >
                Draft Email
                <Send size={17} aria-hidden="true" />
              </button>
              <p className="mt-4 min-h-6 text-sm text-[#bdb5a2]" aria-live="polite">
                {formStatus}
              </p>
            </form>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-sm text-[#8f8777] md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© 2026 CJ Cinco. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <Sparkles size={15} aria-hidden="true" />
            Music • Healing • Business • Life
          </p>
        </div>
      </footer>
    </main>
  );
}
