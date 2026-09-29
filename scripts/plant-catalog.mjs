import { readFileSync, writeFileSync, renameSync, realpathSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultSource = '/Users/cjcinco/AOS/06 Aligned Harmonics/CJ Cinco/Website/plant-inventory.json';
const text = (value, limit = 100) => typeof value === 'string' && value.trim() && value.length <= limit ? value.trim() : null;
const date = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) ? value : null;
const money = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100000 && Math.abs(Math.round(value * 100) - value * 100) < 1e-7;
const count = (value) => Number.isInteger(value) && value >= 0;
const publicUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
};

/** Construct every public field explicitly. Never spread or serialize a private row. */
export function projectCatalog(inventory, { now = new Date(), verifyPhoto = () => false } = {}) {
  if (inventory.schemaVersion !== 1 || !Array.isArray(inventory.plants)) throw new Error('Invalid inventory schema.');
  const release = inventory.release || {};
  const registrationNumber = release.registrationVerified === true ? text(release.registrationNumber, 40) : null;
  const releaseReady = release.approved === true && !!registrationNumber && release.advertisingRequirementsVerified === true && release.inspectionVerified === true;
  const ids = new Set();
  const plants = inventory.plants.filter(row => row.includeInCatalog === true).map(row => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id) || ids.has(row.id)) throw new Error('Invalid or duplicate plant ID.');
    ids.add(row.id);
    const name = text(row.name);
    if (!name || !['Herbs', 'Vines', 'Fruit plants', 'Roots & canes', 'Succulents', 'Other'].includes(row.category)) throw new Error(`Invalid public name/category: ${row.id}`);
    const identityVerified = row.identity?.verified === true;
    const cultivar = identityVerified && row.identity?.cultivarVerified === true ? text(row.identity.cultivar) : null;
    const detailsVerified = row.details?.verified === true;
    const starterAssumptions = row.starter?.assumed === true;
    const size = detailsVerified ? text(row.details.size) : starterAssumptions ? text(row.starter.size) : null;
    const format = detailsVerified ? text(row.details.format) : starterAssumptions ? text(row.starter.format) : null;
    const priceIsEstimate = row.price?.basis === 'starter-estimate' && row.price?.authorizedForDraft === true;
    const priceVerified = row.price?.verified === true && row.price?.basis !== 'starter-estimate';
    const price = (priceVerified || priceIsEstimate) && money(row.price.amount) ? row.price.amount : null;
    const checkedAt = date(row.stock?.checkedAt);
    const age = checkedAt ? now.getTime() - Date.parse(checkedAt) : Infinity;
    const fresh = age >= 0 && age <= 7 * 86400000;
    const validStock = count(row.stock?.count) && count(row.stock?.reserved) && row.stock.reserved <= row.stock.count;
    let availability = ['sold_out', 'paused', 'restocking'].includes(row.availability) ? row.availability : 'unverified';
    if (row.availability === 'available' && identityVerified && detailsVerified && size && format && text(row.details.condition) && priceVerified && price !== null && validStock && fresh && releaseReady) {
      availability = row.stock.count > row.stock.reserved ? 'available' : 'sold_out';
    }
    // Owner-reported stock is distinct from fully verified release/inventory evidence.
    const ownerReportedAt = row.availability === 'available' && row.private?.ownerReport?.availability === 'available' ? date(row.private.ownerReport.date) : null;
    const projectPhoto = photo => {
      const photoFileValid = /^\/plants\/[a-z0-9][a-z0-9-]*\.(webp|jpg|png)$/.test(photo?.src || '') && text(photo?.alt, 180) && /^[a-f0-9]{64}$/.test(photo?.sha256 || '') && verifyPhoto(photo);
      const productApproved = photo?.kind !== 'reference' && photo?.approvedForPublic === true && photo?.depictsSaleItem === true && photo?.metadataStripped === true;
      const referenceApproved = photo?.kind === 'reference' && photo?.approvedForLocalReference === true && publicUrl(photo?.sourceUrl) && text(photo?.credit, 120);
      // A reference photo never becomes proof of the plant offered or of readiness.
      // Block release if an included reference still lacks public-use rights.
      if (releaseReady && photo?.kind === 'reference' && !(photo?.publicUseApproved === true && text(photo?.license, 80) && publicUrl(photo?.licenseUrl))) throw new Error(`Public photo rights unresolved: ${row.id}`);
      return photoFileValid && (productApproved || referenceApproved) ? {
        src: photo.src, alt: photo.alt, kind: referenceApproved ? 'reference' : 'product',
        sourceUrl: referenceApproved ? publicUrl(photo.sourceUrl) : null,
        credit: referenceApproved ? text(photo.credit, 120) : null,
        license: referenceApproved && photo.publicUseApproved === true ? text(photo.license, 80) : null,
        licenseUrl: referenceApproved && photo.publicUseApproved === true ? publicUrl(photo.licenseUrl) : null,
      } : null;
    };
    const publicPhoto = projectPhoto(row.photo);
    const publicLargerPhoto = projectPhoto(row.largerPhoto);
    const guideUrl = publicUrl(row.guide?.url);
    const care = guideUrl ? { sun: text(row.guide?.sun, 180), water: text(row.guide?.water, 180), soil: text(row.guide?.soil, 180) } : null;
    const offered = row.sizeOptions;
    const sizeOptions = offered?.approvedForDisplay === true && offered.approximate === true && Array.isArray(offered.options) && offered.options.length === 2 && offered.options.every((option, index) => option.label === ['Starter', 'Larger'][index] && money(option.price) && text(option.size, 60)) && offered.options[0].price === price && offered.options[1].price > price
      ? offered.options.map(option => ({ label: option.label, price: option.price, size: text(option.size, 60) })) : [];
    return { id: row.id, name, category: row.category, identityVerified, cultivar, size, format, detailsAssumed: !detailsVerified && starterAssumptions, price, priceFrom: price !== null && row.price?.from === true, priceIsEstimate: price !== null && priceIsEstimate, sizeOptions, description: guideUrl ? text(row.guide?.description, 600) : null, guideUrl, care, availability, ownerReportedAt, checkedAt: availability === 'available' ? checkedAt : null, photo: publicPhoto, largerPhoto: publicLargerPhoto };
  });
  const approvedContact = (contact, pattern) => contact?.approvedForPublic === true && pattern.test(contact.value || '') ? contact.value : null;
  return {
    schemaVersion: 1,
    preview: !releaseReady,
    registrationNumber: releaseReady ? registrationNumber : null,
    pickupArea: inventory.pickupArea?.approvedForPublic === true ? text(inventory.pickupArea.value, 80) : null,
    contacts: {
      phone: approvedContact(inventory.contacts?.phone, /^\+[1-9]\d{7,14}$/),
      messenger: approvedContact(inventory.contacts?.messenger, /^https:\/\/m\.me\/[a-zA-Z0-9.]+$/),
    },
    plants,
  };
}

function verifyPhoto(photo) {
  const file = resolve(root, 'public', '.' + photo.src);
  try {
    if (!realpathSync(file).startsWith(resolve(root, 'public/plants') + sep)) return false;
    return createHash('sha256').update(readFileSync(file)).digest('hex') === photo.sha256;
  } catch { return false; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const source = realpathSync(process.argv[2] || defaultSource);
  if (source === root || source.startsWith(root + sep)) throw new Error('Private inventory must remain outside the website checkout.');
  const output = resolve(root, 'src/app/plants/catalog.public.json');
  const catalog = projectCatalog(JSON.parse(readFileSync(source, 'utf8')), { verifyPhoto });
  const result = JSON.stringify(catalog, null, 2) + '\n';
  writeFileSync(output + '.tmp', result, { mode: 0o644 });
  renameSync(output + '.tmp', output);
  if (readFileSync(output, 'utf8') !== result) throw new Error('Catalog readback failed.');
  console.log(`Updated ${catalog.plants.length} public entries; ${catalog.preview ? 'local preview; release gates unresolved' : 'release fields verified in source'}. No publication performed.`);
}
