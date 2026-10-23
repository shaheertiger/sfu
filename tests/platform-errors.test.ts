import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PublishError, errorFromAnswer, isAuthError, jsonFetch, platformErrorMessage, timedFetch, userFacingError, withDeadline } from '../lib/server/adapters/types.ts';

const quiet = <T>(fn: () => T): T => {
  const err = console.error;
  console.error = () => {};
  try { return fn(); } finally { console.error = err; }
};

const META_FORMAT_ERROR = {
  error: {
    message: '(#100) Invalid parameter',
    type: 'OAuthException',
    code: 100,
    error_subcode: 2207026,
    error_user_title: 'Unsupported format',
    error_user_msg: 'The video format is not supported. See https://help.instagram.com/1631821640426723 for more.',
    fbtrace_id: 'AbCdEf123_xyz',
  },
};

test('Meta errors become the human message, without links, trace ids or JSON', () => {
  const msg = platformErrorMessage(META_FORMAT_ERROR, 400);
  assert.equal(msg, 'Unsupported format: The video format is not supported. See for more.');
  assert.doesNotMatch(msg, /https?:|fbtrace|[{}]/);
  assert.equal(platformErrorMessage({ error: { message: 'Something broke (fbtrace_id: A1b2C3)' } }, 500), 'Something broke');
});

test('other platforms’ error shapes are read too', () => {
  assert.equal(platformErrorMessage({ title: 'Forbidden', detail: 'You are not permitted to create a Tweet with duplicate content.', type: 'about:blank', status: 403 }, 403), 'You are not permitted to create a Tweet with duplicate content.');
  assert.equal(platformErrorMessage({ errors: [{ message: 'Rate limit exceeded', code: 88 }] }, 429), 'Rate limit exceeded');
  assert.equal(platformErrorMessage({ error: 'invalid_grant', error_description: 'Refresh token has expired' }, 400), 'Refresh token has expired');
  assert.equal(platformErrorMessage({ message: 'Invalid board', code: 2 }, 400), 'Invalid board');
  assert.equal(platformErrorMessage('<html><body>Bad gateway</body></html>', 502), 'The platform had a temporary problem.');
  assert.equal(platformErrorMessage({}, 400), 'The platform refused the request (HTTP 400).');
  assert.ok(platformErrorMessage({ message: 'x'.repeat(1000) }, 400).length <= 200);
});

test('only token problems mark an account for reconnecting, not every 403 or "permission" error', () => {
  quiet(() => {
    assert.equal(errorFromAnswer('https://graph.facebook.com/x', 400, JSON.stringify({ error: { message: 'Error validating access token: Session has expired on Friday.', type: 'OAuthException', code: 190, error_subcode: 463 } })).auth, true);
    assert.equal(errorFromAnswer('https://graph.facebook.com/x', 403, JSON.stringify({ error: { message: '(#200) Requires pages_manage_posts permission to manage the object', type: 'OAuthException', code: 200 } })).auth, false);
    assert.equal(errorFromAnswer('https://graph.facebook.com/x', 400, JSON.stringify({ error: { message: '(#4) Application request limit reached', type: 'OAuthException', code: 4 } })).auth, false);
    assert.equal(errorFromAnswer('https://api.x.com/2/tweets', 401, JSON.stringify({ title: 'Unauthorized', status: 401 })).auth, true);
    assert.equal(errorFromAnswer('https://oauth2.googleapis.com/token', 400, JSON.stringify({ error: 'invalid_grant', error_description: 'Bad Request' })).auth, true);
    assert.equal(errorFromAnswer('https://api.linkedin.com/rest/posts', 403, JSON.stringify({ message: 'Not enough permissions to access: partnerApiPostsExternal.CREATE' })).auth, false);
  });
  assert.equal(isAuthError('The user has not authorized application 1234.'), true);
  assert.equal(isAuthError('The session has been invalidated because the user changed their password'), true);
  assert.equal(isAuthError('Token has been revoked'), true);
  assert.equal(isAuthError('Permission denied'), false);
  assert.equal(isAuthError('403 Forbidden'), false);
  assert.equal(isAuthError(new PublishError('Invalid parameter', false, { auth: false })), false);
});

test('retryable: server errors, rate limits and Meta transient errors; not client errors', () => {
  quiet(() => {
    assert.equal(errorFromAnswer('https://a.test', 503, '').retryable, true);
    assert.equal(errorFromAnswer('https://a.test', 429, '{}').retryable, true);
    assert.equal(errorFromAnswer('https://a.test', 400, JSON.stringify({ error: { message: 'Please retry', is_transient: true } })).retryable, true);
    assert.equal(errorFromAnswer('https://a.test', 400, JSON.stringify(META_FORMAT_ERROR)).retryable, false);
  });
});

test('jsonFetch throws the readable message and logs the raw answer server-side only', async () => {
  const real = globalThis.fetch;
  const logged: string[] = [];
  const err = console.error;
  console.error = (...a: any[]) => { logged.push(a.join(' ')); };
  globalThis.fetch = (async () => new Response(JSON.stringify(META_FORMAT_ERROR), { status: 400 })) as any;
  try {
    await assert.rejects(() => jsonFetch('https://graph.facebook.com/v21.0/1/media'), (e: any) => {
      assert.ok(e instanceof PublishError);
      assert.equal(e.message, 'Unsupported format: The video format is not supported. See for more.');
      assert.equal(e.status, 400);
      assert.equal(e.code, 100);
      assert.equal(e.uncertain, undefined);
      return true;
    });
    assert.match(logged.join('\n'), /fbtrace_id/);
  } finally {
    globalThis.fetch = real;
    console.error = err;
  }
});

test('a request with no answer is marked uncertain; one never sent (out of time) is not', async () => {
  const real = globalThis.fetch;
  globalThis.fetch = (async () => { throw new TypeError('fetch failed'); }) as any;
  try {
    await assert.rejects(() => jsonFetch('https://api.x.com/2/tweets'), (e: any) => e instanceof PublishError && e.uncertain === true && e.message === 'Could not reach api.x.com');
    let called = false;
    globalThis.fetch = (async () => { called = true; return new Response('{}'); }) as any;
    await assert.rejects(
      () => withDeadline(Date.now() + 3000, () => timedFetch('https://api.x.com/2/tweets')),
      (e: any) => e instanceof PublishError && e.code === 'out_of_time' && !e.uncertain,
    );
    assert.equal(called, false);
  } finally {
    globalThis.fetch = real;
  }
});

test('errors that are not from a platform are summarised for users', () => {
  assert.equal(userFacingError(new TypeError("Cannot read properties of undefined (reading 'id')")), 'Something went wrong on our side while publishing.');
  assert.equal(userFacingError(new PublishError('Instagram requires an image or video', false)), 'Instagram requires an image or video');
  assert.equal(userFacingError(new Error('Upload failed, see https://internal.example/x')), 'Upload failed');
});
