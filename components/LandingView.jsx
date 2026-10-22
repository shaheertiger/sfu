// Generated from the Claude Design prototype "Landing Page.dc.html".
import React, { Fragment } from 'react';
import { $arr, $t, $sx, $dv } from '../lib/dc';

export const css =
  '\n*{box-sizing:border-box}\nhtml{scroll-behavior:smooth}\nhtml,body{margin:0;padding:0;background:#0c0d0f;color:#f6f5f1;font:16px/1.55 "Geist",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\na{color:#f6f5f1;text-decoration:none}\na:hover{color:#dcff2e}\nbutton{font:inherit;color:inherit}\n::selection{background:#dcff2e;color:#15171a}\n@keyframes sfyMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}\n@keyframes sfyBob{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-14px) rotate(var(--r,0deg))}}\n@keyframes sfyPulse{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}\n@keyframes sfyShine{from{background-position:200% 0}to{background-position:-200% 0}}\n@keyframes sfyArrive{0%,84%{box-shadow:0 0 0 0 rgba(220,255,46,0)}88%{box-shadow:0 0 0 0 rgba(220,255,46,.75)}100%{box-shadow:0 0 0 12px rgba(220,255,46,0)}}\n@keyframes sfyPing{0%{box-shadow:0 0 0 0 rgba(220,255,46,.5)}100%{box-shadow:0 0 0 14px rgba(220,255,46,0)}}\n\n.landing-hover-0:hover{color:#f6f5f1 !important}\n.landing-hover-1:hover{transform:translateY(-1px) !important;color:#15171a !important}\n.landing-hover-2:hover{transform:translateY(-2px) !important;color:#15171a !important}\n.landing-hover-3:hover{border-color:#6b7079 !important;color:#f6f5f1 !important}\n.landing-hover-4:hover{border-color:#dcff2e !important;transform:translateY(-3px) !important}\n.landing-hover-5:hover{filter:brightness(1.15) !important}\n.landing-hover-6:hover{border-color:#dcff2e !important;color:#f6f5f1 !important}\n.landing-hover-7:hover{border-color:#3a3e45 !important;transform:translateY(-3px) !important}\n.landing-hover-8:hover{border-color:#f6f5f1 !important;color:#f6f5f1 !important}\n.landing-hover-9:hover{transform:translateY(-2px) !important;color:#dcff2e !important}\n.landing-hover-a:hover{background:rgba(21,23,26,.08) !important;color:#15171a !important}';

