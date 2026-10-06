import Image from "next/image";
import { minimalHome, siteContent, techHelp } from "./content";
import styles from "./minimal-home.module.css";

export default function Home() {
  return (
    <div id="home" className={styles.page}>
      <a className={styles.skipLink} href="#about">Skip to introduction</a>
      <main id="about" tabIndex={-1} aria-label="About CJ" className={styles.content}>
        <Image className={styles.portrait} src="/cj-brand-pic.png" alt="CJ" width={900} height={900} loading="eager" />
        <p className={styles.intro}>{minimalHome.introduction}</p>
        <div id="tech-help" className={styles.actions}>
          <a className={styles.primary} href={techHelp.href}>Vero Tech Care</a>
          <a id="email" className={styles.button} href={`mailto:${siteContent.email}`}>
            {/* Keep old contact/music fragments useful without adding visible sections. */}
            <span id="healing"><span id="sound">Email me</span></span>
          </a>
          <a className={`${styles.button} ${styles.gift}`} href="/downloads/cj-cinco-health-snapshot.pdf" download="cj-cinco-health-snapshot.pdf">
            Download Health Snapshot
          </a>
        </div>
      </main>
    </div>
  );
}
