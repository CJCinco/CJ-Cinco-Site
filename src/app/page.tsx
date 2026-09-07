import HeroVideo from "./hero-video";
import Image from "next/image";
import { healing, navItems, siteContent, sound, techHelp } from "./content";

export default function Home() {
  return (
    <main className="site-shell">
      <HeroVideo />
      <header className="site-header">
        <nav aria-label="Main navigation" className="header-inner">
          <a href="#home" className="wordmark">{siteContent.name}</a>
          <div className="desktop-navigation">
            {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </div>
          <a href="#email" className="header-email">Email</a>
        </nav>
        <nav aria-label="Page sections" className="mobile-navigation">
          {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
      </header>

      <section id="home" className="hero-section">
        <div className="content-width">
          <div className="hero-content">
            <h1>{siteContent.name}</h1>
            <p className="hero-description">{siteContent.supportingLine}</p>
          </div>
        </div>
      </section>

      <div className="story-surface">
        <div className="content-width">
          <section id="about" className="story-section about-section">
            <div className="section-heading about-profile">
              <h2>About</h2>
              <Image
                src="/visuals/cj-cinco-headshot-teal.webp"
                alt="CJ Cinco"
                loading="eager"
                width={720}
                height={720}
                className="about-portrait"
                sizes="(max-width: 767px) 280px, 320px"
              />
            </div>
            <div className="section-copy">{siteContent.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </section>

          <section id="tech-help" className="story-section">
            <div className="section-heading section-brand">
              <h2>Tech Help</h2>
              <div className="brand-logo-frame brand-logo-frame-dark">
                <Image src="/visuals/vero-tech-care-logo.webp" alt="Vero Tech Care" width={640} height={640} className="brand-logo brand-logo-vtc" />
              </div>
            </div>
            <div className="section-copy">
              {techHelp.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <a href={techHelp.href} target="_blank" rel="noreferrer" className="text-link">Vero Tech Care</a>
            </div>
          </section>

          <section id="sound" className="story-section">
            <div className="section-heading section-brand">
              <h2>Sound</h2>
              <div className="brand-logo-frame">
                <Image src="/visuals/aligned-harmonics-logo.webp" alt="Aligned Harmonics" width={276} height={97} className="brand-logo brand-logo-sound" />
              </div>
            </div>
            <div className="section-copy">
              {sound.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <a href={sound.href} target="_blank" rel="noreferrer" className="text-link">{sound.linkLabel}</a>
            </div>
          </section>

          <section id="healing" className="story-section">
            <div className="section-heading section-brand">
              <h2>Healing</h2>
              <div className="brand-logo-frame">
                <Image src="/visuals/green-bodyworks-logo.webp" alt="Green Bodyworks" width={300} height={300} className="brand-logo brand-logo-healing" />
              </div>
            </div>
            <div className="section-copy">
              {healing.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <a href={healing.href} target="_blank" rel="noreferrer" className="text-link">Green Bodyworks</a>
            </div>
          </section>

          <footer id="email" className="site-footer">
            <div className="footer-email">
              <span className="footer-email-label">Email</span>
              <a href={`mailto:${siteContent.email}`}>{siteContent.email}</a>
            </div>
            <p>© 2026 {siteContent.name}.</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
