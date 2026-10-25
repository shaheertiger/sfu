/**
 * The public API reference at /docs, as data. Every endpoint here is checked against
 * app/api/v1/** by tests/api-reference.test.ts: the route file must exist, export the method,
 * and accept API keys. Field names, limits and status codes come from the route handlers and
 * lib/server/*; when those change, change this file with them.
 *
 * Text fields support a little inline markup: `code`, **bold** and [links](/path).
 */

export const BASE_URL = 'https://scheduleforyou.com/api/v1';

/* ---------- example values (epoch milliseconds, like the API returns) ---------- */
const CREATED = Date.UTC(2026, 9, 20, 9, 12, 4);
const UPDATED = Date.UTC(2026, 9, 20, 9, 12, 4);
const WHEN = Date.UTC(2026, 10, 2, 14, 0, 0);
const PUBLISHED = Date.UTC(2026, 10, 2, 14, 0, 9);

const IDS = {
  workspace: 'ws_5b1e9d02c7a64f38',
  post: 'post_3f9c2a71b8d04e65',
  x: 'acc_7d21e0c94b3a6f15',
  linkedin: 'acc_c0a85f3e17d94b26',
  pinterest: 'acc_19e4b7d2a05c3f81',
  media: 'med_a41c7e2093bd5f18',
  webhook: 'whk_e83b1f6a20d94c57',
  feed: 'feed_6c0d4a9b13e2f758',
  key: 'key_2b7f90e1c4a35d68',
};

const target = (id, account_id, extra = {}) => ({
  id,
  account_id,
  caption_override: null,
  options: {},
  status: 'pending',
  external_id: null,
  external_url: null,
  error: null,
  published_at: null,
  stats: {},
  failed_at: null,
  ...extra,
});

const POST = {
  id: IDS.post,
  caption: 'Our autumn menu starts Monday.',
  media: [IDS.media],
  scheduled_at: WHEN,
  status: 'scheduled',
  labels: ['Launch'],
  repeat: 'none',
  evergreen: false,
  approval: null,
  remind: true,
  note: '',
  batch: null,
  created_at: CREATED,
  updated_at: UPDATED,
  signature: true,
  targets: [
    target('tgt_0f6e2d9a4c71b358', IDS.x, { caption_override: 'Autumn menu: Monday.' }),
    target('tgt_8a3c51f07e2d94b6', IDS.linkedin),
  ],
};

const PUBLISHED_POST = {
  ...POST,
  status: 'published',
  updated_at: PUBLISHED,
  targets: [
    target('tgt_0f6e2d9a4c71b358', IDS.x, { caption_override: 'Autumn menu: Monday.', status: 'published', external_id: '1853920716648120321', external_url: 'https://x.com/harborbakery/status/1853920716648120321', published_at: PUBLISHED }),
    target('tgt_8a3c51f07e2d94b6', IDS.linkedin, { status: 'published', external_id: 'urn:li:share:7259012345678901248', external_url: 'https://www.linkedin.com/feed/update/urn:li:share:7259012345678901248', published_at: PUBLISHED }),
  ],
};

const ACCOUNT = {
  id: IDS.x,
  platform: 'x',
  username: 'harborbakery',
  display_name: 'Harbor Bakery',
  avatar_url: 'https://pbs.twimg.com/profile_images/1780000000000000000/a1b2c3d4_normal.jpg',
  status: 'active',
  last_error: null,
  has_refresh: true,
  token_expires_at: null,
  created_at: Date.UTC(2026, 8, 3, 16, 40, 0),
  default_first_comment: null,
  meta: {},
};

const MEDIA = {
  id: IDS.media,
  filename: 'autumn-menu.jpg',
  mime: 'image/jpeg',
  size: 482113,
  folder: 'Product shots',
  created_at: CREATED,
  url: 'https://storage.example.com/sfy-media/ws_5b1e9d02c7a64f38/med_a41c7e2093bd5f18/autumn-menu.jpg?X-Amz-Expires=3600&X-Amz-Signature=…',
  thumb_url: 'https://scheduleforyou.com/_next/image?url=%2Fm%2Fmed_a41c7e2093bd5f18&w=640&q=75',
  poster: false,
  usage: { posts: 2, drafts: 0, last_used_at: 1760000000000, platforms: { instagram: { published: 1, scheduled: 1, last: 1760000000000 }, x: { published: 1, scheduled: 0, last: 1757000000000 } } },
};

const WEBHOOK = {
  id: IDS.webhook,
  url: 'https://example.com/hooks/scheduleforyou',
  format: 'json',
  events: ['post.published', 'post.partial', 'post.failed'],
  active: true,
  secret: 'whsec_3a9f…',
  last_status: 200,
  last_error: null,
  last_sent_at: PUBLISHED,
  created_at: CREATED,
};

const FEED = {
  id: IDS.feed,
  url: 'https://harborbakery.com/blog/rss.xml',
  title: 'Harbor Bakery Journal',
  mode: 'queue',
  template: '{title}\n\n{link}',
  account_ids: [IDS.x, IDS.linkedin],
  active: true,
  last_checked_at: Date.UTC(2026, 9, 20, 9, 15, 0),
  last_error: null,
};

/* ---------- reusable parameter rows ---------- */
const idParam = (what) => ({ name: 'id', type: 'string', required: true, description: `The ${what} ID.` });

