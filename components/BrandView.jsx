// Generated from the Claude Design prototype "Logo.dc.html".
import React, { Fragment } from 'react';
import { $arr, $t, $sx, $dv } from '../lib/dc';

export const css =
  '\n*{box-sizing:border-box}\nhtml,body{margin:0;background:#0c0d0f;color:#f6f5f1;font:15px/1.5 "Geist",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\na{color:#dcff2e;text-decoration:none}\na:hover{color:#f6f5f1}\n@keyframes lgDraw{0%{stroke-dashoffset:100;opacity:1}42%{stroke-dashoffset:0}88%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}\n@keyframes lgFade{0%{opacity:0}4%{opacity:1}88%{opacity:1}100%{opacity:0}}\n@keyframes lgRipple{0%,40%{transform:scale(1);opacity:0}43%{opacity:.9}78%{transform:scale(3);opacity:0}100%{opacity:0}}\n\n/* Phones: stack the brand sheet into one column */\n@media (max-width:760px){\n  section{padding:28px 16px!important;width:auto!important;max-width:100vw}\n  section [style*="grid-template-columns"]:not([style*="repeat(3,64px)"]){grid-template-columns:minmax(0,1fr)!important}\n  section [style*="display:flex"][style*="gap"]{flex-wrap:wrap}\n  section h1,section h2{overflow-wrap:anywhere}\n  html,body{overflow-x:hidden}\n  section [style*="padding:32px"]{padding:18px!important}\n  section [style*="padding:24px"]{padding:14px!important}\n  section [style*="gap:28px"]{gap:14px!important}\n}\n';

