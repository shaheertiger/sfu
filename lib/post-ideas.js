/**
 * /post-ideas pages: ready-to-schedule post prompts per industry, built from templates so every
 * page is specific to its business without a writer per page.
 *   /post-ideas                         hub
 *   /post-ideas/{industry}              30 ideas for that business, plus a Monday-to-Sunday plan
 *
 * Pruned in November 2026 (SEO audit): the 280 industry × weekday pages repeated 70–74% of their
 * text and now redirect to the industry page, and industries without clear search demand redirect
 * to the hub (lib/retired-pages.mjs). Add an industry back only with demand data.
 */
import { WEEKDAYS, WEEKDAY_NAMES } from './best-time';
import { RETIRED_INDUSTRIES } from './retired-pages.mjs';

export const POST_IDEAS_ROOT = '/post-ideas';

/**
 * { slug, name, people (who the audience is), thing (what they sell), place, expert, proof } fills the templates.
 * `plural` and `one` override industryPlural() / industryOne() where the rule gets it wrong.
 */
export const INDUSTRIES = [
  { slug: 'small-business', name: 'small business', people: 'customers', thing: 'products', place: 'shop', expert: 'owner', proof: 'a customer review' },
  { slug: 'real-estate', name: 'real estate', plural: 'real estate agents', one: 'a real estate agent', people: 'buyers and sellers', thing: 'listings', place: 'office', expert: 'agent', proof: 'a closing day photo' },
  { slug: 'restaurants', name: 'restaurant', people: 'diners', thing: 'dishes', place: 'kitchen', expert: 'chef', proof: 'a full table on a Friday night' },
  { slug: 'gyms', name: 'gym', people: 'members', thing: 'classes', place: 'gym floor', expert: 'coach', proof: 'a member\'s progress photo (with permission)' },
  { slug: 'dentists', name: 'dental practice', people: 'patients', thing: 'treatments', place: 'practice', expert: 'dentist', proof: 'a five-star review' },
  { slug: 'salons', name: 'hair salon', people: 'clients', thing: 'services', place: 'salon', expert: 'stylist', proof: 'a before-and-after' },
  { slug: 'photographers', name: 'photography business', people: 'clients', thing: 'sessions', place: 'studio', expert: 'photographer', proof: 'a favourite shot from last week' },
  { slug: 'churches', name: 'church', people: 'congregation', thing: 'services and groups', place: 'sanctuary', expert: 'pastor', proof: 'a volunteer story' },
  { slug: 'nonprofits', name: 'nonprofit', people: 'supporters', thing: 'programs', place: 'community', expert: 'director', proof: 'one number that shows impact' },
  { slug: 'bakeries', name: 'bakery', people: 'customers', thing: 'bakes', place: 'counter', expert: 'baker', proof: 'the morning tray' },
  { slug: 'coffee-shops', name: 'coffee shop', people: 'regulars', thing: 'drinks', place: 'counter', expert: 'barista', proof: 'the line out the door' },
  { slug: 'boutiques', name: 'boutique', people: 'shoppers', thing: 'pieces', place: 'shop', expert: 'owner', proof: 'a customer in their outfit' },
  { slug: 'ecommerce', name: 'online store', people: 'customers', thing: 'products', place: 'warehouse', expert: 'founder', proof: 'an unboxing' },
  { slug: 'personal-trainers', name: 'personal trainer', people: 'clients', thing: 'sessions', place: 'gym', expert: 'trainer', proof: 'a client PR' },
  { slug: 'nail-salons', name: 'nail salon', people: 'clients', thing: 'sets', place: 'salon', expert: 'nail tech', proof: 'this week\'s favourite set' },
];

/** Industries whose pages were retired; their URLs redirect to the hub (lib/retired-pages.mjs). */
export { RETIRED_INDUSTRIES };

export const industryBySlug = (slug) => INDUSTRIES.find((i) => i.slug === slug) || null;

