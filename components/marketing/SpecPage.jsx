import { fitTitle, shortPlatform } from '@/lib/fit-title';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { SPECS_ROOT, SPECS_VERIFIED, SPEC_PLATFORMS, equivalentSpec, sizePresetFor, specPath } from '@/lib/specs';
import { TOOLS } from '@/lib/tools/registry';
import { abs, breadcrumbLd, faqPageLd } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';
import { pagePath as bestTimePath } from '@/lib/best-time-pages';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { specFigures } from '@/lib/figures';

const KIND_LABEL = { image: 'Image sizes', video: 'Video specs', text: 'Character limits', media: 'Media limits' };

export function specCopy(platform, spec) {
  const year = new Date().getUTCFullYear();
  const isText = spec.kind === 'text';
  return {
    title: fitTitle(
      `${spec.h1} (${year}): ${spec.answer}${spec.rows[1] ? ` [${spec.rows[1][0]} ${spec.rows[1][1]}]` : ''}`,
      `${spec.h1} (${year}): ${spec.answer}`,
      `${spec.h1.replace(platform.name, shortPlatform(platform.name))} (${year}): ${spec.answer}`,
      `${spec.h1.replace(platform.name, shortPlatform(platform.name))}: ${spec.answer}`,
    ),
    description: `${spec.h1.replace(/^\w/, (c) => c.toUpperCase())} is ${spec.answer}. ${spec.detail} Every ${platform.name} ${isText ? 'limit' : 'size'} in one table, verified ${SPECS_VERIFIED}.`,
    keyword: spec.h1.toLowerCase(),
  };
}

export function specFaq(platform, spec) {
  const isText = spec.kind === 'text';
  return [
    { q: `What is the ${spec.h1.toLowerCase()}?`, a: `${spec.answer}. ${spec.detail}` },
    { q: `What happens if I go over the ${isText ? 'limit' : 'recommended size'}?`, a: isText ? `${platform.name} rejects the post or cuts the text at the limit. Schedule For You counts characters the way ${platform.name} does and warns before you schedule.` : `${platform.name} scales and crops to fit. Upload at the recommended size and ratio so nothing important is cut and the image stays sharp.` },
    { q: `When were these ${platform.name} ${isText ? 'limits' : 'sizes'} last checked?`, a: `On ${SPECS_VERIFIED}, against ${platform.name}'s help pages and what Schedule For You enforces when it publishes. Platforms change limits without notice; if you see a difference, use the report link at the bottom of the page.` },
  ];
}

export default function SpecPage({ platform, spec }) {
  const path = specPath(platform.slug, spec.slug);
  const copy = specCopy(platform, spec);
  const faq = specFaq(platform, spec);
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Specs & limits', href: SPECS_ROOT }, { name: platform.name, href: specPath(platform.slug) }, { name: spec.h1, href: path }];
  const preset = sizePresetFor(platform.name, spec);
  const resizer = TOOLS.find((t) => t.kind === 'resizer' && t.platform === platform.id);
  const counter = TOOLS.find((t) => t.kind === 'counter' && t.platform === platform.id);
  const siblings = platform.specs.filter((x) => x.slug !== spec.slug);
  const others = SPEC_PLATFORMS.filter((p) => p.slug !== platform.slug).map((p) => ({ p, s: equivalentSpec(p, spec) })).filter((x) => x.s);
  const figs = specFigures(platform.slug, spec.slug);
  const img = figuresLd(figs);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: copy.title, description: copy.description, inLanguage: 'en', dateModified: SPECS_VERIFIED, ...img.primary }, ...img.nodes, breadcrumbLd(crumbs), faqPageLd(faq)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{KIND_LABEL[spec.kind]} · verified {SPECS_VERIFIED}</span>
          <h1 className={m.h1}>{spec.h1}</h1>
          <p className={m.lead}>{spec.h1.replace(/^\w/, (c) => c.toUpperCase())} is <strong>{spec.answer}</strong>. {spec.detail}</p>
          <Figure fig={figs[0]} priority />
          <div className={m.toolArea}>
            <div className={s.answer} style={{ gridTemplateColumns: '1fr' }}>
              <div className={s.slot}>
                <div className={s.slotRank}>Recommended</div>
                <div className={s.slotTime}>{spec.answer}</div>
                <div className={s.slotDay}>{platform.name} · {KIND_LABEL[spec.kind].toLowerCase()}</div>
              </div>
            </div>
          </div>
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          <section className={m.section}>
            <h2 id="table">{spec.h1.replace(/^\w/, (c) => c.toUpperCase())} at a glance</h2>
            <div className="table-wrap">
              <table><thead><tr><th>What</th><th>Value</th></tr></thead><tbody>
                {spec.rows.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}{r[2] ? ` ${r[2]}` : ''}</td></tr>)}
              </tbody></table>
            </div>
            <p>Source: {platform.name} help pages and the limits Schedule For You applies when publishing. Last verified {SPECS_VERIFIED}. <Link href="/methodology#specs">How we check</Link> · <Link href="/docs">Report a change</Link>.</p>
          </section>
          {(preset || resizer || counter) && (
            <section className={m.section}>
              <h2 id="tool">Make it fit</h2>
              <ul>
                {resizer && spec.kind !== 'text' && <li><Link href={`/tools/${resizer.slug}`}>Resize an image to {spec.answer}</Link> in the browser, no sign-up.</li>}
                {counter && spec.kind === 'text' && <li><Link href={`/tools/${counter.slug}`}>Count characters the way {platform.name} does</Link>.</li>}
                <li><Link href="/tools/aspect-ratio-calculator">Aspect ratio calculator</Link> for any other size.</li>
                <li><Link href={bestTimePath(platform.slug)}>Best time to post on {platform.name}</Link>.</li>
              </ul>
            </section>
          )}
          <section className={m.section}>
            <h2 id="more">Other {platform.name} {spec.kind === 'text' ? 'limits' : 'sizes'}</h2>
            <ul className={s.chips}>{siblings.map((x) => <li key={x.slug}><Link href={specPath(platform.slug, x.slug)} className={s.chip}>{x.h1.replace(`${platform.name} `, '')}</Link></li>)}</ul>
          </section>
          <section className={m.faq} aria-labelledby="faq">
            <h2 id="faq">Frequently asked questions</h2>
            {faq.map((f) => <div key={f.q} className={m.faqItem}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </section>
          <TrialCta heading={`Schedule ${platform.name} posts at the right size`}><p>Schedule For You checks sizes and character counts before a post goes out. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p></TrialCta>
          <div className={m.more}>
            <section>
              <h3>Same spec on other platforms</h3>
              <ul className={m.linkGrid}>{others.map(({ p, s: x }) => <li key={p.slug}><Link href={specPath(p.slug, x.slug)} className={m.linkCard}>{x.h1}</Link></li>)}</ul>
            </section>
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}
