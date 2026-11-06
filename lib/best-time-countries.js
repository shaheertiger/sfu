/**
 * Local facts for each country page under /best-time-to-post: time zone names, the zones a
 * country spans, its main cities and how the working day runs there. This is what makes the
 * country pages different from each other: the hourly data can be the same for two countries
 * (until each has enough posts of its own), but the time zone, the cities and the daily
 * rhythm are not. Keep every line factual and hedged; no made-up statistics.
 *
 * Also holds small time zone helpers that run in the browser and on the server (Intl only).
 */
import { COUNTRIES, WEEKDAY_NAMES, countryBySlug, formatHour } from './best-time';

/** Regions for "nearby countries" links and the index page. */
export const REGIONS = [
  { slug: 'north-america', name: 'North America', countries: ['usa', 'canada', 'mexico'] },
  { slug: 'south-america', name: 'South America', countries: ['brazil'] },
  { slug: 'europe', name: 'Europe', countries: ['uk', 'ireland', 'germany', 'france', 'spain', 'italy', 'netherlands', 'belgium'] },
  { slug: 'middle-east-africa', name: 'Middle East and Africa', countries: ['uae', 'nigeria', 'south-africa', 'kenya'] },
  { slug: 'south-asia', name: 'South Asia', countries: ['india', 'pakistan'] },
  { slug: 'east-southeast-asia', name: 'East and Southeast Asia', countries: ['singapore', 'malaysia', 'philippines', 'indonesia', 'japan'] },
  { slug: 'oceania', name: 'Oceania', countries: ['australia', 'new-zealand'] },
];

/**
 * abbr: [standard, daylight saving] abbreviations for the page's main zone.
 * zoneName: the zone's full name. zones: other zones in the country ([label, IANA]), first = main.
 * cities: largest cities. rhythm: how the day runs. tips: local things that move posting times.
 */
