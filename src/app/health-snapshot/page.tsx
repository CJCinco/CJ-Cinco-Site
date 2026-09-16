import SiteHeader from "../site-header";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./snapshot.module.css";

export const metadata: Metadata = {
  title: "Your Health Snapshot | CJ Cinco",
  description: "A free, one-page reflection on mind, body, soul and everyday alignment.",
};

export default function HealthSnapshotPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#snapshot">Skip to Health Snapshot</a>
      <SiteHeader currentPage="Health Snapshot" />
      <main id="snapshot" className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>A moment for yourself</p>
          <h1>Your Health Snapshot</h1>
          <p className={styles.subheading}>Honor where you are. Connect with possibility. Live in alignment.</p>
          <p className={styles.description}>A simple reflection on your mind, body, soul, and what you welcome into your everyday life. Connect with the possibility you’re aligning with and choose one small action to embody it.</p>
          <a className={styles.download} href="/downloads/cj-cinco-health-snapshot.pdf" download="cj-cinco-health-snapshot.pdf">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" /></svg>
            Download the PDF
          </a>
          <p className={styles.details}>Free · One page · Ready to print</p>
        </div>
        <figure className={styles.preview}>
          <Image src="/downloads/health-snapshot-preview.png" width={1237} height={1600} alt="Preview of Your Health Snapshot, with reflection prompts for mind, body and soul, an everyday inputs table, and space for intentions and actions." priority />
          <figcaption>A little space to reflect, reconnect, and choose your next step.</figcaption>
        </figure>
      </main>
      <footer className={styles.footer}><Link href="/" prefetch={false}>CJ Cinco</Link><span>© 2026 CJ Cinco</span></footer>
    </div>
  );
}
