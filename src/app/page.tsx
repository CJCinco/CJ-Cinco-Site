import SiteHeader from "./site-header";
import HeroRider from "./hero-rider";
import { healing, siteContent, sound, techHelp } from "./content";

export default function Home() {
  return (
    <main className="site-shell">
      <HeroRider />
      <SiteHeader home emailHref="#email" />

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
            <div className="section-heading">
              <h2>About</h2>
            </div>
            <div className="section-copy">{siteContent.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </section>

          <section id="tech-help" className="story-section journey-section">
            <div className="journey-art-space" aria-hidden="true" />
            <div className="journey-content">
              <div className="section-heading section-brand">
                <h2>Tech Help</h2>
              </div>
              <div className="section-copy">
                {techHelp.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <a href={techHelp.href} target="_blank" rel="noreferrer" className="text-link">Vero Tech Care</a>
              </div>
            </div>
          </section>

          <section id="sound" className="story-section journey-section journey-section-left">
            <div className="journey-art-space" aria-hidden="true" />
            <div className="journey-content">
              <div className="section-heading section-brand">
                <h2>Sound</h2>
              </div>
              <div className="section-copy">
                {sound.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <a href={sound.href} target="_blank" rel="noreferrer" className="text-link">{sound.linkLabel}</a>
              </div>
            </div>
          </section>

          <section id="healing" className="story-section journey-section">
            <div className="journey-art-space" aria-hidden="true" />
            <div className="journey-content">
              <div className="section-heading section-brand">
                <h2>Healing</h2>
              </div>
              <div className="section-copy">
                {healing.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <a href={healing.href} target="_blank" rel="noreferrer" className="text-link">Green Bodyworks</a>
              </div>
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
