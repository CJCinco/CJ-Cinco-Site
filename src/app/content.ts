import {
  AudioLines,
  BriefcaseBusiness,
  CalendarDays,
  HeartHandshake,
  Mail,
  Music2,
  Radio,
  Sparkles,
  Waves,
} from "lucide-react";

export const siteContent = {
  name: "CJ Cinco",
  tagline: "Music • Healing • Business • Life",
  supportingLine:
    "Building a creative and healing-centered life through sound, service, and practical support.",
  email: "hello@cjcinco.com",
  bio:
    "CJ Cinco is the public creative identity of CJ Watson: a new dad, music producer, Reiki practitioner, entrepreneur, and founder behind Vero Tech Care and Green Body Works. This hub brings the public threads together without merging the businesses: music, healing work, practical service, and the long-game creative ecosystem behind Aligned Harmonics.",
};

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Sound", href: "#sound" },
  { label: "Healing", href: "#healing" },
  { label: "Ventures", href: "#ventures" },
  { label: "Contact", href: "#contact" },
];

export const focusAreas = [
  {
    title: "Sound",
    text: "Artist work, production, beats, intentional audio, and future release paths.",
    icon: Music2,
  },
  {
    title: "Healing",
    text: "Reiki, bodywork, nervous-system reset, grounding, and reconnection.",
    icon: Sparkles,
  },
  {
    title: "Service",
    text: "Practical support through Vero Tech Care and grounded local entrepreneurship.",
    icon: HeartHandshake,
  },
  {
    title: "Ecosystem",
    text: "Aligned Harmonics as the umbrella for creative, healing, and business lanes.",
    icon: BriefcaseBusiness,
  },
];

export const soundCards = [
  {
    title: "Releases",
    label: "Coming soon",
    text: "A home for future CJ Cinco singles, albums, ambient projects, and intentional sound releases.",
    icon: Radio,
  },
  {
    title: "Beats",
    label: "Library placeholder",
    text: "Space for beats, loops, sketches, and producer notes once the catalog is ready to publish.",
    icon: AudioLines,
  },
  {
    title: "Production Work",
    label: "Selective projects",
    text: "Future case studies for production, scoring, editing, sound design, and collaboration.",
    icon: Waves,
  },
];

export const ventures = [
  {
    title: "Vero Tech Care",
    type: "Separate business",
    text: "Premium local tech help, in-home support, workshops, and digital-presence services for Vero Beach and nearby communities.",
    href: "https://verotechcare.com/",
  },
  {
    title: "Green Body Works",
    type: "Healing lane",
    text: "Reiki, craniosacral-inspired bodywork, Lucia Light support, and calm session work kept as its own healing identity.",
    href: "https://greenbodyworks.com/",
  },
  {
    title: "Aligned Harmonics",
    type: "Umbrella company",
    text: "The broader creative and business ecosystem behind technology, healing, music, land, and long-term aligned service.",
    href: "https://alignedharmonics.com/",
  },
  {
    title: "Music / CJ Cinco",
    type: "Artist identity",
    text: "The public sound and personal-brand lane for music, production, public content, and creative studio experiments.",
    href: "#sound",
  },
];

export const contactLinks = [
  { label: "Email", href: "mailto:hello@cjcinco.com", icon: Mail },
  { label: "Instagram", href: null, icon: Sparkles },
  { label: "YouTube", href: null, icon: Radio },
  { label: "Facebook", href: null, icon: CalendarDays },
];
