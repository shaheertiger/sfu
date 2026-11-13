import { fitTitle, titleCase } from '@/lib/fit-title';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { INDUSTRIES, POST_IDEAS_ROOT, ideasFor, industryOne, industryPlural, postIdeasPath, weekPlan } from '@/lib/post-ideas';
import { abs, breadcrumbLd, faqPageLd } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';
import { pagePath as bestTimePath } from '@/lib/best-time-pages';

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export function postIdeasCopy(ind) {
  const year = new Date().getUTCFullYear();
  const n = ideasFor(ind).length;
  const who = ind.name === 'small business' ? 'a Small Business' : titleCase(industryPlural(ind));
  return { title: fitTitle(`${n} Social Media Post Ideas for ${who} (${year}) — Ready to Schedule`, `${n} Social Media Post Ideas for ${who} (${year})`, `${n} Post Ideas for ${who} (${year})`), description: `${n} post ideas for ${industryOne(ind)}: behind the scenes, proof, education, offers and engagement prompts, each written for ${ind.people}, plus a Monday-to-Sunday plan.`, h1: `Social media post ideas for ${ind.name === 'small business' ? 'a small business' : industryPlural(ind)}`, keyword: `${ind.name} social media post ideas` };
}

export function postIdeasFaq(ind) {
  return [
    { q: `How often should ${industryOne(ind)} post?`, a: 'Three to five posts a week is enough for most small accounts, as long as they go out consistently. Pick the days, set posting slots, and fill them a week ahead.' },
    { q: 'Which of these ideas works best?', a: `Proof posts (${ind.proof}) and short educational posts earn the most saves and shares for local businesses. Offers work when they are rare and have a deadline.` },
    { q: 'Can I schedule these to several platforms at once?', a: 'Yes. Write the post once, tailor the caption per platform, and Schedule For You publishes it to each account from one queue. The Free plan covers 3 accounts and up to 10 scheduled posts at a time, no card needed.' },
    { q: 'What should I post on each day of the week?', a: `Use the weekly plan on this page: ${weekPlan(ind).slice(1, 6).map((d) => `${d.angle.hook} on ${d.day}`).join(', ')}, and lighter community posts at the weekend.` },
  ];
}

export default function PostIdeasPage({ ind }) {
  const copy = postIdeasCopy(ind);
  const faq = postIdeasFaq(ind);
  const path = postIdeasPath(ind.slug);
  const ideas = ideasFor(ind);
  const plan = weekPlan(ind);
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Post ideas', href: POST_IDEAS_ROOT }, { name: cap(ind.name), href: path }];
  const types = [...new Set(ideas.map((i) => i.type))];
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: copy.title, description: copy.description, inLanguage: 'en' }, { '@type': 'ItemList', name: copy.h1, numberOfItems: ideas.length, itemListElement: ideas.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.text })) }, breadcrumbLd(crumbs), faqPageLd(faq)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{ideas.length} prompts · a plan for every weekday</span>
          <h1 className={m.h1}>{copy.h1}</h1>
          <p className={m.lead}>{`${ideas.length} posts written for ${industryOne(ind)} talking to ${ind.people}: show the ${ind.place}, share ${ind.proof}, teach one thing, and ask a question. Pick five, schedule the week.`}</p>
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          {types.map((t) => (
            <section key={t} className={m.section}>
              <h2 id={t.toLowerCase().replace(/\s+/g, '-')}>{t} posts for {industryOne(ind)}</h2>
              <ol>{ideas.filter((i) => i.type === t).map((i) => <li key={i.text}>{i.text}</li>)}</ol>
            </section>
          ))}
          <section className={m.section}>
            <h2 id="days">What Should {cap(industryOne(ind))} Post Each Day of the Week?</h2>
            <p>One angle per day, with a first post to try. Fill the rest of the week from the lists above.</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Day</th><th>Angle</th><th>Post to try</th></tr></thead>
                <tbody>{plan.map((d) => <tr key={d.weekday} id={d.weekday}><td>{d.day}</td><td><strong>{d.angle.hook}</strong>: {d.angle.note}</td><td>{d.idea?.text}</td></tr>)}</tbody>
              </table>
            </div>
            <p>Not sure when to post? See the <Link href={bestTimePath('instagram')}>best time to post on Instagram</Link> and <Link href={bestTimePath('facebook')}>Facebook</Link>.</p>
          </section>
          <section className={m.faq} aria-labelledby="faq"><h2 id="faq">Frequently asked questions</h2>{faq.map((f) => <div key={f.q} className={m.faqItem}><h3>{f.q}</h3><p>{f.a}</p></div>)}</section>
          <TrialCta heading={`Schedule a week of ${ind.name} posts in one sitting`}><p>Paste five of these into the queue, tailor the caption per platform, done. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p></TrialCta>
          <div className={m.more}><section><h3>Ideas for other businesses</h3><ul className={m.linkGrid}>{INDUSTRIES.filter((i) => i.slug !== ind.slug).slice(0, 12).map((i) => <li key={i.slug}><Link href={postIdeasPath(i.slug)} className={m.linkCard}>{cap(i.name)}</Link></li>)}</ul></section></div>
        </article>
      </div>
    </MarketingPage>
  );
}