const POST_FIELDS = [
  { name: 'caption', type: 'string', description: 'The post text, up to 65,000 characters. Each target is also checked against its platform’s own limit (see [Platforms](#platforms)).' },
  { name: 'account_ids', type: 'string[]', description: 'Shortcut for `targets`: one target per account ID, each using `caption`. Up to 100. Ignored when `targets` is sent.' },
  { name: 'targets', type: 'object[]', description: 'Where to publish, up to 100. Each item has `account_id` (required), an optional `caption` that replaces the post caption for that account (`null` uses the post caption), and optional per-platform `options` (see [Platform options](#platform-options)). Duplicate account IDs are dropped.' },
  { name: 'media', type: 'string[]', description: 'Up to 35 media IDs from [Upload a file](#upload-a-file), in display order.' },
  { name: 'scheduled_at', type: 'string | number | null', description: 'When to publish: an ISO 8601 date (`2026-11-02T14:00:00Z`) or epoch milliseconds. `null` saves a draft.' },
  { name: 'status', type: 'string', description: '`draft` or `scheduled`. Send `draft` to save without a time and to skip platform checks. A post with a `scheduled_at` is scheduled.' },
  { name: 'publish_now', type: 'boolean', description: 'Publish during this request instead of waiting for the scheduler.' },
  { name: 'labels', type: 'string[]', description: 'Up to 50 labels, each up to 40 characters.' },
  { name: 'repeat', type: 'string', description: '`none` (default), `weekly` or `monthly`. After the post publishes, a copy is scheduled for the next occurrence: the same weekday, or the same day of the month (the last day in shorter months), at the same local time in the workspace’s timezone.' },
  { name: 'evergreen', type: 'boolean', description: 'After the post publishes, put a copy back in the next open posting slot.' },
  { name: 'approval', type: 'string | null', description: '`pending`, `approved` or `null`. Posts with `pending` approval are never published until approved.' },
  { name: 'remind', type: 'boolean', description: 'Send the reminder email before this post publishes, when reminders are turned on for the workspace. Defaults to `true`.' },
  { name: 'note', type: 'string', description: 'Internal note, up to 2,000 characters. Never published.' },
  { name: 'batch', type: 'string | null', description: 'A free-form batch name, up to 80 characters, for grouping posts.' },
  { name: 'signature', type: 'boolean', description: 'Set to `false` to leave the workspace signature off this post. Defaults to `true`.' },
  { name: 'force', type: 'boolean', description: 'Save even when a platform check fails. The affected targets will then fail when they publish.' },
];

