"use client";

import { useEffect, useRef } from "react";
import { navItems, siteContent } from "./content";
import { mountNavigation } from "./navigation-menu";

export default function SiteHeader({ home = false, currentPage, emailHref = `mailto:${siteContent.email}` }: { home?: boolean; currentPage?: string; emailHref?: string }) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => menu.current ? mountNavigation(menu.current) : undefined, []);
  const groups = [
    { label: "Explore", items: navItems.filter(item => item.href.startsWith("#")) },
    { label: "Discover", items: navItems.filter(item => !item.href.startsWith("#")) },
  ];
  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="header-inner">
        <a href={home ? "#home" : "/"} className="wordmark">{siteContent.name}</a>
        <details ref={menu} className="navigation-menu">
          <summary className="menu-toggle" aria-label="Navigation menu" aria-controls="site-navigation">
            <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
          </summary>
          <div id="site-navigation" className="navigation-panel">
            {groups.map(group => <div className="navigation-group" key={group.label}>
              <p className="navigation-label">{group.label}</p>
              {group.items.map(item => <a key={item.href}
                href={!home && item.href.startsWith("#") ? `/${item.href}` : item.href}
                aria-current={item.label === currentPage ? "page" : undefined}>{item.label}</a>)}
            </div>)}
          </div>
        </details>
        <a href={emailHref} className="header-email">Email</a>
      </nav>
    </header>
  );
}
