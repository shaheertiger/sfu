import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { INDUSTRIES, POST_IDEAS_ROOT, WEEKDAYS, WEEKDAY_NAMES, ideasFor, ideasForDay, postIdeasPath } from '@/lib/post-ideas';
import { abs, breadcrumbLd, faqPageLd } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';
import { pagePath as bestTimePath } from '@/lib/best-time-pages';

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export function postIdeasCopy(ind, weekday) {
  const year = new Date().getUTCFullYear();
  if (!weekday) {
    const n = ideasFor(ind).length;
    return { title: `${n} Social Media Post Ideas for ${cap(ind.name === 'small business' ? 'a Small Business' : ind.name.replace(/s$/, '') + 's')} (${year}) — Ready to Schedule`, description: `${n} post ideas for a ${ind.name}: behind the scenes, proof, education, offers and engagement prompts, each written for ${ind.people}. Schedule the week in one sitting.`, h1: `Social media post ideas for ${ind.name === 'small business' ? 'a small business' : `${ind.name}s`}`, keyword: `${ind.name} social media post ideas` };
  }
  const { angle, ideas } = ideasForDay(ind, weekday);
  const day = WEEKDAY_NAMES[WEEKDAYS.indexOf(weekday)];
  return { title: `${day} Post Ideas for ${cap(ind.name)}s: ${angle.hook} (${ideas.length} prompts)`, description: `${day} social media post ideas for a ${ind.name}: ${angle.note.toLowerCase()} ${ideas.length} prompts you can schedule now.`, h1: `${day} post ideas for ${ind.name}s`, keyword: `${weekday} post ideas ${ind.name}` };
}

export function postIdeasFaq(ind, weekday) {
  return [
    { q: `How often should a ${ind.name} post?`, a: 'Three to five posts a week is enough for most small accounts, as long as they go out consistently. Pick the days, set posting slots, and fill them a week ahead.' },
    { q: 'Which of these ideas works best?', a: `Proof posts (${ind.proof}) and short educational posts earn the most saves and shares for local businesses. Offers work when they are rare and have a deadline.` },
    { q: 'Can I schedule these to several platforms at once?', a: 'Yes. Write the post once, tailor the caption per platform, and Schedule For You publishes it to each account from one queue. The Free plan covers 3 accounts and up to 10 scheduled posts at a time, no card needed.' },
    ...(weekday ? [{ q: `Why ${WEEKDAY_NAMES[WEEKDAYS.indexOf(weekday)]} for these?`, a: ideasForDay(ind, weekday).angle.note }] : []),
  ];
}

export default function PostIdeasPage({ ind, weekday = '' }) {
  const copy = postIdeasCopy(ind, weekday);
  const faq = postIdeasFaq(ind, weekday);
  const path = postIdeasPath(ind.slug, weekday);
  const dayName = weekday ? WEEKDAY_NAMES[WEEKDAYS.indexOf(weekday)] : '';
  const { angle, ideas } = weekday ? ideasForDay(ind, weekday) : { angle: null, ideas: ideasFor(ind) };
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Post ideas', href: POST_IDEAS_ROOT }, { name: cap(ind.name), href: postIdeasPath(ind.slug) }, ...(weekday ? [{ name: dayName, href: path }] : [])];
  const types = [...new Set(ideas.map((i) => i.type))];
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: copy.title, description: copy.description, inLanguage: 'en' }, { '@type': 'ItemList', name: copy.h1, numberOfItems: ideas.length, itemListElement: ideas.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.text })) }, breadcrumbLd(crumbs), faqPageLd(faq)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{ideas.length} prompts · {weekday ? angle.hook : 'all week'}</span>
          <h1 className={m.h1}>{copy.h1}</h1>
          <p className={m.lead}>{weekday ? `${angle.note} Each prompt below is written for a ${ind.name} talking to ${ind.people}.` : `${ideas.length} posts written for a ${ind.name} talking to ${ind.people}: show the ${ind.place}, share ${ind.proof}, teach one thing, and ask a question. Pick five, schedule the week.`}</p>
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          {types.map((t) => (
            <section key={t} className={m.section}>
              <h2 id={t.toLowerCase().replace(/\s+/g, '-')}>{t} posts for a {ind.name}</h2>
              <ol>{ideas.filter((i) => i.type === t).map((i) => <li key={i.text}>{i.text}</li>)}</ol>
            </section>
          ))}
          <section className={m.section}>
            <h2 id="days">{cap(ind.name)} post ideas by weekday</h2>
            <ul className={s.chips}>{WEEKDAYS.map((d, i) => <li key={d}><Link href={postIdeasPath(ind.slug, d)} className={`${s.chip} ${d === weekday ? s.chipOn : ''}`}>{WEEKDAY_NAMES[i]}</Link></li>)}</ul>
            <p>Not sure when to post? See the <Link href={bestTimePath('instagram')}>best time to post on Instagram</Link> and <Link href={bestTimePath('facebook')}>Facebook</Link>.</p>
          </section>
          <section className={m.faq} aria-labelledby="faq"><h2 id="faq">Frequently asked questions</h2>{faq.map((f) => <div key={f.q} className={m.faqItem}><h3>{f.q}</h3><p>{f.a}</p></div>)}</section>
          <TrialCta heading={`Schedule a week of ${ind.name} posts in one sitting`}><p>Paste five of these into the queue, tailor the caption per platform, done. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p></TrialCta>
          <div className={m.more}><section><h3>Ideas for other businesses</h3><ul className={m.linkGrid}>{INDUSTRIES.filter((i) => i.slug !== ind.slug).slice(0, 12).map((i) => <li key={i.slug}><Link href={postIdeasPath(i.slug, weekday)} className={m.linkCard}>{cap(i.name)}{weekday ? ` · ${dayName}` : ''}</Link></li>)}</ul></section></div>
        </article>
      </div>
    </MarketingPage>
  );
}
