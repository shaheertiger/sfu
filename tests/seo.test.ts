import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAQ, PLANS, faqLd, jsonLd, landingLd } from '../lib/seo.js';
import { PLANS as BILLING } from '../lib/server/billing.ts';

test('advertised prices match the billing plans', () => {
  for (const p of PLANS) {
    const b = BILLING[p.id as keyof typeof BILLING];
    assert.equal(b.amount, p.price, p.id);
    assert.equal(b.yearlyAmount, p.yearly, p.id);
    assert.equal(b.accountLimit, p.accounts, p.id);
  }
});

test('the FAQ in structured data is the FAQ shown on the page', async () => {
  const src = await import('node:fs').then((fs) => fs.readFileSync(new URL('../components/LandingMobile.jsx', import.meta.url), 'utf8'));
  for (const [q, a] of FAQ) {
    assert.ok(src.includes(q), q);
    assert.ok(src.includes(a), a);
  }
  assert.equal(faqLd().mainEntity.length, FAQ.length);
});

test('the landing graph has the expected types and the FAQ only when asked for', () => {
  process.env.APP_URL = 'https://example.com';
  const types = (g: any) => g['@graph'].map((n: any) => n['@type']);
  assert.deepEqual(types(landingLd()), ['Organization', 'WebSite', 'SoftwareApplication']);
  assert.deepEqual(types(landingLd({ withFaq: true })), ['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage']);
  const app: any = landingLd()['@graph'][2];
  assert.equal(app.offers.length, 5);
  assert.equal(app.offers[0].name, 'Free');
  assert.equal(app.offers[0].price, 0);
  assert.deepEqual(app.offers.slice(1).map((o: any) => o.priceSpecification.billingDuration), ['P1M', 'P1Y', 'P1M', 'P1Y']);
  assert.equal(app.offers[0].priceCurrency, 'USD');
  assert.ok(app.url.startsWith('https://example.com/'));
  delete process.env.APP_URL;
});

test('JSON-LD serialisation cannot break out of its script tag', () => {
  assert.equal(jsonLd({ a: '</script><script>alert(1)</script>' }).includes('</script>'), false);
});
