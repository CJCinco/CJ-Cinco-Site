import test from 'node:test';
import assert from 'node:assert/strict';
import { projectCatalog } from './plant-catalog.mjs';

const now = new Date('2026-09-15T12:00:00Z');
const fixture = () => ({ schemaVersion: 1, release: {}, contacts: {}, plants: [{ id: 'test-plant', includeInCatalog: true, name: 'Test plant', category: 'Herbs', identity: { verified: true, cultivarVerified: false, cultivar: 'PRIVATE_CULTIVAR' }, details: { verified: true, size: '6 inches', format: 'Rooted in 4-inch pot', condition: 'Inspected' }, price: { verified: true, amount: 12 }, stock: { count: 4, reserved: 1, checkedAt: '2026-09-15' }, availability: 'available', private: { cost: 'PRIVATE_COST', buyer: 'PRIVATE_BUYER', minimumPrice: 'PRIVATE_MINIMUM', thread: 'PRIVATE_THREAD', address: 'PRIVATE_ADDRESS', position: 'PRIVATE_POSITION', calendar: 'PRIVATE_CALENDAR' } }] });
const release = inventory => { inventory.release = { approved: true, registrationVerified: true, registrationNumber: 'TEST-ONLY', advertisingRequirementsVerified: true, inspectionVerified: true }; return inventory; };