export function renderLanding($v) {
  return (
    <>
      <div style={{ minHeight: '100vh', overflowX: 'clip' }}>
        {' '}
        <nav
          style={{
            position: 'sticky',
            top: '0',
            zIndex: '20',
            background: 'rgba(12,13,15,.72)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid #1f2227',
          }}
        >
          {' '}
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            {' '}
            <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f6f5f1' }}>
              {' '}
              <img
                src="/logos/schedule-for-you-glyph.svg"
                alt="Schedule For You"
                width="32"
                height="32"
                style={{ display: 'block' }}
              />{' '}
              <span style={{ fontWeight: '800', letterSpacing: '-0.055em', fontSize: '20px', lineHeight: '1' }}>
                {'schedule for you'}
              </span>{' '}
            </a>{' '}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              {' '}
              <a
                href="#features"
                style={{ padding: '8px 12px', fontSize: '14px', color: '#a7abb2', borderRadius: '8px' }}
                className="landing-hover-0"
              >
                {'Features'}
              </a>{' '}
              <a
                href="#pricing"
                style={{ padding: '8px 12px', fontSize: '14px', color: '#a7abb2', borderRadius: '8px' }}
                className="landing-hover-0"
              >
                {'Pricing'}
              </a>{' '}
              <a
                href="/login"
                style={{ padding: '8px 12px', fontSize: '14px', color: '#a7abb2', borderRadius: '8px' }}
                className="landing-hover-0"
              >
                {'Sign in'}
              </a>{' '}
              <a
                href="/signup"
                style={{
                  padding: '8px 14px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '9px',
                  background: '#dcff2e',
                  color: '#15171a',
                  transition: 'transform .15s',
                }}
                className="landing-hover-1"
              >
                {'Start free'}
              </a>{' '}
            </div>{' '}
          </div>{' '}
        </nav>{' '}
        <header
          id="top"
          data-screen-label="Hero"
          onMouseMove={$v['onHeroMove']}
          style={{ position: 'relative', padding: '96px 24px 40px' }}
        >
          {' '}
          {$v['wide'] ? (
            <>
              {' '}
              <div
                style={{
                  position: 'absolute',
                  inset: '0',
                  maxWidth: '1320px',
                  margin: '0 auto',
                  pointerEvents: 'none',
                }}
              >
                {' '}
                {$arr($v['floaters']).map((f, $index) => (
                  <Fragment key={$index}>
                    {' '}
                    <span
                      style={{
                        position: 'absolute',
                        left: `${f?.left ?? ''}`,
                        top: `${f?.top ?? ''}`,
                        '--r': `${f?.rot ?? ''}`,
                        width: `${f?.size ?? ''}px`,
                        height: `${f?.size ?? ''}px`,
                        borderRadius: '22%',
                        background: `${f?.tile ?? ''}`,
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 20px 50px -14px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06) inset',
                        animation: `sfyBob ${f?.dur ?? ''}s ease-in-out ${f?.delay ?? ''}s infinite`,
                      }}
                    >
                      {' '}
                      <span
                        style={{
                          width: '46%',
                          height: '46%',
                          background: '#ffffff',
                          WebkitMask: `${f?.logo ?? ''} center/contain no-repeat`,
                          mask: `${f?.logo ?? ''} center/contain no-repeat`,
                        }}
                      />{' '}
                    </span>{' '}
                  </Fragment>
                ))}{' '}
              </div>{' '}
            </>
          ) : null}{' '}
          <div
            style={{
              position: 'relative',
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '28px',
            }}
          >
            {' '}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px 5px 6px',
                border: '1px solid #2a2e34',
                borderRadius: '999px',
                background: '#15171a',
                fontSize: '13px',
                color: '#a7abb2',
              }}
            >
              {' '}
              <span
                style={{
                  padding: '1px 8px',
                  borderRadius: '999px',
                  background: '#dcff2e',
                  color: '#15171a',
                  fontWeight: '600',
                  fontSize: '12px',
                }}
              >
                {'New'}
              </span>
              {' REST API and MCP server in every workspace '}
            </span>{' '}
            <h1
              style={{
                margin: '0',
                fontSize: 'clamp(48px,8.4vw,116px)',
                lineHeight: '.95',
                letterSpacing: '-0.05em',
                fontWeight: '700',
                textWrap: 'balance',
              }}
            >
              {'Write it once.'}
              <br />
              <span style={{ color: '#dcff2e' }}>{'Post it everywhere.'}</span>
            </h1>{' '}
            <p
              style={{
                margin: '0',
                maxWidth: '600px',
                fontSize: 'clamp(17px,1.6vw,20px)',
                color: '#a7abb2',
                textWrap: 'pretty',
              }}
            >
              {
                'One composer, every social account you run. Schedule, tweak per platform, and let the queue do the posting while you build.'
              }
            </p>{' '}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {' '}
              <a
                href="/signup"
                style={{
                  padding: '14px 22px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  background: '#dcff2e',
                  color: '#15171a',
                  transition: 'transform .15s',
                }}
                className="landing-hover-2"
              >
                {'Start posting free'}
              </a>{' '}
              <a
                href="#how"
                style={{
                  padding: '14px 22px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '12px',
                  border: '1px solid #3a3e45',
                  background: '#15171a',
                  color: '#f6f5f1',
                  transition: 'border-color .15s',
                }}
                className="landing-hover-3"
              >
                {'See how it works'}
              </a>{' '}
            </div>{' '}
            <span style={{ fontSize: '13px', color: '#6b7079' }}>{'7-day trial · No card to start'}</span>{' '}
          </div>{' '}
          <div
            id="how"
            data-demo-root=""
            style={{
              transform: `${$v['tilt'] ?? ''}`,
              transformOrigin: '50% 0',
              willChange: 'transform',
              position: 'relative',
              maxWidth: '1180px',
              margin: '72px auto 0',
              border: '1px solid #2a2e34',
              borderRadius: '14px',
              background: '#121417',
              boxShadow: '0 50px 100px -40px rgba(0,0,0,.95)',
              overflow: 'hidden',
            }}
          >
            {' '}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '11px 14px',
                borderBottom: '1px solid #22252a',
                background: '#17191c',
              }}
            >
              {' '}
              <div style={{ display: 'flex', gap: '7px' }}>
                {' '}
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57' }} />{' '}
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#febc2e' }} />{' '}
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28c840' }} />{' '}
              </div>{' '}
              <span style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                <span
                  style={{
                    padding: '4px 40px',
                    borderRadius: '7px',
                    background: '#0f1113',
                    fontSize: '12px',
                    color: '#a7abb2',
                  }}
                >
                  {'scheduleforyou.com'}
                </span>
              </span>{' '}
              <span style={{ width: '47px' }} />{' '}
            </div>{' '}
            <div style={{ display: 'grid', gridTemplateColumns: `${$v['demoCols'] ?? ''}`, textAlign: 'left' }}>
              {' '}
              {$v['wide'] ? (
                <>
                  {' '}
                  <aside
                    style={{
                      background: '#15171a',
                      borderRight: '1px solid #22252a',
                      padding: '16px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      fontSize: '13px',
                    }}
                  >
                    {' '}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 8px 14px' }}>
                      {' '}
                      <img
                        src="/logos/schedule-for-you-glyph.svg"
                        alt=""
                        width="20"
                        height="20"
                        style={{ display: 'block' }}
                      />{' '}
                      <span style={{ fontWeight: '800', letterSpacing: '-0.05em', fontSize: '14px' }}>
                        {'schedule for you'}
                      </span>{' '}
                    </div>{' '}
                    <span
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        background: '#dcff2e',
                        color: '#15171a',
                        fontWeight: '600',
                      }}
                    >
                      {'New post'}
                      <span
                        style={{
                          font: "500 10px 'Geist Mono',monospace",
                          padding: '0 5px',
                          borderRadius: '4px',
                          background: 'rgba(21,23,26,.12)',
                        }}
                      >
                        {'N'}
                      </span>
                    </span>{' '}
                    <span style={{ padding: '7px 10px', borderRadius: '7px', color: '#a7abb2' }}>{'Queue'}</span>{' '}
                    <span style={{ padding: '7px 10px', borderRadius: '7px', color: '#a7abb2' }}>{'Calendar'}</span>{' '}
                    <span
                      style={{
                        padding: '7px 10px',
                        borderRadius: '7px',
                        background: '#22252a',
                        color: '#f6f5f1',
                        fontWeight: '500',
                      }}
                    >
                      {'Compose'}
                    </span>{' '}
                    <span style={{ padding: '7px 10px', borderRadius: '7px', color: '#a7abb2' }}>{'Accounts'}</span>{' '}
                    <span style={{ padding: '7px 10px', borderRadius: '7px', color: '#a7abb2' }}>{'Analytics'}</span>{' '}
                    <span style={{ flex: '1' }} />{' '}
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 8px 2px',
                        borderTop: '1px solid #22252a',
                      }}
                    >
                      {' '}
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'linear-gradient(160deg,#9a7a58,#5d4a36)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '10px',
                          fontWeight: '700',
                        }}
                      />{' '}
                      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.25' }}>
                        <span style={{ fontWeight: '600', fontSize: '12px' }}>{'Field & Co.'}</span>
                        <span style={{ fontSize: '11px', color: '#6b7079' }}>{'Studio plan'}</span>
                      </span>{' '}
                    </span>{' '}
                  </aside>{' '}
                </>
              ) : null}{' '}
              <div
                style={{
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  borderRight: '1px solid #22252a',
                  minWidth: '0',
                }}
              >
                {' '}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
                  {' '}
                  <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.02em' }}>
                    {'New post'}
                  </span>{' '}
                  <span style={{ fontSize: '12px', color: '#6b7079' }}>{'Draft saved'}</span>{' '}
                </div>{' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {' '}
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#a7abb2' }}>{'Post to'}</span>{' '}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {' '}
                    {$arr($v['chips']).map((c, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <span
                          data-demo={`chip-${$index ?? ''}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '6px 11px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            border: `1px solid ${c?.border ?? ''}`,
                            background: `${c?.bg ?? ''}`,
                            color: `${c?.color ?? ''}`,
                            transition: 'background .2s,color .2s,border-color .2s',
                          }}
                        >
                          {' '}
                          <span
                            style={{
                              width: '13px',
                              height: '13px',
                              background: 'currentColor',
                              WebkitMask: `${c?.logo ?? ''} center/contain no-repeat`,
                              mask: `${c?.logo ?? ''} center/contain no-repeat`,
                            }}
                          />
                          {$t(c?.label)}{' '}
                        </span>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${$v['captionBorder'] ?? ''}`,
                    borderRadius: '10px',
                    background: '#0f1113',
                    transition: 'border-color .2s',
                  }}
                >
                  {' '}
                  <div
                    data-demo="caption"
                    style={{ minHeight: '104px', padding: '13px 14px', fontSize: '15px', lineHeight: '1.55' }}
                  >
                    {$t($v['caption'])}
                    <span
                      style={{
                        display: 'inline-block',
                        width: '1.5px',
                        height: '17px',
                        marginLeft: '1px',
                        verticalAlign: '-3px',
                        background: '#f6f5f1',
                        opacity: `${$v['cursorOp'] ?? ''}`,
                      }}
                    />
                  </div>{' '}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderTop: '1px solid #1f2227',
                    }}
                  >
                    {' '}
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '7px',
                        background: 'linear-gradient(160deg,#8a6d4f,#5d4a36)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '4px 5px',
                        color: '#f3e9d8',
                        fontWeight: '800',
                        fontSize: '8px',
                        lineHeight: '.95',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {'Fall'}
                      <br />
                      {'field kit'}
                    </div>{' '}
                    <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500' }}>{'fall-kit.jpg'}</span>
                      <span style={{ fontSize: '11px', color: '#6b7079' }}>{'2400 × 2400 · 2.4 MB'}</span>
                    </span>{' '}
                    <span style={{ flex: '1' }} />{' '}
                    <span style={{ font: "12px 'Geist Mono',monospace", color: '#6b7079' }}>
                      {$t($v['charLabel'])}
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'stretch', marginTop: 'auto' }}
                >
                  {' '}
                  <div
                    data-demo="time"
                    style={{
                      flex: '1 1 180px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      border: `1px solid ${$v['timeBorder'] ?? ''}`,
                      borderRadius: '9px',
                      background: '#0f1113',
                      transition: 'border-color .2s',
                    }}
                  >
                    {' '}
                    <span style={{ fontSize: '12px', color: '#6b7079' }}>{'Schedule'}</span>{' '}
                    <span
                      style={{
                        fontWeight: '500',
                        fontSize: '14px',
                        color: `${$v['timeColor'] ?? ''}`,
                        transition: 'color .2s',
                      }}
                    >
                      {$t($v['timeLabel'])}
                    </span>{' '}
                  </div>{' '}
                  <span
                    data-demo="btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      borderRadius: '9px',
                      fontWeight: '600',
                      fontSize: '14px',
                      background: '#dcff2e',
                      color: '#15171a',
                      transform: `scale(${$v['btnScale'] ?? ''})`,
                      transition: 'transform .12s',
                    }}
                  >
                    {$t($v['btnLabel'])}
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div
                data-demo="rest"
                style={{
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: '#0f1113',
                  minWidth: '0',
                }}
              >
                {' '}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '10px',
                    paddingBottom: '6px',
                  }}
                >
                  {' '}
                  <span style={{ fontWeight: '700', fontSize: '15px' }}>{'Queue'}</span>{' '}
                  <span style={{ fontSize: '12px', color: '#6b7079' }}>{'Tue, Oct 27'}</span>{' '}
                </div>{' '}
                {$arr($v['rows']).map((r, $index) => (
                  <Fragment key={$index}>
                    {' '}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto minmax(0,1fr) auto',
                        gap: '11px',
                        alignItems: 'center',
                        padding: '10px 11px',
                        border: '1px solid #1f2227',
                        borderRadius: '10px',
                        background: '#15171a',
                        opacity: `${r?.op ?? ''}`,
                        transform: `translateY(${r?.ty ?? ''}px)`,
                        transition: 'opacity .45s,transform .45s cubic-bezier(.2,.8,.2,1)',
                      }}
                    >
                      {' '}
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `${r?.tile ?? ''}`,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            width: '15px',
                            height: '15px',
                            background: '#ffffff',
                            WebkitMask: `${r?.logo ?? ''} center/contain no-repeat`,
                            mask: `${r?.logo ?? ''} center/contain no-repeat`,
                          }}
                        />
                      </span>{' '}
                      <div style={{ minWidth: '0', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {' '}
                        <div style={{ display: 'flex', gap: '7px', alignItems: 'baseline', minWidth: '0' }}>
                          {' '}
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{$t(r?.label)}</span>{' '}
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#6b7079',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {$t(r?.handle)}
                          </span>{' '}
                        </div>{' '}
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#a7abb2',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {$t(r?.text)}
                        </span>{' '}
                      </div>{' '}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                        {' '}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: `${r?.pillColor ?? ''}`,
                            transition: 'color .3s',
                          }}
                        >
                          {$t(r?.status)}
                        </span>{' '}
                        <span style={{ font: "11px 'Geist Mono',monospace", color: '#6b7079' }}>
                          {$t(r?.meta)}
                        </span>{' '}
                      </div>{' '}
                    </div>{' '}
                  </Fragment>
                ))}{' '}
              </div>{' '}
            </div>{' '}
            <div
              style={{
                position: 'absolute',
                left: '0',
                top: '0',
                transform: `translate(${$v['cx'] ?? ''}px,${$v['cy'] ?? ''}px)`,
                transition: 'transform .75s cubic-bezier(.65,0,.25,1),opacity .4s',
                opacity: `${$v['curOp'] ?? ''}`,
                pointerEvents: 'none',
                zIndex: '5',
              }}
            >
              {' '}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                style={{
                  display: 'block',
                  transform: `scale(${$v['curScale'] ?? ''})`,
                  transformOrigin: '3px 3px',
                  transition: 'transform .12s',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))',
                }}
              >
                <path
                  d="M4 2.5 L4 19 L8.6 14.8 L11.6 21.2 L14.4 19.9 L11.5 13.6 L17.6 13.4 Z"
                  fill="#f6f5f1"
                  stroke="#15171a"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>{' '}
            </div>{' '}
          </div>{' '}
        </header>{' '}
        <section data-screen-label="Platforms" style={{ padding: '48px 0 24px' }}>
          {' '}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
            {' '}
            <span style={{ fontSize: '15px', color: '#a7abb2' }}>{'Posts to ten platforms'}</span>{' '}
            <div
              style={{
                width: '100%',
                overflow: 'hidden',
                WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)',
                maskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)',
              }}
            >
              {' '}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  width: 'max-content',
                  animation: 'sfyMarquee 38s linear infinite',
                }}
              >
                {' '}
                {$arr($v['marquee']).map((p, $index) => (
                  <Fragment key={$index}>
                    {' '}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px 12px 12px',
                        borderRadius: '16px',
                        border: '1px solid #22252a',
                        background: '#121417',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#f6f5f1',
                        whiteSpace: 'nowrap',
                        transition: 'border-color .2s,transform .2s',
                      }}
                      className="landing-hover-4"
                    >
                      {' '}
                      <span
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '11px',
                          background: `${p?.tile ?? ''}`,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            background: '#ffffff',
                            WebkitMask: `${p?.logo ?? ''} center/contain no-repeat`,
                            mask: `${p?.logo ?? ''} center/contain no-repeat`,
                          }}
                        />
                      </span>
                      {$t(p?.label)}{' '}
                    </span>{' '}
                  </Fragment>
                ))}{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section data-screen-label="Fan-out" style={{ padding: '120px 24px 40px' }}>
          {' '}
          <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {' '}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {' '}
              <h2
                style={{
                  margin: '0',
                  fontSize: 'clamp(34px,5.4vw,72px)',
                  lineHeight: '1',
                  letterSpacing: '-0.045em',
                  fontWeight: '700',
                  textWrap: 'balance',
                }}
              >
                {'Ten platforms out.'}
              </h2>{' '}
              <p style={{ margin: '0', maxWidth: '520px', color: '#a7abb2', textWrap: 'pretty' }}>
                {'Images, videos, carousels and plain text all go out at once, each formatted for where it lands.'}
              </p>{' '}
            </div>{' '}
            <div
              data-reveal=""
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1000/560',
                border: '1px solid #1f2227',
                borderRadius: '24px',
                background: 'radial-gradient(120% 90% at 30% 50%,#121417 0%,#0c0d0f 70%)',
                overflow: 'hidden',
              }}
            >
              {' '}
              {$t($v['fanSvg'])}{' '}
              <div
                style={{
                  position: 'absolute',
                  left: '6%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '27%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(6px,.9vw,12px)',
                  padding: 'clamp(8px,1.2vw,16px)',
                  borderRadius: 'clamp(10px,1.4vw,16px)',
                  border: '1px solid #2a2e34',
                  background: '#15171a',
                  boxShadow: '0 30px 60px -30px rgba(0,0,0,.9)',
                }}
              >
                {' '}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px,.8vw,10px)' }}>
                  {' '}
                  <span
                    style={{
                      width: 'clamp(18px,2.4vw,30px)',
                      height: 'clamp(18px,2.4vw,30px)',
                      borderRadius: '50%',
                      background: 'linear-gradient(160deg,#9a7a58,#5d4a36)',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: '700',
                      fontSize: 'clamp(7px,.9vw,11px)',
                      flex: 'none',
                    }}
                  />{' '}
                  <span
                    style={{ display: 'flex', flexDirection: 'column', minWidth: '0', lineHeight: '1.2', flex: '1' }}
                  >
                    {' '}
                    <span style={{ fontWeight: '600', fontSize: 'clamp(9px,1.05vw,13px)', whiteSpace: 'nowrap' }}>
                      {'Field & Co.'}
                    </span>{' '}
                    <span
                      style={{
                        font: "clamp(8px,.85vw,11px) 'Geist Mono',monospace",
                        color: '#6b7079',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {'Tue · 9:00 AM'}
                    </span>{' '}
                  </span>{' '}
                  <span
                    style={{
                      padding: '1px clamp(5px,.6vw,8px)',
                      borderRadius: '999px',
                      background: '#dcff2e',
                      color: '#15171a',
                      fontSize: 'clamp(7px,.8vw,11px)',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {'10 accounts'}
                  </span>{' '}
                </div>{' '}
                <span style={{ fontSize: 'clamp(9px,1.1vw,14px)', lineHeight: '1.45', textWrap: 'pretty' }}>
                  {'The Fall field kit is live. Waxed canvas, brass hardware, built to take a beating.'}
                </span>{' '}
                <div
                  style={{
                    aspectRatio: '16/10',
                    borderRadius: 'clamp(6px,.8vw,10px)',
                    background: 'linear-gradient(160deg,#8a6d4f,#5d4a36)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 'clamp(6px,1vw,12px)',
                    color: '#f3e9d8',
                  }}
                >
                  {' '}
                  <span
                    style={{
                      fontWeight: '800',
                      fontSize: 'clamp(12px,1.8vw,24px)',
                      lineHeight: '.92',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {'Fall'}
                    <br />
                    {'field kit'}
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              {$arr($v['fanNodes']).map((n, $index) => (
                <Fragment key={$index}>
                  {' '}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${n?.left ?? ''}%`,
                      top: `${n?.top ?? ''}%`,
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(6px,1vw,12px)',
                    }}
                  >
                    {' '}
                    <span
                      style={{
                        width: 'clamp(22px,3.4vw,38px)',
                        height: 'clamp(22px,3.4vw,38px)',
                        borderRadius: '28%',
                        background: `${n?.tile ?? ''}`,
                        display: 'grid',
                        placeItems: 'center',
                        flex: 'none',
                        animation: `sfyArrive 2.4s ease-out ${n?.delay ?? ''}s infinite`,
                      }}
                    >
                      <span
                        style={{
                          width: '50%',
                          height: '50%',
                          background: '#ffffff',
                          WebkitMask: `${n?.logo ?? ''} center/contain no-repeat`,
                          mask: `${n?.logo ?? ''} center/contain no-repeat`,
                        }}
                      />
                    </span>{' '}
                    <span
                      style={{
                        fontSize: 'clamp(9px,1.2vw,14px)',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        color: '#f6f5f1',
                      }}
                    >
                      {$t(n?.label)}
                    </span>{' '}
                  </div>{' '}
                </Fragment>
              ))}{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section data-screen-label="Value" style={{ padding: '120px 24px 60px' }}>
          {' '}
          <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {' '}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: '24px',
              }}
            >
              {' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '720px' }}>
                {' '}
                <h2
                  style={{
                    margin: '0',
                    fontSize: 'clamp(34px,4.6vw,60px)',
                    lineHeight: '1.02',
                    letterSpacing: '-0.04em',
                    fontWeight: '700',
                    textWrap: 'balance',
                  }}
                >
                  {'One sitting. A week of posts. Every account.'}
                </h2>{' '}
              </div>{' '}
            </div>{' '}
            <div
              data-reveal=""
              style={{
                display: 'grid',
                gridTemplateColumns: `${$v['bentoCols'] ?? ''}`,
                gridTemplateRows: 'auto auto',
                gap: '16px',
              }}
            >
              {' '}
              <div
                style={{
                  gridRow: `${$v['bentoSpan'] ?? ''}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px',
                  padding: '28px',
                  borderRadius: '22px',
                  border: '1px solid #22252a',
                  background: '#0f1113',
                  minWidth: '0',
                }}
              >
                {' '}
                <div style={{ position: 'relative', flex: '1', minHeight: '330px' }}>
                  {' '}
                  {$arr($v['tabRows']).map((r, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          position: 'absolute',
                          left: '0',
                          right: '0',
                          top: '0',
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '0 12px',
                          borderRadius: '12px',
                          border: '1px solid #22252a',
                          background: '#15171a',
                          transform: `translateY(${r?.y ?? ''}px) scale(${r?.sc ?? ''})`,
                          opacity: `${r?.op ?? ''}`,
                          zIndex: `${r?.z ?? ''}`,
                          transition: `transform .7s cubic-bezier(.65,0,.25,1) ${r?.d ?? ''}s,opacity .5s ${r?.d ?? ''}s`,
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '7px',
                            background: `${r?.tile ?? ''}`,
                            display: 'grid',
                            placeItems: 'center',
                            flex: 'none',
                          }}
                        >
                          <span
                            style={{
                              width: '13px',
                              height: '13px',
                              background: '#ffffff',
                              WebkitMask: `${r?.logo ?? ''} center/contain no-repeat`,
                              mask: `${r?.logo ?? ''} center/contain no-repeat`,
                            }}
                          />
                        </span>{' '}
                        <span style={{ font: "12px 'Geist Mono',monospace", color: '#a7abb2', whiteSpace: 'nowrap' }}>
                          {$t(r?.host)}
                        </span>{' '}
                        <span
                          style={{
                            flex: '1',
                            minWidth: '0',
                            fontSize: '13px',
                            color: '#6b7079',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {'Paste caption, attach image, pick time…'}
                        </span>{' '}
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '6px',
                            border: '1px solid #2a2e34',
                            fontSize: '12px',
                            color: '#a7abb2',
                            flex: 'none',
                          }}
                        >
                          {'Post'}
                        </span>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                  <div
                    style={{
                      position: 'absolute',
                      left: '0',
                      right: '0',
                      top: '0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      padding: '18px',
                      borderRadius: '14px',
                      border: '1px solid #3a3e45',
                      background: '#17191c',
                      opacity: `${$v['oneOp'] ?? ''}`,
                      transform: `translateY(${$v['oneY'] ?? ''}px)`,
                      transition: 'opacity .5s .35s,transform .6s cubic-bezier(.2,.8,.2,1) .35s',
                      zIndex: '20',
                    }}
                  >
                    {' '}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {' '}
                      <img
                        src="/logos/schedule-for-you-glyph.svg"
                        alt=""
                        width="26"
                        height="26"
                        style={{ display: 'block' }}
                      />{' '}
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>{'New post'}</span>{' '}
                      <span style={{ flex: '1' }} />{' '}
                      <span style={{ display: 'flex' }}>
                        {' '}
                        {$arr($v['tabRows']).map((r, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <span
                              style={{
                                width: '24px',
                                height: '24px',
                                marginLeft: '-6px',
                                borderRadius: '50%',
                                border: '2px solid #17191c',
                                background: `${r?.tile ?? ''}`,
                                display: 'grid',
                                placeItems: 'center',
                              }}
                            >
                              <span
                                style={{
                                  width: '11px',
                                  height: '11px',
                                  background: '#ffffff',
                                  WebkitMask: `${r?.logo ?? ''} center/contain no-repeat`,
                                  mask: `${r?.logo ?? ''} center/contain no-repeat`,
                                }}
                              />
                            </span>{' '}
                          </Fragment>
                        ))}{' '}
                      </span>{' '}
                    </div>{' '}
                    <span style={{ fontSize: '15px', lineHeight: '1.5' }}>
                      {'The Fall field kit is live. Waxed canvas, brass hardware, built to take a beating.'}
                    </span>{' '}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        paddingTop: '12px',
                        borderTop: '1px solid #22252a',
                      }}
                    >
                      {' '}
                      <span style={{ fontSize: '13px', color: '#a7abb2' }}>{'Tue, Oct 27 · 9:00 AM'}</span>{' '}
                      <span style={{ flex: '1' }} />{' '}
                      <span
                        style={{
                          padding: '7px 13px',
                          borderRadius: '8px',
                          background: '#dcff2e',
                          color: '#15171a',
                          fontWeight: '600',
                          fontSize: '13px',
                        }}
                      >
                        {'Schedule 5 posts'}
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div
                    style={{
                      position: 'absolute',
                      left: '0',
                      right: '0',
                      top: '206px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
                      gap: '6px',
                      zIndex: '21',
                    }}
                  >
                    {' '}
                    {$arr($v['tabRows']).map((r, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 4px',
                            borderRadius: '12px',
                            background: '#15171a',
                            border: '1px solid #22252a',
                            opacity: `${r?.resOp ?? ''}`,
                            transform: `translateY(${r?.resY ?? ''}px)`,
                            transition: `opacity .4s ${r?.rd ?? ''}s,transform .5s cubic-bezier(.2,.8,.2,1) ${r?.rd ?? ''}s`,
                          }}
                        >
                          {' '}
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: `${r?.tile ?? ''}`,
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            <span
                              style={{
                                width: '14px',
                                height: '14px',
                                background: '#ffffff',
                                WebkitMask: `${r?.logo ?? ''} center/contain no-repeat`,
                                mask: `${r?.logo ?? ''} center/contain no-repeat`,
                              }}
                            />
                          </span>{' '}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#dcff2e',
                            }}
                          >
                            {'Queued'}
                          </span>{' '}
                        </div>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </div>{' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                  {' '}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                    {' '}
                    <h3
                      style={{
                        margin: '0',
                        fontSize: 'clamp(26px,2.6vw,34px)',
                        letterSpacing: '-0.035em',
                        lineHeight: '1.05',
                      }}
                    >
                      {'Time back'}
                    </h3>{' '}
                    <span style={{ fontSize: '15px', color: '#a7abb2' }}>{$t($v['tabCaption'])}</span>{' '}
                  </div>{' '}
                  <p style={{ margin: '0', color: '#a7abb2', maxWidth: '460px', textWrap: 'pretty' }}>
                    {
                      'Queue the week in one session. No more logging into five apps and pasting the same caption five times.'
                    }
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  padding: '28px',
                  borderRadius: '22px',
                  border: '1px solid #22252a',
                  background: '#0f1113',
                  minWidth: '0',
                }}
              >
                {' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {' '}
                  {$arr($v['echo']).map((e, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 10px',
                          borderRadius: '10px',
                          background: '#15171a',
                          minWidth: '0',
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            flex: 'none',
                            background: '#a7abb2',
                            WebkitMask: `${e?.logo ?? ''} center/contain no-repeat`,
                            mask: `${e?.logo ?? ''} center/contain no-repeat`,
                          }}
                        />{' '}
                        <span
                          style={{
                            minWidth: '0',
                            fontSize: '13px',
                            color: '#a7abb2',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {$t(e?.pre)}
                          <span
                            style={{
                              padding: '1px 3px',
                              margin: '0 -1px',
                              borderRadius: '4px',
                              background: `${e?.hl ?? ''}`,
                              color: `${e?.hc ?? ''}`,
                              transition: 'background .35s,color .35s',
                            }}
                          >
                            {$t(e?.key)}
                          </span>
                          {$t(e?.post)}
                        </span>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {' '}
                  <h3 style={{ margin: '0', fontSize: '24px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                    {'Consistent everywhere'}
                  </h3>{' '}
                  <p style={{ margin: '0', color: '#a7abb2', fontSize: '15px', textWrap: 'pretty' }}>
                    {
                      'One source caption keeps every platform on message. Reword it per account only where the audience is different.'
                    }
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  padding: '28px',
                  borderRadius: '22px',
                  border: '1px solid #22252a',
                  background: '#0f1113',
                  minWidth: '0',
                }}
              >
                {' '}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {' '}
                  {$arr($v['checks']).map((c, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '9px 2px',
                          borderBottom: '1px solid #1c1f23',
                          minWidth: '0',
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            flex: 'none',
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            border: `1.5px solid ${c?.ring ?? ''}`,
                            background: `${c?.fill ?? ''}`,
                            color: '#15171a',
                            transition: 'all .3s',
                          }}
                        >
                          {$t(c?.icon)}
                        </span>{' '}
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            flex: 'none',
                            background: '#f6f5f1',
                            WebkitMask: `${c?.logo ?? ''} center/contain no-repeat`,
                            mask: `${c?.logo ?? ''} center/contain no-repeat`,
                          }}
                        />{' '}
                        <span style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>{$t(c?.rule)}</span>{' '}
                        <span style={{ flex: '1' }} />{' '}
                        <span
                          style={{
                            font: "12px 'Geist Mono',monospace",
                            color: `${c?.noteColor ?? ''}`,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            transition: 'color .3s',
                          }}
                        >
                          {$t(c?.note)}
                        </span>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {' '}
                  <h3 style={{ margin: '0', fontSize: '24px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                    {'Checks before it posts'}
                  </h3>{' '}
                  <p style={{ margin: '0', color: '#a7abb2', fontSize: '15px', textWrap: 'pretty' }}>
                    {
                      'Character limits, image counts and media rules are checked per platform while you write, so nothing fails at 9 AM.'
                    }
                  </p>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section
          id="features"
          data-screen-label="Features"
          ref={$v['featRef']}
          style={{ position: 'relative', height: `${$v['featH'] ?? ''}` }}
        >
          {' '}
          <div
            style={{
              position: `${$v['featPos'] ?? ''}`,
              top: '0',
              minHeight: `${$v['featMinH'] ?? ''}`,
              display: 'flex',
              alignItems: 'center',
              padding: '72px 24px',
            }}
          >
            {' '}
            <div
              style={{
                maxWidth: '1120px',
                width: '100%',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: `${$v['featCols'] ?? ''}`,
                gap: '56px',
                alignItems: 'center',
              }}
            >
              {' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', minWidth: '0' }}>
                {' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {' '}
                  <h2
                    style={{
                      margin: '0',
                      fontSize: 'clamp(34px,4.2vw,56px)',
                      lineHeight: '1.02',
                      letterSpacing: '-0.04em',
                      fontWeight: '700',
                      textWrap: 'balance',
                    }}
                  >
                    {'Built for people who post a lot.'}
                  </h2>{' '}
                </div>{' '}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {' '}
                  {$arr($v['featSteps']).map((f, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <button
                        onClick={f?.go}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2px minmax(0,1fr)',
                          gap: '22px',
                          padding: '0',
                          border: '0',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            position: 'relative',
                            background: '#22252a',
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: '0',
                              right: '0',
                              top: '0',
                              height: `${f?.fill ?? ''}%`,
                              background: '#dcff2e',
                              transition: 'height .15s linear',
                            }}
                          />
                        </span>{' '}
                        <span style={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
                          {' '}
                          <span style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            {' '}
                            <span
                              style={{
                                fontSize: 'clamp(20px,2.2vw,28px)',
                                fontWeight: '700',
                                letterSpacing: '-0.03em',
                                lineHeight: '1.15',
                                color: `${f?.color ?? ''}`,
                                transition: 'color .3s',
                              }}
                            >
                              {$t(f?.title)}
                            </span>{' '}
                          </span>{' '}
                          <span
                            style={{
                              display: 'grid',
                              gridTemplateRows: `${f?.rows ?? ''}`,
                              transition: 'grid-template-rows .45s cubic-bezier(.2,.8,.2,1)',
                            }}
                          >
                            {' '}
                            <span style={{ overflow: 'hidden' }}>
                              {' '}
                              <span
                                style={{
                                  display: 'block',
                                  padding: '10px 0 0',
                                  color: '#a7abb2',
                                  maxWidth: '440px',
                                  textWrap: 'pretty',
                                }}
                              >
                                {$t(f?.body)}
                              </span>{' '}
                            </span>{' '}
                          </span>{' '}
                        </span>{' '}
                      </button>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
              </div>{' '}
              <div style={{ position: 'relative', height: '500px', minWidth: '0' }}>
                {' '}
                <div
                  style={{
                    position: 'absolute',
                    inset: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    padding: '22px',
                    borderRadius: '22px',
                    border: '1px solid #2a2e34',
                    background: '#121417',
                    boxShadow: '0 40px 90px -40px rgba(0,0,0,.95)',
                    opacity: `${$v['v0']?.op ?? ''}`,
                    transform: `translateY(${$v['v0']?.y ?? ''}px) scale(${$v['v0']?.sc ?? ''})`,
                    pointerEvents: `${$v['v0']?.pe ?? ''}`,
                    transition: 'opacity .5s,transform .6s cubic-bezier(.2,.8,.2,1)',
                  }}
                >
                  {' '}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      padding: '4px',
                      borderRadius: '12px',
                      background: '#0c0d0f',
                      border: '1px solid #1f2227',
                    }}
                  >
                    {' '}
                    {$arr($v['tabs']).map((t, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={t?.select}
                          style={{
                            flex: '1 1 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            border: '0',
                            padding: '8px 10px',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: `${t?.bg ?? ''}`,
                            color: `${t?.color ?? ''}`,
                            transition: 'background .25s,color .25s',
                          }}
                        >
                          {' '}
                          <span
                            style={{
                              width: '13px',
                              height: '13px',
                              background: 'currentColor',
                              WebkitMask: `${t?.logo ?? ''} center/contain no-repeat`,
                              mask: `${t?.logo ?? ''} center/contain no-repeat`,
                            }}
                          />
                          {$t(t?.label)}{' '}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                  <div
                    style={{
                      flex: '1',
                      minHeight: '0',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '14px',
                      border: '1px solid #1f2227',
                      background: '#0c0d0f',
                      overflow: 'hidden',
                    }}
                  >
                    {' '}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px 0' }}>
                      {' '}
                      <span
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: 'linear-gradient(160deg,#9a7a58,#5d4a36)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: '700',
                          fontSize: '11px',
                        }}
                      />{' '}
                      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.25' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{'Field & Co.'}</span>
                        <span style={{ fontSize: '12px', color: '#6b7079' }}>{$t($v['tabHandle'])}</span>
                      </span>{' '}
                    </div>{' '}
                    <div
                      style={{
                        flex: '1',
                        padding: '12px 16px',
                        whiteSpace: 'pre-wrap',
                        fontSize: '15px',
                        lineHeight: '1.55',
                        textWrap: 'pretty',
                        overflow: 'hidden',
                      }}
                    >
                      {$t($v['tabText'])}
                    </div>{' '}
                  </div>{' '}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {' '}
                    <svg
                      width="38"
                      height="38"
                      viewBox="0 0 36 36"
                      style={{ display: 'block', transform: 'rotate(-90deg)' }}
                    >
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#22252a" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#dcff2e"
                        strokeWidth="3"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray={$v['ringDash']}
                        style={{ transition: 'stroke-dasharray .5s cubic-bezier(.2,.8,.2,1)' }}
                      />
                    </svg>{' '}
                    <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                      {' '}
                      <span style={{ font: "13px 'Geist Mono',monospace", color: '#f6f5f1' }}>
                        {$t($v['tabCount'])}
                      </span>{' '}
                      <span style={{ fontSize: '12px', color: '#6b7079' }}>{$t($v['tabNote'])}</span>{' '}
                    </span>{' '}
                    <span style={{ flex: '1' }} />{' '}
                    <span style={{ fontSize: '12px', color: '#6b7079' }}>
                      {'Same post, rewritten for '}
                      {$t($v['tabLabel'])}
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{
                    position: 'absolute',
                    inset: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    padding: '22px',
                    borderRadius: '22px',
                    border: '1px solid #2a2e34',
                    background: '#121417',
                    boxShadow: '0 40px 90px -40px rgba(0,0,0,.95)',
                    opacity: `${$v['v1']?.op ?? ''}`,
                    transform: `translateY(${$v['v1']?.y ?? ''}px) scale(${$v['v1']?.sc ?? ''})`,
                    pointerEvents: `${$v['v1']?.pe ?? ''}`,
                    transition: 'opacity .5s,transform .6s cubic-bezier(.2,.8,.2,1)',
                  }}
                >
                  {' '}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    {' '}
                    <span style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.02em' }}>
                      {'October 26 – November 1'}
                    </span>{' '}
                    <span style={{ font: "12px 'Geist Mono',monospace", color: '#6b7079' }}>
                      {$t($v['weekCount'])}
                    </span>{' '}
                  </div>{' '}
                  <div
                    style={{ flex: '1', display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: '6px' }}
                  >
                    {' '}
                    {$arr($v['weekLive']).map((d, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            padding: '10px 6px',
                            borderRadius: '12px',
                            background: `${d?.bg ?? ''}`,
                            border: `1px solid ${d?.border ?? ''}`,
                            transition: 'background .3s,border-color .3s',
                            minWidth: '0',
                          }}
                        >
                          {' '}
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7079' }}>
                            {$t(d?.dow)}
                          </span>{' '}
                          <span
                            style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1' }}
                          >
                            {$t(d?.num)}
                          </span>{' '}
                          {$arr(d?.posts).map((e, $index) => (
                            <Fragment key={$index}>
                              {' '}
                              <span
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  padding: '7px 6px',
                                  borderRadius: '8px',
                                  background: `${e?.bg ?? ''}`,
                                  color: `${e?.fg ?? ''}`,
                                  opacity: `${e?.op ?? ''}`,
                                  transform: `translateY(${e?.y ?? ''}px)`,
                                  transition: 'opacity .4s,transform .5s cubic-bezier(.2,.8,.2,1),background .3s',
                                }}
                                className="landing-hover-5"
                              >
                                {' '}
                                <span style={{ font: "10px 'Geist Mono',monospace" }}>{$t(e?.time)}</span>{' '}
                                <span style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {' '}
                                  {$arr(e?.icons).map((c, $index) => (
                                    <Fragment key={$index}>
                                      {' '}
                                      <span
                                        style={{
                                          width: '10px',
                                          height: '10px',
                                          background: 'currentColor',
                                          WebkitMask: `${c ?? ''} center/contain no-repeat`,
                                          mask: `${c ?? ''} center/contain no-repeat`,
                                        }}
                                      />{' '}
                                    </Fragment>
                                  ))}{' '}
                                </span>{' '}
                              </span>{' '}
                            </Fragment>
                          ))}{' '}
                        </div>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#0c0d0f',
                      border: '1px solid #1f2227',
                      opacity: `${$v['dropOp'] ?? ''}`,
                      transition: 'opacity .4s',
                    }}
                  >
                    {' '}
                    <span style={{ fontSize: '13px' }}>
                      {'Added '}
                      <strong>{'Thu 15:00'}</strong>
                      {' · Fall field kit restock'}
                    </span>{' '}
                    <span style={{ flex: '1' }} />{' '}
                    <span style={{ font: "12px 'Geist Mono',monospace", color: '#6b7079' }}>
                      {'X · Threads · Bluesky'}
                    </span>{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{
                    position: 'absolute',
                    inset: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '22px',
                    border: '1px solid #2a2e34',
                    background: '#0c0d0f',
                    boxShadow: '0 40px 90px -40px rgba(0,0,0,.95)',
                    overflow: 'hidden',
                    opacity: `${$v['v2']?.op ?? ''}`,
                    transform: `translateY(${$v['v2']?.y ?? ''}px) scale(${$v['v2']?.sc ?? ''})`,
                    pointerEvents: `${$v['v2']?.pe ?? ''}`,
                    transition: 'opacity .5s,transform .6s cubic-bezier(.2,.8,.2,1)',
                  }}
                >
                  {' '}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px',
                      borderBottom: '1px solid #1f2227',
                      background: '#121417',
                    }}
                  >
                    {' '}
                    {$arr($v['codeTabs']).map((t, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={t?.select}
                          style={{
                            border: '0',
                            padding: '6px 12px',
                            borderRadius: '7px',
                            cursor: 'pointer',
                            font: "500 12px 'Geist Mono',monospace",
                            background: `${t?.bg ?? ''}`,
                            color: `${t?.color ?? ''}`,
                            transition: 'background .2s',
                          }}
                        >
                          {$t(t?.label)}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                    <span style={{ flex: '1' }} />{' '}
                    <button
                      onClick={$v['copy']}
                      style={{
                        border: '1px solid #2a2e34',
                        padding: '5px 12px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: 'transparent',
                        color: '#a7abb2',
                        transition: 'border-color .2s,color .2s',
                      }}
                      className="landing-hover-6"
                    >
                      {$t($v['copyLabel'])}
                    </button>{' '}
                  </div>{' '}
                  {$v['isChat'] ? (
                    <>
                      {' '}
                      <div
                        style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '14px', padding: '22px' }}
                      >
                        {' '}
                        <div
                          style={{
                            alignSelf: 'flex-end',
                            maxWidth: '85%',
                            padding: '12px 14px',
                            borderRadius: '14px 14px 4px 14px',
                            background: '#22252a',
                            fontSize: '15px',
                            lineHeight: '1.5',
                          }}
                        >
                          {$t($v['chatPrompt'])}
                          <span
                            style={{
                              display: 'inline-block',
                              width: '1.5px',
                              height: '16px',
                              marginLeft: '1px',
                              verticalAlign: '-3px',
                              background: '#f6f5f1',
                              opacity: `${$v['chatCursor'] ?? ''}`,
                            }}
                          />
                        </div>{' '}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            opacity: `${$v['chatToolOp'] ?? ''}`,
                            transform: `translateY(${$v['chatToolY'] ?? ''}px)`,
                            transition: 'opacity .4s,transform .5s cubic-bezier(.2,.8,.2,1)',
                          }}
                        >
                          {' '}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              padding: '12px 14px',
                              borderRadius: '12px',
                              border: '1px solid #22252a',
                              background: '#121417',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                color: '#a7abb2',
                              }}
                            >
                              <img
                                src="/logos/schedule-for-you-glyph.svg"
                                alt=""
                                width="14"
                                height="14"
                                style={{ display: 'block' }}
                              />
                              {'schedule-for-you · schedule_post'}
                            </span>{' '}
                            <span
                              style={{
                                font: "12px/1.6 'Geist Mono',monospace",
                                color: '#c9ccd1',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {'{ "accounts": ["x", "bluesky"], "scheduled_at": "2026-10-27T09:00" }'}
                            </span>{' '}
                          </div>{' '}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              opacity: `${$v['chatDoneOp'] ?? ''}`,
                              transition: 'opacity .4s',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#dcff2e',
                                color: '#15171a',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '12px',
                                fontWeight: '800',
                              }}
                            >
                              {'✓'}
                            </span>{' '}
                            <span style={{ fontSize: '14px' }}>
                              {'Scheduled 2 posts for '}
                              <strong>{'Tue, Oct 27 · 9:00 AM'}</strong>
                              {'.'}
                            </span>{' '}
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </>
                  ) : null}{' '}
                  {$v['isRest'] ? (
                    <>
                      {' '}
                      <pre
                        style={{
                          flex: '1',
                          margin: '0',
                          padding: '22px',
                          font: "13px/1.7 'Geist Mono',monospace",
                          color: '#c9ccd1',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {$t($v['codeText'])}
                      </pre>{' '}
                    </>
                  ) : null}{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        {$v['showTestimonials'] ? (
          <>
            {' '}
            <section data-screen-label="Testimonials" style={{ padding: '80px 24px' }}>
              {' '}
              <div
                style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}
              >
                {' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '720px' }}>
                  {' '}
                  <h2
                    style={{
                      margin: '0',
                      fontSize: 'clamp(34px,4.6vw,60px)',
                      lineHeight: '1.02',
                      letterSpacing: '-0.04em',
                      fontWeight: '700',
                      textWrap: 'balance',
                    }}
                  >
                    {'People who stopped copy-pasting.'}
                  </h2>{' '}
                </div>{' '}
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}
                >
                  {' '}
                  {$arr($v['quotes']).map((q, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <figure
                        data-reveal=""
                        style={{
                          margin: '0',
                          padding: '28px',
                          border: '1px solid #22252a',
                          borderRadius: '18px',
                          background: '#0f1113',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '24px',
                          justifyContent: 'space-between',
                          transition: 'border-color .2s,transform .2s',
                        }}
                        className="landing-hover-7"
                      >
                        {' '}
                        <blockquote
                          style={{
                            margin: '0',
                            fontSize: '18px',
                            lineHeight: '1.5',
                            letterSpacing: '-0.01em',
                            textWrap: 'pretty',
                          }}
                        >
                          {'“'}
                          {$t(q?.text)}
                          {'”'}
                        </blockquote>{' '}
                        <figcaption
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            paddingTop: '18px',
                            borderTop: '1px solid #22252a',
                          }}
                        >
                          {' '}
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>{$t(q?.name)}</span>{' '}
                          <span style={{ fontSize: '13px', color: '#6b7079' }}>{$t(q?.role)}</span>{' '}
                        </figcaption>{' '}
                      </figure>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
              </div>{' '}
            </section>{' '}
          </>
        ) : null}{' '}
        <section id="pricing" data-screen-label="Pricing" style={{ padding: '80px 24px' }}>
          {' '}
          <div
            style={{
              maxWidth: '1120px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {' '}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              {' '}
              <h2
                style={{
                  margin: '0',
                  fontSize: 'clamp(34px,4.6vw,60px)',
                  lineHeight: '1.02',
                  letterSpacing: '-0.04em',
                  fontWeight: '700',
                }}
              >
                {'Simple pricing'}
              </h2>{' '}
              <p style={{ margin: '0', color: '#a7abb2' }}>{'Unlimited posts on every plan. Cancel whenever.'}</p>{' '}
            </div>{' '}
            <div
              data-reveal=""
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))',
                gap: '16px',
                width: '100%',
                maxWidth: '760px',
                textAlign: 'left',
              }}
            >
              {' '}
              <div
                style={{
                  padding: '30px',
                  border: '1px solid #22252a',
                  borderRadius: '20px',
                  background: '#0f1113',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {' '}
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '2px 10px',
                    borderRadius: '999px',
                    border: '1px solid #3a3e45',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {'Solo'}
                </span>{' '}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '52px', fontWeight: '700', letterSpacing: '-0.04em', lineHeight: '1' }}>
                    {'$19'}
                  </span>
                  <span style={{ color: '#6b7079' }}>{'/mo'}</span>
                </div>{' '}
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#a7abb2', fontSize: '15px' }}
                >
                  {' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'15 connected accounts'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Unlimited posts & scheduling'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Per-platform captions'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'API + MCP access'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Basic analytics'}
                  </span>{' '}
                </div>{' '}
                <a
                  href="/signup"
                  style={{
                    marginTop: 'auto',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '11px',
                    border: '1px solid #3a3e45',
                    fontWeight: '600',
                    transition: 'border-color .2s',
                  }}
                  className="landing-hover-8"
                >
                  {'Start 7-day trial'}
                </a>{' '}
              </div>{' '}
              <div
                style={{
                  position: 'relative',
                  padding: '30px',
                  border: '1px solid #dcff2e',
                  borderRadius: '20px',
                  background: '#15171a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: '0 30px 80px -40px rgba(220,255,46,.35)',
                }}
              >
                {' '}
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '2px 10px',
                    borderRadius: '999px',
                    background: '#dcff2e',
                    color: '#15171a',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {'Studio'}
                </span>{' '}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '52px', fontWeight: '700', letterSpacing: '-0.04em', lineHeight: '1' }}>
                    {'$59'}
                  </span>
                  <span style={{ color: '#6b7079' }}>{'/mo'}</span>
                </div>{' '}
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#a7abb2', fontSize: '15px' }}
                >
                  {' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Everything in Solo'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'100 connected accounts'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Team members'}
                  </span>{' '}
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#dcff2e' }}>{'✓'}</span>
                    {'Priority support'}
                  </span>{' '}
                </div>{' '}
                <a
                  href="/signup"
                  style={{
                    marginTop: 'auto',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '11px',
                    background: '#dcff2e',
                    color: '#15171a',
                    fontWeight: '600',
                    transition: 'transform .15s',
                  }}
                  className="landing-hover-1"
                >
                  {'Start 7-day trial'}
                </a>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <section data-screen-label="CTA" style={{ padding: '60px 24px 100px' }}>
          {' '}
          <div
            data-reveal=""
            style={{
              maxWidth: '1120px',
              margin: '0 auto',
              padding: 'clamp(40px,7vw,88px) clamp(24px,5vw,64px)',
              borderRadius: '28px',
              background: '#dcff2e',
              color: '#15171a',
              display: 'flex',
              flexDirection: 'column',
              gap: '26px',
              alignItems: 'flex-start',
            }}
          >
            {' '}
            <h2
              style={{
                margin: '0',
                fontSize: 'clamp(40px,7vw,96px)',
                lineHeight: '.95',
                letterSpacing: '-0.05em',
                fontWeight: '700',
                maxWidth: '900px',
                textWrap: 'balance',
              }}
            >
              {'Your next week of posts, done by lunch.'}
            </h2>{' '}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {' '}
              <a
                href="/signup"
                style={{
                  padding: '15px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  background: '#15171a',
                  color: '#f6f5f1',
                  transition: 'transform .15s',
                }}
                className="landing-hover-9"
              >
                {'Start posting free'}
              </a>{' '}
              <a
                href="#pricing"
                style={{
                  padding: '15px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: '1.5px solid #15171a',
                  color: '#15171a',
                }}
                className="landing-hover-a"
              >
                {'See pricing'}
              </a>{' '}
            </div>{' '}
          </div>{' '}
        </section>{' '}
        <footer style={{ borderTop: '1px solid #1f2227', padding: '28px 24px 44px' }}>
          {' '}
          <div
            style={{
              maxWidth: '1120px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: '#6b7079',
            }}
          >
            {' '}
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logos/schedule-for-you-glyph.svg" alt="" width="20" height="20" style={{ display: 'block' }} />
              {'© 2026 Schedule For You'}
            </span>{' '}
            <span style={{ display: 'flex', gap: '18px' }}>
              <a href="#features" style={{ color: '#6b7079' }}>
                {'Features'}
              </a>
              <a href="#pricing" style={{ color: '#6b7079' }}>
                {'Pricing'}
              </a>
              <a href="/login" style={{ color: '#6b7079' }}>
                {'Sign in'}
              </a>
            </span>{' '}
          </div>{' '}
        </footer>
      </div>
    </>
  );
}
