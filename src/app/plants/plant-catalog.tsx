"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Leaf, Mail, MessageCircle, Phone, Search, Sprout, X } from "lucide-react";
import styles from "./plants.module.css";

type Plant = { id: string; name: string; category: string; identityVerified: boolean; cultivar: string | null; size: string | null; format: string | null; detailsAssumed: boolean; price: number | null; priceIsEstimate: boolean; description: string | null; guideUrl: string | null; care: { sun: string | null; water: string | null; soil: string | null } | null; availability: string; checkedAt: string | null; photo: { src: string; alt: string; kind: string; sourceUrl: string | null; credit: string | null; license: string | null; licenseUrl: string | null } | null };
type Catalog = { preview: boolean; registrationNumber: string | null; contacts: { phone: string | null; messenger: string | null }; plants: Plant[] };
const categories = ["All plants", "Herbs", "Vines", "Fruit plants", "Roots & canes", "Succulents", "Other"];
const priceLabel = (plant: Plant) => plant.price === null ? "Price to be confirmed" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(plant.price);
function availability(plant: Plant, now: number | null) {
  if (plant.availability === "available") {
    const checked = plant.checkedAt ? Date.parse(plant.checkedAt) : NaN;
    return now !== null && Number.isFinite(checked) && now >= checked && now - checked <= 7 * 86400000 ? "Available · confirm before pickup" : "Availability needs confirmation";
  }
  return plant.availability === "sold_out" ? "Currently unavailable" : plant.availability === "paused" ? "Temporarily unavailable" : "Availability unverified";
}

function PlantPhoto({ plant }: { plant: Plant }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.photo} data-category={plant.category} data-photo-kind={plant.photo?.kind}>
    {plant.photo && !failed ? <Image src={plant.photo.src} alt={plant.photo.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1050px) 50vw, 33vw" onError={() => setFailed(true)} /> : <div className={styles.photoPending}><Sprout aria-hidden="true" strokeWidth={0.8} /><span>Plant photo coming soon</span><small>Actual plant photo pending review</small></div>}
    <span className={styles.photoCategory}>{plant.category}</span>
  </div>;
}