const LOCAL = {
  usa: {
    abbr: ['ET', 'ET'],
    zoneName: 'Eastern Time',
    zones: [['Eastern (New York, Miami, Atlanta)', 'America/New_York'], ['Central (Chicago, Houston, Dallas)', 'America/Chicago'], ['Mountain (Denver, Salt Lake City)', 'America/Denver'], ['Arizona (Phoenix)', 'America/Phoenix'], ['Pacific (Los Angeles, Seattle)', 'America/Los_Angeles']],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'Dallas', 'Miami', 'Atlanta'],
    rhythm: 'Most US offices run 9 AM to 5 PM, Monday to Friday, with lunch around noon. Commutes peak at about 7–9 AM and 4–6 PM, and evening phone time runs from roughly 7 to 10 PM. With four main zones, a 9 AM Eastern post goes out at 6 AM in California, so national accounts often pick a mid-morning Eastern slot that still lands in the Pacific morning.',
    tips: ['Daylight saving time starts on the second Sunday in March and ends on the first Sunday in November. Arizona (outside the Navajo Nation) and Hawaii stay on standard time all year.', 'Thanksgiving week, July 4 and the days between Christmas and New Year behave more like weekends than workdays.', 'If most of your followers are on the West Coast, use the Pacific column in the table above rather than the Eastern times.'],
  },
  uk: {
    abbr: ['GMT', 'BST'],
    zoneName: 'Greenwich Mean Time in winter and British Summer Time in summer',
    cities: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Leeds', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Cardiff', 'Belfast'],
    rhythm: 'Working hours usually run 9 AM to 5:30 PM, Monday to Friday, with lunch somewhere between 12 and 2 PM. Commutes into London and the other big cities are long, so phones come out around 7–9 AM and 5–7 PM. The evening after dinner, roughly 8 to 10 PM, is the main leisure window.',
    tips: ['Clocks go forward on the last Sunday in March and back on the last Sunday in October, the same weekends as the rest of Europe.', 'Bank holiday Mondays behave like Sundays: later mornings, busier afternoons.', 'England, Scotland, Wales and Northern Ireland share one time zone, so one schedule covers the whole country.'],
  },
  india: {
    abbr: ['IST', 'IST'],
    zoneName: 'India Standard Time',
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'],
    rhythm: 'Offices typically run from about 9:30 AM to 6:30 PM, and many businesses also open on Saturdays. Lunch usually falls between 1 and 2 PM. Evenings run late: dinner is often between 8:30 and 9:30 PM, and phone use stays high until around 11 PM.',
    tips: ['One time zone covers the whole country, so a single schedule reaches everyone from Gujarat to Assam.', 'India is UTC+5:30, so converted times land on the half hour: 9 PM in India is 3:30 PM UTC.', 'Festivals such as Diwali and Holi, and big cricket matches, change when people scroll. Plan around them rather than posting against them.'],
  },
  canada: {
    abbr: ['ET', 'ET'],
    zoneName: 'Eastern Time',
    zones: [['Eastern (Toronto, Montreal, Ottawa)', 'America/Toronto'], ['Atlantic (Halifax)', 'America/Halifax'], ['Newfoundland (St. John\'s)', 'America/St_Johns'], ['Central (Winnipeg)', 'America/Winnipeg'], ['Saskatchewan (Regina)', 'America/Regina'], ['Mountain (Calgary, Edmonton)', 'America/Edmonton'], ['Pacific (Vancouver)', 'America/Vancouver']],
    cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Halifax'],
    rhythm: 'Working days usually run 9 AM to 5 PM, Monday to Friday, with lunch around noon. Most Canadians live in Ontario and Quebec, so Eastern slots reach the largest share of people. A post at 9 AM in Toronto goes out at 6 AM in Vancouver.',
    tips: ['Saskatchewan does not change its clocks, so its gap with Toronto is different in winter and summer.', 'Newfoundland is 30 minutes off the other zones, so converted times there land on the half hour.', 'Quebec audiences often respond better to French captions.'],
  },
  australia: {
    abbr: ['AEST', 'AEDT'],
    zoneName: 'Australian Eastern Time',
    zones: [['Sydney, Melbourne, Canberra, Hobart', 'Australia/Sydney'], ['Brisbane (no daylight saving)', 'Australia/Brisbane'], ['Adelaide', 'Australia/Adelaide'], ['Darwin', 'Australia/Darwin'], ['Perth', 'Australia/Perth']],
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Hobart', 'Darwin'],
    rhythm: 'Workdays commonly run from about 8:30 AM to 5 PM, Monday to Friday, with lunch between 12 and 1:30 PM. Early starts are normal, so morning scrolling begins around 6–7 AM. Most people live on the east coast; Perth is two to three hours behind Sydney depending on the season.',
    tips: ['Daylight saving runs from the first Sunday in October to the first Sunday in April in New South Wales, Victoria, the ACT, Tasmania and South Australia. Queensland, the Northern Territory and Western Australia keep the same time all year.', 'Australia is a day ahead of the Americas: a Monday-morning post in Sydney goes out on Sunday in the United States.'],
  },
  philippines: {
    abbr: ['PHT', 'PHT'],
    zoneName: 'Philippine Standard Time',
    cities: ['Quezon City', 'Manila', 'Davao City', 'Caloocan', 'Cebu City', 'Zamboanga City', 'Taguig', 'Pasig', 'Makati', 'Cagayan de Oro'],
    rhythm: 'Office hours usually run 8 AM to 5 PM, and Saturday work is common. Metro Manila commutes are long, so phones come out early in the morning and again in the evening rush. Evenings, roughly 7 to 11 PM, are the main scrolling window. Many people work night shifts in BPO jobs that follow US hours, which adds late-night and early-morning activity.',
    tips: ['Facebook and Messenger are especially widely used in the Philippines, so a Facebook slot here often matters more than in other countries.', 'Paydays around the 15th and the end of the month tend to lift shopping-related posts.', 'Holy Week and the long Christmas season (which starts in September) change weekly patterns.'],
  },
  pakistan: {
    abbr: ['PKT', 'PKT'],
    zoneName: 'Pakistan Standard Time',
    cities: ['Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Peshawar', 'Multan', 'Hyderabad', 'Islamabad', 'Quetta'],
    rhythm: 'Offices generally run from about 9 AM to 5 PM, Monday to Friday, and many private businesses also open on Saturday. Friday slows down around Jumu\'ah prayers in the early afternoon. Evenings run late: dinner is often after 8 PM and scrolling stays high until around midnight.',
    tips: ['During Ramadan, activity moves to the hours after iftar (sunset) and late at night around sehri. Shift your slots later for the month.', 'Big cricket matches pull attention away from everything else; post before the match or after it ends.', 'One time zone covers the whole country, so one schedule reaches Karachi and Peshawar alike.'],
  },
  nigeria: {
    abbr: ['WAT', 'WAT'],
    zoneName: 'West Africa Time',
    cities: ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Kaduna', 'Onitsha', 'Enugu', 'Aba'],
    rhythm: 'Office hours usually run 8 AM to 5 PM, Monday to Friday. Long commutes in Lagos and Abuja mean people scroll in traffic early in the morning and again from about 5 to 8 PM. Evenings, roughly 8 to 11 PM, are the main window.',
    tips: ['Nigeria is one hour ahead of the UK in winter and on the same time in summer, which helps if you also target the diaspora in Britain.', 'The whole country uses one time zone and does not change clocks.'],
  },
  germany: {
    abbr: ['CET', 'CEST'],
    zoneName: 'Central European Time',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    rhythm: 'The workday starts early, often around 8 AM, with lunch between 12 and 1 PM, and many people finish by 5 PM. Dinner is early, around 6 to 7 PM, so the evening window starts and ends earlier than in southern Europe.',
    tips: ['Shops are closed on Sundays, so Sunday afternoons and evenings tend to be relaxed, phone-in-hand time.', 'German captions usually reach further than English ones, even with younger audiences.', 'Clocks change on the last Sunday in March and the last Sunday in October.'],
  },
  france: {
    abbr: ['CET', 'CEST'],
    zoneName: 'Central European Time',
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille'],
    rhythm: 'Workdays run from about 9 AM to 6 PM, and lunch is a proper break, usually between 12 and 2 PM. Dinner is around 8 PM, so the evening window runs from about 8:30 to 10:30 PM.',
    tips: ['Many primary schools have Wednesday afternoons off, which matters for accounts aimed at parents.', 'August is the main holiday month and weekday patterns flatten out.', 'Clocks change on the last Sunday in March and the last Sunday in October.'],
  },
  brazil: {
    abbr: ['BRT', 'BRT'],
    zoneName: 'Brasília Time',
    zones: [['Brasília (São Paulo, Rio, Brasília)', 'America/Sao_Paulo'], ['Amazon (Manaus)', 'America/Manaus'], ['Acre (Rio Branco)', 'America/Rio_Branco'], ['Fernando de Noronha', 'America/Noronha']],
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
    rhythm: 'Business hours usually run from 9 AM to 6 PM with a lunch break between about 12 and 2 PM. Long commutes in São Paulo and Rio push evening scrolling later, roughly 8 to 11 PM.',
    tips: ['Brazil stopped using daylight saving time in 2019, so its gap with Europe and the US changes when they change their clocks.', 'Carnival week and big football matches change behaviour across the country.', 'Portuguese captions reach much further than English ones.'],
  },
  mexico: {
    abbr: ['CST', 'CST'],
    zoneName: 'Central Standard Time',
    zones: [['Central (Mexico City, Guadalajara, Monterrey)', 'America/Mexico_City'], ['Southeast (Cancún)', 'America/Cancun'], ['Sonora (Hermosillo)', 'America/Hermosillo'], ['Pacific (Tijuana)', 'America/Tijuana']],
    cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'Cancún'],
    rhythm: 'Workdays often run from 9 AM to 6 PM or later, and the main meal of the day (la comida) comes late, around 2 to 4 PM. Dinner is light and late, so evening scrolling runs until about 11 PM.',
    tips: ['Most of Mexico stopped changing clocks in 2022. Border cities such as Tijuana and Ciudad Juárez still follow US daylight saving time.', 'Spanish captions reach much further than English ones.'],
  },
  indonesia: {
    abbr: ['WIB', 'WIB'],
    zoneName: 'Western Indonesia Time',
    zones: [['WIB (Jakarta, Java, Sumatra)', 'Asia/Jakarta'], ['WITA (Bali, Sulawesi)', 'Asia/Makassar'], ['WIT (Papua, Maluku)', 'Asia/Jayapura']],
    cities: ['Jakarta', 'Surabaya', 'Bekasi', 'Bandung', 'Medan', 'Depok', 'Tangerang', 'Semarang', 'Makassar', 'Denpasar'],
    rhythm: 'Office hours usually run 8 AM to 5 PM, Monday to Friday. Jakarta\'s traffic makes for long commutes, so mobile use peaks early in the morning and again from about 5 to 8 PM. Evenings after dinner, roughly 7:30 to 10 PM, are the busiest.',
    tips: ['During Ramadan, attention shifts to the pre-dawn sahur hours and the evening after buka puasa. Move your slots to match for the month.', 'WIB covers Java and Sumatra, where most Indonesians live, so it is the right default. Bali is one hour ahead.', 'Bahasa Indonesia captions reach much further than English ones.'],
  },
  malaysia: {
    abbr: ['MYT', 'MYT'],
    zoneName: 'Malaysia Time',
    cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Kota Kinabalu', 'Kuching', 'Malacca City', 'Seremban'],
    rhythm: 'Offices generally run from 9 AM to 6 PM. Lunch is around 1 PM, with a longer break on Fridays for prayers. Evenings, roughly 8 to 11 PM, are the main scrolling window.',
    tips: ['Kelantan, Terengganu and Kedah take Friday and Saturday as their weekend, while the other states rest on Saturday and Sunday.', 'Ramadan and Hari Raya move activity later into the night.', 'Peninsular Malaysia, Sabah and Sarawak all use the same time.'],
  },
  'south-africa': {
    abbr: ['SAST', 'SAST'],
    zoneName: 'South African Standard Time',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Gqeberha', 'Bloemfontein', 'East London', 'Polokwane', 'Mbombela', 'Kimberley'],
    rhythm: 'Workdays usually run 8 AM to 5 PM, Monday to Friday, with lunch between 12 and 1 PM. Commutes start early in Gauteng, so morning scrolling begins around 6 AM. Evenings, roughly 7 to 10 PM, are the main window.',
    tips: ['SAST equals Central European Summer Time, so in the northern summer South Africa shares clock time with much of Europe.', 'Month-end paydays, around the 25th, tend to lift retail and shopping posts.', 'The whole country uses one time zone and does not change clocks.'],
  },
  uae: {
    abbr: ['GST', 'GST'],
    zoneName: 'Gulf Standard Time',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
    rhythm: 'Since 2022 the official working week runs Monday to Friday, with Friday a half day for government offices; Sharjah takes Friday off entirely. Office hours usually run 8 AM to 5 PM. Evenings run late, especially in the hot months when people stay in until after sunset.',
    tips: ['During Ramadan, working hours get shorter and activity moves to after iftar and late at night.', 'A large share of residents are expats, so English and Arabic captions (and sometimes Hindi or Urdu) reach different groups.', 'The UAE does not change its clocks.'],
  },
  kenya: {
    abbr: ['EAT', 'EAT'],
    zoneName: 'East Africa Time',
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale'],
    rhythm: 'Offices usually run 8 AM to 5 PM, Monday to Friday. Nairobi commuters spend long stretches in traffic and matatus, so phones are busy from about 6 to 8 AM and 5 to 8 PM. Evenings until around 10 PM are the main window.',
    tips: ['Kenya sits on the equator, so sunrise and sunset barely move through the year and daily routines stay steady.', 'The country uses one time zone and does not change clocks.'],
  },
  japan: {
    abbr: ['JST', 'JST'],
    zoneName: 'Japan Standard Time',
    cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama'],
    rhythm: 'Office hours typically run 9 AM to 6 PM, often later. Long train commutes are prime phone time, about 7 to 9 AM and 6 to 8 PM, and lunch is a short break from 12 to 1 PM. Late evenings, about 9 PM to midnight, are busy too.',
    tips: ['Golden Week (late April to early May), Obon (mid-August) and the New Year break change weekday patterns nationwide.', 'Japanese captions reach much further than English ones.', 'Japan does not use daylight saving time.'],
  },
  spain: {
    abbr: ['CET', 'CEST'],
    zoneName: 'Central European Time',
    zones: [['Mainland and Balearic Islands', 'Europe/Madrid'], ['Canary Islands', 'Atlantic/Canary']],
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
    rhythm: 'Spain runs late. Lunch is the main meal, usually between 2 and 4 PM, and dinner is around 9 to 10 PM, so the evening window stretches to about midnight. Mornings start around 9 AM.',
    tips: ['Spain uses Central European Time even though it sits level with the UK, which is part of why daily life feels an hour later.', 'The Canary Islands are one hour behind the mainland.', 'August is the main holiday month and weekday patterns flatten out.'],
  },
  italy: {
    abbr: ['CET', 'CEST'],
    zoneName: 'Central European Time',
    cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Venice'],
    rhythm: 'Workdays run from roughly 9 AM to 6 PM with lunch between about 1 and 2:30 PM. Evenings start with aperitivo around 6 to 8 PM and dinner around 8 to 9 PM, with scrolling continuing until about 11 PM.',
    tips: ['Ferragosto (August 15) sits in the middle of the main holiday season, and August weekdays look like weekends.', 'Italian captions reach much further than English ones.', 'Clocks change on the last Sunday in March and the last Sunday in October.'],
  },
  netherlands: {
    abbr: ['CET', 'CEST'],
    zoneName: 'Central European Time',
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen'],
    rhythm: 'Workdays run from about 8:30 AM to 5:30 PM, with a short lunch between 12 and 1 PM. Dinner is early, around 6 PM, so evenings free up from about 7:30 PM. Part-time work is very common, so weekday daytime activity is spread more evenly than in many countries.',
    tips: ['Many Dutch people are comfortable with English online, but Dutch captions feel more local.', 'Clocks change on the last Sunday in March and the last Sunday in October.'],
  },
  ireland: {
    abbr: ['GMT', 'IST'],
    zoneName: 'Greenwich Mean Time in winter and Irish Standard Time in summer',
    cities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Kilkenny', 'Sligo'],
    rhythm: 'Office hours are usually 9 AM to 5:30 PM, with lunch around 1 PM. Dublin commutes are long, so morning scrolling starts around 7 AM. Evenings, about 8 to 10:30 PM, are the busiest.',
    tips: ['Ireland shares clock time with the UK all year, so one schedule can serve both audiences.', 'Here IST means Irish Standard Time (UTC+1 in summer), not India Standard Time.'],
  },
  'new-zealand': {
    abbr: ['NZST', 'NZDT'],
    zoneName: 'New Zealand Time',
    zones: [['Main islands (Auckland, Wellington)', 'Pacific/Auckland'], ['Chatham Islands', 'Pacific/Chatham']],
    cities: ['Auckland', 'Christchurch', 'Wellington', 'Hamilton', 'Tauranga', 'Dunedin', 'Palmerston North', 'Napier', 'Nelson', 'Rotorua'],
    rhythm: 'Workdays run from about 8:30 AM to 5 PM, Monday to Friday. Kiwis tend to start and finish early, so mornings from 7 AM and evenings from about 7 to 9:30 PM are the strongest windows.',
    tips: ['New Zealand is one of the first places to start each day: Monday morning in Auckland is still Sunday in Europe and the Americas.', 'Daylight saving runs from the last Sunday in September to the first Sunday in April.'],
  },
  singapore: {
    abbr: ['SGT', 'SGT'],
    zoneName: 'Singapore Standard Time',
    cities: ['Downtown Core', 'Orchard', 'Jurong East', 'Tampines', 'Woodlands', 'Punggol', 'Bedok', 'Ang Mo Kio'],
    citiesLabel: 'areas',
    rhythm: 'Office hours usually run 9 AM to 6 PM, and many people work late. MRT commutes, about 7:30 to 9:30 AM and 6 to 8 PM, are prime phone time. Lunch runs from around 12 to 2 PM at hawker centres and food courts, and late evenings stay busy until midnight.',
    tips: ['Singapore shares UTC+8 with Malaysia, the Philippines, Hong Kong and much of China, so one schedule can serve the region.', 'English works for most audiences, but Mandarin, Malay and Tamil captions can reach specific communities.', 'Singapore does not change its clocks.'],
  },
  belgium: {
    abbr: ['CET', 'CEST'],
    zoneName: 'Central European Time',
    cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Mechelen'],
    rhythm: 'Workdays run from roughly 8:30 AM to 5:30 PM, with lunch between 12 and 1:30 PM. Dinner is around 6:30 to 7:30 PM, so evenings from about 8 PM are the main scrolling window.',
    tips: ['Belgium has three official languages: Dutch in Flanders, French in Wallonia and German in the east. Brussels is bilingual, so match captions to the region you target.', 'Clocks change on the last Sunday in March and the last Sunday in October.'],
  },
};

