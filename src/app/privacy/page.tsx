import SiteHeader from "../site-header";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | CJ Cinco",
  description: "How cjcinco.com and CJ Cinco's personal tools handle your information.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#privacy">Skip to Privacy Policy</a>
      <SiteHeader currentPage="Privacy" />
      <main id="privacy" className={styles.content}>
        <p className={styles.eyebrow}>Last updated September 24, 2026</p>
        <h1>Privacy Policy</h1>

        <section>
          <h2>This website</h2>
          <p>cjcinco.com does not ask you to create an account, does not use advertising, and does not sell or share personal information. The site is hosted on Cloudflare, which may keep standard technical logs (such as IP address and browser type) to deliver and protect the site.</p>
          <p>If you email CJ Cinco, your message and email address are used only to reply to you.</p>
        </section>

        <section>
          <h2>Goose Workspace (personal Google integration)</h2>
          <p>Goose Workspace is a private tool CJ Cinco uses to let his own AI assistant on his own computer work with his Google account. It is not offered to the public.</p>
          <ul>
            <li>With permission, it can access Gmail, Google Calendar and Google Drive for the signed-in account only.</li>
            <li>Data from Google is processed on CJ Cinco&rsquo;s own computer to complete the tasks he requests. It is not sold, used for advertising, or shared with third parties.</li>
            <li>Access tokens are stored locally on that computer and can be revoked at any time at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>.</li>
            <li>Use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including the Limited Use requirements.</li>
          </ul>
        </section>

        <section>
          <h2>Contact</h2>
          <p>Questions about this policy: <a href="mailto:energy@cjcinco.com">energy@cjcinco.com</a>.</p>
        </section>
      </main>
      <footer className={styles.footer}><Link href="/" prefetch={false}>CJ Cinco</Link><span>© 2026 CJ Cinco</span></footer>
    </div>
  );
}
