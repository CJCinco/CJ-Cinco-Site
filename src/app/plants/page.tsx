import SiteHeader from "../site-header";
import type { Metadata } from "next";
import Link from "next/link";
import { siteContent } from "../content";
import catalog from "./catalog.public.json";
import PlantCatalog from "./plant-catalog";
import styles from "./plants.module.css";

export const metadata: Metadata = {
  title: "Plants | CJ Cinco",
  description: "Explore the CJ Cinco plant directory and ask about a plant. Availability, size and pricing are confirmed individually.",
  robots: { index: !catalog.preview, follow: !catalog.preview },
};

export default function PlantsPage() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#catalog">Skip to plant directory</a>
      <SiteHeader currentPage="Plants" emailHref="#inquiries" />
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="plants-title">
          <h1 id="plants-title">Plant Directory</h1>
          <p className={styles.intro}>A small collection of herbs, vines, and fruit plants. Explore the directory, find something that catches your eye, and start a conversation.</p>
        </section>
        <PlantCatalog catalog={catalog} email={siteContent.email} />
        <footer className={styles.footer}><Link href="/" prefetch={false}>CJ Cinco</Link><p>Something green. A simple conversation.</p><span>© 2026 CJ Cinco</span></footer>
      </div>
    </main>
  );
}