/** Everything a country page needs about the place. Throws in tests if a country has no entry. */
export function countryLocal(slug) {
  const c = countryBySlug(slug);
  const l = LOCAL[slug];
  if (!c || !l) return null;
  const region = REGIONS.find((r) => r.countries.includes(slug)) || null;
  // adj: the form used before "time" or "audience" ("US time", "UK audience").
  const adj = { usa: 'US' }[slug] || c.short;
  return { ...c, ...l, adj, zones: l.zones || [[c.short, c.tz]], citiesLabel: l.citiesLabel || 'cities', region };
}

/** Up to n other countries in the same region, then the nearest by UTC offset. */
export function nearbyCountries(slug, n = 4, at = Date.now()) {
  const me = countryBySlug(slug);
  if (!me) return [];
  const region = REGIONS.find((r) => r.countries.includes(slug));
  const same = (region?.countries || []).filter((s) => s !== slug);
  const myOff = offsetMinutes(me.tz, at);
  const rest = COUNTRIES.filter((c) => c.slug !== slug && !same.includes(c.slug))
    .sort((a, b) => Math.abs(offsetMinutes(a.tz, at) - myOff) - Math.abs(offsetMinutes(b.tz, at) - myOff))
    .map((c) => c.slug);
  return [...same, ...rest].slice(0, n).map(countryBySlug);
}