export default function PlantCatalog({ catalog, email }: { catalog: Catalog; email: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All plants");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [selected, setSelected] = useState<Plant | null>(null);
  const [copyState, setCopyState] = useState("");
  const [dialogMode, setDialogMode] = useState<"info" | "inquiry">("inquiry");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
    if (selected) dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [selected, dialogMode]);
  const shown = catalog.plants.filter(plant => (category === "All plants" || plant.category === category) && `${plant.name} ${plant.cultivar || ""} ${plant.category}`.toLowerCase().includes(query.trim().toLowerCase()) && (!availableOnly || availability(plant, now).startsWith("Available ·")));
  const inquiry = selected ? `Hi CJ, I'm interested in ${selected.name} (${selected.id}). Could you confirm the plant's identity, current availability, size or pot format, price, and pickup options? Thank you!` : "";
  const mailto = `mailto:${email}?subject=${encodeURIComponent(selected ? `Plant inquiry: ${selected.name} [${selected.id}]` : "Plant inquiry")}&body=${encodeURIComponent(inquiry)}`;
  const reset = () => { setQuery(""); setCategory("All plants"); setAvailableOnly(false); };
  const close = () => dialog.current?.close();
  const openPlant = (plant: Plant, mode: "info" | "inquiry") => { setCopyState(""); setDialogMode(mode); setSelected(plant); };
  return <>
    <section id="catalog" className={styles.catalog} aria-label="Plant catalog">
      <noscript><p>Enable JavaScript to search, filter, or open a plant inquiry. You can still read all entries and use the email link below.</p></noscript>
      <div className={styles.filters}>
        <div className={styles.search}><Search size={18} aria-hidden="true" /><label className={styles.srOnly} htmlFor="plant-search">Search plants</label><input id="plant-search" type="search" placeholder="Search by plant name…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}</div>
        <label className={styles.availableToggle}><input type="checkbox" checked={availableOnly} onChange={event => setAvailableOnly(event.target.checked)} /> Available only</label>
      </div>
      <div className={styles.filterBottom}><div className={styles.categories} role="group" aria-label="Plant categories">{categories.filter(item => item === "All plants" || catalog.plants.some(p => p.category === item)).map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><p className={styles.resultCount} role="status" aria-live="polite">{shown.length} {shown.length === 1 ? "plant" : "plants"}</p></div>
      {shown.length ? <div className={styles.grid}>{shown.map(plant => <article className={styles.card} key={plant.id} id={`plant-${plant.id}`}>
        <PlantPhoto plant={plant} />
        <div className={styles.cardContent}>
          <div className={styles.cardHeading}><h2>{plant.name}</h2><p className={styles.cardPrice}>{priceLabel(plant)}</p></div>
          {plant.description && <p className={styles.description}>{plant.description}</p>}
          <p className={styles.stock}><span />{availability(plant, now)}</p>
          <div className={styles.cardActions}>
            <button type="button" className={styles.askButton} onClick={() => openPlant(plant, "inquiry")} aria-label={`Ask about ${plant.name}`}>Ask about this plant</button>
            <button type="button" className={styles.infoButton} onClick={() => openPlant(plant, "info")} aria-label={`More info about ${plant.name}`}>More info</button>
          </div>
        </div>
      </article>)}</div> : <div className={styles.empty}><Leaf size={36} aria-hidden="true" /><h3>{availableOnly ? "No confirmed available plants yet." : "No plants match your search."}</h3><p>{availableOnly ? "You can browse the full directory and ask about a plant that interests you." : "Try another name or choose a different category."}</p><button type="button" onClick={reset}>Show all plants</button></div>}
    </section>
    <section id="inquiries" className={styles.inquiries} aria-labelledby="inquiry-title"><div><p className={styles.eyebrow}>LET’S TALK PLANTS</p><h2 id="inquiry-title">A question is a good start.</h2><p>Ask about a plant and we’ll confirm the details together. An inquiry doesn’t reserve a plant or arrange a pickup.</p></div><div className={styles.channels}><a href={`mailto:${email}?subject=Plant%20inquiry`}><Mail size={20} aria-hidden="true"/><span>Email CJ<small>{email}</small></span></a>{catalog.contacts.phone ? <a href={`tel:${catalog.contacts.phone}`}><Phone size={20} aria-hidden="true"/><span>Call CJ<small>{catalog.contacts.phone}</small></span></a> : <div aria-disabled="true"><Phone size={20} aria-hidden="true"/><span>Phone<small>Not available yet · use email</small></span></div>}{catalog.contacts.messenger ? <a href={catalog.contacts.messenger} target="_blank" rel="noreferrer"><MessageCircle size={20} aria-hidden="true"/><span>Messenger<small>Open a conversation</small></span></a> : <div aria-disabled="true"><MessageCircle size={20} aria-hidden="true"/><span>Messenger<small>Not available yet · use email</small></span></div>}</div></section>
    {catalog.registrationNumber && <p className={styles.registration}>FDACS nursery registration: {catalog.registrationNumber}</p>}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="plant-dialog-title" onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      {selected && <div className={styles.dialogBody}>
        <button type="button" autoFocus className={styles.closeButton} aria-label="Close plant details" onClick={close}><X size={22}/></button>
        <h2 id="plant-dialog-title">{selected.name}</h2>
        <p className={styles.dialogStatus}>{priceLabel(selected)} · {availability(selected, now)}</p>
        {dialogMode === "info" ? <>
          <p>{selected.description}</p>
          <dl className={styles.infoDetails}>
            <div><dt>Sunlight</dt><dd>{selected.care?.sun || "Ask about the best location"}</dd></div>
            <div><dt>Water</dt><dd>{selected.care?.water || "Confirm care when you inquire"}</dd></div>
            <div><dt>Soil</dt><dd>{selected.care?.soil || "Well-drained growing mix"}</dd></div>
            <div><dt>{selected.detailsAssumed ? "Estimated starter height" : "Plant height"}</dt><dd>{selected.size || "To be confirmed"}</dd></div>
            <div><dt>Plant format</dt><dd>{selected.format || "To be confirmed"}</dd></div>
            {selected.cultivar && <div><dt>Variety</dt><dd>{selected.cultivar}</dd></div>}
          </dl>
          {selected.detailsAssumed && <p className={styles.detailNote}>Starter size and format are approximate. Confirm the individual plant when you inquire.</p>}
          {selected.guideUrl && <a className={styles.guideLink} href={selected.guideUrl} target="_blank" rel="noreferrer">Read the growing guide</a>}
          <button type="button" className={styles.primaryButton} onClick={() => setDialogMode("inquiry")}>Ask about this plant</button>
          {selected.photo?.sourceUrl && <details className={styles.photoCredits}><summary>Photo credits</summary><p><a href={selected.photo.sourceUrl} target="_blank" rel="noreferrer">{selected.photo.credit}</a>{selected.photo.licenseUrl && <> · <a href={selected.photo.licenseUrl} target="_blank" rel="noreferrer">{selected.photo.license}</a></>}</p></details>}
        </> : <>
          <p>This message asks for details. Nothing is reserved and no pickup is booked.</p>
          <label htmlFor="inquiry-message">Your inquiry</label><textarea id="inquiry-message" readOnly value={inquiry} rows={5}/>
          <a className={styles.primaryButton} href={mailto}><Mail size={18} aria-hidden="true"/> Open email draft</a>
          <button type="button" className={styles.copyButton} onClick={async () => { try { await navigator.clipboard.writeText(inquiry); setCopyState("Copied. Paste it into your preferred conversation."); } catch { setCopyState("Select and copy the message above."); } }}>{copyState.startsWith("Copied") ? <Check size={17} aria-hidden="true"/> : <Copy size={17} aria-hidden="true"/>} Copy inquiry text</button>
          <p className={styles.copyStatus} role="status">{copyState || "Email opens in your mail app. You choose when to send."}</p>
          {catalog.contacts.phone && <a className={styles.dialogOther} href={`tel:${catalog.contacts.phone}`}>Call CJ</a>}
          {catalog.contacts.messenger && <a className={styles.dialogOther} href={catalog.contacts.messenger} target="_blank" rel="noreferrer">Open Messenger</a>}
        </>}
      </div>}
    </dialog>
  </>;
}