test('only explicit public fields survive; hidden rows and unverified cultivar stay private', () => {
  const inventory = fixture();
  inventory.plants.push({ id: 'private-plant', includeInCatalog: false, name: 'PRIVATE_PLANT' });
  inventory.private = 'PRIVATE_TOP_LEVEL';
  const result = projectCatalog(inventory, { now });
  assert.equal(result.plants.length, 1);
  assert.equal(JSON.stringify(result).includes('PRIVATE_'), false);
  assert.deepEqual(Object.keys(result.plants[0]).sort(), ['id', 'name', 'category', 'identityVerified', 'cultivar', 'size', 'format', 'detailsAssumed', 'price', 'priceFrom', 'priceIsEstimate', 'sizeOptions', 'description', 'guideUrl', 'care', 'availability', 'ownerReportedAt', 'checkedAt', 'photo', 'largerPhoto'].sort());
  assert.equal('stock' in result.plants[0], false);
});
test('available requires release, identity, price, condition, size, format and fresh sale stock', () => {
  assert.equal(projectCatalog(fixture(), { now }).plants[0].availability, 'unverified');
  assert.equal(projectCatalog(release(fixture()), { now }).plants[0].availability, 'available');
  for (const invalidate of [i => i.plants[0].identity.verified = false, i => i.plants[0].price.verified = false, i => i.plants[0].details.condition = null, i => i.plants[0].details.size = null, i => i.plants[0].stock.checkedAt = '2026-09-01', i => i.plants[0].stock.checkedAt = '2026-09-20', i => i.plants[0].stock.reserved = 9, i => i.release.inspectionVerified = false]) {
    const inventory = release(fixture()); invalidate(inventory);
    assert.equal(projectCatalog(inventory, { now }).plants[0].availability, 'unverified');
  }
  const reserved = release(fixture()); reserved.plants[0].stock.reserved = 4;
  assert.equal(projectCatalog(reserved, { now }).plants[0].availability, 'sold_out');
});
test('unapproved contacts and unsafe destinations are omitted', () => {
  const inventory = fixture();
  inventory.contacts = { phone: { value: '+15555550100', approvedForPublic: false }, messenger: { value: 'javascript:alert(1)', approvedForPublic: true } };
  assert.deepEqual(projectCatalog(inventory, { now }).contacts, { phone: null, messenger: null });
  inventory.contacts = { phone: { value: '+15555550100', approvedForPublic: true }, messenger: { value: 'https://m.me/example', approvedForPublic: true } };
  assert.deepEqual(projectCatalog(inventory, { now }).contacts, { phone: '+15555550100', messenger: 'https://m.me/example' });
});
test('ordinary decimal prices survive without accepting fractional cents', () => {
  for (const amount of [9.95, 19.99, 4.10, 0, 100000]) {
    const inventory = release(fixture()); inventory.plants[0].price.amount = amount;
    const plant = projectCatalog(inventory, { now }).plants[0];
    assert.equal(plant.price, amount);
    assert.equal(plant.availability, 'available');
  }
  for (const amount of [1.005, -1, Infinity, NaN, '9.95']) {
    const inventory = release(fixture()); inventory.plants[0].price.amount = amount;
    assert.equal(projectCatalog(inventory, { now }).plants[0].price, null);
  }
});
test('photos require explicit review, metadata stripping, item match and byte verification', () => {
  const inventory = fixture();
  const photo = { src: '/plants/test-plant.webp', alt: 'Test plant', sha256: 'a'.repeat(64), approvedForPublic: true, depictsSaleItem: true, metadataStripped: true };
  inventory.plants[0].photo = photo;
  assert.equal(projectCatalog(inventory, { now }).plants[0].photo, null);
  assert.deepEqual(projectCatalog(inventory, { now, verifyPhoto: () => true }).plants[0].photo, { src: photo.src, alt: photo.alt, kind: 'product', sourceUrl: null, credit: null, license: null, licenseUrl: null });
  for (const bad of [{ ...photo, src: '/plants/../../private.jpg' }, { ...photo, src: 'https://example.com/photo.jpg' }, { ...photo, depictsSaleItem: false }, { ...photo, approvedForPublic: false }, { ...photo, metadataStripped: false }]) {
    inventory.plants[0].photo = bad;
    assert.equal(projectCatalog(inventory, { now, verifyPhoto: () => true }).plants[0].photo, null);
  }
});
test('larger photo has independent hash verification and exposes only approved image fields', () => {
  const inventory = fixture();
  const starter = { src: '/plants/test-plant.png', alt: 'Starter illustration', sha256: 'a'.repeat(64), approvedForPublic: true, depictsSaleItem: true, metadataStripped: true };
  const larger = { ...starter, src: '/plants/test-plant-larger-v1.png', alt: 'Larger illustration', sha256: 'b'.repeat(64), private: 'PRIVATE_IMAGE_NOTE', generatedIllustration: true };
  inventory.plants[0].photo = starter;
  inventory.plants[0].largerPhoto = larger;
  const verified = projectCatalog(inventory, { now, verifyPhoto: photo => photo.sha256 === 'a'.repeat(64) });
  assert.equal(verified.plants[0].photo.src, starter.src);
  assert.equal(verified.plants[0].largerPhoto, null);
  const both = projectCatalog(inventory, { now, verifyPhoto: () => true }).plants[0];
  assert.deepEqual(both.largerPhoto, { src: larger.src, alt: larger.alt, kind: 'product', sourceUrl: null, credit: null, license: null, licenseUrl: null });
  assert.equal(JSON.stringify(both).includes('PRIVATE_'), false);
  inventory.plants[0].largerPhoto = { ...larger, metadataStripped: false };
  assert.equal(projectCatalog(inventory, { now, verifyPhoto: () => true }).plants[0].largerPhoto, null);
  delete inventory.plants[0].largerPhoto;
  assert.equal(projectCatalog(inventory, { now, verifyPhoto: () => true }).plants[0].largerPhoto, null);
});
test('malformed/duplicate identifiers fail instead of replacing a valid catalog', () => {
  const inventory = fixture(); inventory.plants.push(inventory.plants[0]);
  assert.throws(() => projectCatalog(inventory, { now }), /duplicate/);
  assert.throws(() => projectCatalog({ schemaVersion: 2 }, { now }), /schema/);
});
test('authorized starter estimates show as assumptions and never establish sale readiness', () => {
  const inventory = release(fixture());
  inventory.plants[0].price = { amount: 5, basis: 'starter-estimate', authorizedForDraft: true, verified: false };
  inventory.plants[0].details.verified = false;
  inventory.plants[0].starter = { assumed: true, size: '3–6 inches', format: 'Rooted cutting', private: 'PRIVATE_STARTER_NOTE' };
  const plant = projectCatalog(inventory, { now }).plants[0];
  assert.equal(plant.price, 5);
  assert.equal(plant.priceIsEstimate, true);
  assert.equal(plant.detailsAssumed, true);
  assert.equal(plant.size, '3–6 inches');
  assert.equal(plant.availability, 'unverified');
  assert.equal(JSON.stringify(plant).includes('PRIVATE_'), false);
  inventory.plants[0].price.verified = true;
  inventory.plants[0].details.verified = true;
  assert.equal(projectCatalog(inventory, { now }).plants[0].availability, 'unverified');
  inventory.plants[0].price.authorizedForDraft = false;
  assert.equal(projectCatalog(inventory, { now }).plants[0].price, null);
});
test('generic photos remain references and unresolved reuse rights block release', () => {
  const inventory = fixture();
  inventory.plants[0].photo = { kind: 'reference', src: '/plants/test-reference.jpg', alt: 'Example small plant, not actual stock', sha256: 'a'.repeat(64), approvedForLocalReference: true, publicUseApproved: false, sourceUrl: 'https://example.com/plant', credit: 'Example nursery' };
  const opts = { now, verifyPhoto: () => true };
  const photo = projectCatalog(inventory, opts).plants[0].photo;
  assert.equal(photo.kind, 'reference');
  assert.equal(photo.sourceUrl, 'https://example.com/plant');
  assert.equal(photo.license, null);
  assert.equal(projectCatalog(inventory, opts).plants[0].availability, 'unverified');
  assert.throws(() => projectCatalog(release(inventory), opts), /photo rights unresolved/);
  inventory.plants[0].photo.publicUseApproved = true;
  inventory.plants[0].photo.license = 'CC BY 4.0';
  inventory.plants[0].photo.licenseUrl = 'https://creativecommons.org/licenses/by/4.0/';
  assert.equal(projectCatalog(inventory, opts).plants[0].photo.kind, 'reference');
  inventory.release = {};
  inventory.plants[0].photo.sourceUrl = 'javascript:alert(1)';
  assert.equal(projectCatalog(inventory, opts).plants[0].photo, null);
});

