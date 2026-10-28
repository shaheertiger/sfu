import Link from 'next/link';
import CodePanel, { CopyButton } from './CodePanel';
import DocsNav from './DocsNav';
import { Inline, highlight } from './highlight';
import s from './docs.module.css';
import { Breadcrumbs, TrialCta } from '@/components/marketing/Chrome';
import {
  BASE_URL, DASHBOARD_ONLY, ERRORS, GROUPS, LIMITS, PING_PAYLOAD, PLATFORM_NOTES, PLATFORM_OPTIONS, VERIFY_SAMPLES,
  WEBHOOK_EVENTS, WEBHOOK_HEADERS, WEBHOOK_PAYLOAD, requestSamples, responseJson, toJson,
} from '@/lib/api-reference';
import { PLATFORM_LIST } from '@/lib/server/platforms';

/** The /docs page body: sidebar, getting-started sections, every endpoint, webhooks and platforms. */

const NAV = [
  { title: 'Getting started', items: [['introduction', 'Introduction'], ['authentication', 'Authentication'], ['errors', 'Errors'], ['limits', 'Limits']] },
  ...GROUPS.map((g) => ({ title: g.title, href: g.id, items: g.endpoints.map((e) => [e.id, e.title, e.method]) })),
  { title: 'More', items: [['webhook-events', 'Webhook events'], ['platforms', 'Platform rules'], ['platform-options', 'Platform options'], ['mcp-server', 'MCP server']] },
];