/** Idea templates. `{name}` etc. are filled per industry; `days` limits a template to weekdays (0 = Sunday). `type` groups them. */
export const TEMPLATES = [
  { type: 'Behind the scenes', text: 'Show the {place} before opening: one photo, one line about what gets set up first.' },
  { type: 'Behind the scenes', text: 'Introduce one person on the team: name, role, the question {people} ask them most.' },
  { type: 'Behind the scenes', text: 'A 15-second video of the most satisfying part of the job, no voiceover, captions on.' },
  { type: 'Proof', text: 'Post {proof}. Caption: what the {people} asked for, what you did, one sentence from them.' },
  { type: 'Proof', text: 'Screenshot a review (with permission) and reply to it publicly in the caption.' },
  { type: 'Proof', text: 'One number from last month ({thing} delivered, {people} served) and what it took.' },
  { type: 'Education', text: 'The one mistake {people} make before coming to a {name}, and the fix.' },
  { type: 'Education', text: '"{Expert} answers": pick the question you got three times this week and answer it in five lines.' },
  { type: 'Education', text: 'A carousel: 5 things to know before choosing {thing}. One per slide, last slide is your CTA.' },
  { type: 'Education', text: 'Myth vs. fact about {thing}, as a two-image post.' },
  { type: 'Offer', text: 'This week only: one clear offer on {thing}, the price, the deadline, how to book.' },
  { type: 'Offer', text: 'Reminder post: what is still available this week and the fastest way to claim it.' },
  { type: 'Engagement', text: 'This or that: two {thing} options side by side; ask {people} to vote in the comments.' },
  { type: 'Engagement', text: 'Fill in the blank: "The best thing about my last visit to the {place} was ___."' },
  { type: 'Engagement', text: 'Ask {people} what they want to see more of: three options, pick one next week.' },
  { type: 'Engagement', text: 'Caption this: a funny photo from the {place}, best comment gets a shout-out.' },
  { type: 'Story', text: 'Why you started the {name}: three sentences, one photo from the early days.' },
  { type: 'Story', text: 'A hard week and what you learned from it. Keep it to five lines.' },
  { type: 'Story', text: 'The {thing} you are proudest of this year and why.' },
  { type: 'Community', text: 'Shout out another local business your {people} love. Tag them.' },
  { type: 'Community', text: 'A local event this weekend and whether you will be there.' },
  { type: 'Community', text: 'Thank the {people} who have been with you longest; name a few if they are happy to be named.' },
  { type: 'Seasonal', text: 'What changes at the {place} this month, and what {people} should do before it does.' },
  { type: 'Seasonal', text: 'A holiday or awareness day this week that fits a {name}, and one honest line about it.' },
  { type: 'Process', text: 'Step-by-step: what happens when a new {people_one} books {thing}. Carousel, 5 slides.' },
  { type: 'Process', text: 'What a typical day looks like for the {expert}, as a timeline post.' },
  { type: 'FAQ', text: 'Price transparency: what {thing} costs and what affects it.' },
  { type: 'FAQ', text: 'The question {people} are embarrassed to ask about {thing}, answered kindly.' },
  { type: 'Recap', text: 'Week in review: three things that happened at the {place}, one photo each.' },
  { type: 'Recap', text: 'Your most-saved post from last month, reposted with an update.' },
];

/** Weekday angles: the hook each day's post should lead with. */
export const WEEKDAY_ANGLES = {
  monday: { hook: 'Monday motivation', note: 'Start the week with a goal, a plan or a fresh start story.', types: ['Story', 'Education', 'Process'] },
  tuesday: { hook: 'Tip Tuesday', note: 'Teach one thing. Tuesday is the most-read day for how-to posts.', types: ['Education', 'FAQ', 'Process'] },
  wednesday: { hook: 'Mid-week check-in', note: 'Engagement posts do best when feeds are quieter.', types: ['Engagement', 'Community', 'Behind the scenes'] },
  thursday: { hook: 'Throwback / proof', note: 'Show results and history; Thursday leads into weekend decisions.', types: ['Proof', 'Story', 'Recap'] },
  friday: { hook: 'Friday wins and offers', note: 'Celebrate the week and put the weekend offer in front of people.', types: ['Proof', 'Offer', 'Recap'] },
  saturday: { hook: 'Weekend and community', note: 'Lighter posts; local events, behind the scenes, customer photos.', types: ['Community', 'Behind the scenes', 'Engagement'] },
  sunday: { hook: 'Sunday reset', note: 'Plan-ahead posts: what is coming this week and how to book it.', types: ['Seasonal', 'Offer', 'Story'] },
};

const singular = (people) => people.replace(/s$/, '').replace(/ and .*/, '');

/** English plural of the last word: bakery → bakeries, small business → small businesses, gym → gyms. */
export function pluralize(phrase) {
  return phrase.replace(/(\w+)$/, (w) => {
    if (/[^aeiou]y$/i.test(w)) return `${w.slice(0, -1)}ies`;
    if (/(s|x|z|ch|sh)$/i.test(w)) return `${w}es`;
    return `${w}s`;
  });
}
/** The industry in the plural, for titles and headings: "Post Ideas for Bakeries". */
export const industryPlural = (ind) => ind.plural || pluralize(ind.name);
/** The industry with its article: "a bakery", "an accounting firm", "an online store". */
export const industryOne = (ind) => ind.one || `${/^[aeiou]/i.test(ind.name) ? 'an' : 'a'} ${ind.name}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function fill(template, ind) {
  return template
    .replace(/\ba \{name\}/g, industryOne(ind)).replace(/\{name\}/g, ind.name).replace(/\{people\}/g, ind.people).replace(/\{people_one\}/g, singular(ind.people))
    .replace(/\{thing\}/g, ind.thing).replace(/\{place\}/g, ind.place).replace(/\{expert\}/g, ind.expert).replace(/\{Expert\}/g, cap(ind.expert))
    .replace(/\{proof\}/g, ind.proof);
}

/** Ideas for an industry page: all templates, filled. */
export function ideasFor(ind) {
  return TEMPLATES.map((t) => ({ type: t.type, text: fill(t.text, ind) }));
}

/** A Monday-to-Sunday plan for an industry: each day's angle and one idea of that day's first type. */
export function weekPlan(ind) {
  const all = ideasFor(ind);
  return WEEKDAYS.map((d, i) => {
    const angle = WEEKDAY_ANGLES[d];
    return { weekday: d, day: WEEKDAY_NAMES[i], angle, idea: all.find((x) => x.type === angle.types[0]) };
  });
}

export const postIdeasPath = (industry = '') => `${POST_IDEAS_ROOT}${industry ? `/${industry}` : ''}`;

export function allPostIdeaPages() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export { WEEKDAYS, WEEKDAY_NAMES };
