// Generated from the Claude Design prototype "Landing Page Mobile.dc.html".
import React, { Fragment } from 'react';
import { $arr, $t, $sx, $dv } from '../lib/dc';

export const css =
  "\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{margin:0;padding:0;background:#0b0c0e;color:#f6f5f1;font-family:'Geist',system-ui,sans-serif;-webkit-font-smoothing:antialiased}\na{color:#f6f5f1;text-decoration:none}\na:hover{color:#dcff2e}\ninput,button{font-family:inherit}\n::selection{background:#dcff2e;color:#15171a}\n@media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}\n\n.landingmobile-active-0:active{transform:scale(.94) !important}\n.landingmobile-focus-1:focus{border-color:#dcff2e !important}\n.landingmobile-active-2:active{transform:scale(.98) !important}";

export function renderLandingMobile($v) {
  return (
    <>
      <div style={{ minHeight: '100vh', background: '#0b0c0e' }}>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            background: '#0f1113',
            minHeight: '100vh',
            position: 'relative',
            overflowX: 'clip',
            paddingBottom: `${$v['bottomPad'] ?? ''}`,
          }}
        >
          {' '}
          <header
            style={{
              position: 'sticky',
              top: '0',
              zIndex: '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 20px',
              background: 'rgba(15,17,19,.88)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderBottom: `1px solid ${$v['headBorder'] ?? ''}`,
            }}
          >
            {' '}
            <a
              href="#top"
              aria-label="Schedule For You home"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {' '}
              <img
                src="/logos/schedule-for-you-glyph.svg"
                alt=""
                width="28"
                height="28"
                style={{ display: 'block' }}
              />{' '}
              <span style={{ fontWeight: '800', letterSpacing: '-0.055em', fontSize: '17px', lineHeight: '1' }}>
                {'schedule for you'}
              </span>{' '}
            </a>{' '}
            <a href="/login" style={{ padding: '10px 4px', fontSize: '15px', fontWeight: '500', color: '#a7abb2' }}>
              {'Sign in'}
            </a>{' '}
          </header>{' '}
          <section
            id="top"
            data-screen-label="Hero"
            style={{ padding: '28px 20px 36px', display: 'flex', flexDirection: 'column', gap: '22px' }}
          >
            {' '}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {' '}
              <span style={{ display: 'flex' }}>
                {' '}
                {$arr($v['heroLogos']).map((l, $index) => (
                  <Fragment key={$index}>
                    {' '}
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        marginRight: '-7px',
                        borderRadius: '50%',
                        border: '2px solid #0f1113',
                        background: `${l?.color ?? ''}`,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <span
                        style={{ width: '12px', height: '12px', background: `${l?.bg ?? ''} center/contain no-repeat` }}
                      />
                    </span>{' '}
                  </Fragment>
                ))}{' '}
              </span>{' '}
              <span style={{ fontSize: '14px', color: '#a7abb2', marginLeft: '8px' }}>
                {'Posts to 10 platforms at once'}
              </span>{' '}
            </div>{' '}
            <h1
              style={{
                margin: '0',
                fontSize: 'clamp(42px,12.5vw,56px)',
                lineHeight: '.96',
                letterSpacing: '-0.055em',
                fontWeight: '700',
              }}
            >
              {'Write it once.'}
              <br />
              <span style={{ color: '#dcff2e' }}>{'Post it everywhere.'}</span>
            </h1>{' '}
            <p style={{ margin: '0', fontSize: '17px', lineHeight: '1.5', color: '#a7abb2', textWrap: 'pretty' }}>
              {
                'One composer for every social account you run. Schedule a week of posts in one sitting and let the queue publish them.'
              }
            </p>{' '}
            {$v['notSignedUp'] ? (
              <>
                {' '}
                <form
                  onSubmit={$v['submit']}
                  noValidate={true}
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  {' '}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '14px',
                      borderRadius: '16px',
                      background: '#15171a',
                      border: '1px solid #22252a',
                    }}
                  >
                    {' '}
                    <span
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{'Where do you post?'}</span>
                      <span style={{ fontSize: '12px', color: '#6b7079' }}>{$t($v['pickHint'])}</span>
                    </span>{' '}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
                      {' '}
                      {$arr($v['pickers']).map((p, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <button
                            type="button"
                            onClick={p?.toggle}
                            aria-pressed={p?.pressed}
                            aria-label={p?.name}
                            title={p?.name}
                            style={{
                              aspectRatio: '1',
                              borderRadius: '12px',
                              border: `1.5px solid ${p?.border ?? ''}`,
                              background: `${p?.bg ?? ''}`,
                              display: 'grid',
                              placeItems: 'center',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background .15s,border-color .15s,transform .12s',
                            }}
                            className="landingmobile-active-0"
                          >
                            {' '}
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                background: `${p?.logo ?? ''} center/contain no-repeat`,
                                opacity: `${p?.op ?? ''}`,
                              }}
                            />{' '}
                            <span
                              style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#dcff2e',
                                color: '#15171a',
                                fontSize: '11px',
                                fontWeight: '800',
                                display: `${p?.check ?? ''}`,
                                placeItems: 'center',
                              }}
                            >
                              {'✓'}
                            </span>{' '}
                          </button>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                  </div>{' '}
                  <label htmlFor="email" style={{ fontSize: '13px', fontWeight: '500', color: '#a7abb2' }}>
                    {'Work email'}
                  </label>{' '}
                  <input
                    id="email"
                    ref={$v['emailRef']}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck="false"
                    value={$dv($v['email'])}
                    onChange={$v['onEmail']}
                    placeholder="you@company.com"
                    aria-invalid={$v['invalid']}
                    aria-describedby="email-err"
                    style={{
                      height: '56px',
                      padding: '0 16px',
                      fontSize: '17px',
                      borderRadius: '14px',
                      border: `1.5px solid ${$v['inputBorder'] ?? ''}`,
                      background: '#17191c',
                      color: '#f6f5f1',
                      outline: 'none',
                      transition: 'border-color .15s',
                    }}
                    className="landingmobile-focus-1"
                  />{' '}
                  {$v['showErr'] ? (
                    <>
                      <span id="email-err" role="alert" style={{ fontSize: '13px', color: '#ff8a8f' }}>
                        {'Enter a valid email to create your account.'}
                      </span>
                    </>
                  ) : null}{' '}
                  <button
                    type="submit"
                    style={{
                      height: '56px',
                      borderRadius: '14px',
                      border: '0',
                      background: '#dcff2e',
                      color: '#15171a',
                      fontSize: '17px',
                      fontWeight: '700',
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                      transition: 'transform .12s',
                    }}
                    className="landingmobile-active-2"
                  >
                    {$t($v['ctaLabel'])}
                  </button>{' '}
                </form>{' '}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: '13px', color: '#a7abb2' }}>
                  {' '}
                  <span style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'7-day free trial'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Card required'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Cancel anytime'}
                  </span>{' '}
                </div>{' '}
              </>
            ) : null}{' '}
          </section>{' '}
          <section
            data-screen-label="Live demo"
            style={{ padding: '8px 20px 44px', display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {' '}
            <div
              style={{ borderRadius: '22px', background: '#15171a', border: '1px solid #22252a', overflow: 'hidden' }}
            >
              {' '}
              <div
                style={{
                  padding: '16px 16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderBottom: '1px solid #22252a',
                }}
              >
                {' '}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a7abb2' }}>
                  {' '}
                  <img
                    src="/logos/schedule-for-you-glyph.svg"
                    alt=""
                    width="18"
                    height="18"
                    style={{ display: 'block' }}
                  />{' '}
                  <span style={{ fontWeight: '600', color: '#f6f5f1' }}>{'New post'}</span>{' '}
                  <span style={{ flex: '1' }} />{' '}
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '12px' }}>{'Tue 9:00 AM'}</span>{' '}
                </div>{' '}
                <div style={{ minHeight: '52px', fontSize: '16px', lineHeight: '1.45', color: '#f6f5f1' }}>
                  {$t($v['typed'])}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '18px',
                      marginLeft: '1px',
                      verticalAlign: '-3px',
                      background: '#dcff2e',
                      opacity: `${$v['caretOp'] ?? ''}`,
                    }}
                  />
                </div>{' '}
              </div>{' '}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {' '}
                {$arr($v['demoRows']).map((r, $index) => (
                  <Fragment key={$index}>
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 16px',
                        borderTop: `${r?.divider ?? ''}`,
                      }}
                    >
                      {' '}
                      <span
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          flex: 'none',
                          background: `${r?.color ?? ''}`,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            background: `${r?.bg ?? ''} center/contain no-repeat`,
                          }}
                        />
                      </span>{' '}
                      <span
                        style={{
                          flex: '1',
                          minWidth: '0',
                          display: 'flex',
                          flexDirection: 'column',
                          lineHeight: '1.25',
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{$t(r?.name)}</span>
                        <span style={{ fontSize: '12px', color: '#6b7079' }}>{$t(r?.note)}</span>
                      </span>{' '}
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: `${r?.stColor ?? ''}`,
                          transition: 'color .3s',
                        }}
                      >
                        {$t(r?.st)}
                      </span>{' '}
                    </div>{' '}
                  </Fragment>
                ))}{' '}
              </div>{' '}
            </div>{' '}
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7079', textAlign: 'center' }}>
              {"One caption, adjusted for each platform's limits, scheduled everywhere."}
            </p>{' '}
          </section>{' '}
          <section
            data-screen-label="Cost of copy-paste"
            style={{ padding: '8px 20px 44px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {' '}
            <h2
              style={{
                margin: '0',
                fontSize: '32px',
                lineHeight: '1.02',
                letterSpacing: '-0.045em',
                fontWeight: '700',
              }}
            >
              {'What copy-pasting costs you.'}
            </h2>{' '}
            <div
              style={{
                padding: '18px',
                borderRadius: '20px',
                background: '#15171a',
                border: '1px solid #22252a',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {' '}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {' '}
                <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#a7abb2' }}>
                  <span>{'Posts per week'}</span>
                  <strong style={{ color: '#f6f5f1', fontSize: '16px' }}>{$t($v['ppw'])}</strong>
                </span>{' '}
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={$dv($v['ppw'])}
                  onChange={$v['onPpw']}
                  aria-label="Posts per week"
                  style={{ width: '100%', accentColor: '#dcff2e', height: '28px' }}
                />{' '}
              </label>{' '}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {' '}
                <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#a7abb2' }}>
                  <span>{'Accounts you post to'}</span>
                  <strong style={{ color: '#f6f5f1', fontSize: '16px' }}>{$t($v['accN'])}</strong>
                </span>{' '}
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={$dv($v['accN'])}
                  onChange={$v['onAccN']}
                  aria-label="Accounts"
                  style={{ width: '100%', accentColor: '#dcff2e', height: '28px' }}
                />{' '}
              </label>{' '}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {' '}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#2a1517',
                    border: '1px solid #4a2326',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {' '}
                  <span style={{ fontSize: '12px', color: '#ff8a8f' }}>{'Posting by hand'}</span>{' '}
                  <span
                    style={{
                      fontSize: '30px',
                      fontWeight: '700',
                      letterSpacing: '-0.04em',
                      lineHeight: '1',
                      color: '#ffb3b6',
                    }}
                  >
                    {$t($v['manualLabel'])}
                  </span>{' '}
                  <span style={{ fontSize: '12px', color: '#c9a3a5' }}>{$t($v['manualSub'])}</span>{' '}
                </div>{' '}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#dcff2e',
                    color: '#15171a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {' '}
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>{'With Schedule For You'}</span>{' '}
                  <span style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.04em', lineHeight: '1' }}>
                    {$t($v['toolLabel'])}
                  </span>{' '}
                  <span style={{ fontSize: '12px' }}>{$t($v['toolSub'])}</span>{' '}
                </div>{' '}
              </div>{' '}
              <span style={{ fontSize: '15px', lineHeight: '1.45' }}>
                {"That's "}
                <strong style={{ color: '#dcff2e' }}>{$t($v['yearLabel'])}</strong>
                {' back every year.'}
              </span>{' '}
              <span style={{ fontSize: '12px', color: '#6b7079' }}>
                {
                  'Estimate assumes 2 minutes to reformat and post each post on each account by hand, versus about 2 minutes per post once in our composer.'
                }
              </span>{' '}
            </div>{' '}
          </section>{' '}
          <section
            data-screen-label="Testimonials"
            style={{ padding: '8px 0 44px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {' '}
            <h2
              style={{
                margin: '0',
                padding: '0 20px',
                fontSize: '32px',
                lineHeight: '1.02',
                letterSpacing: '-0.045em',
                fontWeight: '700',
              }}
            >
              {'People who stopped copy-pasting.'}
            </h2>{' '}
            <div
              style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: '86%',
                gap: '12px',
                overflowX: 'auto',
                padding: '0 20px 6px',
                scrollSnapType: 'x mandatory',
                scrollPadding: '0 20px',
                scrollbarWidth: 'none',
              }}
            >
              {' '}
              {$arr($v['quotes']).map((q, $index) => (
                <Fragment key={$index}>
                  {' '}
                  <figure
                    style={{
                      scrollSnapAlign: 'start',
                      margin: '0',
                      padding: '20px',
                      borderRadius: '20px',
                      background: '#15171a',
                      border: '1px solid #22252a',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      justifyContent: 'space-between',
                    }}
                  >
                    {' '}
                    <blockquote style={{ margin: '0', fontSize: '17px', lineHeight: '1.5', letterSpacing: '-0.01em' }}>
                      {'“'}
                      {$t(q?.text)}
                      {'”'}
                    </blockquote>{' '}
                    <figcaption style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {' '}
                      <span
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#2a2e34',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                        }}
                      >
                        {$t(q?.initials)}
                      </span>{' '}
                      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{$t(q?.name)}</span>
                        <span style={{ fontSize: '13px', color: '#6b7079' }}>{$t(q?.role)}</span>
                      </span>{' '}
                    </figcaption>{' '}
                  </figure>{' '}
                </Fragment>
              ))}{' '}
            </div>{' '}
          </section>{' '}
          <section
            data-screen-label="How it works"
            style={{ padding: '8px 0 44px', display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            {' '}
            <h2
              style={{
                margin: '0',
                padding: '0 20px',
                fontSize: '32px',
                lineHeight: '1.02',
                letterSpacing: '-0.045em',
                fontWeight: '700',
              }}
            >
              {'A week of posts'}
              <br />
              {'in one sitting.'}
            </h2>{' '}
            <div
              style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: '80%',
                gap: '12px',
                overflowX: 'auto',
                padding: '0 20px 6px',
                scrollSnapType: 'x mandatory',
                scrollPadding: '0 20px',
                scrollbarWidth: 'none',
              }}
            >
              {' '}
              {$arr($v['steps']).map((s, $index) => (
                <Fragment key={$index}>
                  {' '}
                  <div
                    style={{
                      scrollSnapAlign: 'start',
                      minHeight: '200px',
                      borderRadius: '20px',
                      padding: '20px',
                      background: `${s?.bg ?? ''}`,
                      color: `${s?.fg ?? ''}`,
                      border: `1px solid ${s?.border ?? ''}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {' '}
                    <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '13px', opacity: '.7' }}>
                      {$t(s?.n)}
                      {' / 3'}
                    </span>{' '}
                    <strong
                      style={{ fontSize: '23px', lineHeight: '1.1', letterSpacing: '-0.035em', marginTop: 'auto' }}
                    >
                      {$t(s?.title)}
                    </strong>{' '}
                    <span style={{ fontSize: '15px', lineHeight: '1.45', opacity: '.85' }}>{$t(s?.body)}</span>{' '}
                  </div>{' '}
                </Fragment>
              ))}{' '}
            </div>{' '}
          </section>{' '}
          <section
            data-screen-label="Features"
            style={{ padding: '8px 20px 44px', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {' '}
            <h2
              style={{
                margin: '0 0 10px',
                fontSize: '32px',
                lineHeight: '1.02',
                letterSpacing: '-0.045em',
                fontWeight: '700',
              }}
            >
              {'Built for people who post a lot.'}
            </h2>{' '}
            {$arr($v['features']).map((f, $index) => (
              <Fragment key={$index}>
                {' '}
                <div style={{ display: 'flex', gap: '14px', padding: '14px 0', borderTop: '1px solid #22252a' }}>
                  {' '}
                  <span
                    style={{
                      fontFamily: "'Geist Mono',monospace",
                      fontSize: '13px',
                      color: '#dcff2e',
                      paddingTop: '2px',
                    }}
                  >
                    {$t(f?.n)}
                  </span>{' '}
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <strong style={{ fontSize: '17px', letterSpacing: '-0.02em' }}>{$t(f?.title)}</strong>
                    <span style={{ fontSize: '15px', lineHeight: '1.45', color: '#a7abb2' }}>{$t(f?.body)}</span>
                  </span>{' '}
                </div>{' '}
              </Fragment>
            ))}{' '}
          </section>{' '}
          <section
            id="pricing"
            data-screen-label="Pricing"
            style={{ padding: '8px 20px 44px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {' '}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {' '}
              <h2
                style={{
                  margin: '0',
                  fontSize: '32px',
                  lineHeight: '1.02',
                  letterSpacing: '-0.045em',
                  fontWeight: '700',
                }}
              >
                {'Simple pricing'}
              </h2>{' '}
              <p style={{ margin: '0', color: '#a7abb2', fontSize: '15px' }}>
                {'Unlimited posts on every plan. 7-day free trial, card required. Cancel anytime.'}
              </p>{' '}
            </div>{' '}
            <div
              role="tablist"
              aria-label="Plan"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: '4px',
                borderRadius: '14px',
                background: '#17191c',
                border: '1px solid #22252a',
              }}
            >
              {' '}
              {$arr($v['plans']).map((p, $index) => (
                <Fragment key={$index}>
                  {' '}
                  <button
                    role="tab"
                    aria-selected={p?.sel}
                    onClick={p?.pick}
                    style={{
                      height: '44px',
                      border: '0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      background: `${p?.bg ?? ''}`,
                      color: `${p?.fg ?? ''}`,
                      transition: 'background .2s,color .2s',
                    }}
                  >
                    {$t(p?.name)}
                  </button>{' '}
                </Fragment>
              ))}{' '}
            </div>{' '}
            <div
              style={{
                padding: '22px',
                borderRadius: '20px',
                border: `1px solid ${$v['planBorder'] ?? ''}`,
                background: '#15171a',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              {' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {' '}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '52px', fontWeight: '700', letterSpacing: '-0.045em', lineHeight: '1' }}>
                    {$t($v['planPrice'])}
                  </span>
                  <span style={{ color: '#6b7079' }}>{'/mo'}</span>
                </div>{' '}
                <span style={{ fontSize: '14px', color: '#a7abb2' }}>
                  {'About '}
                  {$t($v['perDay'])}
                  {' a day. Less than '}
                  {$t($v['perHour'])}
                  {' per hour you get back.'}
                </span>{' '}
              </div>{' '}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#c9ccd1', fontSize: '15px' }}
              >
                {' '}
                {$arr($v['planFeatures']).map((f, $index) => (
                  <Fragment key={$index}>
                    <span style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                      {$t(f)}
                    </span>
                  </Fragment>
                ))}{' '}
              </div>{' '}
              <button
                onClick={$v['openSheet']}
                style={{
                  height: '54px',
                  borderRadius: '14px',
                  border: '0',
                  background: '#dcff2e',
                  color: '#15171a',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
                className="landingmobile-active-2"
              >
                {'Start 7-day trial'}
              </button>{' '}
              <span style={{ fontSize: '13px', color: '#a7abb2', textAlign: 'center', marginTop: '-6px' }}>
                {"Try every feature for 7 days. Cancel before it ends and you won't be charged."}
              </span>{' '}
            </div>{' '}
          </section>{' '}
          <section
            data-screen-label="FAQ"
            style={{ padding: '8px 20px 44px', display: 'flex', flexDirection: 'column' }}
          >
            {' '}
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: '32px',
                lineHeight: '1.02',
                letterSpacing: '-0.045em',
                fontWeight: '700',
              }}
            >
              {'Questions'}
            </h2>{' '}
            {$arr($v['faqs']).map((q, $index) => (
              <Fragment key={$index}>
                {' '}
                <div style={{ borderTop: '1px solid #22252a' }}>
                  {' '}
                  <button
                    onClick={q?.toggle}
                    aria-expanded={q?.open}
                    style={{
                      width: '100%',
                      minHeight: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 0',
                      border: '0',
                      background: 'transparent',
                      color: '#f6f5f1',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}
                  >
                    {' '}
                    <span style={{ flex: '1' }}>{$t(q?.q)}</span>
                    <span
                      style={{
                        fontSize: '20px',
                        color: '#a7abb2',
                        transform: `rotate(${q?.rot ?? ''}deg)`,
                        transition: 'transform .2s',
                      }}
                    >
                      {'+'}
                    </span>{' '}
                  </button>{' '}
                  <div
                    style={{
                      display: `${q?.display ?? ''}`,
                      padding: '0 0 16px',
                      fontSize: '15px',
                      lineHeight: '1.5',
                      color: '#a7abb2',
                    }}
                  >
                    {$t(q?.a)}
                  </div>{' '}
                </div>{' '}
              </Fragment>
            ))}{' '}
          </section>{' '}
          <section id="final" data-screen-label="CTA" style={{ padding: '8px 20px 40px' }}>
            {' '}
            <div
              style={{
                padding: '32px 22px',
                borderRadius: '24px',
                background: '#dcff2e',
                color: '#15171a',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {' '}
              <h2
                style={{
                  margin: '0',
                  fontSize: '40px',
                  lineHeight: '.96',
                  letterSpacing: '-0.055em',
                  fontWeight: '700',
                }}
              >
                {'Your next week of posts, done by lunch.'}
              </h2>{' '}
              <span style={{ fontSize: '16px', lineHeight: '1.45' }}>
                {'Every week you wait costs about '}
                <strong>{$t($v['savedLabel'])}</strong>
                {' of copy-pasting.'}
              </span>{' '}
              <button
                onClick={$v['openSheet']}
                style={{
                  height: '56px',
                  borderRadius: '14px',
                  border: '0',
                  background: '#15171a',
                  color: '#f6f5f1',
                  fontSize: '17px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {$t($v['ctaLabel'])}
              </button>{' '}
            </div>{' '}
          </section>{' '}
          <footer
            style={{
              padding: '8px 20px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '13px',
              color: '#6b7079',
            }}
          >
            {' '}
            <nav aria-label="More" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
              <a href="/tools" style={{ color: '#a7abb2', padding: '10px 0' }}>
                {'Free tools'}
              </a>
              <a href="/blog" style={{ color: '#a7abb2', padding: '10px 0' }}>
                {'Blog'}
              </a>
              <a href="/compare" style={{ color: '#a7abb2', padding: '10px 0' }}>
                {'Compare'}
              </a>
              <a href="/about" style={{ color: '#a7abb2', padding: '10px 0' }}>
                {'About'}
              </a>
              <a href="/privacy" style={{ color: '#a7abb2', padding: '10px 0' }}>
                {'Privacy'}
              </a>
              <a href="/login" style={{ color: '#a7abb2', padding: '10px 0' }}>
                {'Sign in'}
              </a>
            </nav>{' '}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {' '}
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/logos/schedule-for-you-glyph.svg"
                  alt=""
                  width="18"
                  height="18"
                  style={{ display: 'block' }}
                />
                {'© 2026 Schedule For You'}
              </span>{' '}
              <a href="/?desktop=1" style={{ color: '#6b7079', padding: '12px 0' }}>
                {'Desktop site'}
              </a>{' '}
            </div>{' '}
          </footer>
        </div>
        <div
          style={{
            position: 'fixed',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '30',
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {' '}
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
              background: 'rgba(15,17,19,.92)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderTop: '1px solid #22252a',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transform: `translateY(${$v['barY'] ?? ''}%)`,
              transition: 'transform .3s cubic-bezier(.2,.8,.2,1)',
              pointerEvents: `${$v['barPE'] ?? ''}`,
            }}
          >
            {' '}
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', flex: 'none' }}>
              <strong style={{ fontSize: '15px' }}>
                {'Save '}
                {$t($v['savedLabel'])}
              </strong>
              <span style={{ fontSize: '12px', color: '#a7abb2' }}>{'every week'}</span>
            </span>{' '}
            <button
              onClick={$v['openSheet']}
              style={{
                flex: '1',
                height: '50px',
                borderRadius: '13px',
                border: '0',
                background: '#dcff2e',
                color: '#15171a',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {'Start free'}
            </button>{' '}
          </div>
        </div>
        {$v['sheetOpen'] ? (
          <>
            {' '}
            <div
              onClick={$v['closeSheet']}
              style={{ position: 'fixed', inset: '0', zIndex: '40', background: 'rgba(0,0,0,.55)' }}
            />{' '}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Start your trial"
              style={{
                position: 'fixed',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: '41',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {' '}
              <div
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  padding: '10px 20px calc(22px + env(safe-area-inset-bottom))',
                  borderRadius: '24px 24px 0 0',
                  background: '#15171a',
                  borderTop: '1px solid #2a2e34',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {' '}
                <span
                  style={{
                    alignSelf: 'center',
                    width: '40px',
                    height: '4px',
                    borderRadius: '4px',
                    background: '#3a3e45',
                  }}
                />{' '}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {' '}
                  <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>{'Start your 7-day trial'}</strong>
                    <span style={{ fontSize: '14px', color: '#a7abb2' }}>{$t($v['sheetPlan'])}</span>{' '}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span
                        style={{
                          flex: '1',
                          height: '4px',
                          borderRadius: '4px',
                          background: '#22252a',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${$v['progW'] ?? ''}`,
                            background: '#dcff2e',
                            borderRadius: '4px',
                            transition: 'width .3s',
                          }}
                        />
                      </span>
                      <span style={{ fontSize: '12px', color: '#a7abb2', whiteSpace: 'nowrap' }}>
                        {$t($v['progLabel'])}
                      </span>
                    </span>
                  </span>{' '}
                  <button
                    onClick={$v['closeSheet']}
                    aria-label="Close"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      border: '1px solid #3a3e45',
                      background: 'transparent',
                      color: '#f6f5f1',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    {'×'}
                  </button>{' '}
                </div>{' '}
                {$v['notSignedUp'] ? (
                  <>
                    {' '}
                    <form
                      onSubmit={$v['submit']}
                      noValidate={true}
                      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                      {' '}
                      {$v['hasPicks'] ? (
                        <>
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13px',
                              color: '#a7abb2',
                            }}
                          >
                            <span style={{ display: 'flex' }}>
                              {$arr($v['pickedLogos']).map((l, $index) => (
                                <Fragment key={$index}>
                                  <span
                                    style={{
                                      width: '22px',
                                      height: '22px',
                                      marginRight: '-6px',
                                      borderRadius: '50%',
                                      border: '2px solid #15171a',
                                      background: `${l?.color ?? ''}`,
                                      display: 'grid',
                                      placeItems: 'center',
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: '10px',
                                        height: '10px',
                                        background: `${l?.logo ?? ''} center/contain no-repeat`,
                                      }}
                                    />
                                  </span>
                                </Fragment>
                              ))}
                            </span>
                            <span style={{ marginLeft: '8px' }}>{$t($v['pickSummary'])}</span>
                          </span>
                        </>
                      ) : null}{' '}
                      <input
                        ref={$v['sheetRef']}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck="false"
                        value={$dv($v['email'])}
                        onChange={$v['onEmail']}
                        placeholder="you@company.com"
                        aria-label="Work email"
                        aria-invalid={$v['invalid']}
                        style={{
                          height: '56px',
                          padding: '0 16px',
                          fontSize: '17px',
                          borderRadius: '14px',
                          border: `1.5px solid ${$v['inputBorder'] ?? ''}`,
                          background: '#0f1113',
                          color: '#f6f5f1',
                          outline: 'none',
                        }}
                        className="landingmobile-focus-1"
                      />{' '}
                      {$v['showErr'] ? (
                        <>
                          <span role="alert" style={{ fontSize: '13px', color: '#ff8a8f' }}>
                            {'Enter a valid email to create your account.'}
                          </span>
                        </>
                      ) : null}{' '}
                      <button
                        type="submit"
                        style={{
                          height: '56px',
                          borderRadius: '14px',
                          border: '0',
                          background: '#dcff2e',
                          color: '#15171a',
                          fontSize: '17px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {$t($v['ctaLabel'])}
                      </button>{' '}
                    </form>{' '}
                  </>
                ) : null}{' '}
              </div>{' '}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