function NavList() {
  return (
    <div className={s.navGroups}>
      {NAV.map((g) => (
        <div key={g.title} className={s.navGroup}>
          <p className={s.navTitle}>{g.href ? <a href={`#${g.href}`}>{g.title}</a> : g.title}</p>
          <ul>
            {g.items.map(([id, label, method]) => (
              <li key={id}>
                <a href={`#${id}`} className={s.navLink}>
                  {method && <span className={`${s.navMethod} ${s[`m${method}`]}`}>{method === 'DELETE' ? 'DEL' : method}</span>}
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const Method = ({ m }) => <span className={`${s.method} ${s[`m${m}`]}`}>{m}</span>;

function Code({ code, lang = 'json', title, status }) {
  return <CodePanel title={title} status={status} panes={[{ label: lang, text: code, node: highlight(code, lang) }]} />;
}

function Samples({ title, samples, sync = false }) {
  return <CodePanel title={title} sync={sync} panes={samples.map((x) => ({ label: x.label, text: x.code, node: highlight(x.code, x.lang) }))} />;
}

function Params({ title, rows }) {
  if (!rows?.length) return null;
  return (
    <div className={s.params}>
      <h4 className={s.h4}>{title}</h4>
      <dl>
        {rows.map((p) => (
          <div key={p.name} className={s.param}>
            <dt>
              <code className={s.paramName}>{p.name}</code>
              <span className={s.paramType}>{p.type}</span>
              {p.required && <span className={s.required}>required</span>}
            </dt>
            <dd>
              <Inline text={p.description} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Table({ head, rows, className = '' }) {
  return (
    <div className={s.tableWrap}>
      <table className={`${s.table} ${className}`}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{typeof c === 'string' ? <Inline text={c} /> : c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Endpoint({ e }) {
  const full = `/api/v1${e.path}`;
  return (
    <section id={e.id} className={s.endpoint} aria-labelledby={`${e.id}-title`}>
      <div className={s.endpointText}>
        <h3 id={`${e.id}-title`} className={s.h3}>
          <a href={`#${e.id}`} className={s.anchor}>{e.title}</a>
        </h3>
        <div className={s.route}>
          <Method m={e.method} />
          <code className={s.routePath}>{full}</code>
          <CopyButton text={`${e.method} ${BASE_URL}${e.path}`} label="Copy" className={s.routeCopy} />
        </div>
        {e.description.map((p, i) => (
          <p key={i} className={s.p}>
            <Inline text={p} />
          </p>
        ))}
        <Params title="Path parameters" rows={e.params?.path} />
        <Params title="Query parameters" rows={e.params?.query} />
        <Params title="Body (JSON)" rows={e.params?.body} />
        {e.errors?.length > 0 && (
          <div className={s.params}>
            <h4 className={s.h4}>Errors</h4>
            <dl>
              {e.errors.map(([code, when]) => (
                <div key={code} className={s.param}>
                  <dt>
                    <span className={`${s.status} ${s.statusErr}`}>{code}</span>
                  </dt>
                  <dd>
                    <Inline text={when} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
      <div className={s.endpointCode}>
        <Samples title="Request" samples={requestSamples(e)} sync />
        <Code title="Response" status={e.response.status} code={responseJson(e)} />
      </div>
    </section>
  );
}

function Prose({ items }) {
  return items.map((it, i) => {
    if (typeof it === 'string') return <p key={i} className={s.p}><Inline text={it} /></p>;
    if (it.list) {
      return (
        <ol key={i} className={s.ol}>
          {it.list.map((li, j) => (
            <li key={j}><Inline text={li} /></li>
          ))}
        </ol>
      );
    }
    return <div key={i} className={s.inlineCode}><Code title={it.title} lang={it.lang} code={it.code} /></div>;
  });
}

const QUICK_START = `# 1. Find the accounts to post to
curl "${BASE_URL}/accounts" \\
  -H "Authorization: Bearer $SFY_API_KEY"

# 2. Schedule a post to two of them
curl -X POST "${BASE_URL}/posts" \\
  -H "Authorization: Bearer $SFY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "caption": "Our autumn menu starts Monday.",
    "account_ids": ["acc_7d21e0c94b3a6f15", "acc_c0a85f3e17d94b26"],
    "scheduled_at": "2026-11-02T14:00:00Z"
  }'`;

const ERROR_EXAMPLE = toJson({ error: 'Pinterest needs an image; X / Twitter (@harborbakery): 312/280 characters', errors: ['Pinterest needs an image', 'X / Twitter (@harborbakery): 312/280 characters'] });

const MCP_CONFIG = toJson({
  mcpServers: {
    scheduleforyou: {
      type: 'http',
      url: 'https://scheduleforyou.com/api/mcp',
      headers: { Authorization: 'Bearer sfy_…' },
    },
  },
});

const MCP_CLAUDE_CODE = 'claude mcp add --transport http scheduleforyou https://scheduleforyou.com/api/mcp \\\n  --header "Authorization: Bearer sfy_…"';

// For clients that only run local commands: mcp-remote bridges stdio to the hosted endpoint.
const MCP_BRIDGE = toJson({
  mcpServers: {
    scheduleforyou: {
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://scheduleforyou.com/api/mcp', '--header', 'Authorization: Bearer sfy_…'],
    },
  },
});

const yes = (v) => (v ? 'Yes' : 'No');
const MEDIA_RULE = { none: 'Optional', image: 'Image required', video: 'Video required', any: 'Image or video required' };

export default function ApiReference({ crumbs }) {
  return (
    <div className={s.shell}>
      <DocsNav />
      <Breadcrumbs items={crumbs} />
      <details className={s.mobileNav} data-docs-nav>
        <summary>Contents</summary>
        <nav aria-label="API reference" className={s.mobileNavBody}>
          <NavList />
        </nav>
      </details>
      <div className={s.layout}>
        <aside className={s.sidebar}>
          <nav aria-label="API reference" className={s.sidebarInner} data-docs-nav data-docs-scroll>
            <NavList />
          </nav>
        </aside>

        <div className={s.content}>
          <header className={s.header}>
            <span className={s.eyebrow}>API reference · v1</span>
            <h1 className={s.h1}>Schedule For You API</h1>
            <p className={s.lead}>Create, schedule and publish posts to ten social platforms from your own code, upload media, and get a signed webhook when each post goes out.</p>
          </header>

          <section id="introduction" className={s.section}>
            <div className={s.cols}>
              <div>
                <h2 className={s.h2}><a href="#introduction" className={s.anchor}>Introduction</a></h2>
                <p className={s.p}>The API is REST over HTTPS. Requests and responses are JSON, and every request is made with an API key that belongs to one workspace. It can do what the dashboard’s composer does: list accounts, create and schedule posts, publish or retry them, upload media, and manage webhooks and RSS feeds.</p>
                <p className={s.p}>The version is part of the path; everything on this page is under <code className={s.ic}>/api/v1</code>.</p>
                <h4 className={s.h4}>Conventions</h4>
                <ul className={s.ul}>
                  <li>IDs are strings with a prefix that says what they are: <code className={s.ic}>acc_</code> accounts, <code className={s.ic}>post_</code> posts, <code className={s.ic}>tgt_</code> targets, <code className={s.ic}>med_</code> media, <code className={s.ic}>whk_</code> webhooks, <code className={s.ic}>feed_</code> feeds.</li>
                  <li>Times in responses are epoch milliseconds (UTC). <code className={s.ic}>scheduled_at</code> also accepts an ISO 8601 string. Webhook payloads use ISO 8601 strings.</li>
                  <li>Send bodies as JSON with <code className={s.ic}>Content-Type: application/json</code>. Unknown fields are ignored.</li>
                  <li>List endpoints are not paginated. They return everything up to the caps in <a href="#limits">Limits</a>; narrow posts down with <code className={s.ic}>status</code>, <code className={s.ic}>from</code> and <code className={s.ic}>to</code>.</li>
                </ul>
              </div>
              <div className={s.sticky}>
                <div className={s.baseUrl}>
                  <span className={s.baseLabel}>Base URL</span>
                  <code>{BASE_URL}</code>
                  <CopyButton text={BASE_URL} />
                </div>
                <Code title="Quick start" lang="bash" code={QUICK_START} />
              </div>
            </div>
          </section>

          <section id="authentication" className={s.section}>
            <div className={s.cols}>
              <div>
                <h2 className={s.h2}><a href="#authentication" className={s.anchor}>Authentication</a></h2>
                <p className={s.p}>Create a key in the dashboard under <strong>Settings → API keys</strong>. The full key starts with <code className={s.ic}>sfy_</code> and is shown once, when you create it; only a hash is stored. Send it on every request in the <code className={s.ic}>Authorization</code> header.</p>
                <p className={s.p}>A key belongs to the workspace it was created in, and every request acts on that workspace’s accounts and posts. Anyone holding the key can post to those accounts, so keep it on your server: the API sends no CORS headers, and a key in browser code is visible to anyone who opens the page. Revoke a key from the same Settings screen.</p>
                <p className={s.p}>A request without a valid key gets a <code className={s.ic}>401</code>.</p>
                <h4 className={s.h4} id="dashboard-only">Dashboard-only actions</h4>
                <p className={s.p}>These routes exist for the dashboard and answer <code className={s.ic}>403</code> to an API key. Connecting a social account also happens in the dashboard, because it goes through each platform’s own sign-in.</p>
                <ul className={s.ul}>
                  {DASHBOARD_ONLY.map((d) => (
                    <li key={d.method + d.path}>
                      {d.what}: <code className={s.ic}>{d.method} /api/v1{d.path}</code>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={s.sticky}>
                <Code title="Authenticated request" lang="bash" code={`curl "${BASE_URL}/accounts" \\\n  -H "Authorization: Bearer sfy_your_key"`} />
                <Code title="Missing or invalid key" status={401} code={toJson({ error: 'Invalid API key' })} />
              </div>
            </div>
          </section>

          <section id="errors" className={s.section}>
            <div className={s.cols}>
              <div>
                <h2 className={s.h2}><a href="#errors" className={s.anchor}>Errors</a></h2>
                <p className={s.p}>Successful requests answer <code className={s.ic}>200</code>, or <code className={s.ic}>201</code> when something was created. Anything else has a JSON body with an <code className={s.ic}>error</code> message written to be shown to a person.</p>
                <p className={s.p}>A <code className={s.ic}>400</code> from a malformed field also has <code className={s.ic}>issues</code>, one entry per problem with the field’s <code className={s.ic}>path</code>. A <code className={s.ic}>422</code> from a platform check also has <code className={s.ic}>errors</code>, one message per rule broken.</p>
              </div>
              <div className={s.sticky}>
                <Code title="Platform check failed" status={422} code={ERROR_EXAMPLE} />
              </div>
            </div>
            <Table head={['Status', 'Meaning', 'When']} rows={ERRORS.map(([c, n, w]) => [<span key="c" className={`${s.status} ${c >= 500 ? s.statusErr : c >= 400 ? s.statusWarn : ''}`}>{c}</span>, n, w])} />
          </section>

          <section id="limits" className={s.section}>
            <h2 className={s.h2}><a href="#limits" className={s.anchor}>Limits</a></h2>
            <p className={s.p}>Caps on what a request or a workspace can hold. Character and media limits for each platform are under <a href="#platforms">Platform rules</a>.</p>
            <Table head={['What', 'Limit']} rows={LIMITS} />
          </section>

          {GROUPS.map((g) => (
            <div key={g.id} className={s.group}>
              <section id={g.id} className={s.groupIntro}>
                <h2 className={s.h2}><a href={`#${g.id}`} className={s.anchor}>{g.title}</a></h2>
                <Prose items={g.intro} />
              </section>
              {g.endpoints.map((e) => (
                <Endpoint key={e.id} e={e} />
              ))}
            </div>
          ))}

          <section id="webhook-events" className={s.section}>
            <div className={s.cols}>
              <div>
                <h2 className={s.h2}><a href="#webhook-events" className={s.anchor}>Webhook events</a></h2>
                <p className={s.p}>When a post finishes publishing, every active webhook that listens to the event gets a <code className={s.ic}>POST</code> with a JSON body. A post whose targets are waiting for a retry has not finished, so the event comes after the last attempt.</p>
                <Table head={['Event', 'Sent when']} rows={WEBHOOK_EVENTS.map(([e, w]) => [`\`${e}\``, w])} />
                <h4 className={s.h4}>Headers</h4>
                <Table head={['Header', 'Value']} rows={WEBHOOK_HEADERS} />
                <h4 className={s.h4}>Delivery</h4>
                <p className={s.p}>Each event is sent once, with a 5-second timeout, and is not retried. Answer with any <code className={s.ic}>2xx</code> status quickly and do slow work afterwards. The result of the last delivery is in <code className={s.ic}>last_status</code>, <code className={s.ic}>last_error</code> and <code className={s.ic}>last_sent_at</code> on the webhook. <a href="#test-a-webhook">Send a test event</a> delivers a <code className={s.ic}>ping</code>.</p>
                <h4 className={s.h4}>Verifying the signature</h4>
                <p className={s.p}>Compute the HMAC-SHA256 of the timestamp, a dot and the raw request body, keyed with the webhook’s secret, and compare it with <code className={s.ic}>v1</code> in constant time. Use the body exactly as received: parsing and re-serialising the JSON changes the bytes. Rejecting timestamps more than a few minutes old stops replayed requests.</p>
              </div>
              <div className={s.sticky}>
                <Code title="post.published payload" code={toJson(WEBHOOK_PAYLOAD)} />
                <Code title="ping payload" code={toJson(PING_PAYLOAD)} />
                <Samples title="Verify a delivery" samples={VERIFY_SAMPLES} />
              </div>
            </div>
          </section>

          <section id="platforms" className={s.section}>
            <h2 className={s.h2}><a href="#platforms" className={s.anchor}>Platform rules</a></h2>
            <p className={s.p}>Use these IDs and limits to check a post before you send it. The API applies the same checks when a post is created, and <a href="#list-platforms">List platforms</a> returns them as data.</p>
            <Table
              className={s.platformTable}
              head={['Platform', 'ID', 'Caption limit', 'Images', 'Video', 'Media']}
              rows={PLATFORM_LIST.map((p) => [
                p.label,
                `\`${p.id}\``,
                p.maxChars.toLocaleString('en-US'),
                String(p.maxImages),
                p.id === 'pinterest' ? 'No' : yes(p.video),
                MEDIA_RULE[p.requiresMedia] + (PLATFORM_NOTES[p.id] ? `. ${PLATFORM_NOTES[p.id]}` : ''),
              ])}
            />
            <p className={s.p}>The caption limit counts the caption sent to that account: its target <code className={s.ic}>caption</code> if it has one, otherwise the post caption. The workspace signature is only added when it fits.</p>

            <h3 id="platform-options" className={s.h3}><a href="#platform-options" className={s.anchor}>Platform options</a></h3>
            <p className={s.p}>Some platforms take extra settings per target, sent as <code className={s.ic}>targets[].options</code>. Other platforms take none.</p>
            <div className={s.cols}>
              <div>
                {Object.entries(PLATFORM_OPTIONS).map(([id, rows]) => (
                  <Params key={id} title={PLATFORM_LIST.find((p) => p.id === id)?.label || id} rows={rows.map(([name, description]) => ({ name, type: 'string', description }))} />
                ))}
              </div>
              <div className={s.sticky}>
                <Code
                  title="Targets with options"
                  code={toJson({
                    caption: 'How we laminate croissant dough\nThree folds, two days, one very cold kitchen.',
                    media: ['med_5e2b0c8f71a49d36'],
                    scheduled_at: '2026-11-04T17:00:00Z',
                    targets: [
                      { account_id: 'acc_4f8a1d2c6e0b9735', options: { title: 'How we laminate croissant dough', privacy: 'unlisted' } },
                      { account_id: 'acc_d6b3e9f04a127c58', options: { privacy: 'PUBLIC_TO_EVERYONE' } },
                    ],
                  })}
                />
              </div>
            </div>
          </section>

          <section id="mcp-server" className={s.section}>
            <div className={s.cols}>
              <div>
                <h2 className={s.h2}><a href="#mcp-server" className={s.anchor}>MCP server</a></h2>
                <p className={s.p}>For assistants and agents that speak the Model Context Protocol, there is a hosted MCP server at <code className={s.ic}>https://scheduleforyou.com/api/mcp</code> (Streamable HTTP). Nothing to install: add the URL to your client and send an API key in the <code className={s.ic}>Authorization</code> header. Every tool calls this API with that key, so it can do exactly what the key can.</p>
                <p className={s.p}>Clients that only run local commands can reach it through <code className={s.ic}>mcp-remote</code>, shown in the second example.</p>
                <h4 className={s.h4}>Tools</h4>
                <ul className={s.ul}>
                  <li><code className={s.ic}>list_accounts</code>: the connected accounts and their IDs.</li>
                  <li><code className={s.ic}>create_post</code>: a caption, account IDs, and a time or <code className={s.ic}>publish_now</code>. It can take public image or video URLs, which it uploads for you, and per-account captions and options.</li>
                  <li><code className={s.ic}>list_posts</code>: recent posts, optionally by status.</li>
                  <li><code className={s.ic}>delete_post</code> and <code className={s.ic}>publish_post</code>.</li>
                </ul>
              </div>
              <div className={s.sticky}>
                <Code title="MCP client config (URL)" code={MCP_CONFIG} />
                <Code title="Claude Code" code={MCP_CLAUDE_CODE} lang="curl" />
                <Code title="Local-command clients" code={MCP_BRIDGE} />
              </div>
            </div>
          </section>

          <div className={s.cta}>
            <TrialCta heading="Start building with the API">
              <p>The API, webhooks and RSS feeds come with both paid plans, Solo and Studio. Start the trial, create a key under Settings → API keys and schedule your first post. For a shorter tour, see the <Link href="/api">API overview</Link>.</p>
            </TrialCta>
          </div>
        </div>
      </div>
    </div>
  );
}