/* --- Time zone helpers (Intl only, safe in the browser) --- */

/** Minutes east of UTC for a zone at an instant (India = 330, New York in winter = -300). */
export function offsetMinutes(tz, at = Date.now()) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(at));
  const g = (t) => Number(p.find((x) => x.type === t).value);
  const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return Math.round((asUtc - Math.floor(at / 60000) * 60000) / 60000);
}

/** "UTC+5:30", "UTC−3", "UTC+0". */
export function formatOffset(min) {
  const sign = min < 0 ? '−' : '+';
  const a = Math.abs(min);
  const h = Math.floor(a / 60);
  const m = a % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

/** Whether a zone changes its clocks during the year, and its winter and summer offsets. */
export function dstInfo(tz, year = new Date().getUTCFullYear()) {
  const jan = offsetMinutes(tz, Date.UTC(year, 0, 15));
  const jul = offsetMinutes(tz, Date.UTC(year, 6, 15));
  return { observes: jan !== jul, standard: Math.min(jan, jul), daylight: Math.max(jan, jul) };
}

/** The zone abbreviation in use right now for a country page ("CEST" in July, "CET" in January). */
export function currentAbbr(local, at = Date.now()) {
  const d = dstInfo(local.tz, new Date(at).getUTCFullYear());
  return d.observes && offsetMinutes(local.tz, at) === d.daylight ? local.abbr[1] : local.abbr[0];
}

/** Label for an abbreviation pair: "SGT" or "CET/CEST". */
export const abbrLabel = (local) => (local.abbr[0] === local.abbr[1] ? local.abbr[0] : `${local.abbr[0]}/${local.abbr[1]}`);

/**
 * The same weekly slot seen from another zone at an instant: { weekday, hour, minute }.
 * Good enough for every week except the few days around a clock change.
 */
export function convertSlot({ weekday, hour }, fromTz, toTz, at = Date.now()) {
  const diff = offsetMinutes(toTz, at) - offsetMinutes(fromTz, at);
  const week = 7 * 1440;
  const t = (((weekday * 1440 + hour * 60 + diff) % week) + week) % week;
  return { weekday: Math.floor(t / 1440), hour: Math.floor((t % 1440) / 60), minute: t % 60 };
}

/** "9 PM" or "9:30 PM". */
export function formatClock(hour, minute = 0) {
  if (!minute) return formatHour(hour);
  const base = formatHour(hour);
  return base.replace(' ', `:${String(minute).padStart(2, '0')} `);
}

/** "21:00". */
export const formatHour24 = (h, minute = 0) => `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

/** "Tue 9 PM" style label of a converted slot, naming the day only when it differs. */
export function convertedLabel(slot, original) {
  const time = formatClock(slot.hour, slot.minute);
  return slot.weekday === original.weekday ? time : `${WEEKDAY_NAMES[slot.weekday].slice(0, 3)} ${time}`;
}

/** Reference zones for the "scheduling from abroad" table: the big audience hubs, minus the page's own. */
const REFERENCE_ZONES = [
  ['UTC', 'UTC'],
  ['New York', 'America/New_York'],
  ['Los Angeles', 'America/Los_Angeles'],
  ['London', 'Europe/London'],
  ['Berlin', 'Europe/Berlin'],
  ['Dubai', 'Asia/Dubai'],
  ['India', 'Asia/Kolkata'],
  ['Singapore', 'Asia/Singapore'],
  ['Sydney', 'Australia/Sydney'],
];
export function referenceZones(tz, n = 5, at = Date.now()) {
  const mine = offsetMinutes(tz, at);
  return REFERENCE_ZONES.filter(([, z]) => z !== tz && (z === 'UTC' || offsetMinutes(z, at) !== mine)).slice(0, n);
}
