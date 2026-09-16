import { navItems, siteContent } from "./content";

export default function SiteHeader({ home = false, currentPage, emailHref = `mailto:${siteContent.email}` }: { home?: boolean; currentPage?: string; emailHref?: string }) {
  const navigation = navItems.map(item => ({ ...item, href: !home && item.href.startsWith("#") ? `/${item.href}` : item.href }));
  const links = navigation.map(item => <a key={item.href} href={item.href} aria-current={item.label === currentPage ? "page" : undefined}>{item.label}</a>);
  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="header-inner">
        <a href={home ? "#home" : "/"} className="wordmark">{siteContent.name}</a>
        <div className="desktop-navigation">{links}</div>
        <a href={emailHref} className="header-email">Email</a>
      </nav>
      <nav aria-label="Page sections" className="mobile-navigation">{links}</nav>
    </header>
  );
}