export function renderBrand($v) {
  return (
    <>
      <section style={{ padding: '56px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {' '}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {' '}
          <span style={{ font: "13px 'Geist Mono',monospace", color: '#dcff2e' }}>
            {'Turn 3 — Bold monograms · 3a selected'}
          </span>{' '}
          <h1 style={{ margin: '0', fontSize: '48px', letterSpacing: '-0.045em', lineHeight: '1' }}>
            {'One S, three ways.'}
          </h1>{' '}
          <p style={{ margin: '0', color: '#a7abb2', maxWidth: '720px', textWrap: 'pretty' }}>
            {
              'All three use the same custom S: two crescents that taper to sharp points at the ends and meet in a heavy spine, like a brush stroke in one motion. Solid filled shapes, so they hold up as an app icon, an avatar and a 16px favicon.'
            }
          </p>{' '}
        </div>{' '}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          {' '}
          <div
            id="3a"
            style={{
              width: '600px',
              border: '1px solid #22252a',
              borderRadius: '28px',
              background: '#0f1113',
              overflow: 'hidden',
            }}
          >
            {' '}
            <div
              style={{
                position: 'relative',
                height: '420px',
                display: 'grid',
                placeItems: 'center',
                background: '#0a0b0d',
              }}
            >
              {' '}
              <span
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: '#dcff2e',
                  color: '#15171a',
                  font: "600 12px 'Geist Mono',monospace",
                }}
              >
                {'3a'}
              </span>{' '}
              <svg
                width="260"
                height="260"
                viewBox="0 0 64 64"
                style={{ filter: 'drop-shadow(0 30px 50px rgba(220,255,46,.18))' }}
              >
                <rect x="9" y="13" width="46" height="44" rx="12" fill="#dcff2e" />
                <rect x="19" y="7" width="6" height="12" rx="3" fill="#dcff2e" stroke="#0a0b0d" strokeWidth="2.5" />
                <rect x="39" y="7" width="6" height="12" rx="3" fill="#dcff2e" stroke="#0a0b0d" strokeWidth="2.5" />
                <path
                  d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                  fill="#0a0b0d"
                  transform="translate(32 36) scale(.66) translate(-32 -32)"
                />
              </svg>{' '}
            </div>{' '}
            <div
              style={{
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                borderTop: '1px solid #22252a',
              }}
            >
              {' '}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>{'The Calendar S'}</strong>
                <span style={{ fontSize: '13px', color: '#6b7079' }}>{'Bold · container mark'}</span>
              </div>{' '}
              <p style={{ margin: '0', color: '#a7abb2', fontSize: '14px', textWrap: 'pretty' }}>
                {'A calendar page with the S cut through it. Says "scheduling" before anyone reads the name.'}
              </p>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '22px',
                  borderRadius: '16px',
                  background: '#f6f5f1',
                  color: '#15171a',
                }}
              >
                {' '}
                <svg width="52" height="52" viewBox="0 0 64 64">
                  <rect x="9" y="13" width="46" height="44" rx="12" fill="#15171a" />
                  <rect x="19" y="7" width="6" height="12" rx="3" fill="#15171a" stroke="#f6f5f1" strokeWidth="2.5" />
                  <rect x="39" y="7" width="6" height="12" rx="3" fill="#15171a" stroke="#f6f5f1" strokeWidth="2.5" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#dcff2e"
                    transform="translate(32 36) scale(.66) translate(-32 -32)"
                  />
                </svg>{' '}
                <span style={{ fontWeight: '800', fontSize: '34px', letterSpacing: '-0.055em', lineHeight: '1' }}>
                  {'schedule for you'}
                </span>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '22px',
                  borderRadius: '16px',
                  background: '#dcff2e',
                  color: '#15171a',
                }}
              >
                {' '}
                <svg width="52" height="52" viewBox="0 0 64 64">
                  <rect x="9" y="13" width="46" height="44" rx="12" fill="#15171a" />
                  <rect x="19" y="7" width="6" height="12" rx="3" fill="#15171a" stroke="#dcff2e" strokeWidth="2.5" />
                  <rect x="39" y="7" width="6" height="12" rx="3" fill="#15171a" stroke="#dcff2e" strokeWidth="2.5" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#dcff2e"
                    transform="translate(32 36) scale(.66) translate(-32 -32)"
                  />
                </svg>{' '}
                <span style={{ fontWeight: '800', fontSize: '34px', letterSpacing: '-0.055em', lineHeight: '1' }}>
                  {'schedule for you'}
                </span>{' '}
              </div>{' '}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '4px 2px' }}>
                {' '}
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="16" fill="#15171a" stroke="#2a2e34" />
                  <rect x="9" y="13" width="46" height="44" rx="12" fill="#dcff2e" />
                  <rect x="19" y="7" width="6" height="12" rx="3" fill="#dcff2e" stroke="#15171a" strokeWidth="2.5" />
                  <rect x="39" y="7" width="6" height="12" rx="3" fill="#dcff2e" stroke="#15171a" strokeWidth="2.5" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#15171a"
                    transform="translate(32 36) scale(.66) translate(-32 -32)"
                  />
                </svg>{' '}
                <svg width="32" height="32" viewBox="0 0 64 64">
                  <rect x="9" y="13" width="46" height="44" rx="12" fill="#dcff2e" />
                  <rect x="19" y="7" width="6" height="12" rx="3" fill="#dcff2e" stroke="#0f1113" strokeWidth="2.5" />
                  <rect x="39" y="7" width="6" height="12" rx="3" fill="#dcff2e" stroke="#0f1113" strokeWidth="2.5" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#0f1113"
                    transform="translate(32 36) scale(.7) translate(-32 -32)"
                  />
                </svg>{' '}
                <svg width="16" height="16" viewBox="0 0 64 64">
                  <rect x="9" y="13" width="46" height="44" rx="12" fill="#dcff2e" />
                  <rect x="19" y="7" width="6" height="12" rx="3" fill="#dcff2e" />
                  <rect x="39" y="7" width="6" height="12" rx="3" fill="#dcff2e" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#0f1113"
                    transform="translate(32 36) scale(.74) translate(-32 -32)"
                  />
                </svg>{' '}
                <span style={{ font: "11px 'Geist Mono',monospace", color: '#6b7079' }}>{'64 · 32 · 16'}</span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div
            id="3b"
            style={{
              width: '600px',
              border: '1px solid #22252a',
              borderRadius: '28px',
              background: '#0f1113',
              overflow: 'hidden',
            }}
          >
            {' '}
            <div
              style={{
                position: 'relative',
                height: '420px',
                display: 'grid',
                placeItems: 'center',
                background: '#dcff2e',
              }}
            >
              {' '}
              <span
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: '#15171a',
                  color: '#dcff2e',
                  font: "600 12px 'Geist Mono',monospace",
                }}
              >
                {'3b'}
              </span>{' '}
              <svg width="300" height="300" viewBox="0 0 64 64">
                <path
                  d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                  fill="#15171a"
                  transform="translate(32 32) scale(1.12) translate(-32 -32)"
                />
              </svg>{' '}
            </div>{' '}
            <div
              style={{
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                borderTop: '1px solid #22252a',
              }}
            >
              {' '}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>{'The Crescent S'}</strong>
                <span style={{ fontSize: '13px', color: '#6b7079' }}>{'Loud · gesture mark'}</span>
              </div>{' '}
              <p style={{ margin: '0', color: '#a7abb2', fontSize: '14px', textWrap: 'pretty' }}>
                {
                  'The S alone, no container. One confident shape that works the way a swoosh does: on a shirt, a sticker, a story frame.'
                }
              </p>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '22px',
                  borderRadius: '16px',
                  background: '#0a0b0d',
                }}
              >
                {' '}
                <svg width="50" height="50" viewBox="8 8 48 48">
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#dcff2e"
                  />
                </svg>{' '}
                <span
                  style={{
                    fontWeight: '800',
                    fontSize: '30px',
                    letterSpacing: '-0.03em',
                    lineHeight: '1',
                    textTransform: 'uppercase',
                  }}
                >
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '22px',
                  borderRadius: '16px',
                  background: '#f6f5f1',
                  color: '#15171a',
                }}
              >
                {' '}
                <svg width="50" height="50" viewBox="8 8 48 48">
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#15171a"
                  />
                </svg>{' '}
                <span
                  style={{
                    fontWeight: '800',
                    fontSize: '30px',
                    letterSpacing: '-0.03em',
                    lineHeight: '1',
                    textTransform: 'uppercase',
                  }}
                >
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '4px 2px' }}>
                {' '}
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="16" fill="#dcff2e" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#15171a"
                    transform="translate(32 32) scale(1.08) translate(-32 -32)"
                  />
                </svg>{' '}
                <svg width="32" height="32" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="16" fill="#dcff2e" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#15171a"
                    transform="translate(32 32) scale(1.08) translate(-32 -32)"
                  />
                </svg>{' '}
                <svg width="16" height="16" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="16" fill="#dcff2e" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#15171a"
                    transform="translate(32 32) scale(1.12) translate(-32 -32)"
                  />
                </svg>{' '}
                <span style={{ font: "11px 'Geist Mono',monospace", color: '#6b7079' }}>{'64 · 32 · 16'}</span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div
            id="3c"
            style={{
              width: '600px',
              border: '1px solid #22252a',
              borderRadius: '28px',
              background: '#0f1113',
              overflow: 'hidden',
            }}
          >
            {' '}
            <div
              style={{
                position: 'relative',
                height: '420px',
                display: 'grid',
                placeItems: 'center',
                background: '#15171a',
              }}
            >
              {' '}
              <span
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: '#2a2e34',
                  color: '#f6f5f1',
                  font: "600 12px 'Geist Mono',monospace",
                }}
              >
                {'3c'}
              </span>{' '}
              <svg width="290" height="290" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="31" fill="#0c0d0f" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#dcff2e" strokeWidth=".7" />
                <circle cx="32" cy="32" r="26.6" fill="none" stroke="#dcff2e" strokeWidth=".25" />
                <path
                  d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                  fill="#dcff2e"
                  transform="translate(32 32) scale(.8) translate(-32 -32)"
                />
              </svg>{' '}
            </div>{' '}
            <div
              style={{
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                borderTop: '1px solid #22252a',
              }}
            >
              {' '}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>{'The Seal'}</strong>
                <span style={{ fontSize: '13px', color: '#6b7079' }}>{'Luxury · editorial'}</span>
              </div>{' '}
              <p style={{ margin: '0', color: '#a7abb2', fontSize: '14px', textWrap: 'pretty' }}>
                {
                  "The S set in a fine double ring, paired with a high-contrast serif. Reads like a publisher's or atelier's mark."
                }
              </p>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '22px',
                  borderRadius: '16px',
                  background: '#0a0b0d',
                }}
              >
                {' '}
                <svg width="54" height="54" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="30" fill="none" stroke="#dcff2e" strokeWidth="1.4" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#dcff2e"
                    transform="translate(32 32) scale(.84) translate(-32 -32)"
                  />
                </svg>{' '}
                <span
                  style={{
                    fontFamily: "'Bodoni Moda',serif",
                    fontWeight: '600',
                    fontSize: '36px',
                    letterSpacing: '-0.02em',
                    lineHeight: '1',
                  }}
                >
                  {'Schedule '}
                  <em style={{ fontWeight: '500' }}>{'For'}</em>
                  {' You'}
                </span>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '22px',
                  borderRadius: '16px',
                  background: '#f6f5f1',
                  color: '#15171a',
                }}
              >
                {' '}
                <svg width="54" height="54" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="30" fill="none" stroke="#15171a" strokeWidth="1.4" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#15171a"
                    transform="translate(32 32) scale(.84) translate(-32 -32)"
                  />
                </svg>{' '}
                <span
                  style={{
                    fontFamily: "'Bodoni Moda',serif",
                    fontWeight: '600',
                    fontSize: '36px',
                    letterSpacing: '-0.02em',
                    lineHeight: '1',
                  }}
                >
                  {'Schedule '}
                  <em style={{ fontWeight: '500' }}>{'For'}</em>
                  {' You'}
                </span>{' '}
              </div>{' '}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '4px 2px' }}>
                {' '}
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="32" fill="#15171a" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#dcff2e" strokeWidth="1" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#dcff2e"
                    transform="translate(32 32) scale(.8) translate(-32 -32)"
                  />
                </svg>{' '}
                <svg width="32" height="32" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="32" fill="#15171a" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#dcff2e"
                    transform="translate(32 32) scale(.92) translate(-32 -32)"
                  />
                </svg>{' '}
                <svg width="16" height="16" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="32" fill="#15171a" />
                  <path
                    d="M28 35 A13.5 13.5 0 1 1 44 17 A8 8 0 1 0 36 29 A13.5 13.5 0 1 1 20 47 A8 8 0 1 0 28 35 Z"
                    fill="#dcff2e"
                    transform="translate(32 32) scale(.98) translate(-32 -32)"
                  />
                </svg>{' '}
                <span style={{ font: "11px 'Geist Mono',monospace", color: '#6b7079' }}>{'64 · 32 · 16'}</span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>
      </section>
      <section
        id="2a"
        style={{ padding: '56px', display: 'flex', flexDirection: 'column', gap: '24px', width: '1480px' }}
      >
        {' '}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {' '}
          <span
            style={{
              padding: '2px 10px',
              borderRadius: '999px',
              background: '#dcff2e',
              color: '#15171a',
              font: "600 12px 'Geist Mono',monospace",
            }}
          >
            {'2a'}
          </span>{' '}
          <span style={{ font: "13px 'Geist Mono',monospace", color: '#a7abb2' }}>
            {'Turn 2 — The Route S · brand mark'}
          </span>{' '}
        </div>{' '}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '560px 1fr',
            border: '1px solid #22252a',
            borderRadius: '28px',
            overflow: 'hidden',
            background: '#0f1113',
          }}
        >
          {' '}
          <div
            style={{
              height: '560px',
              display: 'grid',
              placeItems: 'center',
              background: '#0a0b0d',
              backgroundImage: 'radial-gradient(#1a1d21 1px,transparent 1px)',
              backgroundSize: '24px 24px',
              borderRight: '1px solid #22252a',
            }}
          >
            {' '}
            <div
              style={{ filter: 'drop-shadow(0 40px 60px rgba(0,0,0,.7)) drop-shadow(0 0 80px rgba(220,255,46,.08))' }}
            >
              {$t($v['heroMark'])}
            </div>{' '}
          </div>{' '}
          <div
            style={{ padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px' }}
          >
            {' '}
            <span style={{ font: "13px 'Geist Mono',monospace", color: '#dcff2e' }}>{'The idea'}</span>{' '}
            <h2
              style={{ margin: '0', fontSize: '64px', lineHeight: '.98', letterSpacing: '-0.05em', fontWeight: '700' }}
            >
              {'One route.'}
              <br />
              {'Draft to live.'}
            </h2>{' '}
            <p
              style={{
                margin: '0',
                fontSize: '19px',
                lineHeight: '1.55',
                color: '#a7abb2',
                maxWidth: '560px',
                textWrap: 'pretty',
              }}
            >
              {
                "The S is a single continuous stroke built from two equal arcs, like a route on a transit map. A post travels it from the top terminal, where it's written, to the lime node at the end, where it goes live."
              }
            </p>{' '}
            <p
              style={{
                margin: '0',
                fontSize: '19px',
                lineHeight: '1.55',
                color: '#a7abb2',
                maxWidth: '560px',
                textWrap: 'pretty',
              }}
            >
              {
                'The lime node is the one place the accent appears. It means the same thing in the logo that it means in the product: published.'
              }
            </p>{' '}
            <div style={{ display: 'flex', gap: '28px', paddingTop: '8px', borderTop: '1px solid #22252a' }}>
              {' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#15171a',
                    border: '1px solid #2a2e34',
                  }}
                />
                <span style={{ font: "12px 'Geist Mono',monospace", color: '#a7abb2' }}>{'Ink #15171A'}</span>
              </div>{' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f6f5f1' }} />
                <span style={{ font: "12px 'Geist Mono',monospace", color: '#a7abb2' }}>{'Paper #F6F5F1'}</span>
              </div>{' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcff2e' }} />
                <span style={{ font: "12px 'Geist Mono',monospace", color: '#a7abb2' }}>{'Live #DCFF2E'}</span>
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {' '}
          <div
            style={{
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              padding: '32px',
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            {' '}
            <svg width="300" height="300" viewBox="0 0 64 64" style={{ display: 'block' }}>
              {' '}
              <rect width="64" height="64" rx="18" fill="#15171a" />{' '}
              <path
                d="M8 0V64M16 0V64M24 0V64M32 0V64M40 0V64M48 0V64M56 0V64M0 8H64M0 16H64M0 24H64M0 32H64M0 40H64M0 48H64M0 56H64"
                stroke="#23272c"
                strokeWidth=".2"
              />{' '}
              <circle cx="32" cy="21" r="11" fill="none" stroke="#6b7079" strokeWidth=".25" strokeDasharray="1 1" />{' '}
              <circle cx="32" cy="43" r="11" fill="none" stroke="#6b7079" strokeWidth=".25" strokeDasharray="1 1" />{' '}
              <path d="M32 21 L41.01 14.69 M32 43 L22.99 49.31" stroke="#6b7079" strokeWidth=".25" />{' '}
              <path
                d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                fill="none"
                stroke="#f6f5f1"
                strokeOpacity=".9"
                strokeWidth="7.5"
                strokeLinecap="round"
              />{' '}
              <circle cx="22.99" cy="49.31" r="6" fill="#dcff2e" /> <circle cx="32" cy="21" r=".9" fill="#dcff2e" />{' '}
              <circle cx="32" cy="43" r=".9" fill="#dcff2e" />{' '}
            </svg>{' '}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {' '}
              <strong style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>{'Construction'}</strong>{' '}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#a7abb2' }}
              >
                {' '}
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderBottom: '1px solid #22252a',
                    paddingBottom: '10px',
                  }}
                >
                  <span>{'Arcs'}</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", color: '#f6f5f1' }}>{'2 × r11, stacked'}</span>
                </span>{' '}
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderBottom: '1px solid #22252a',
                    paddingBottom: '10px',
                  }}
                >
                  <span>{'Stroke'}</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", color: '#f6f5f1' }}>{'7.5 / 64, round'}</span>
                </span>{' '}
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderBottom: '1px solid #22252a',
                    paddingBottom: '10px',
                  }}
                >
                  <span>{'Terminals'}</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", color: '#f6f5f1' }}>{'35° off axis'}</span>
                </span>{' '}
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderBottom: '1px solid #22252a',
                    paddingBottom: '10px',
                  }}
                >
                  <span>{'Live node'}</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", color: '#f6f5f1' }}>{'r6, on the end'}</span>
                </span>{' '}
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span>{'Tile corner'}</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", color: '#f6f5f1' }}>{'18 / 64'}</span>
                </span>{' '}
              </div>{' '}
              <p style={{ margin: '0', fontSize: '13px', color: '#6b7079', textWrap: 'pretty' }}>
                {
                  'Both terminals sit on the same 35° diagonal, so the mark has point symmetry and reads as balanced at any size.'
                }
              </p>{' '}
            </div>{' '}
          </div>{' '}
          <div
            style={{
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {' '}
            <strong style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>{'Scale'}</strong>{' '}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '28px',
                padding: '24px',
                borderRadius: '16px',
                background: '#0a0b0d',
              }}
            >
              {' '}
              {$arr($v['sizes']).map((s, $index) => (
                <Fragment key={$index}>
                  {' '}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    {' '}
                    <svg
                      width={s?.px}
                      height={s?.px}
                      viewBox="0 0 64 64"
                      style={{ display: 'block', boxShadow: '0 0 0 1px #2a2e34', borderRadius: '28%' }}
                    >
                      <rect width="64" height="64" rx="18" fill="#15171a" />
                      <path
                        d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                        fill="none"
                        stroke="#f6f5f1"
                        strokeWidth={s?.sw}
                        strokeLinecap="round"
                      />
                      <circle cx="22.99" cy="49.31" r={s?.r} fill="#dcff2e" />
                    </svg>{' '}
                    <span style={{ font: "11px 'Geist Mono',monospace", color: '#6b7079' }}>{$t(s?.px)}</span>{' '}
                  </div>{' '}
                </Fragment>
              ))}{' '}
            </div>{' '}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '28px',
                padding: '24px',
                borderRadius: '16px',
                background: '#f6f5f1',
              }}
            >
              {' '}
              {$arr($v['sizes']).map((s, $index) => (
                <Fragment key={$index}>
                  {' '}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    {' '}
                    <svg width={s?.px} height={s?.px} viewBox="0 0 64 64" style={{ display: 'block' }}>
                      <rect width="64" height="64" rx="18" fill="#15171a" />
                      <path
                        d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                        fill="none"
                        stroke="#f6f5f1"
                        strokeWidth={s?.sw}
                        strokeLinecap="round"
                      />
                      <circle cx="22.99" cy="49.31" r={s?.r} fill="#dcff2e" />
                    </svg>{' '}
                    <span style={{ font: "11px 'Geist Mono',monospace", color: '#6b7079' }}>{$t(s?.px)}</span>{' '}
                  </div>{' '}
                </Fragment>
              ))}{' '}
            </div>{' '}
            <p style={{ margin: '0', fontSize: '13px', color: '#6b7079' }}>
              {'Below 24px the stroke thickens to 9 and the node to 7 so it holds up as a favicon.'}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
          {' '}
          <div
            style={{
              height: '240px',
              borderRadius: '24px',
              background: '#0a0b0d',
              border: '1px solid #22252a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            {' '}
            <svg width="56" height="56" viewBox="6 6 52 52">
              <path
                d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                fill="none"
                stroke="#f6f5f1"
                strokeWidth="7.5"
                strokeLinecap="round"
              />
              <circle cx="22.99" cy="49.31" r="6" fill="#dcff2e" />
            </svg>{' '}
            <span style={{ fontWeight: '700', fontSize: '34px', letterSpacing: '-0.045em' }}>
              {'Schedule For You'}
            </span>{' '}
          </div>{' '}
          <div
            style={{
              height: '240px',
              borderRadius: '24px',
              background: '#f6f5f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: '#15171a',
            }}
          >
            {' '}
            <svg width="56" height="56" viewBox="0 0 64 64">
              <rect width="64" height="64" rx="18" fill="#15171a" />
              <path
                d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                fill="none"
                stroke="#f6f5f1"
                strokeWidth="7.5"
                strokeLinecap="round"
              />
              <circle cx="22.99" cy="49.31" r="6" fill="#dcff2e" />
            </svg>{' '}
            <span style={{ fontWeight: '700', fontSize: '34px', letterSpacing: '-0.045em' }}>
              {'Schedule For You'}
            </span>{' '}
          </div>{' '}
          <div
            style={{
              height: '240px',
              borderRadius: '24px',
              background: '#dcff2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: '#15171a',
            }}
          >
            {' '}
            <svg width="56" height="56" viewBox="6 6 52 52">
              <path
                d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                fill="none"
                stroke="#15171a"
                strokeWidth="7.5"
                strokeLinecap="round"
              />
              <circle cx="22.99" cy="49.31" r="6" fill="#15171a" />
            </svg>{' '}
            <span style={{ fontWeight: '700', fontSize: '34px', letterSpacing: '-0.045em' }}>
              {'Schedule For You'}
            </span>{' '}
          </div>{' '}
        </div>{' '}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: '24px' }}>
          {' '}
          <div
            style={{
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {' '}
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#a7abb2' }}>{'Browser tab'}</span>{' '}
            <div
              style={{ borderRadius: '14px', background: '#1c1f23', overflow: 'hidden', border: '1px solid #2a2e34' }}
            >
              {' '}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '8px 10px 0' }}>
                {' '}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 14px',
                    borderRadius: '10px 10px 0 0',
                    background: '#0c0d0f',
                    fontSize: '13px',
                    minWidth: '0',
                  }}
                >
                  {' '}
                  <svg width="16" height="16" viewBox="0 0 64 64">
                    <rect width="64" height="64" rx="18" fill="#15171a" />
                    <path
                      d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                      fill="none"
                      stroke="#f6f5f1"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <circle cx="22.99" cy="49.31" r="7" fill="#dcff2e" />
                  </svg>{' '}
                  <span style={{ whiteSpace: 'nowrap' }}>{'Schedule For You — Queue'}</span>{' '}
                </span>{' '}
                <span style={{ padding: '9px 14px', fontSize: '13px', color: '#6b7079', whiteSpace: 'nowrap' }}>
                  {'New tab'}
                </span>{' '}
              </div>{' '}
              <div
                style={{
                  height: '92px',
                  background: '#0c0d0f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0 20px',
                }}
              >
                {' '}
                <svg width="26" height="26" viewBox="6 6 52 52">
                  <path
                    d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                    fill="none"
                    stroke="#f6f5f1"
                    strokeWidth="7.5"
                    strokeLinecap="round"
                  />
                  <circle cx="22.99" cy="49.31" r="6" fill="#dcff2e" />
                </svg>{' '}
                <span style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.03em' }}>
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div
            style={{
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {' '}
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#a7abb2' }}>{'Social avatar'}</span>{' '}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1' }}>
              {' '}
              <span
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: '#15171a',
                  border: '1px solid #2a2e34',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                }}
              >
                {' '}
                <svg width="62" height="62" viewBox="6 6 52 52">
                  <path
                    d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                    fill="none"
                    stroke="#f6f5f1"
                    strokeWidth="7.5"
                    strokeLinecap="round"
                  />
                  <circle cx="22.99" cy="49.31" r="6" fill="#dcff2e" />
                </svg>{' '}
              </span>{' '}
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                {' '}
                <strong style={{ fontSize: '17px' }}>{'Schedule For You'}</strong>{' '}
                <span style={{ fontSize: '14px', color: '#6b7079' }}>{'@scheduleforyou'}</span>{' '}
              </span>{' '}
            </div>{' '}
            <p style={{ margin: '0', fontSize: '13px', color: '#6b7079' }}>
              {'The glyph sits inside a circle crop without touching the edge.'}
            </p>{' '}
          </div>{' '}
          <div
            style={{
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {' '}
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#a7abb2' }}>{'Home screen'}</span>{' '}
            <div
              style={{
                flex: '1',
                borderRadius: '18px',
                background: 'linear-gradient(160deg,#2b3a2e,#1a2230)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3,64px)',
                justifyContent: 'center',
                alignContent: 'center',
                gap: '18px 22px',
                padding: '18px',
              }}
            >
              {' '}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(255,255,255,.14)' }}
                />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)' }}>{'Photos'}</span>
              </span>{' '}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                {' '}
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 64 64"
                  style={{ display: 'block', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.4))' }}
                >
                  <rect width="64" height="64" rx="15" fill="#15171a" />
                  <path
                    d="M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31"
                    fill="none"
                    stroke="#f6f5f1"
                    strokeWidth="7.5"
                    strokeLinecap="round"
                  />
                  <circle cx="22.99" cy="49.31" r="6" fill="#dcff2e" />
                </svg>{' '}
                <span style={{ fontSize: '11px', color: '#fff' }}>{'Schedule'}</span>{' '}
              </span>{' '}
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(255,255,255,.14)' }}
                />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)' }}>{'Mail'}</span>
              </span>{' '}
            </div>{' '}
          </div>{' '}
        </div>
      </section>
      <section style={{ padding: '56px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {' '}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {' '}
          <span style={{ font: "13px 'Geist Mono',monospace", color: '#dcff2e' }}>{'Turn 1 — Logo concepts'}</span>{' '}
          <h1 style={{ margin: '0', fontSize: '40px', letterSpacing: '-0.04em' }}>{'Schedule For You'}</h1>{' '}
          <p style={{ margin: '0', color: '#a7abb2', maxWidth: '640px' }}>
            {'Three marks. Superseded by '}
            <a href="#2a">{'2a'}</a>
            {'.'}
          </p>{' '}
        </div>{' '}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          {' '}
          <div
            id="1a"
            style={{
              width: '520px',
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              overflow: 'hidden',
            }}
          >
            {' '}
            <div
              style={{
                position: 'relative',
                height: '340px',
                display: 'grid',
                placeItems: 'center',
                backgroundImage: 'radial-gradient(#1c1f23 1px,transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {' '}
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: '#dcff2e',
                  color: '#15171a',
                  font: "600 12px 'Geist Mono',monospace",
                }}
              >
                {'1a'}
              </span>{' '}
              <svg width="180" height="180" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="17" fill="#dcff2e" />
                <path
                  d="M19 32 C 29 32, 33 18, 45 18 M19 32 L46 32 M19 32 C 29 32, 33 46, 45 46"
                  fill="none"
                  stroke="#15171a"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                />
                <circle cx="18" cy="32" r="6.5" fill="#15171a" />
                <circle cx="46" cy="18" r="4.2" fill="#15171a" />
                <circle cx="47" cy="32" r="4.2" fill="#15171a" />
                <circle cx="46" cy="46" r="4.2" fill="#15171a" />
              </svg>{' '}
            </div>{' '}
            <div
              style={{
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderTop: '1px solid #22252a',
              }}
            >
              {' '}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{'Fanout'}</strong>
                <span style={{ fontSize: '13px', color: '#6b7079' }}>{'One post in, many out'}</span>
              </div>{' '}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {' '}
                <svg width="36" height="36" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="17" fill="#dcff2e" />
                  <path
                    d="M19 32 C 29 32, 33 18, 45 18 M19 32 L46 32 M19 32 C 29 32, 33 46, 45 46"
                    fill="none"
                    stroke="#15171a"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  <circle cx="18" cy="32" r="6.5" fill="#15171a" />
                  <circle cx="46" cy="18" r="4.2" fill="#15171a" />
                  <circle cx="47" cy="32" r="4.2" fill="#15171a" />
                  <circle cx="46" cy="46" r="4.2" fill="#15171a" />
                </svg>{' '}
                <span style={{ fontWeight: '700', fontSize: '24px', letterSpacing: '-0.035em' }}>
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#f6f5f1',
                }}
              >
                {' '}
                <svg width="32" height="32" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="17" fill="#15171a" />
                  <path
                    d="M19 32 C 29 32, 33 18, 45 18 M19 32 L46 32 M19 32 C 29 32, 33 46, 45 46"
                    fill="none"
                    stroke="#dcff2e"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  <circle cx="18" cy="32" r="6.5" fill="#dcff2e" />
                  <circle cx="46" cy="18" r="4.2" fill="#dcff2e" />
                  <circle cx="47" cy="32" r="4.2" fill="#dcff2e" />
                  <circle cx="46" cy="46" r="4.2" fill="#dcff2e" />
                </svg>{' '}
                <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.035em', color: '#15171a' }}>
                  {'Schedule For You'}
                </span>{' '}
                <span style={{ flex: '1' }} />{' '}
                <svg width="20" height="20" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="17" fill="#15171a" />
                  <path
                    d="M19 32 C 29 32, 33 18, 45 18 M19 32 L46 32 M19 32 C 29 32, 33 46, 45 46"
                    fill="none"
                    stroke="#dcff2e"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="18" cy="32" r="7" fill="#dcff2e" />
                  <circle cx="46" cy="18" r="5" fill="#dcff2e" />
                  <circle cx="47" cy="32" r="5" fill="#dcff2e" />
                  <circle cx="46" cy="46" r="5" fill="#dcff2e" />
                </svg>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div
            id="1b"
            style={{
              width: '520px',
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              overflow: 'hidden',
            }}
          >
            {' '}
            <div
              style={{
                position: 'relative',
                height: '340px',
                display: 'grid',
                placeItems: 'center',
                backgroundImage: 'radial-gradient(#1c1f23 1px,transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {' '}
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: '#2a2e34',
                  color: '#f6f5f1',
                  font: "600 12px 'Geist Mono',monospace",
                }}
              >
                {'1b'}
              </span>{' '}
              <svg width="180" height="180" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="17" fill="#dcff2e" />
                <circle cx="32" cy="32" r="18" fill="none" stroke="#15171a" strokeWidth="4.5" />
                <path
                  d="M24 32.5 L30 38.5 L41 25"
                  fill="none"
                  stroke="#15171a"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="10" r="3" fill="#15171a" />
              </svg>{' '}
            </div>{' '}
            <div
              style={{
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderTop: '1px solid #22252a',
              }}
            >
              {' '}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{'Clock check'}</strong>
                <span style={{ fontSize: '13px', color: '#6b7079' }}>{'Scheduled and done'}</span>
              </div>{' '}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {' '}
                <svg width="36" height="36" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="17" fill="#dcff2e" />
                  <circle cx="32" cy="32" r="18" fill="none" stroke="#15171a" strokeWidth="4.5" />
                  <path
                    d="M24 32.5 L30 38.5 L41 25"
                    fill="none"
                    stroke="#15171a"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="32" cy="10" r="3" fill="#15171a" />
                </svg>{' '}
                <span style={{ fontWeight: '700', fontSize: '24px', letterSpacing: '-0.035em' }}>
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#f6f5f1',
                }}
              >
                {' '}
                <svg width="32" height="32" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="17" fill="#15171a" />
                  <circle cx="32" cy="32" r="18" fill="none" stroke="#dcff2e" strokeWidth="4.5" />
                  <path
                    d="M24 32.5 L30 38.5 L41 25"
                    fill="none"
                    stroke="#dcff2e"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="32" cy="10" r="3" fill="#dcff2e" />
                </svg>{' '}
                <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.035em', color: '#15171a' }}>
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div
            id="1c"
            style={{
              width: '520px',
              border: '1px solid #22252a',
              borderRadius: '24px',
              background: '#0f1113',
              overflow: 'hidden',
            }}
          >
            {' '}
            <div
              style={{
                position: 'relative',
                height: '340px',
                display: 'grid',
                placeItems: 'center',
                backgroundImage: 'radial-gradient(#1c1f23 1px,transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {' '}
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: '#2a2e34',
                  color: '#f6f5f1',
                  font: "600 12px 'Geist Mono',monospace",
                }}
              >
                {'1c'}
              </span>{' '}
              <svg width="180" height="180" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="17" fill="#15171a" stroke="#2a2e34" strokeWidth="1" />
                <rect x="14" y="16" width="36" height="8" rx="4" fill="#dcff2e" />
                <rect x="14" y="28" width="28" height="8" rx="4" fill="#f6f5f1" opacity=".85" />
                <rect x="14" y="40" width="20" height="8" rx="4" fill="#f6f5f1" opacity=".45" />
              </svg>{' '}
            </div>{' '}
            <div
              style={{
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderTop: '1px solid #22252a',
              }}
            >
              {' '}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <strong style={{ fontSize: '18px' }}>{'Queue'}</strong>
                <span style={{ fontSize: '13px', color: '#6b7079' }}>{'Next up, then the rest'}</span>
              </div>{' '}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {' '}
                <svg width="36" height="36" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="17" fill="#15171a" stroke="#2a2e34" strokeWidth="1" />
                  <rect x="14" y="16" width="36" height="8" rx="4" fill="#dcff2e" />
                  <rect x="14" y="28" width="28" height="8" rx="4" fill="#f6f5f1" opacity=".85" />
                  <rect x="14" y="40" width="20" height="8" rx="4" fill="#f6f5f1" opacity=".45" />
                </svg>{' '}
                <span style={{ fontWeight: '700', fontSize: '24px', letterSpacing: '-0.035em' }}>
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#f6f5f1',
                }}
              >
                {' '}
                <svg width="32" height="32" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="17" fill="#15171a" />
                  <rect x="14" y="16" width="36" height="8" rx="4" fill="#dcff2e" />
                  <rect x="14" y="28" width="28" height="8" rx="4" fill="#f6f5f1" opacity=".85" />
                  <rect x="14" y="40" width="20" height="8" rx="4" fill="#f6f5f1" opacity=".45" />
                </svg>{' '}
                <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.035em', color: '#15171a' }}>
                  {'Schedule For You'}
                </span>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>
      </section>
    </>
  );
}