/* ---------- endpoint groups ---------- */
export const GROUPS = [
  {
    id: 'accounts',
    title: 'Accounts',
    intro: [
      'Accounts are the social profiles connected to the workspace. Connecting an account goes through each platform’s sign-in, so it happens in the dashboard under **Accounts**. The API lists accounts and can disconnect them.',
    ],
    endpoints: [
      {
        id: 'list-accounts',
        method: 'GET',
        path: '/accounts',
        title: 'List accounts',
        description: [
          'Returns every connected account, oldest first, and the number of accounts the workspace’s plan allows. Use the `id` values as `account_ids` or `targets[].account_id` when you create a post.',
          'An account whose `status` is `error` needs to be reconnected in the dashboard; `last_error` says why. For Pinterest accounts, `meta.boards` lists the boards you can use as `board_id`.',
          '`has_refresh` is `true` when the account keeps its sign-in fresh by itself (a refresh token, a self-renewing token, or one that doesn’t expire). `token_expires_at` is only set when it doesn’t: it is when the account will need reconnecting.',
          '`default_first_comment` is posted under every post to the account that has no `first_comment` of its own (see [Update an account](#update-an-account)).',
        ],
        response: { status: 200, body: { accounts: [ACCOUNT, { ...ACCOUNT, id: IDS.pinterest, platform: 'pinterest', username: 'harborbakery', avatar_url: null, meta: { boards: [{ id: '1080863410238761234', name: 'Seasonal bakes' }] } }], limit: 15 } },
      },
      {
        id: 'update-an-account',
        method: 'PATCH',
        path: '/accounts/{id}',
        title: 'Update an account',
        description: [
          'Sets the account’s default first comment: text posted by the account under every post to it that has no `first_comment` of its own, such as a hashtag set or a standing link. Send `null` or an empty string to remove it. A post can skip the default with `first_comment: false` on its target.',
          'Only X, Bluesky, Threads, Instagram, Facebook and LinkedIn accounts can post comments. The limit is the platform’s comment limit (X 280, Bluesky 300, Threads 500, LinkedIn 1,250, Instagram 2,200, Facebook 8,000 characters).',
        ],
        params: { path: [idParam('account')], body: [{ name: 'default_first_comment', type: 'string | null', required: true, description: 'The comment, or `null` to remove it.' }] },
        example: { body: { default_first_comment: '#harborbakery #sourdough #bristolfood' } },
        response: { status: 200, body: { account: { ...ACCOUNT, default_first_comment: '#harborbakery #sourdough #bristolfood' } } },
        errors: [
          [404, 'No account with that ID in this workspace.'],
          [422, 'The platform cannot post comments, or the text is over its comment limit.'],
        ],
      },
      {
        id: 'disconnect-an-account',
        method: 'DELETE',
        path: '/accounts/{id}',
        title: 'Disconnect an account',
        description: [
          'Removes the account from the workspace. Posts already published on the platform stay there. Targets on unpublished posts that pointed at this account are removed; a post left with no targets goes back to `draft`.',
        ],
        params: { path: [idParam('account')] },
        response: { status: 200, body: { ok: true } },
        errors: [[404, 'No account with that ID in this workspace.']],
      },
    ],
  },
  {
    id: 'posts',
    title: 'Posts',
    intro: [
      'A post is one caption and set of media sent to one or more accounts. Each account it goes to is a **target** with its own status, so a post can publish on LinkedIn and fail on X.',
      'Post `status` is one of `draft`, `scheduled`, `publishing`, `published`, `partial` (some targets published, at least one failed) or `failed`. Target `status` is `pending`, `publishing`, `published` or `failed`. A target is tried up to three times: after a temporary error it is retried a couple of minutes later, and an error that retrying cannot fix (such as a missing video) fails it straight away. While a platform is still processing a video the target simply waits and is checked again, without using up a try. If the platform never answered after the post was sent, the target fails instead of being sent again, so nothing is posted twice: check the account, then retry it.',
    ],
    endpoints: [
      {
        id: 'list-posts',
        method: 'GET',
        path: '/posts',
        title: 'List posts',
        description: [
          'Returns posts with their targets, newest first by scheduled time (or creation time for posts without one).',
        ],
        params: {
          query: [
            { name: 'status', type: 'string', description: 'Only posts with this status: `draft`, `scheduled`, `publishing`, `published`, `partial` or `failed`.' },
            { name: 'from', type: 'string | number', description: 'Only posts scheduled (or created) at or after this time: an ISO 8601 date or epoch milliseconds.' },
            { name: 'to', type: 'string | number', description: 'Only posts scheduled (or created) at or before this time: an ISO 8601 date or epoch milliseconds.' },
            { name: 'limit', type: 'number', description: 'Maximum number of posts. Defaults to 500, at most 2,000.' },
          ],
        },
        example: { query: { status: 'scheduled', limit: 50 } },
        response: { status: 200, body: { posts: [POST] } },
      },
      {
        id: 'create-a-post',
        method: 'POST',
        path: '/posts',
        title: 'Create a post',
        description: [
          'Creates a draft, a scheduled post, or a post that publishes straight away with `publish_now`.',
          'Unless you send `status: "draft"`, every target is checked against its platform’s rules first: caption length, whether the platform needs an image or a video, Instagram’s JPEG-only images, and Facebook’s video-or-images rule. If anything fails, nothing is saved and you get a `422` with an `errors` list. Send `force: true` to save anyway.',
          'With `publish_now`, the request waits while the post publishes, which can take a while for video. The response shows each target’s result. The plan is checked first, so nothing is saved if the workspace can’t publish.',
          'To schedule, send `scheduled_at`. `status: "scheduled"` without a time is refused rather than saved as a draft, and so is a `scheduled_at` more than 5 minutes in the past (use `publish_now` instead).',
        ],
        params: { body: POST_FIELDS },
        example: {
          body: {
            caption: 'Our autumn menu starts Monday.',
            targets: [
              { account_id: IDS.x, caption: 'Autumn menu: Monday.' },
              { account_id: IDS.linkedin },
            ],
            media: [IDS.media],
            scheduled_at: '2026-11-02T14:00:00Z',
            labels: ['Launch'],
          },
        },
        response: { status: 201, body: { post: POST } },
        errors: [
          [400, 'The body is not valid JSON or a field has the wrong type. `issues` lists each problem.'],
          [402, 'With `publish_now`: the workspace has no active plan or trial. Nothing is saved.'],
          [409, 'With `publish_now`: the post has `approval: "pending"`. Approve it first, or leave out `publish_now`.'],
          [422, 'A platform check failed, a media file hasn’t been confirmed as uploaded, `status: "scheduled"` came without `scheduled_at`, or `scheduled_at` is more than 5 minutes in the past. `errors` lists each platform problem, for example `X / Twitter (@harborbakery): 312/280 characters`.'],
        ],
      },
      {
        id: 'retrieve-a-post',
        method: 'GET',
        path: '/posts/{id}',
        title: 'Retrieve a post',
        description: ['Returns one post with its targets. Published targets include `external_url`, the link to the post on the platform.'],
        params: { path: [idParam('post')] },
        response: { status: 200, body: { post: PUBLISHED_POST } },
        errors: [[404, 'No post with that ID in this workspace.']],
      },
      {
        id: 'update-a-post',
        method: 'PATCH',
        path: '/posts/{id}',
        title: 'Update a post',
        description: [
          'Takes the same fields as [Create a post](#create-a-post). Fields you leave out keep their values.',
          'Sending `targets` or `account_ids` replaces the post’s targets; targets that already published are kept as they are. Platform checks run when you send targets and the post is not a draft.',
          'Updating a `failed` post puts it back in the queue with fresh attempts for its failed targets; send a new `scheduled_at` to choose when it goes out. A post that was already due keeps its time; otherwise a new `scheduled_at` more than 5 minutes in the past is refused.',
        ],
        params: { path: [idParam('post')], body: POST_FIELDS.filter((f) => f.name !== 'publish_now') },
        example: { body: { caption: 'Our autumn menu starts Tuesday.', scheduled_at: '2026-11-03T14:00:00Z' } },
        response: { status: 200, body: { post: { ...POST, caption: 'Our autumn menu starts Tuesday.', scheduled_at: WHEN + 86400000 } } },
        errors: [
          [400, 'A field has the wrong type.'],
          [404, 'No post with that ID in this workspace.'],
          [409, 'The post is publishing right now, or it is published and the update would reschedule it.'],
          [422, 'A platform check failed (`errors` lists each one), or the new `scheduled_at` is more than 5 minutes in the past.'],
        ],
      },
      {
        id: 'delete-a-post',
        method: 'DELETE',
        path: '/posts/{id}',
        title: 'Delete a post',
        description: ['Deletes the post from Schedule For You. Anything already published stays on the platforms.'],
        params: { path: [idParam('post')] },
        response: { status: 200, body: { ok: true } },
        errors: [[404, 'No post with that ID in this workspace.']],
      },
      {
        id: 'publish-a-post',
        method: 'POST',
        path: '/posts/{id}/publish',
        title: 'Publish a post now',
        description: [
          'Publishes a draft or scheduled post right away, or retries the targets of a `failed` or `partial` post. Targets that already published are skipped; failed targets get a fresh set of attempts.',
          'The request waits while the post publishes. `status` in the response is the post’s status afterwards: `published`, `partial`, `failed`, or `scheduled` when a target hit a temporary error, is still being processed by the platform, or didn’t fit in this request’s time; the scheduler picks it up within a couple of minutes. `publishing` means another run already had the post.',
        ],
        params: { path: [idParam('post')] },
        response: { status: 200, body: { status: 'published', post: PUBLISHED_POST } },
        errors: [
          [402, 'The workspace has no active plan or trial.'],
          [404, 'No post with that ID in this workspace.'],
          [409, 'The post is waiting for approval, already published, or publishing right now.'],
          [422, 'The post has no targets.'],
        ],
      },
      {
        id: 'create-a-preview-link',
        method: 'POST',
        path: '/posts/{id}/share',
        title: 'Create a preview link',
        description: [
          'Returns a link anyone can open, without an account, to see the post, comment on it, approve it or ask for changes. Approving sets the post’s `approval` to `approved`; asking for changes sets it to `pending`.',
          'Links last 30 days. Calling this again returns the same link while it has more than 7 days left.',
        ],
        params: { path: [idParam('post')] },
        response: { status: 200, body: { url: 'https://scheduleforyou.com/p/Xq3vK8mN2pR5tW9yB4cFh7Lz', token: 'Xq3vK8mN2pR5tW9yB4cFh7Lz', expires_at: Date.UTC(2026, 10, 19, 9, 30, 0) } },
        errors: [[404, 'No post with that ID in this workspace.']],
      },
      {
        id: 'list-post-comments',
        method: 'GET',
        path: '/posts/{id}/comments',
        title: 'List preview comments',
        description: [
          'Returns the comments, approvals and change requests left on the post’s preview link, oldest first. `kind` is `comment`, `approved` or `changes`.',
        ],
        params: { path: [idParam('post')] },
        response: {
          status: 200,
          body: {
            comments: [
              { id: 'cmt_4e1a9c07b25d83f6', author: 'Dana (client)', body: 'Can we say “from Monday”?', kind: 'changes', source: 'client', created_at: Date.UTC(2026, 9, 21, 15, 2, 0) },
              { id: 'cmt_b7d30f9e612a4c85', author: 'Dana (client)', body: 'Approved', kind: 'approved', source: 'client', created_at: Date.UTC(2026, 9, 21, 16, 45, 0) },
            ],
          },
        },
        errors: [[404, 'No post with that ID in this workspace.']],
      },
    ],
  },
  {
    id: 'media',
    title: 'Media',
    intro: [
      'Files go straight from your code to storage, so uploads of any size never pass through the API. Uploading takes three requests:',
      {
        list: [
          '[Upload a file](#upload-a-file) with its name, type and size. You get a media `id` and an `upload_url`.',
          '`PUT` the file’s bytes to `upload_url` with the `Content-Type` header from the response. The URL works for 15 minutes and expects exactly `size` bytes.',
          '[Confirm the upload](#update-a-file) with `{"uploaded": true}`. The file is then listed and can be attached to posts by its `id`.',
        ],
      },
      {
        title: 'Step 2: send the file',
        lang: 'bash',
        code: `curl -X PUT "$UPLOAD_URL" \\\n  -H "Content-Type: image/jpeg" \\\n  --data-binary @autumn-menu.jpg`,
      },
      'Accepted types: JPG, PNG and WebP images up to 20 MB, GIF up to 15 MB, and MP4, MOV or WebM video up to 1 GB.',
    ],
    endpoints: [
      {
        id: 'upload-a-file',
        method: 'POST',
        path: '/media',
        title: 'Upload a file',
        description: ['Registers a file and returns a presigned `upload_url` to send it to. The file is not listed or usable until you confirm the upload.'],
        params: {
          body: [
            { name: 'filename', type: 'string', required: true, description: 'The file name, up to 200 characters.' },
            { name: 'mime', type: 'string', required: true, description: '`image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `video/quicktime` or `video/webm`.' },
            { name: 'size', type: 'integer', required: true, description: 'The file size in bytes.' },
            { name: 'folder', type: 'string | null', description: 'A media library folder, up to 80 characters.' },
            { name: 'poster_size', type: 'integer', description: 'Videos only: the byte size of a JPEG still (up to 2 MB) to show as the video’s thumbnail. The response then also has a `poster_upload_url` to `PUT` it to with `Content-Type: image/jpeg`; confirm with `poster: true`.' },
          ],
        },
        example: { body: { filename: 'autumn-menu.jpg', mime: 'image/jpeg', size: 482113 } },
        response: {
          status: 201,
          body: {
            id: IDS.media,
            upload_url: 'https://storage.example.com/sfy-media/ws_5b1e9d02c7a64f38/med_a41c7e2093bd5f18/autumn-menu.jpg?X-Amz-Expires=900&X-Amz-Signature=…',
            headers: { 'content-type': 'image/jpeg' },
          },
        },
        errors: [
          [413, 'The file is larger than its type allows.'],
          [415, 'The file type is not supported.'],
        ],
      },
      {
        id: 'update-a-file',
        method: 'PATCH',
        path: '/media/{id}',
        title: 'Confirm or move a file',
        description: [
          'Send `uploaded: true` after the `PUT` to confirm the upload; the stored size is read back from storage. Send `folder` to move the file to another library folder, or `null` to take it out of one.',
        ],
        params: {
          path: [idParam('media')],
          body: [
            { name: 'uploaded', type: 'true', description: 'Confirms the file is in storage.' },
            { name: 'folder', type: 'string | null', description: 'The folder name, up to 80 characters, or `null`.' },
            { name: 'poster_size', type: 'integer', description: 'Videos only: asks for a `poster_upload_url` for a JPEG still of this size (up to 2 MB).' },
            { name: 'poster', type: 'true', description: 'Confirms the poster still is in storage. The video then gets a `thumb_url`.' },
          ],
        },
        example: { body: { uploaded: true } },
        response: { status: 200, body: { media: MEDIA } },
        errors: [
          [404, 'No file with that ID in this workspace.'],
          [409, 'The file is not in storage yet. Upload it again.'],
        ],
      },
      {
        id: 'list-media',
        method: 'GET',
        path: '/media',
        title: 'List media',
        description: [
          'Returns uploaded files, newest first, up to 500. A `url` can be a signed link that expires after an hour, so fetch the list again rather than storing it.',
          '`thumb_url` is a small cached version for previews: images always have one, videos once they have a poster still (`poster`), GIFs never.',
          '`usage` says where each file has been: `posts` and `drafts` that include it, `last_used_at` (when it last published, or null), and per platform how many times it `published`, how many posts are still `scheduled`, and the `last` time it went out there. A platform the file was never published to is simply absent, so a script can pick files that are fresh for it.',
        ],
        response: { status: 200, body: { media: [MEDIA] } },
      },
      {
        id: 'delete-a-file',
        method: 'DELETE',
        path: '/media/{id}',
        title: 'Delete a file',
        description: ['Deletes the file from storage and the media library.'],
        params: { path: [idParam('media')] },
        response: { status: 200, body: { ok: true } },
        errors: [[404, 'No file with that ID in this workspace.']],
      },
    ],
  },
  {
    id: 'webhook-endpoints',
    title: 'Webhooks',
    intro: [
      'Register a URL and Schedule For You sends it a signed `POST` when a post finishes publishing. See [Webhook events](#webhook-events) for the payload and how to check the signature. A workspace can have up to 10 webhooks.',
    ],
    endpoints: [
      {
        id: 'list-webhooks',
        method: 'GET',
        path: '/webhooks',
        title: 'List webhooks',
        description: ['Returns the workspace’s webhooks with the result of their last delivery. Secrets are shortened; the full secret is only returned when a webhook is created.'],
        response: { status: 200, body: { webhooks: [WEBHOOK] } },
      },
      {
        id: 'create-a-webhook',
        method: 'POST',
        path: '/webhooks',
        title: 'Create a webhook',
        description: ['Adds a webhook. The response contains the full signing `secret` this one time, so store it now.'],
        params: {
          body: [
            { name: 'url', type: 'string', required: true, description: 'A public `https://` URL, up to 2,000 characters. Private and local addresses are refused.' },
            { name: 'events', type: 'string[]', description: 'Any of `post.published`, `post.partial` and `post.failed`. Defaults to all three.' },
            { name: 'format', type: 'string', description: '`json` (default): the signed JSON described under [Webhook events](#webhook-events). `slack` or `discord`: a readable message in the shape their incoming webhooks take (`{ "text": … }` / `{ "content": … }`), so a Slack or Discord webhook URL works as the endpoint.' },
          ],
        },
        example: { body: { url: 'https://example.com/hooks/scheduleforyou', events: ['post.published', 'post.failed'] } },
        response: { status: 201, body: { webhook: { ...WEBHOOK, events: ['post.published', 'post.failed'], secret: 'whsec_3a9f0c27d1e84b6a5f2c9d0e7b13a48c6f5e2d1a9b0c7e34', last_status: null, last_sent_at: null } } },
        errors: [[400, 'The URL is not a public https URL, or the workspace already has 10 webhooks.']],
      },
      {
        id: 'update-a-webhook',
        method: 'PATCH',
        path: '/webhooks/{id}',
        title: 'Update a webhook',
        description: ['Pauses or resumes a webhook, or changes the events it receives. The URL cannot be changed; create a new webhook instead.'],
        params: {
          path: [idParam('webhook')],
          body: [
            { name: 'active', type: 'boolean', description: '`false` stops deliveries until you set it back to `true`.' },
            { name: 'events', type: 'string[]', description: 'At least one of `post.published`, `post.partial` and `post.failed`.' },
            { name: 'format', type: 'string', description: '`json`, `slack` or `discord`.' },
          ],
        },
        example: { body: { active: false } },
        response: { status: 200, body: { webhook: { ...WEBHOOK, active: false } } },
        errors: [[404, 'No webhook with that ID in this workspace.']],
      },
      {
        id: 'delete-a-webhook',
        method: 'DELETE',
        path: '/webhooks/{id}',
        title: 'Delete a webhook',
        description: ['Deletes the webhook.'],
        params: { path: [idParam('webhook')] },
        response: { status: 200, body: { ok: true } },
        errors: [[404, 'No webhook with that ID in this workspace.']],
      },
      {
        id: 'test-a-webhook',
        method: 'POST',
        path: '/webhooks/{id}/test',
        title: 'Send a test event',
        description: ['Sends a `ping` event to the webhook right away and returns what your endpoint answered: its HTTP `status`, and an `error` when the delivery failed or the status was not 2xx.'],
        params: { path: [idParam('webhook')] },
        response: { status: 200, body: { status: 200, error: null } },
        errors: [[404, 'No webhook with that ID in this workspace.']],
      },
    ],
  },
  {
    id: 'feeds',
    title: 'RSS feeds',
    intro: [
      'An RSS or Atom feed turns each new item into a post for the feed’s accounts. Feeds are checked every 15 minutes, and up to five new items are picked up per check. Items already in the feed when you add it are never posted. A workspace can have up to 20 feeds.',
      'Posts from a feed get the label `RSS`. In `draft` mode they wait in drafts for review; in `queue` mode they are scheduled into the next open posting slot (if the feed has no accounts, they are saved as drafts).',
    ],
    endpoints: [
      {
        id: 'list-feeds',
        method: 'GET',
        path: '/feeds',
        title: 'List feeds',
        description: ['Returns the workspace’s feeds with the time and result of their last check.'],
        response: { status: 200, body: { feeds: [FEED] } },
      },
      {
        id: 'create-a-feed',
        method: 'POST',
        path: '/feeds',
        title: 'Add a feed',
        description: ['Adds a feed and reads it once right away, so a wrong URL fails here rather than later. That first read only records the items already in the feed.'],
        params: {
          body: [
            { name: 'url', type: 'string', required: true, description: 'The feed URL, up to 2,000 characters.' },
            { name: 'mode', type: 'string', description: '`draft` (default) or `queue`.' },
            { name: 'template', type: 'string', description: 'The caption for each item, up to 2,000 characters. Placeholders: `{title}`, `{link}` and `{description}` (HTML removed, cut to 280 characters). Defaults to `{title}` and `{link}` on separate paragraphs.' },
            { name: 'account_ids', type: 'string[]', description: 'Accounts to post to, up to 100. IDs that are not in the workspace are dropped.' },
          ],
        },
        example: { body: { url: 'https://harborbakery.com/blog/rss.xml', mode: 'queue', account_ids: [IDS.x, IDS.linkedin] } },
        response: { status: 201, body: { feed: FEED } },
        errors: [[400, 'The URL could not be read as an RSS or Atom feed, or the workspace already has 20 feeds.']],
      },
      {
        id: 'update-a-feed',
        method: 'PATCH',
        path: '/feeds/{id}',
        title: 'Update a feed',
        description: ['Changes any of the feed’s settings. Fields you leave out keep their values.'],
        params: {
          path: [idParam('feed')],
          body: [
            { name: 'active', type: 'boolean', description: '`false` pauses the feed.' },
            { name: 'mode', type: 'string', description: '`draft` or `queue`.' },
            { name: 'template', type: 'string', description: 'The caption template, 1 to 2,000 characters.' },
            { name: 'account_ids', type: 'string[]', description: 'Replaces the feed’s accounts. Up to 100.' },
          ],
        },
        example: { body: { mode: 'draft' } },
        response: { status: 200, body: { feed: { ...FEED, mode: 'draft' } } },
        errors: [[404, 'No feed with that ID in this workspace.']],
      },
      {
        id: 'delete-a-feed',
        method: 'DELETE',
        path: '/feeds/{id}',
        title: 'Delete a feed',
        description: ['Deletes the feed. Posts it already created are kept.'],
        params: { path: [idParam('feed')] },
        response: { status: 200, body: { ok: true } },
        errors: [[404, 'No feed with that ID in this workspace.']],
      },
      {
        id: 'check-a-feed',
        method: 'POST',
        path: '/feeds/{id}/check',
        title: 'Check a feed now',
        description: ['Reads the feed now instead of waiting for the next check, and returns how many posts it `created`. If the feed could not be read, `feed.last_error` says why.'],
        params: { path: [idParam('feed')] },
        response: { status: 200, body: { created: 1, feed: FEED } },
        errors: [[404, 'No feed with that ID in this workspace.']],
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace',
    intro: ['Settings and read-only views of the workspace the API key belongs to.'],
    endpoints: [
      {
        id: 'set-the-signature',
        method: 'PUT',
        path: '/signature',
        title: 'Set the signature',
        description: [
          'Sets text that is added to the end of every post, on its own paragraph, when it publishes. It is skipped for a post that already contains it, for a post that would go over its platform’s character limit, and for posts created with `signature: false`. An empty string turns the signature off.',
        ],
        params: { body: [{ name: 'signature', type: 'string', required: true, description: 'Up to 500 characters. Leading and trailing spaces are removed.' }] },
        example: { body: { signature: 'Harbor Bakery · 12 Quay Street' } },
        response: { status: 200, body: { signature: 'Harbor Bakery · 12 Quay Street' } },
      },
      {
        id: 'get-the-calendar-link',
        method: 'GET',
        path: '/calendar-link',
        title: 'Shared calendar link',
        description: [
          'The shared calendar is a read-only page of the workspace’s upcoming and recent posts (next 90 days, last 14) for clients and teammates, plus an iCal feed (`ics_url`) that Google Calendar, Apple Calendar and Outlook can subscribe to. Anyone with the link can see it; there is no sign-in.',
        ],
        response: { status: 200, body: { enabled: true, url: 'https://scheduleforyou.com/c/Qm3xT9vLp2aZ8rKd1sWn4yHc7bFe', ics_url: 'https://scheduleforyou.com/c/Qm3xT9vLp2aZ8rKd1sWn4yHc7bFe/feed.ics' } },
      },
      {
        id: 'create-the-calendar-link',
        method: 'POST',
        path: '/calendar-link',
        title: 'Create or rotate the calendar link',
        description: ['Turns the shared calendar on, keeping the current link. With `rotate: true` a new link replaces it and every copy of the old one stops working.'],
        params: { body: [{ name: 'rotate', type: 'boolean', description: 'Replace the current link with a new one.' }] },
        example: { body: { rotate: false } },
        response: { status: 200, body: { enabled: true, url: 'https://scheduleforyou.com/c/Qm3xT9vLp2aZ8rKd1sWn4yHc7bFe', ics_url: 'https://scheduleforyou.com/c/Qm3xT9vLp2aZ8rKd1sWn4yHc7bFe/feed.ics' } },
      },
      {
        id: 'delete-the-calendar-link',
        method: 'DELETE',
        path: '/calendar-link',
        title: 'Turn the calendar link off',
        description: ['Turns the shared calendar off. The page and the feed answer 404 from then on.'],
        response: { status: 200, body: { enabled: false, url: null, ics_url: null } },
      },
      {
        id: 'automations-overview',
        method: 'GET',
        path: '/automations',
        title: 'Get automations',
        description: [
          'Returns the signature, webhooks, feeds and a short list of accounts in one request. With an API key, `workspace.role` is `api`.',
          '`track_links` says whether link click tracking is on for the workspace (turned on in the dashboard under Automations → Link clicks). When it is, links in captions and first comments are swapped for short links on the app’s domain as the post publishes, and every click is counted: `link_clicks` and `tracked_links` are the workspace totals, and each published target carries its own count in `stats.clicks`. With `utm_tags` on, the destination gets `utm_source` (the platform), `utm_medium=social` and `utm_campaign` (the post’s first label) before it is shortened.',
          '`calendar` is the shared calendar link (see [Shared calendar link](#get-the-calendar-link)).',
          '`referral` is the workspace’s referral link and its results: `signups` workspaces were created through it, `rewarded` of them have paid, and each one credited `credit_cents` (a month of the workspace’s plan) to the owner’s bill. `share` carries the share-to-queue bookmarklet; opening `<app_url>?share=1&text=…&url=…` prefills the composer.',
        ],
        response: {
          status: 200,
          body: {
            workspace: { id: IDS.workspace, name: 'Harbor Bakery', role: 'api' },
            signature: 'Harbor Bakery · 12 Quay Street',
            track_links: true,
            utm_tags: true,
            link_clicks: 128,
            tracked_links: 9,
            calendar: { enabled: true, url: 'https://scheduleforyou.com/c/Qm3xT9vLp2aZ8rKd1sWn4yHc7bFe', ics_url: 'https://scheduleforyou.com/c/Qm3xT9vLp2aZ8rKd1sWn4yHc7bFe/feed.ics' },
            webhooks: [WEBHOOK],
            feeds: [FEED],
            accounts: [{ id: IDS.x, platform: 'x', username: 'harborbakery', display_name: 'Harbor Bakery' }],
            referral: { code: 'k7mvq2xd', url: 'https://scheduleforyou.com/r/k7mvq2xd', signups: 3, rewarded: 1, credit_cents: 1900, trial_days: 14, share_text: 'I schedule my posts … This link gets you a 14-day free trial: https://scheduleforyou.com/r/k7mvq2xd' },
            share: { bookmarklet: 'javascript:void(open("https://scheduleforyou.com/app?share=1"+…))', app_url: 'https://scheduleforyou.com/app' },
          },
        },
      },
      {
        id: 'list-team',
        method: 'GET',
        path: '/team',
        title: 'List team members',
        description: ['Returns the workspace’s members, invitations that have not been accepted yet, and the workspace plan. Inviting people is done from the dashboard.'],
        response: {
          status: 200,
          body: {
            members: [{ id: '0b7e4c1a-5d2f-4e9b-8a63-1c9d2e7f4a50', email: 'owner@harborbakery.com', name: 'Sam Rivera', role: 'owner' }],
            invites: [{ id: 'inv_93a1d7f0c2b84e65', email: 'dana@harborbakery.com', role: 'editor', created_at: CREATED }],
            plan: 'studio',
          },
        },
      },
      {
        id: 'list-api-keys',
        method: 'GET',
        path: '/keys',
        title: 'List API keys',
        description: ['Returns the workspace’s API keys with when each was last used. Only the first eight characters of a key (`prefix`) are stored in readable form. Creating and revoking keys is done from the dashboard.'],
        response: { status: 200, body: { keys: [{ id: IDS.key, name: 'CMS', prefix: 'sfy_Qm7x', created_at: Date.UTC(2026, 8, 3, 16, 52, 0), last_used_at: Date.UTC(2026, 9, 20, 9, 12, 4) }] } },
      },
    ],
  },
  {
    id: 'platform-endpoints',
    title: 'Platforms',
    intro: ['What each platform accepts. The same rules are applied when a post is created.'],
    endpoints: [
      {
        id: 'list-platforms',
        method: 'GET',
        path: '/platforms',
        title: 'List platforms',
        description: [
          'Returns every platform with its caption limit (`maxChars`), image limit (`maxImages`), whether it takes video, and which media it requires (`requiresMedia`: `none`, `image`, `video` or `any`). `fields` lists the per-target options the platform takes, and `configured` is `false` for platforms that cannot be connected yet.',
        ],
        response: {
          status: 200,
          body: {
            platforms: [
              { id: 'x', label: 'X / Twitter', color: '#000000', authMode: 'oauth', maxChars: 280, maxImages: 4, video: true, requiresMedia: 'none', configured: true },
              { id: 'youtube', label: 'YouTube', color: '#ff0000', authMode: 'oauth', maxChars: 5000, maxImages: 0, video: true, requiresMedia: 'video', fields: [{ key: 'title', label: 'Title', type: 'text', required: true }, { key: 'privacy', label: 'Privacy', type: 'select', options: ['public', 'unlisted', 'private'] }], configured: true },
            ],
          },
        },
      },
    ],
  },
];

/** Every documented endpoint, flat. */
export const ENDPOINTS = GROUPS.flatMap((g) => g.endpoints.map((e) => ({ ...e, group: g.id })));

/** Routes that exist but refuse API keys (403 “This action is only available from the dashboard”). */
export const DASHBOARD_ONLY = [
  { method: 'POST', path: '/keys', what: 'Create an API key' },
  { method: 'DELETE', path: '/keys/{id}', what: 'Revoke an API key' },
  { method: 'POST', path: '/team', what: 'Invite a team member' },
  { method: 'DELETE', path: '/team/invites/{id}', what: 'Revoke an invitation that hasn’t been accepted' },
];

/* ---------- prose sections ---------- */
export const ERRORS = [
  [400, 'Bad request', 'The body is not a JSON object, a field is missing or has the wrong type, or a value is not allowed.'],
  [401, 'Unauthorized', 'The `Authorization` header is missing or the API key is not valid.'],
  [402, 'Payment required', 'Publishing needs an active plan or trial on the workspace.'],
  [403, 'Forbidden', 'The action is only available from the dashboard.'],
  [404, 'Not found', 'Nothing with that ID in the key’s workspace.'],
  [409, 'Conflict', 'The resource is in a state that does not allow this, such as a post that is publishing right now.'],
  [413, 'Payload too large', 'A media file is over the size limit for its type.'],
  [415, 'Unsupported media type', 'A media file type is not accepted.'],
  [422, 'Unprocessable', 'A post breaks a platform rule (`errors` lists each one) or is scheduled in the past.'],
  [500, 'Server error', 'Something failed on our side. The message never includes internal details; try again.'],
  [504, 'Timeout', 'An outside service took too long. Try again.'],
];

export const LIMITS = [
  ['Posts per list request', '500 by default, up to 2,000 with `limit`'],
  ['Targets per post', '100'],
  ['Media files per post', '35'],
  ['Media files per list request', '500, newest first'],
  ['Webhooks per workspace', '10'],
  ['RSS feeds per workspace', '20'],
];

export const WEBHOOK_EVENTS = [
  ['post.published', 'Every target of the post published.'],
  ['post.partial', 'Some targets published and at least one failed for good.'],
  ['post.failed', 'No target published.'],
];

export const WEBHOOK_HEADERS = [
  ['Content-Type', '`application/json`'],
  ['User-Agent', '`ScheduleForYou-Webhooks/1`'],
  ['X-SFY-Event', 'The event name, or `ping` for a test delivery.'],
  ['X-SFY-Signature', '`t=<unix seconds>,v1=<signature>`, where the signature is the hex HMAC-SHA256 of `<t>.<raw body>` keyed with the webhook secret.'],
];

export const WEBHOOK_PAYLOAD = {
  event: 'post.published',
  workspace_id: IDS.workspace,
  sent_at: '2026-11-02T14:00:10.112Z',
  data: {
    post: { id: IDS.post, caption: 'Our autumn menu starts Monday.', scheduled_at: '2026-11-02T14:00:00.000Z', status: 'published', labels: ['Launch'], created_at: '2026-10-20T09:12:04.000Z' },
    targets: [
      { platform: 'x', username: 'harborbakery', status: 'published', url: 'https://x.com/harborbakery/status/1853920716648120321', error: null, published_at: '2026-11-02T14:00:09.000Z' },
      { platform: 'linkedin', username: 'Sam Rivera', status: 'published', url: 'https://www.linkedin.com/feed/update/urn:li:share:7259012345678901248', error: null, published_at: '2026-11-02T14:00:09.000Z' },
    ],
  },
};

export const PING_PAYLOAD = { event: 'ping', workspace_id: IDS.workspace, sent_at: '2026-10-20T09:20:00.000Z', data: { message: 'Test delivery from Schedule For You' } };

export const VERIFY_SAMPLES = [
  {
    label: 'Node.js',
    lang: 'javascript',
    code: `import crypto from 'node:crypto';

// rawBody: the request body exactly as received (a string), before JSON parsing.
export function verifySignature(rawBody, header, secret, toleranceSeconds = 300) {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', secret).update(\`\${t}.\${rawBody}\`).digest('hex');
  const given = Buffer.from(parts.v1 || '', 'hex');
  const wanted = Buffer.from(expected, 'hex');
  return given.length === wanted.length && crypto.timingSafeEqual(given, wanted);
}

// Express: app.post('/hooks/scheduleforyou', express.text({ type: 'application/json' }), (req, res) => {
//   if (!verifySignature(req.body, req.get('x-sfy-signature'), process.env.SFY_WEBHOOK_SECRET)) return res.sendStatus(400);
//   const event = JSON.parse(req.body);
//   res.sendStatus(200);
// });`,
  },
  {
    label: 'Python',
    lang: 'python',
    code: `import hashlib
import hmac
import time


def verify_signature(raw_body: bytes, header: str, secret: str, tolerance: int = 300) -> bool:
    parts = dict(p.split("=", 1) for p in header.split(","))
    t = int(parts.get("t", "0"))
    if not t or abs(time.time() - t) > tolerance:
        return False
    signed = f"{t}.".encode() + raw_body
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, parts.get("v1", ""))`,
  },
];

/**
 * What each platform does with `targets[].options`, from lib/server/adapters. Keys match the
 * `fields` in lib/server/platforms.ts (checked by the test).
 */
const FIRST_COMMENT_DOC = ['first_comment', 'Text posted as a comment on the post right after it goes live: hashtags, a link, a call to action. Posted by the same account. If the comment fails the post stays published and `error` on the target says why.'];

export const PLATFORM_OPTIONS = {
  x: [FIRST_COMMENT_DOC],
  bluesky: [FIRST_COMMENT_DOC],
  threads: [FIRST_COMMENT_DOC],
  instagram: [FIRST_COMMENT_DOC],
  facebook: [FIRST_COMMENT_DOC],
  linkedin: [FIRST_COMMENT_DOC],
  tiktok: [
    ['privacy', '`PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS` or `SELF_ONLY`. Defaults to `SELF_ONLY`.'],
  ],
  youtube: [
    ['title', 'The video title. Without it, the first line of the caption is the title and the rest is the description.'],
    ['privacy', '`public`, `unlisted` or `private`. Defaults to `public`.'],
  ],
  pinterest: [
    ['board_id', 'The board to pin to, from `meta.boards` in [List accounts](#list-accounts). Defaults to the account’s first board.'],
    ['title', 'The pin title. Defaults to the first line of the caption.'],
    ['link', 'Where the pin links to.'],
  ],
  google_business: [
    ['cta_url', 'Adds a “Learn more” button that opens this URL.'],
  ],
};

const THREAD_NOTE = 'A caption with a line holding only `---` is published as a thread: each part becomes a post replying to the one before, media goes on the first post, and each part must fit the character limit. Up to 25 parts.';

export const PLATFORM_NOTES = {
  x: THREAD_NOTE,
  bluesky: THREAD_NOTE,
  threads: THREAD_NOTE,
  tiktok: 'With a video, the video is posted; otherwise the images become a photo post.',
  pinterest: 'One image per pin.',
  google_business: 'The first image is attached.',
};

/* ---------- code samples ---------- */
const exampleUrl = (e) => {
  const path = e.path.replace('{id}', e.example?.id || exampleIdFor(e));
  const q = e.example?.query ? '?' + new URLSearchParams(Object.entries(e.example.query).map(([k, v]) => [k, String(v)])).toString() : '';
  return `${BASE_URL}${path}${q}`;
};

function exampleIdFor(e) {
  const first = e.path.split('/')[1];
  return { accounts: IDS.x, posts: IDS.post, media: IDS.media, webhooks: IDS.webhook, feeds: IDS.feed, keys: IDS.key }[first] || 'ID';
}

const json = (v, indent = 2) => JSON.stringify(v, null, indent);
const indentRest = (s, pad) => s.split('\n').join(`\n${pad}`);

function pythonLiteral(v, level = 0) {
  const pad = '    '.repeat(level + 1);
  const end = '    '.repeat(level);
  if (v === null) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    if (v.every((x) => typeof x !== 'object' || x === null)) return `[${v.map((x) => pythonLiteral(x)).join(', ')}]`;
    return `[\n${v.map((x) => pad + pythonLiteral(x, level + 1)).join(',\n')},\n${end}]`;
  }
  const entries = Object.entries(v);
  if (!entries.length) return '{}';
  return `{\n${entries.map(([k, x]) => `${pad}${JSON.stringify(k)}: ${pythonLiteral(x, level + 1)}`).join(',\n')},\n${end}}`;
}

/** curl, JavaScript and Python versions of an endpoint's example request. */
export function requestSamples(e) {
  const url = exampleUrl(e);
  const body = e.example?.body;
  const hasBody = body !== undefined;
  const m = e.method;

  const curl = [
    `curl${m === 'GET' ? '' : ` -X ${m}`} "${url}"`,
    `  -H "Authorization: Bearer $SFY_API_KEY"`,
    ...(hasBody ? [`  -H "Content-Type: application/json"`, `  -d '${json(body).replace(/'/g, `'\\''`)}'`] : []),
  ].join(' \\\n');

  const jsHeaders = hasBody
    ? `{\n    Authorization: \`Bearer \${process.env.SFY_API_KEY}\`,\n    'Content-Type': 'application/json',\n  }`
    : `{ Authorization: \`Bearer \${process.env.SFY_API_KEY}\` }`;
  const js = [
    `const res = await fetch('${url}', {`,
    ...(m === 'GET' ? [] : [`  method: '${m}',`]),
    `  headers: ${jsHeaders},`,
    ...(hasBody ? [`  body: JSON.stringify(${indentRest(json(body), '  ')}),`] : []),
    `});`,
    `const data = await res.json();`,
  ].join('\n');

  const py = [
    'import os',
    'import requests',
    '',
    `res = requests.${m.toLowerCase()}(`,
    `    "${url}",`,
    `    headers={"Authorization": f"Bearer {os.environ['SFY_API_KEY']}"},`,
    ...(hasBody ? [`    json=${pythonLiteral(body, 1)},`] : []),
    ')',
    'data = res.json()',
  ].join('\n');

  return [
    { label: 'curl', lang: 'bash', code: curl },
    { label: 'JavaScript', lang: 'javascript', code: js },
    { label: 'Python', lang: 'python', code: py },
  ];
}

export const responseJson = (e) => json(e.response.body);
export const toJson = json;