test('care information is bounded and private guide fields never enter the public projection', () => {
  const inventory = fixture();
  inventory.plants[0].guide = { url: 'https://example.com/guide', description: 'Growing guide', sun: 'Partial shade', water: 'Keep moist', soil: 'Well drained', notes: 'PRIVATE_GROWER_NOTES' };
  const plant = projectCatalog(inventory, { now }).plants[0];
  assert.deepEqual(plant.care, { sun: 'Partial shade', water: 'Keep moist', soil: 'Well drained' });
  assert.equal(JSON.stringify(plant).includes('PRIVATE_'), false);
  inventory.plants[0].guide.sun = 'x'.repeat(181);
  assert.equal(projectCatalog(inventory, { now }).plants[0].care.sun, null);
  inventory.plants[0].guide.url = 'javascript:alert(1)';
  assert.equal(projectCatalog(inventory, { now }).plants[0].care, null);
});

test('owner availability report stays separate from verified inventory and never overrides restocking', () => {
  const inventory = fixture();
  inventory.plants[0].private.ownerReport = { date: '2026-09-15', availability: 'available', evidence: 'PRIVATE_OWNER_EVIDENCE' };
  let plant = projectCatalog(inventory, { now }).plants[0];
  assert.equal(plant.ownerReportedAt, '2026-09-15');
  assert.equal(plant.availability, 'unverified');
  assert.equal(JSON.stringify(plant).includes('PRIVATE_OWNER_EVIDENCE'), false);
  inventory.plants[0].availability = 'restocking';
  plant = projectCatalog(inventory, { now }).plants[0];
  assert.equal(plant.availability, 'restocking');
  assert.equal(plant.ownerReportedAt, null);
});


test('approximate size offers expose only approved bounded options and do not verify stock', () => {
  const inventory = fixture();
  const options = { approvedForDisplay: true, approximate: true, options: [
    { label: 'Starter', price: 12, size: '6–12 in tall', count: 'PRIVATE_COUNT' },
    { label: 'Larger', price: 25, size: '18–30 in tall', cost: 'PRIVATE_COST' },
  ] };
  inventory.plants[0].sizeOptions = structuredClone(options);
  const plant = projectCatalog(inventory, { now }).plants[0];
  assert.deepEqual(plant.sizeOptions, [{ label: 'Starter', price: 12, size: '6–12 in tall', availability: 'unverified', reportedAt: null }, { label: 'Larger', price: 25, size: '18–30 in tall', availability: 'unverified', reportedAt: null }]);
  assert.equal(plant.availability, 'unverified');
  assert.equal(JSON.stringify(plant).includes('PRIVATE_'), false);
  for (const invalidate of [o => o.approvedForDisplay = false, o => o.options[0].price = 5, o => o.options[1].price = -1, o => o.options[1].price = 12, o => o.options[1].size = 'x'.repeat(61)]) {
    inventory.plants[0].sizeOptions = structuredClone(options);
    invalidate(inventory.plants[0].sizeOptions);
    assert.deepEqual(projectCatalog(inventory, { now }).plants[0].sizeOptions, []);
  }
});

test('pickup projection exposes only an explicitly approved area label', () => {
  const inventory = fixture();
  inventory.pickupArea = { value: 'West Vero Corridor, Vero Beach', approvedForPublic: false, address: 'PRIVATE_ADDRESS', directions: 'PRIVATE_DIRECTIONS' };
  assert.equal(projectCatalog(inventory, { now }).pickupArea, null);
  inventory.pickupArea.approvedForPublic = true;
  const projected = projectCatalog(inventory, { now });
  assert.equal(projected.pickupArea, 'West Vero Corridor, Vero Beach');
  assert.equal(JSON.stringify(projected).includes('PRIVATE_'), false);
});

test('size availability overrides independently, inherits existing stock and keeps evidence private', () => {
  const inventory = fixture();
  const row = inventory.plants[0];
  row.private.ownerReport = { availability: 'available', date: '2026-09-15' };
  row.sizeOptions = { approvedForDisplay: true, approximate: true, options: [
    { label: 'Starter', price: 12, size: '6–12 in', private: 'PRIVATE_SIZE' },
    { label: 'Larger', price: 25, size: '18–30 in' },
  ] };
  const read = () => projectCatalog(inventory, { now }).plants[0];
  assert.deepEqual(read().sizeOptions.map(o => o.availability), ['available', 'available']);
  row.sizeOptions.options[0].availability = 'restocking';
  assert.deepEqual(read().sizeOptions.map(o => o.availability), ['restocking', 'available']);
  row.sizeOptions.options[1].availability = 'restocking';
  assert.deepEqual(read().sizeOptions.map(o => o.availability), ['restocking', 'restocking']);
  row.availability = 'restocking';
  row.sizeOptions.options[0].availability = 'available';
  row.sizeOptions.options[0].availabilityReportedAt = '2026-09-15';
  assert.deepEqual(read().sizeOptions.map(o => o.availability), ['available', 'restocking']);
  assert.equal(read().sizeOptions[0].reportedAt, '2026-09-15');
  assert.equal(read().availability, 'restocking'); // Reports do not rewrite verified inventory.
  row.sizeOptions.options[0].availability = 'made-up';
  assert.equal(read().sizeOptions[0].availability, 'unverified');
  assert.equal(JSON.stringify(read()).includes('PRIVATE_'), false);
  for (const option of row.sizeOptions.options) delete option.availability;
  assert.deepEqual(read().sizeOptions.map(o => o.availability), ['restocking', 'restocking']);
});
