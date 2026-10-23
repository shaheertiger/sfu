// Generated from the Claude Design prototype "Schedule For You.dc.html".
import React, { Fragment } from 'react';
import { $arr, $t, $sx, $dv } from '../lib/dc';

export const css =
  '\n*{box-sizing:border-box}\nhtml,body{margin:0;padding:0;background:#f8f9f6;color:#141619;font:15px/1.5 "Geist",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}\na{color:#141619;text-decoration:underline;text-underline-offset:2px}\na:hover{color:#5c6b00}\nbutton,input,select,textarea{font:inherit;color:inherit}\ntextarea{resize:vertical}\n::selection{background:#d9ff35;color:#141619}\n@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}\n@keyframes dashIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\n/* ---- Phone layout ---- */\n.sfy-top,.sfy-tabs,.sfy-scrim{display:none}\n@media (max-width:760px){\n  html,body{overscroll-behavior-y:none}\n  .sfy-shell{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto 1fr;align-content:start}\n  .sfy-side{position:fixed!important;top:0;left:0;bottom:0;width:min(84vw,300px);height:100dvh!important;z-index:70;transform:translateX(-104%);transition:transform .28s cubic-bezier(.2,.8,.2,1);padding-top:calc(14px + env(safe-area-inset-top))!important;padding-bottom:calc(14px + env(safe-area-inset-bottom))!important}\n  .sfy-shell[data-drawer="open"] .sfy-side{transform:none;box-shadow:24px 0 60px -20px rgba(0,0,0,.6)}\n  .sfy-side .sfy-collapse{display:none!important}\n  .sfy-side button{min-height:40px}\n  .sfy-scrim{display:block;position:fixed;inset:0;z-index:65;background:rgba(10,11,13,.55);opacity:0;pointer-events:none;transition:opacity .25s}\n  .sfy-shell[data-drawer="open"] .sfy-scrim{opacity:1;pointer-events:auto}\n  .sfy-top{display:flex;align-items:center;gap:8px;position:sticky;top:0;z-index:40;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;background:rgba(15,16,18,.94);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:#f8f9f6;border-bottom:1px solid #1c1f23}\n  .sfy-iconbtn{width:40px;height:40px;flex:none;display:grid;place-items:center;border:0;border-radius:10px;background:transparent;color:inherit;cursor:pointer}\n  .sfy-iconbtn:active{background:#1c1f23}\n  .sfy-burger,.sfy-burger::before,.sfy-burger::after{display:block;width:18px;height:2px;border-radius:2px;background:#f8f9f6}\n  .sfy-burger{position:relative}\n  .sfy-burger::before,.sfy-burger::after{content:"";position:absolute;left:0}\n  .sfy-burger::before{top:-6px}.sfy-burger::after{top:6px}\n  .sfy-top-title{flex:1;min-width:0;display:flex;align-items:center;gap:9px;border:0;background:transparent;color:inherit;padding:0;cursor:pointer;text-align:left}\n  .sfy-top-title > span{font-weight:800;letter-spacing:-0.04em;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n  .sfy-plus{width:40px;height:40px;flex:none;border:0;border-radius:11px;background:#d9ff35;color:#141619;font-size:22px;font-weight:600;line-height:1;cursor:pointer}\n  .sfy-main{padding:18px 16px calc(104px + env(safe-area-inset-bottom))!important}\n  .sfy-main h1{font-size:26px!important}\n  .sfy-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:50;padding:6px 6px calc(6px + env(safe-area-inset-bottom));background:rgba(15,16,18,.96);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-top:1px solid #1c1f23}\n  .sfy-tab{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;border:0;border-radius:10px;background:transparent;color:#a3a9b4;font-size:11px;font-weight:500;cursor:pointer;-webkit-tap-highlight-color:transparent}\n  .sfy-tab[data-on="true"]{color:#f8f9f6}\n  .sfy-tab-ic{width:22px;height:22px;background:center/contain no-repeat}\n  .sfy-tab[data-kind="create"] .sfy-tab-ic{width:40px;height:28px;border-radius:9px;background:#d9ff35;display:grid;place-items:center}\n  .sfy-tab[data-kind="create"] .sfy-tab-ic::after{content:"+";color:#141619;font-size:20px;font-weight:600;line-height:1}\n  .sfy-tab[data-kind="more"] .sfy-tab-ic{display:grid;place-items:center}\n  .sfy-tab[data-kind="more"] .sfy-tab-ic::after{content:"•••";color:currentColor;font-size:11px;letter-spacing:1px}\n  .sfy-tab-badge{position:absolute;top:2px;left:calc(50% + 6px);min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#dc3545;color:#fff;font-size:10px;font-weight:700;display:grid;place-items:center}\n  .sfy-toast{bottom:calc(86px + env(safe-area-inset-bottom))!important;max-width:calc(100vw - 32px)}\n  input,select,textarea{font-size:16px!important}\n}\n@media (max-width:760px){\n  .sfy-g2{grid-template-columns:repeat(2,minmax(0,1fr))!important}\n  .sfy-qrow{grid-template-columns:auto minmax(0,1fr) auto!important;row-gap:10px!important;padding:14px!important}\n  .sfy-qbody{grid-column:1/-1;grid-row:2}\n  .sfy-qact{grid-column:3;grid-row:1;justify-self:end}\n  .sfy-qtools{min-width:0;max-width:100%}\n  .sfy-scrollx{max-width:100%;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}\n  .sfy-scrollx::-webkit-scrollbar{display:none}\n  .sfy-month .sfy-mcell{min-height:78px!important;padding:5px 3px!important;gap:3px!important}\n  .sfy-mcell > div > button{display:none!important}\n  .sfy-mcell > div > span{font-size:12px!important;min-width:22px!important;height:22px!important}\n  .sfy-month > div:nth-child(-n+7){padding:8px 2px!important;font-size:11px!important}\n  .sfy-mchip{justify-content:center;gap:2px!important;padding:3px 2px!important}\n  .sfy-mchip > span:nth-child(2),.sfy-mchip > span:nth-child(4){display:none!important}\n  .sfy-tscroll{overflow-x:auto!important;-webkit-overflow-scrolling:touch}\n  .sfy-trow{min-width:560px;grid-template-columns:minmax(180px,1fr) 80px 96px 80px 64px!important}\n  .sfy-stack{grid-template-columns:minmax(0,1fr)!important}\n  .sfy-arow{flex-wrap:wrap!important;row-gap:8px!important;padding:14px!important}\n  .sfy-arow > div{flex:1 1 calc(100% - 52px)!important}\n  .sfy-arow > div + span{margin-left:48px}\n}\n@keyframes toastIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}\n\n.dashboard-hover-0:hover{background:#1c1f23 !important}\n.dashboard-hover-1:hover{background:#e6ff6e !important}\n.dashboard-hover-2:hover{background:#1c1f23 !important;color:#f8f9f6 !important}\n.dashboard-focus-3:focus{outline:2px solid #d9ff35 !important;outline-offset:1px !important}\n.dashboard-hover-4:hover{background:#2a2e34 !important}\n.dashboard-hover-5:hover{border-color:#141619 !important}\n.dashboard-hover-6:hover{transform:translateY(-4px) !important;box-shadow:0 24px 40px -24px rgba(20,23,26,.45) !important}\n.dashboard-hover-7:hover{background:#fcfbf8 !important}\n.dashboard-hover-8:hover{border-color:#141619 !important;color:#141619 !important}\n.dashboard-hover-9:hover{background:#f3f4f0 !important}\n.dashboard-focus-a:focus{border-color:#8a5a00 !important}\n.dashboard-hover-b:hover{background:#D9FF35 !important;color:#141619 !important}\n.dashboard-hover-c:hover{background:#fff6e0 !important;color:#8a5a00 !important}\n.dashboard-hover-d:hover{border-color:#141619 !important;box-shadow:0 6px 16px -10px rgba(20,22,25,.4) !important}\n.dashboard-hover-e:hover{background:#f1f1ec !important;color:#141619 !important}\n.dashboard-focus-f:focus{border-color:#141619 !important}\n.dashboard-hover-g:hover{outline:2px solid #141619 !important;outline-offset:2px !important}\n.dashboard-focus-h:focus{border-color:#141619 !important;border-style:solid !important}\n.dashboard-hover-i:hover{background:#f6f5f1 !important}\n.dashboard-hover-j:hover{transform:translateY(-2px) !important;box-shadow:0 16px 30px -20px rgba(20,23,26,.45) !important}\n.dashboard-hover-k:hover{color:#dc3545 !important;border-color:#f4c6c2 !important}\n.dashboard-hover-l:hover{border-color:#d9ff35 !important}';

export function renderDashboard($v) {
  return (
    <>
      <div
        data-drawer={$v['drawerAttr']}
        style={{
          display: 'grid',
          gridTemplateColumns: `${$v['sideCols'] ?? ''}`,
          minHeight: '100vh',
          transition: 'grid-template-columns .2s',
        }}
        className="sfy-shell"
      >
        {' '}
        <aside
          data-screen-label="Sidebar"
          aria-label="Main navigation"
          style={{
            background: '#0f1012',
            color: '#f8f9f6',
            padding: '14px 10px',
            position: 'sticky',
            top: '0',
            height: '100vh',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            borderRight: '1px solid #1c1f23',
          }}
          className="sfy-side"
        >
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 4px 12px' }}>
            {' '}
            <button
              onClick={$v['toggleWs']}
              style={{
                flex: '1',
                minWidth: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '5px',
                borderRadius: '8px',
                border: '0',
                background: 'transparent',
                color: '#f8f9f6',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              className="dashboard-hover-0"
            >
              {' '}
              <img
                src="/logos/schedule-for-you-glyph.svg"
                alt=""
                width="26"
                height="26"
                style={{ display: 'block', flex: 'none' }}
              />{' '}
              <span
                style={{
                  display: `${$v['sideTxt'] ?? ''}`,
                  fontWeight: '800',
                  letterSpacing: '-0.05em',
                  fontSize: '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {$t($v['wsName'])}
              </span>{' '}
              <span style={{ display: `${$v['sideTxt'] ?? ''}`, fontSize: '10px', color: '#7d828a' }}>{'▼'}</span>{' '}
            </button>{' '}
            <button
              onClick={$v['goCompose']}
              aria-label="Create post"
              title="Create post (N)"
              style={{
                display: `${$v['sideTxt'] ?? ''}`,
                width: '32px',
                height: '32px',
                flex: 'none',
                borderRadius: '9px',
                border: '0',
                background: '#d9ff35',
                color: '#141619',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                lineHeight: '1',
              }}
              className="dashboard-hover-1"
            >
              {'+'}
            </button>{' '}
          </div>{' '}
          <button
            onClick={$v['goCompose']}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              margin: '0 0 14px',
              borderRadius: '9px',
              border: '0',
              background: '#d9ff35',
              color: '#141619',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            className="dashboard-hover-1"
          >
            {' '}
            <span>{'+'}</span>
            <span style={{ display: `${$v['sideTxt'] ?? ''}` }}>{'Create post'}</span>{' '}
          </button>{' '}
          {$arr($v['navGroups']).map((g, $index) => (
            <Fragment key={$index}>
              {' '}
              <span
                style={{
                  display: `${$v['sideTxt'] ?? ''}`,
                  padding: '12px 9px 6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#7d828a',
                }}
              >
                {$t(g?.title)}
              </span>{' '}
              {$arr(g?.items).map((n, $index) => (
                <Fragment key={$index}>
                  {' '}
                  <button
                    onClick={n?.go}
                    title={n?.label}
                    aria-current={n?.current}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '11px',
                      padding: '7px 9px',
                      borderRadius: '8px',
                      border: '0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: '500',
                      fontSize: '14px',
                      background: `${n?.bg ?? ''}`,
                      color: `${n?.color ?? ''}`,
                      transition: 'background .15s,color .15s',
                    }}
                    className="dashboard-hover-2 dashboard-focus-3"
                  >
                    {' '}
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        flex: 'none',
                        background: `${n?.icon ?? ''} center/contain no-repeat`,
                      }}
                    />{' '}
                    <span style={{ flex: '1', display: `${$v['sideTxt'] ?? ''}`, whiteSpace: 'nowrap' }}>
                      {$t(n?.label)}
                    </span>{' '}
                    <span style={{ display: `${$v['sideTxt'] ?? ''}`, fontSize: '12px', color: '#7d828a' }}>
                      {$t(n?.count)}
                    </span>{' '}
                    {n?.hasAlert ? (
                      <>
                        <span
                          title="Failed posts"
                          style={{
                            minWidth: '18px',
                            height: '18px',
                            padding: '0 5px',
                            borderRadius: '6px',
                            background: '#3a1d1f',
                            color: '#ff8a8f',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          {$t(n?.alert)}
                        </span>
                      </>
                    ) : null}{' '}
                  </button>{' '}
                </Fragment>
              ))}{' '}
            </Fragment>
          ))}{' '}
          <div style={{ flex: '1' }} />{' '}
          {$arr($v['navBottom']).map((n, $index) => (
            <Fragment key={$index}>
              {' '}
              <button
                onClick={n?.go}
                title={n?.label}
                aria-current={n?.current}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  padding: '7px 9px',
                  borderRadius: '8px',
                  border: '0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: '500',
                  fontSize: '14px',
                  background: `${n?.bg ?? ''}`,
                  color: `${n?.color ?? ''}`,
                  transition: 'background .15s,color .15s',
                }}
                className="dashboard-hover-2 dashboard-focus-3"
              >
                {' '}
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    flex: 'none',
                    background: `${n?.icon ?? ''} center/contain no-repeat`,
                  }}
                />{' '}
                <span style={{ flex: '1', display: `${$v['sideTxt'] ?? ''}`, whiteSpace: 'nowrap' }}>
                  {$t(n?.label)}
                </span>{' '}
                <span style={{ display: `${$v['sideTxt'] ?? ''}`, fontSize: '12px', color: '#7d828a' }}>
                  {$t(n?.count)}
                </span>{' '}
                {n?.hasAlert ? (
                  <>
                    <span
                      title="Failed posts"
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 5px',
                        borderRadius: '6px',
                        background: '#3a1d1f',
                        color: '#ff8a8f',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {$t(n?.alert)}
                    </span>
                  </>
                ) : null}{' '}
              </button>{' '}
            </Fragment>
          ))}{' '}
          <button
            onClick={$v['toggleSide']}
            aria-label={$v['sideToggleLabel']}
            title={$v['sideToggleLabel']}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              padding: '7px 9px',
              borderRadius: '8px',
              border: '0',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: '500',
              fontSize: '14px',
              background: 'transparent',
              color: '#a3a9b4',
            }}
            className="sfy-collapse dashboard-hover-2"
          >
            {' '}
            <span style={{ width: '18px', textAlign: 'center', flex: 'none' }}>{$t($v['sideArrow'])}</span>
            <span style={{ display: `${$v['sideTxt'] ?? ''}` }}>{'Collapse'}</span>{' '}
          </button>{' '}
          <div
            style={{
              display: `${$v['sideBlock'] ?? ''}`,
              padding: '12px 9px 4px',
              marginTop: '6px',
              fontSize: '13px',
              color: '#a7abb2',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid #1c1f23',
            }}
          >
            {' '}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {' '}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>{'Accounts'}</span>
                <span style={{ color: '#f6f5f1' }}>
                  {$t($v['accountCount'])}
                  {' / '}
                  {$t($v['accountLimitLabel'])}
                </span>
              </div>{' '}
              <span style={{ height: '4px', borderRadius: '4px', background: '#22252a', overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'block',
                    height: '100%',
                    width: `${$v['planPct'] ?? ''}%`,
                    background: '#d9ff35',
                    borderRadius: '4px',
                  }}
                />
              </span>{' '}
            </div>{' '}
            <div style={{ position: 'relative' }}>
              {' '}
              {$v['wsOpen'] ? (
                <>
                  {' '}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-4px',
                      right: '-4px',
                      bottom: 'calc(100% + 8px)',
                      padding: '6px',
                      borderRadius: '12px',
                      background: '#1c1f23',
                      border: '1px solid #2a2e34',
                      boxShadow: '0 20px 40px -16px rgba(0,0,0,.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      zIndex: '5',
                    }}
                  >
                    {' '}
                    <span style={{ padding: '6px 8px 4px', fontSize: '11px', color: '#677184' }}>
                      {'Workspaces'}
                    </span>{' '}
                    {$arr($v['workspaces']).map((w, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={w?.pick}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '0',
                            background: `${w?.bg ?? ''}`,
                            color: '#f6f5f1',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          className="dashboard-hover-4"
                        >
                          {' '}
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '7px',
                              background: `${w?.tone ?? ''}`,
                              flex: 'none',
                            }}
                          />{' '}
                          <span
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              lineHeight: '1.25',
                              minWidth: '0',
                              flex: '1',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {$t(w?.name)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#a7abb2' }}>{$t(w?.sub)}</span>
                          </span>{' '}
                          <span style={{ fontSize: '12px', color: '#d9ff35' }}>{$t(w?.mark)}</span>{' '}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </>
              ) : null}{' '}
              <button
                onClick={$v['toggleWs']}
                style={{
                  width: 'calc(100% + 12px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px',
                  margin: '0 -6px',
                  borderRadius: '10px',
                  border: '0',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                className="dashboard-hover-0"
              >
                {' '}
                <span
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: `${$v['wsTone'] ?? ''}`,
                    flex: 'none',
                  }}
                />{' '}
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3', minWidth: '0', flex: '1' }}>
                  {' '}
                  <span
                    style={{
                      fontWeight: '600',
                      color: '#f6f5f1',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {$t($v['wsName'])}
                  </span>{' '}
                  <span style={{ fontSize: '12px' }}>{$t($v['wsSub'])}</span>{' '}
                </span>{' '}
                <span style={{ fontSize: '11px', color: '#677184' }}>{'▲'}</span>{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </aside>{' '}
        <div onClick={$v['closeDrawer']} className="sfy-scrim" />{' '}
        <header className="sfy-top">
          {' '}
          <button
            onClick={$v['toggleDrawer']}
            aria-label="Open menu"
            aria-expanded={$v['drawerOpen']}
            className="sfy-iconbtn"
          >
            <span className="sfy-burger" />
          </button>{' '}
          <button onClick={$v['toggleDrawer']} className="sfy-top-title">
            <img src="/logos/schedule-for-you-glyph.svg" alt="" width="24" height="24" />
            <span>{$t($v['screenTitle'])}</span>
          </button>{' '}
          <button onClick={$v['goCompose']} aria-label="Create post" className="sfy-plus">
            {'+'}
          </button>{' '}
        </header>{' '}
        <main
          style={{ padding: '28px 36px 96px', maxWidth: '1240px', width: '100%', minWidth: '0' }}
          className="sfy-main"
        >
          {' '}
          {$v['isHome'] ? (
            <>
              {' '}
              <section
                data-screen-label="Home"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '36px',
                  animation: 'dashIn .5s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {' '}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {' '}
                    <h1
                      style={{
                        margin: '0',
                        fontSize: '30px',
                        lineHeight: '1.1',
                        letterSpacing: '-0.03em',
                        fontWeight: '700',
                      }}
                    >
                      {$t($v['greetWord'])}
                      {', '}
                      {$t($v['greetName'])}
                      {' 👋'}
                    </h1>{' '}
                    <p style={{ margin: '0', fontSize: '15px', color: '#677184' }}>
                      {'You have '}
                      <strong style={{ color: '#141619' }}>{$t($v['weekPosts'])}</strong>
                      {' scheduled this week and '}
                      <button
                        onClick={$v['jumpAttn']}
                        style={{
                          font: 'inherit',
                          padding: '0',
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: `${$v['needColor'] ?? ''}`,
                          fontWeight: '600',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                        }}
                      >
                        {$t($v['needText'])}
                      </button>
                      {'.'}
                    </p>{' '}
                  </div>{' '}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {' '}
                    <button
                      onClick={$v['goCalWeek']}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #e7e5df',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                      className="dashboard-hover-5"
                    >
                      {'View calendar'}
                    </button>{' '}
                    <button
                      onClick={$v['goReview']}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #e7e5df',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                      className="dashboard-hover-5"
                    >
                      {$t($v['reviewLabel'])}
                    </button>{' '}
                    <button
                      onClick={$v['goCompose']}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        border: '0',
                        background: '#d9ff35',
                        color: '#141619',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                      className="dashboard-hover-1"
                    >
                      {'+ Create post'}
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '10px' }}
                  className="sfy-g2"
                >
                  {' '}
                  {$arr($v['homeStats']).map((h, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <button
                        onClick={h?.go}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1px solid #e7e5df',
                          background: '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color .15s',
                        }}
                        className="dashboard-hover-5"
                      >
                        {' '}
                        <span
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '9px',
                            background: '#f3f4f0',
                            display: 'grid',
                            placeItems: 'center',
                            flex: 'none',
                          }}
                        >
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              background: `${h?.icon ?? ''} center/contain no-repeat`,
                            }}
                          />
                        </span>{' '}
                        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                          <span
                            style={{
                              fontSize: '22px',
                              fontWeight: '700',
                              letterSpacing: '-0.03em',
                              color: `${h?.color ?? ''}`,
                            }}
                          >
                            {$t(h?.value)}
                          </span>
                          <span style={{ fontSize: '12px', color: '#677184' }}>{$t(h?.label)}</span>
                        </span>{' '}
                      </button>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {' '}
                  <div
                    style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}
                  >
                    {' '}
                    <strong style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>{'Up next'}</strong>{' '}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={$v['goQueueTab']}
                        style={{
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#677184',
                          fontSize: '13px',
                          padding: '0 6px',
                        }}
                      >
                        {'See all '}
                        {$t($v['upcomingCount'])}
                      </button>
                      <button
                        onClick={$v['upPrev']}
                        aria-label="Scroll left"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          border: '1px solid #e7e5df',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        {'‹'}
                      </button>
                      <button
                        onClick={$v['upNextBtn']}
                        aria-label="Scroll right"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          border: '1px solid #e7e5df',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        {'›'}
                      </button>
                    </span>{' '}
                  </div>{' '}
                  <div
                    ref={$v['upRef']}
                    style={{
                      scrollBehavior: 'smooth',
                      display: 'grid',
                      gridAutoFlow: 'column',
                      gridAutoColumns: 'minmax(280px,300px)',
                      gap: '14px',
                      overflowX: 'auto',
                      padding: '4px 2px 18px',
                      margin: '0 -2px',
                      scrollSnapType: 'x mandatory',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {' '}
                    {$arr($v['upNext']).map((c, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={c?.open}
                          style={{
                            scrollSnapAlign: 'start',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid #e7e5df',
                            borderRadius: '18px',
                            background: '#fff',
                            padding: '0',
                            cursor: 'pointer',
                            textAlign: 'left',
                            overflow: 'hidden',
                            minHeight: '300px',
                            transition: 'transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .25s',
                          }}
                          className="dashboard-hover-6"
                        >
                          {' '}
                          <div
                            style={{
                              height: '130px',
                              flex: 'none',
                              background: `${c?.cover ?? ''}`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              padding: '14px',
                              color: `${c?.coverFg ?? ''}`,
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              {' '}
                              <span
                                style={{
                                  padding: '3px 9px',
                                  borderRadius: '999px',
                                  background: 'rgba(21,23,26,.55)',
                                  color: '#f6f5f1',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  backdropFilter: 'blur(6px)',
                                }}
                              >
                                {$t(c?.day)}
                              </span>{' '}
                              <span style={{ font: "600 11px 'Geist Mono',monospace", opacity: '.85' }}>
                                {$t(c?.kind)}
                              </span>{' '}
                            </span>{' '}
                            <span
                              style={{
                                fontSize: `${c?.quoteSize ?? ''}`,
                                fontWeight: '700',
                                letterSpacing: '-0.03em',
                                lineHeight: '1.05',
                                display: '-webkit-box',
                                WebkitLineClamp: '3',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {$t(c?.quote)}
                            </span>{' '}
                          </div>{' '}
                          <div
                            style={{
                              flex: '1',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              padding: '14px 16px 16px',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                gap: '8px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '20px',
                                  fontWeight: '700',
                                  letterSpacing: '-0.03em',
                                  lineHeight: '1',
                                }}
                              >
                                {$t(c?.time)}
                              </span>
                              <span style={{ fontSize: '12px', color: '#677184' }}>{'Edit →'}</span>
                            </span>{' '}
                            <span
                              style={{
                                fontSize: '13px',
                                lineHeight: '1.45',
                                color: '#4a4f57',
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {$t(c?.caption)}
                            </span>{' '}
                            <span style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {' '}
                              <span style={{ display: 'flex' }}>
                                {' '}
                                {$arr(c?.icons).map((i, $index) => (
                                  <Fragment key={$index}>
                                    <span
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        marginRight: '-6px',
                                        borderRadius: '50%',
                                        border: '2px solid #fff',
                                        background: `${i?.color ?? ''}`,
                                        display: 'grid',
                                        placeItems: 'center',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '56%',
                                          height: '56%',
                                          background: `${i?.logo ?? ''} center/contain no-repeat`,
                                        }}
                                      />
                                    </span>
                                  </Fragment>
                                ))}{' '}
                              </span>{' '}
                              <span style={{ flex: '1' }} />{' '}
                              <span
                                style={{
                                  padding: '2px 9px',
                                  borderRadius: '999px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  background: `${c?.tagBg ?? ''}`,
                                  color: `${c?.tagFg ?? ''}`,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {$t(c?.tag)}
                              </span>{' '}
                            </span>{' '}
                          </div>{' '}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  id="attn"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))',
                    gap: '16px',
                    alignItems: 'start',
                  }}
                >
                  {' '}
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #e7e5df',
                      borderRadius: '12px',
                      boxShadow: '0 1px 0 rgba(20,23,26,.03),0 16px 40px -28px rgba(20,23,26,.3)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: '10px',
                        paddingBottom: '6px',
                      }}
                    >
                      {' '}
                      <strong style={{ fontSize: '16px' }}>{'Needs your attention'}</strong>{' '}
                      <span style={{ fontSize: '13px', color: '#677184' }}>{$t($v['attnCount'])}</span>{' '}
                    </div>{' '}
                    {$v['attnEmpty'] ? (
                      <>
                        {' '}
                        <span style={{ padding: '18px 0', color: '#677184', fontSize: '14px' }}>
                          {'Nothing to fix. Every post and account is healthy.'}
                        </span>{' '}
                      </>
                    ) : null}{' '}
                    {$arr($v['attentionShown']).map((x, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '14px 0',
                            borderTop: '1px solid #efede7',
                          }}
                        >
                          {' '}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {' '}
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                flex: 'none',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '12px',
                                fontWeight: '800',
                                background: `${x?.iconBg ?? ''}`,
                                color: `${x?.iconFg ?? ''}`,
                              }}
                            >
                              {$t(x?.icon)}
                            </span>{' '}
                            <strong style={{ fontSize: '14px', flex: '1', minWidth: '0' }}>{$t(x?.title)}</strong>{' '}
                            <span style={{ fontSize: '12px', color: '#9aa0a8', whiteSpace: 'nowrap' }}>
                              {$t(x?.when)}
                            </span>{' '}
                          </div>{' '}
                          <span style={{ fontSize: '13px', color: '#4a4f57', paddingLeft: '32px', textWrap: 'pretty' }}>
                            {$t(x?.body)}
                          </span>{' '}
                          <div style={{ display: 'flex', gap: '6px', paddingLeft: '32px', flexWrap: 'wrap' }}>
                            {' '}
                            {$arr(x?.actions).map((b, $index) => (
                              <Fragment key={$index}>
                                {' '}
                                <button
                                  onClick={b?.go}
                                  style={{
                                    padding: '5px 11px',
                                    borderRadius: '8px',
                                    border: `1px solid ${b?.border ?? ''}`,
                                    background: `${b?.bg ?? ''}`,
                                    color: `${b?.color ?? ''}`,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                  }}
                                >
                                  {$t(b?.label)}
                                </button>{' '}
                              </Fragment>
                            ))}{' '}
                          </div>{' '}
                        </div>{' '}
                      </Fragment>
                    ))}{' '}
                    {$v['hasMoreIssues'] ? (
                      <>
                        <button
                          onClick={$v['toggleIssues']}
                          style={{
                            alignSelf: 'flex-start',
                            marginTop: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e7e5df',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                          }}
                        >
                          {$t($v['issuesLabel'])}
                        </button>
                      </>
                    ) : null}{' '}
                  </div>{' '}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {' '}
                    <div
                      style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}
                    >
                      {' '}
                      <strong style={{ fontSize: '16px' }}>{'Accounts'}</strong>{' '}
                      <button
                        onClick={$v['goAccounts']}
                        style={{
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#677184',
                          fontSize: '13px',
                          padding: '0',
                        }}
                      >
                        {'Manage'}
                      </button>{' '}
                    </div>{' '}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      {' '}
                      {$arr($v['sickTiles']).map((a, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '11px 14px',
                              borderBottom: '1px solid #efefea',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: `${a?.color ?? ''}`,
                                display: 'grid',
                                placeItems: 'center',
                                flex: 'none',
                              }}
                            >
                              <span
                                style={{
                                  width: '56%',
                                  height: '56%',
                                  background: `${a?.logo ?? ''} center/contain no-repeat`,
                                }}
                              />
                            </span>{' '}
                            <span
                              style={{
                                flex: '1',
                                minWidth: '0',
                                display: 'flex',
                                flexDirection: 'column',
                                lineHeight: '1.3',
                              }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                {'@'}
                                {$t(a?.username)}
                              </span>
                              <span style={{ fontSize: '12px', color: `${a?.fg ?? ''}` }}>
                                {$t(a?.label)}
                                {' · '}
                                {$t(a?.detail)}
                              </span>
                            </span>{' '}
                            <button
                              onClick={a?.fix}
                              style={{
                                padding: '6px 11px',
                                borderRadius: '8px',
                                border: '0',
                                background: '#141619',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                              }}
                            >
                              {'Reconnect'}
                            </button>{' '}
                          </div>{' '}
                        </Fragment>
                      ))}{' '}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px' }}>
                        {' '}
                        <span style={{ display: 'flex', alignItems: 'center', minWidth: '0' }}>
                          {$arr($v['okTiles']).map((a, $index) => (
                            <Fragment key={$index}>
                              <span
                                title={a?.title}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  marginRight: '-6px',
                                  borderRadius: '50%',
                                  border: '2px solid #fff',
                                  background: `${a?.pic ?? ''}`,
                                  flex: 'none',
                                }}
                              />
                            </Fragment>
                          ))}
                          {$v['okMore'] ? (
                            <>
                              <span
                                style={{
                                  height: '28px',
                                  minWidth: '28px',
                                  padding: '0 8px',
                                  marginLeft: '2px',
                                  borderRadius: '999px',
                                  border: '2px solid #fff',
                                  background: '#f1f1ec',
                                  color: '#4a4f57',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  whiteSpace: 'nowrap',
                                  flex: 'none',
                                  position: 'relative',
                                }}
                              >
                                {$t($v['okMoreLabel'])}
                              </span>
                            </>
                          ) : null}
                        </span>{' '}
                        <span style={{ fontSize: '13px', color: '#677184', lineHeight: '1.4' }}>
                          <span style={{ color: '#15803d', fontWeight: '500' }}>
                            {'✓ '}
                            {$t($v['okCount'])}
                            {' connected'}
                          </span>
                          {$t($v['okBreakdown'])}
                        </span>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isQueue'] ? (
            <>
              {' '}
              <section
                data-screen-label="Queue"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'dashIn .25s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {' '}
                  <div>
                    {' '}
                    <h1
                      style={{
                        margin: '0',
                        fontSize: '30px',
                        lineHeight: '1.1',
                        letterSpacing: '-0.03em',
                        fontWeight: '700',
                      }}
                    >
                      {'Queue'}
                    </h1>{' '}
                    <p style={{ margin: '8px 0 0', color: '#677184', fontSize: '15px' }}>{$t($v['nextUp'])}</p>{' '}
                  </div>{' '}
                  <div
                    style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}
                    className="sfy-qtools"
                  >
                    {' '}
                    <button
                      onClick={$v['exportCsv']}
                      title="Download scheduled posts as CSV"
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: '1px solid #e7e5df',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                      className="dashboard-hover-5"
                    >
                      {'Export CSV'}
                    </button>{' '}
                    <button
                      onClick={$v['togglePause']}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: `1px solid ${$v['pauseBorder'] ?? ''}`,
                        background: `${$v['pauseBg'] ?? ''}`,
                        color: `${$v['pauseColor'] ?? ''}`,
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px',
                      }}
                    >
                      {$t($v['pauseLabel'])}
                    </button>{' '}
                    {$v['canSelect'] ? (
                      <>
                        {' '}
                        <button
                          onClick={$v['toggleSelect']}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '10px',
                            border: `1px solid ${$v['selectBorder'] ?? ''}`,
                            background: `${$v['selectBg'] ?? ''}`,
                            color: `${$v['selectColor'] ?? ''}`,
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                          }}
                        >
                          {$t($v['selectLabel'])}
                        </button>{' '}
                      </>
                    ) : null}{' '}
                    <div
                      style={{
                        display: 'inline-flex',
                        border: '1px solid #e5e3dc',
                        borderRadius: '10px',
                        background: '#fff',
                        padding: '3px',
                        gap: '2px',
                      }}
                      className="sfy-scrollx"
                    >
                      {' '}
                      {$arr($v['queueTabs']).map((t, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <button
                            onClick={t?.select}
                            style={{
                              whiteSpace: 'nowrap',
                              border: '0',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              display: 'flex',
                              gap: '6px',
                              alignItems: 'center',
                              background: `${t?.bg ?? ''}`,
                              color: `${t?.color ?? ''}`,
                            }}
                          >
                            {$t(t?.label)}
                            <span style={{ font: "500 12px 'Geist Mono',monospace", opacity: '.65' }}>
                              {$t(t?.count)}
                            </span>
                          </button>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                {$v['paused'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 18px',
                        borderRadius: '14px',
                        background: '#fff8e6',
                        border: '1px solid #f3dfb2',
                        flexWrap: 'wrap',
                      }}
                    >
                      {' '}
                      <strong style={{ color: '#8a5a00' }}>{'Queue paused'}</strong>{' '}
                      <span style={{ fontSize: '14px', color: '#6b5a33', flex: '1', minWidth: '200px' }}>
                        {'Nothing publishes until you resume. Posts whose time passes while paused go out right after.'}
                      </span>{' '}
                      <button
                        onClick={$v['togglePause']}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '10px',
                          border: '0',
                          background: '#141619',
                          color: '#fff',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                        }}
                      >
                        {'Resume queue'}
                      </button>{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {' '}
                  <select
                    value={$dv($v['qAcc'])}
                    onChange={$v['onQAcc']}
                    aria-label="Filter by account"
                    style={{
                      padding: '6px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                    }}
                  >
                    {$arr($v['calAccOpts']).map((o, $index) => (
                      <Fragment key={$index}>
                        <option value={$dv(o?.v)}>{o?.l}</option>
                      </Fragment>
                    ))}
                  </select>{' '}
                  <select
                    value={$dv($v['qPlat'])}
                    onChange={$v['onQPlat']}
                    aria-label="Filter by platform"
                    style={{
                      padding: '6px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                    }}
                  >
                    {$arr($v['calPlatOpts']).map((o, $index) => (
                      <Fragment key={$index}>
                        <option value={$dv(o?.v)}>{o?.l}</option>
                      </Fragment>
                    ))}
                  </select>{' '}
                </div>{' '}
                {$v['hasLabels'] ? (
                  <>
                    {' '}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {' '}
                      <span style={{ fontSize: '13px', color: '#677184', marginRight: '4px' }}>{'Labels'}</span>{' '}
                      {$arr($v['labelFilters']).map((l, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <button
                            onClick={l?.pick}
                            style={{
                              padding: '4px 11px',
                              borderRadius: '999px',
                              border: `1px solid ${l?.border ?? ''}`,
                              background: `${l?.bg ?? ''}`,
                              color: `${l?.color ?? ''}`,
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                            }}
                          >
                            {$t(l?.label)}
                            <span style={{ marginLeft: '6px', opacity: '.55' }}>{$t(l?.count)}</span>
                          </button>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$v['hasNext'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px 14px 12px 16px',
                        borderRadius: '12px',
                        background: '#141619',
                        color: '#f8f9f6',
                        flexWrap: 'wrap',
                      }}
                    >
                      {' '}
                      <span style={{ fontSize: '13px', color: '#a3a9b4', whiteSpace: 'nowrap' }}>
                        {$t($v['heroLabel'])}
                      </span>{' '}
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          letterSpacing: '-0.02em',
                          color: '#d9ff35',
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {$t($v['countdown'])}
                      </span>{' '}
                      <span style={{ display: 'flex', flex: 'none' }}>
                        {' '}
                        {$arr($v['nextAccs']).map((a, $index) => (
                          <Fragment key={$index}>
                            <span
                              title={a?.title}
                              style={{
                                width: '22px',
                                height: '22px',
                                marginRight: '-5px',
                                borderRadius: '50%',
                                border: '2px solid #141619',
                                background: `${a?.color ?? ''}`,
                                display: 'grid',
                                placeItems: 'center',
                              }}
                            >
                              <span
                                style={{
                                  width: '55%',
                                  height: '55%',
                                  background: `${a?.logo ?? ''} center/contain no-repeat`,
                                }}
                              />
                            </span>
                          </Fragment>
                        ))}{' '}
                      </span>{' '}
                      <span
                        style={{
                          flex: '1',
                          minWidth: '160px',
                          fontSize: '13px',
                          color: '#d6d9de',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginLeft: '6px',
                        }}
                      >
                        {$t($v['nextCaption'])}
                      </span>{' '}
                      <span style={{ fontSize: '12px', color: '#a3a9b4', whiteSpace: 'nowrap' }}>
                        {$t($v['nextWhen'])}
                      </span>{' '}
                      <button
                        onClick={$v['nextEdit']}
                        style={{
                          padding: '6px 11px',
                          borderRadius: '8px',
                          border: '1px solid #3a3e45',
                          background: 'transparent',
                          color: '#f8f9f6',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        {'Edit'}
                      </button>{' '}
                      <button
                        onClick={$v['nextNow']}
                        style={{
                          padding: '6px 11px',
                          borderRadius: '8px',
                          border: '0',
                          background: '#d9ff35',
                          color: '#141619',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                        }}
                      >
                        {'Post now'}
                      </button>{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$v['showAlert'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1px solid #f4c6c2',
                        background: '#fff6f5',
                      }}
                    >
                      {' '}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {' '}
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#dc3545',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: '800',
                            fontSize: '13px',
                            flex: 'none',
                          }}
                        >
                          {'!'}
                        </span>{' '}
                        <strong style={{ color: '#a1281f' }}>{$t($v['alertTitle'])}</strong>{' '}
                        <span style={{ flex: '1' }} />{' '}
                        {$v['hasRetryable'] ? (
                          <>
                            <button
                              onClick={$v['retryAll']}
                              style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                borderRadius: '8px',
                                border: '0',
                                background: '#141619',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              {$t($v['retryLabel'])}
                            </button>
                          </>
                        ) : null}{' '}
                        <button
                          onClick={$v['viewFailed']}
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '1px solid #e5e3dc',
                            background: '#fff',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          {'View'}
                        </button>{' '}
                        <button
                          onClick={$v['dismissAlert']}
                          title="Dismiss"
                          style={{
                            padding: '4px 8px',
                            border: '0',
                            background: 'transparent',
                            color: '#a1281f',
                            cursor: 'pointer',
                            fontSize: '16px',
                          }}
                        >
                          {'×'}
                        </button>{' '}
                      </div>{' '}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '32px' }}>
                        {' '}
                        {$arr($v['alertItems']).map((f, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <span style={{ fontSize: '13px', color: '#6b4440' }}>
                              <strong style={{ color: '#141619', fontWeight: '600' }}>{$t(f?.who)}</strong>
                              {' · '}
                              {$t(f?.when)}
                              {' · '}
                              {$t(f?.why)}
                            </span>{' '}
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$v['queueEmpty'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        padding: '48px',
                        textAlign: 'center',
                      }}
                    >
                      {' '}
                      <h3 style={{ margin: '0', fontSize: '18px' }}>{$t($v['emptyTitle'])}</h3>{' '}
                      <p style={{ color: '#677184', maxWidth: '420px', margin: '8px auto 16px' }}>
                        {'Write a post and pick a time. It shows up here and goes out automatically.'}
                      </p>{' '}
                      <button
                        onClick={$v['goCompose']}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '10px',
                          border: '1px solid #141619',
                          background: '#141619',
                          color: '#fff',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        {'Write a post'}
                      </button>{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$arr($v['groups']).map((g, $index) => (
                  <Fragment key={$index}>
                    {' '}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {' '}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', padding: '0 2px' }}>
                        {' '}
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{$t(g?.label)}</span>{' '}
                        <span style={{ fontSize: '13px', color: '#677184' }}>{$t(g?.sub)}</span>{' '}
                      </div>{' '}
                      <div
                        style={{
                          background: '#fff',
                          border: '1px solid #e7e5df',
                          borderRadius: '12px',
                          boxShadow: '0 1px 0 rgba(20,23,26,.03),0 16px 40px -28px rgba(20,23,26,.3)',
                          overflow: 'hidden',
                        }}
                      >
                        {' '}
                        {$arr(g?.items).map((p, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: `${$v['rowCols'] ?? ''}`,
                                gap: '16px',
                                borderTop: `${p?.divider ?? ''}`,
                                padding: `${$v['rowPad'] ?? ''}`,
                                background: `${p?.rowBg ?? ''}`,
                                transition: 'background .2s',
                              }}
                              className="sfy-qrow dashboard-hover-7"
                            >
                              {' '}
                              {p?.selecting ? (
                                <>
                                  {' '}
                                  <button
                                    onClick={p?.toggleSel}
                                    aria-label="Select post"
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      marginTop: '1px',
                                      borderRadius: '6px',
                                      border: `1.5px solid ${p?.selBorder ?? ''}`,
                                      background: `${p?.selBg ?? ''}`,
                                      color: '#141619',
                                      cursor: 'pointer',
                                      display: 'grid',
                                      placeItems: 'center',
                                      fontSize: '12px',
                                      fontWeight: '800',
                                      padding: '0',
                                    }}
                                  >
                                    {$t(p?.selMark)}
                                  </button>{' '}
                                </>
                              ) : null}{' '}
                              <div style={{ font: "500 13px 'Geist Mono',monospace", paddingTop: '2px' }}>
                                {$t(p?.time)}
                              </div>{' '}
                              <div
                                style={{ minWidth: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}
                                className="sfy-qbody"
                              >
                                {' '}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  {' '}
                                  <span
                                    style={{
                                      padding: '1px 9px',
                                      borderRadius: '999px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      border: `1px solid ${p?.st?.border ?? ''}`,
                                      background: `${p?.st?.bg ?? ''}`,
                                      color: `${p?.st?.color ?? ''}`,
                                    }}
                                  >
                                    {$t(p?.status)}
                                  </span>{' '}
                                  <span style={{ fontSize: '13px', color: '#677184' }}>{$t(p?.meta)}</span>{' '}
                                  {p?.pending ? (
                                    <>
                                      <span
                                        style={{
                                          padding: '1px 9px',
                                          borderRadius: '999px',
                                          fontSize: '12px',
                                          fontWeight: '600',
                                          background: '#fff8e6',
                                          border: '1px solid #f3dfb2',
                                          color: '#8a5a00',
                                        }}
                                      >
                                        {'Needs approval'}
                                      </span>
                                    </>
                                  ) : null}{' '}
                                  {p?.approved ? (
                                    <>
                                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#15803d' }}>
                                        {'✓ Approved'}
                                      </span>
                                    </>
                                  ) : null}{' '}
                                  {$arr(p?.labels).map((l, $index) => (
                                    <Fragment key={$index}>
                                      <span
                                        style={{
                                          padding: '1px 8px',
                                          borderRadius: '6px',
                                          background: '#f1efe9',
                                          fontSize: '12px',
                                          color: '#4a4f57',
                                        }}
                                      >
                                        {$t(l)}
                                      </span>
                                    </Fragment>
                                  ))}{' '}
                                  {$arr(p?.flags).map((f, $index) => (
                                    <Fragment key={$index}>
                                      <span style={{ fontSize: '12px', color: '#677184' }}>{$t(f)}</span>
                                    </Fragment>
                                  ))}{' '}
                                </div>{' '}
                                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', textWrap: 'pretty' }}>
                                  {$t(p?.caption)}
                                </div>{' '}
                                {p?.hasConflict ? (
                                  <>
                                    <span
                                      style={{
                                        alignSelf: 'flex-start',
                                        padding: '5px 10px',
                                        borderRadius: '8px',
                                        background: '#fff8e6',
                                        color: '#8a5a00',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                      }}
                                    >
                                      {'⚠ '}
                                      {$t(p?.conflict)}
                                    </span>
                                  </>
                                ) : null}{' '}
                                {p?.hasNote ? (
                                  <>
                                    <span
                                      style={{
                                        alignSelf: 'flex-start',
                                        maxWidth: '100%',
                                        padding: '7px 10px',
                                        borderRadius: '8px',
                                        background: '#f6f5f1',
                                        border: '1px dashed #d8d5cc',
                                        color: '#4a4f57',
                                        fontSize: '12px',
                                        lineHeight: '1.4',
                                      }}
                                    >
                                      <strong style={{ fontWeight: '600' }}>{'Internal note'}</strong>
                                      {' · '}
                                      {$t(p?.note)}
                                    </span>
                                  </>
                                ) : null}{' '}
                                {p?.hasMedia ? (
                                  <>
                                    {' '}
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      {' '}
                                      {$arr(p?.media).map((m, $index) => (
                                        <Fragment key={$index}>
                                          {' '}
                                          <div
                                            style={{
                                              width: '56px',
                                              height: '56px',
                                              borderRadius: '8px',
                                              background: `${m?.bg ?? ''}`,
                                              display: 'grid',
                                              placeItems: 'center',
                                              font: "500 10px 'Geist Mono',monospace",
                                              color: '#f3e9d8',
                                            }}
                                          >
                                            {$t(m?.label)}
                                          </div>{' '}
                                        </Fragment>
                                      ))}{' '}
                                    </div>{' '}
                                  </>
                                ) : null}{' '}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {' '}
                                  {$arr(p?.targets).map((t, $index) => (
                                    <Fragment key={$index}>
                                      {' '}
                                      <a
                                        href={t?.href}
                                        target="_blank"
                                        rel="noopener"
                                        title={t?.title}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          fontSize: '12px',
                                          padding: '3px 9px 3px 3px',
                                          borderRadius: '999px',
                                          border: `1px solid ${t?.border ?? ''}`,
                                          background: `${t?.bg ?? ''}`,
                                          color: '#141619',
                                          textDecoration: 'none',
                                          pointerEvents: `${t?.pe ?? ''}`,
                                        }}
                                      >
                                        {' '}
                                        <span
                                          style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            display: 'grid',
                                            placeItems: 'center',
                                            color: '#fff',
                                            fontSize: '8px',
                                            fontWeight: '800',
                                            background: `${t?.color ?? ''}`,
                                          }}
                                        >
                                          <span
                                            style={{
                                              width: '58%',
                                              height: '58%',
                                              background: `${t?.logo ?? ''} center/contain no-repeat`,
                                            }}
                                          />
                                        </span>{' '}
                                        <span>{$t(t?.username)}</span>
                                        <span style={{ color: '#15803d' }}>{$t(t?.arrow)}</span>{' '}
                                      </a>{' '}
                                    </Fragment>
                                  ))}{' '}
                                </div>{' '}
                                {p?.hasError ? (
                                  <>
                                    {' '}
                                    <div style={{ fontSize: '13px', color: '#dc3545' }}>{$t(p?.error)}</div>{' '}
                                  </>
                                ) : null}{' '}
                              </div>{' '}
                              <div
                                style={{ position: 'relative', display: 'flex', gap: '6px', alignItems: 'flex-start' }}
                                className="sfy-qact"
                              >
                                {' '}
                                <button
                                  onClick={p?.primary}
                                  style={{
                                    whiteSpace: 'nowrap',
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    borderRadius: '8px',
                                    border: `1px solid ${p?.primBorder ?? ''}`,
                                    background: `${p?.primBg ?? ''}`,
                                    color: `${p?.primFg ?? ''}`,
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {$t(p?.primLabel)}
                                </button>{' '}
                                <button
                                  onClick={p?.toggleMenu}
                                  aria-label="More actions"
                                  aria-expanded={p?.menuOpen}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    border: '1px solid #e7e5df',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    lineHeight: '1',
                                    color: '#677184',
                                  }}
                                  className="dashboard-hover-8"
                                >
                                  {'⋯'}
                                </button>{' '}
                                {p?.showMenu ? (
                                  <>
                                    {' '}
                                    <div
                                      role="menu"
                                      style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '38px',
                                        zIndex: '8',
                                        minWidth: '180px',
                                        padding: '5px',
                                        borderRadius: '10px',
                                        background: '#fff',
                                        border: '1px solid #e7e5df',
                                        boxShadow: '0 18px 40px -16px rgba(20,22,25,.35)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                      }}
                                    >
                                      {' '}
                                      {$arr(p?.menu).map((m, $index) => (
                                        <Fragment key={$index}>
                                          {' '}
                                          <button
                                            role="menuitem"
                                            onClick={m?.go}
                                            style={{
                                              textAlign: 'left',
                                              padding: '8px 10px',
                                              border: '0',
                                              borderRadius: '7px',
                                              background: 'transparent',
                                              cursor: 'pointer',
                                              fontSize: '13px',
                                              color: `${m?.color ?? ''}`,
                                            }}
                                            className="dashboard-hover-9"
                                          >
                                            {$t(m?.label)}
                                          </button>{' '}
                                        </Fragment>
                                      ))}{' '}
                                    </div>{' '}
                                  </>
                                ) : null}{' '}
                              </div>{' '}
                            </div>{' '}
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                    </div>{' '}
                  </Fragment>
                ))}{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isCalendar'] ? (
            <>
              {' '}
              <section
                data-screen-label="Calendar"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  animation: 'dashIn .3s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {' '}
                  <h1
                    style={{
                      margin: '0',
                      fontSize: '30px',
                      lineHeight: '1.1',
                      letterSpacing: '-0.03em',
                      fontWeight: '700',
                    }}
                  >
                    {'Calendar'}
                  </h1>{' '}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {' '}
                    <button
                      onClick={$v['exportCalCsv']}
                      style={{
                        padding: '7px 10px',
                        border: '1px solid #e7e5df',
                        borderRadius: '9px',
                        background: '#fff',
                        fontSize: '13px',
                        color: '#141619',
                        cursor: 'pointer',
                      }}
                      className="dashboard-hover-5"
                    >
                      {'Export CSV'}
                    </button>{' '}
                    <button
                      onClick={$v['goCompose']}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '9px',
                        border: '0',
                        background: '#141619',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}
                    >
                      {'+ Create post'}
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {' '}
                  <button
                    onClick={$v['calPrev']}
                    aria-label="Previous"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid #e7e5df',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {'‹'}
                  </button>{' '}
                  <button
                    onClick={$v['calNext']}
                    aria-label="Next"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid #e7e5df',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {'›'}
                  </button>{' '}
                  <strong style={{ fontSize: '17px', letterSpacing: '-0.01em', margin: '0 6px', whiteSpace: 'nowrap' }}>
                    {$t($v['calLabel'])}
                  </strong>{' '}
                  <button
                    onClick={$v['calToday']}
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                      color: '#141619',
                      cursor: 'pointer',
                    }}
                  >
                    {'Today'}
                  </button>{' '}
                  <div
                    style={{
                      display: 'inline-flex',
                      border: '1px solid #e7e5df',
                      borderRadius: '10px',
                      background: '#fff',
                      padding: '3px',
                      gap: '2px',
                    }}
                  >
                    {' '}
                    {$arr($v['calViews']).map((v, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={v?.select}
                          style={{
                            border: '0',
                            padding: '4px 12px',
                            borderRadius: '7px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '13px',
                            background: `${v?.bg ?? ''}`,
                            color: `${v?.color ?? ''}`,
                          }}
                        >
                          {$t(v?.label)}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                  <span style={{ flex: '1' }} />{' '}
                  <select
                    value={$dv($v['calPlat'])}
                    onChange={$v['onCalPlat']}
                    aria-label="Filter by platform"
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                      color: '#141619',
                      cursor: 'pointer',
                    }}
                  >
                    {$arr($v['calPlatOpts']).map((o, $index) => (
                      <Fragment key={$index}>
                        <option value={$dv(o?.v)}>{o?.l}</option>
                      </Fragment>
                    ))}
                  </select>{' '}
                  <select
                    value={$dv($v['calAcc'])}
                    onChange={$v['onCalAcc']}
                    aria-label="Filter by account"
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                      color: '#141619',
                      cursor: 'pointer',
                    }}
                  >
                    {$arr($v['calAccOpts']).map((o, $index) => (
                      <Fragment key={$index}>
                        <option value={$dv(o?.v)}>{o?.l}</option>
                      </Fragment>
                    ))}
                  </select>{' '}
                  <select
                    value={$dv($v['calStatus'])}
                    onChange={$v['onCalStatus']}
                    aria-label="Filter by status"
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                      color: '#141619',
                      cursor: 'pointer',
                    }}
                  >
                    {$arr($v['calStatusOpts']).map((o, $index) => (
                      <Fragment key={$index}>
                        <option value={$dv(o?.v)}>{o?.l}</option>
                      </Fragment>
                    ))}
                  </select>{' '}
                  <span title="Change in Settings" style={{ fontSize: '12px', color: '#677184', whiteSpace: 'nowrap' }}>
                    {$t($v['tzShort'])}
                  </span>{' '}
                </div>{' '}
                {$v['noteOpen'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        background: '#fff8e6',
                        border: '1px solid #f3dfb2',
                      }}
                    >
                      {' '}
                      <strong style={{ fontSize: '14px', color: '#8a5a00', whiteSpace: 'nowrap' }}>
                        {'Note for '}
                        {$t($v['noteDay'])}
                      </strong>{' '}
                      <input
                        value={$dv($v['noteText'])}
                        onChange={$v['onNoteText']}
                        placeholder="e.g. Product launch, office closed, campaign starts"
                        style={{
                          flex: '1 1 260px',
                          padding: '8px 12px',
                          border: '1px solid #f3dfb2',
                          borderRadius: '9px',
                          outline: 'none',
                          background: '#fff',
                        }}
                        className="dashboard-focus-a"
                      />{' '}
                      <button
                        onClick={$v['saveNote']}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '9px',
                          border: '0',
                          background: '#141619',
                          color: '#fff',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '13px',
                        }}
                      >
                        {'Save'}
                      </button>{' '}
                      <button
                        onClick={$v['deleteNote']}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '9px',
                          border: '1px solid #f3dfb2',
                          background: '#fff',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        {'Remove'}
                      </button>{' '}
                      <button
                        onClick={$v['closeNote']}
                        style={{
                          padding: '8px 10px',
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#8a5a00',
                          fontSize: '16px',
                        }}
                      >
                        {'×'}
                      </button>{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$v['isMonth'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#fff',
                      }}
                      className="sfy-month"
                    >
                      {' '}
                      {$arr($v['dows']).map((d, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <div
                            style={{
                              padding: '9px 10px',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#677184',
                              textAlign: 'center',
                              borderBottom: '1px solid #e7e5df',
                            }}
                          >
                            {$t(d)}
                          </div>{' '}
                        </Fragment>
                      ))}{' '}
                      {$arr($v['calDays']).map((d, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <div
                            onDragOver={d?.over}
                            onDrop={d?.drop}
                            onDoubleClick={d?.editNote}
                            style={{
                              minHeight: '118px',
                              padding: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              minWidth: '0',
                              background: `${d?.bg ?? ''}`,
                              color: `${d?.color ?? ''}`,
                              boxShadow: `${d?.ring ?? ''}`,
                              borderRight: '1px solid #efefea',
                              borderBottom: '1px solid #efefea',
                              transition: 'background .15s',
                            }}
                            className="sfy-mcell"
                          >
                            {' '}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              {' '}
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  minWidth: '24px',
                                  height: '24px',
                                  padding: '0 4px',
                                  borderRadius: '999px',
                                  display: 'grid',
                                  placeItems: 'center',
                                  background: `${d?.numBg ?? ''}`,
                                  color: `${d?.numColor ?? ''}`,
                                }}
                              >
                                {$t(d?.num)}
                              </span>{' '}
                              <button
                                onClick={d?.add}
                                aria-label="Create post on this day"
                                title="Create post"
                                style={{
                                  border: '0',
                                  background: 'transparent',
                                  color: '#a3a9b4',
                                  cursor: 'pointer',
                                  fontSize: '15px',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '6px',
                                }}
                                className="dashboard-hover-b"
                              >
                                {'+'}
                              </button>{' '}
                            </div>{' '}
                            <button
                              onClick={d?.editNote}
                              title={d?.note}
                              style={{
                                display: `${d?.noteDisplay ?? ''}`,
                                textAlign: 'left',
                                border: '0',
                                padding: '2px 6px',
                                borderRadius: '5px',
                                background: '#fff6e0',
                                color: '#8a5a00',
                                fontSize: '11px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {$t(d?.note)}
                            </button>{' '}
                            {$arr(d?.shown).map((e, $index) => (
                              <Fragment key={$index}>
                                {' '}
                                <button
                                  onClick={e?.open}
                                  draggable={e?.draggable}
                                  onDragStart={e?.dragStart}
                                  onDragEnd={e?.dragEnd}
                                  title={e?.title}
                                  style={{
                                    opacity: `${e?.op ?? ''}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    padding: '3px 4px 3px 4px',
                                    borderRadius: '7px',
                                    border: `1px solid ${e?.border ?? ''}`,
                                    cursor: `${e?.cursor ?? ''}`,
                                    textAlign: 'left',
                                    minWidth: '0',
                                    color: '#141619',
                                    background: '#fff',
                                    transition: 'border-color .15s',
                                  }}
                                  className="sfy-mchip dashboard-hover-5"
                                >
                                  {' '}
                                  <span
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      flex: 'none',
                                      background: `${e?.c1 ?? ''}`,
                                      display: 'grid',
                                      placeItems: 'center',
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: '60%',
                                        height: '60%',
                                        background: `${e?.l1 ?? ''} center/contain no-repeat`,
                                      }}
                                    />
                                  </span>{' '}
                                  <span
                                    style={{
                                      flex: '1',
                                      minWidth: '0',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'clip',
                                    }}
                                  >
                                    {$t(e?.timeShort)}
                                  </span>{' '}
                                  <span style={{ fontSize: '10px', color: '#677184', flex: 'none' }}>
                                    {$t(e?.plus)}
                                  </span>{' '}
                                  <span
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '4px',
                                      flex: 'none',
                                      background: `${e?.thumb ?? ''}`,
                                      display: `${e?.thumbDisplay ?? ''}`,
                                    }}
                                  />{' '}
                                </button>{' '}
                              </Fragment>
                            ))}{' '}
                            <button
                              onClick={d?.more}
                              style={{
                                display: `${d?.moreDisplay ?? ''}`,
                                textAlign: 'left',
                                border: '0',
                                background: 'transparent',
                                padding: '2px 4px',
                                fontSize: '12px',
                                color: '#677184',
                                cursor: 'pointer',
                                fontWeight: '500',
                              }}
                            >
                              {$t(d?.moreLabel)}
                            </button>{' '}
                          </div>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$v['isWeek'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        overflowX: 'auto',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        background: '#fff',
                      }}
                    >
                      {' '}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7,minmax(150px,1fr))',
                          minWidth: '1050px',
                        }}
                      >
                        {' '}
                        {$arr($v['weekDays']).map((d, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <div
                              onDragOver={d?.over}
                              onDrop={d?.drop}
                              style={{
                                minHeight: '260px',
                                minWidth: '0',
                                borderRight: '1px solid #efefea',
                                background: `${d?.bg ?? ''}`,
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                transition: 'background .15s',
                              }}
                            >
                              {' '}
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 2px 6px' }}
                              >
                                {' '}
                                <span style={{ fontSize: '12px', color: '#677184' }}>{$t(d?.dow)}</span>{' '}
                                <span
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    minWidth: '24px',
                                    height: '24px',
                                    padding: '0 5px',
                                    borderRadius: '999px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: `${d?.numBg ?? ''}`,
                                    color: '#141619',
                                  }}
                                >
                                  {$t(d?.num)}
                                </span>{' '}
                                <span style={{ flex: '1' }} />{' '}
                                <button
                                  onClick={d?.editNote}
                                  aria-label="Add note"
                                  title="Add note"
                                  style={{
                                    border: '0',
                                    background: 'transparent',
                                    color: '#a3a9b4',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '6px',
                                  }}
                                  className="dashboard-hover-c"
                                >
                                  {'✎'}
                                </button>{' '}
                                <button
                                  onClick={d?.add}
                                  aria-label="Create post on this day"
                                  title="Create post"
                                  style={{
                                    border: '0',
                                    background: 'transparent',
                                    color: '#a3a9b4',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '6px',
                                  }}
                                  className="dashboard-hover-b"
                                >
                                  {'+'}
                                </button>{' '}
                              </div>{' '}
                              {d?.hasNote ? (
                                <>
                                  <span
                                    style={{
                                      padding: '5px 7px',
                                      borderRadius: '6px',
                                      background: '#fff6e0',
                                      color: '#8a5a00',
                                      fontSize: '11px',
                                      lineHeight: '1.35',
                                    }}
                                  >
                                    {$t(d?.note)}
                                  </span>
                                </>
                              ) : null}{' '}
                              {$arr(d?.events).map((e, $index) => (
                                <Fragment key={$index}>
                                  {' '}
                                  <div
                                    draggable={e?.draggable}
                                    onDragStart={e?.dragStart}
                                    onDragEnd={e?.dragEnd}
                                    style={{
                                      opacity: `${e?.op ?? ''}`,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '6px',
                                      padding: '8px',
                                      borderRadius: '9px',
                                      border: `1px solid ${e?.border ?? ''}`,
                                      background: '#fff',
                                      cursor: `${e?.cursor ?? ''}`,
                                      minWidth: '0',
                                      transition: 'border-color .15s,box-shadow .15s',
                                    }}
                                    className="dashboard-hover-d"
                                  >
                                    {' '}
                                    <button
                                      onClick={e?.open}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        padding: '0',
                                        border: '0',
                                        background: 'transparent',
                                        cursor: 'inherit',
                                        textAlign: 'left',
                                        minWidth: '0',
                                      }}
                                    >
                                      {' '}
                                      <span
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          justifyContent: 'space-between',
                                        }}
                                      >
                                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{$t(e?.time)}</span>
                                        <span
                                          style={{
                                            padding: '1px 7px',
                                            borderRadius: '999px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            background: `${e?.stBg ?? ''}`,
                                            color: `${e?.stFg ?? ''}`,
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {$t(e?.stLabel)}
                                        </span>
                                      </span>{' '}
                                      <span
                                        style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', minWidth: '0' }}
                                      >
                                        {' '}
                                        <span
                                          style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '6px',
                                            flex: 'none',
                                            background: `${e?.thumb ?? ''}`,
                                            display: `${e?.thumbDisplay ?? ''}`,
                                          }}
                                        />{' '}
                                        <span
                                          style={{
                                            fontSize: '12px',
                                            lineHeight: '1.35',
                                            color: '#3b414b',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '2',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            overflowWrap: 'anywhere',
                                          }}
                                        >
                                          {$t(e?.caption)}
                                        </span>{' '}
                                      </span>{' '}
                                    </button>{' '}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span style={{ display: 'flex', flex: 'none' }}>
                                        {$arr(e?.icons).map((c, $index) => (
                                          <Fragment key={$index}>
                                            <span
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                marginRight: '-4px',
                                                borderRadius: '50%',
                                                border: '1.5px solid #fff',
                                                background: `${c?.color ?? ''}`,
                                                display: 'grid',
                                                placeItems: 'center',
                                              }}
                                            >
                                              <span
                                                style={{
                                                  width: '60%',
                                                  height: '60%',
                                                  background: `${c?.logo ?? ''} center/contain no-repeat`,
                                                }}
                                              />
                                            </span>
                                          </Fragment>
                                        ))}
                                      </span>
                                      <span style={{ flex: '1' }} />
                                      <button
                                        onClick={e?.duplicate}
                                        aria-label="Duplicate post"
                                        title="Duplicate"
                                        style={{
                                          border: '0',
                                          background: 'transparent',
                                          cursor: 'pointer',
                                          color: '#677184',
                                          fontSize: '11px',
                                          padding: '2px 4px',
                                          borderRadius: '5px',
                                        }}
                                        className="dashboard-hover-e"
                                      >
                                        {'Duplicate'}
                                      </button>
                                    </span>{' '}
                                  </div>{' '}
                                </Fragment>
                              ))}{' '}
                            </div>{' '}
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$v['isList'] ? (
                  <>
                    {' '}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {' '}
                      {$v['listEmpty'] ? (
                        <>
                          <div
                            style={{
                              padding: '40px',
                              textAlign: 'center',
                              border: '1px dashed #d8d5cc',
                              borderRadius: '12px',
                              color: '#677184',
                            }}
                          >
                            {'No posts match these filters this month.'}
                          </div>
                        </>
                      ) : null}{' '}
                      {$arr($v['listDays']).map((g, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {' '}
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184', padding: '0 2px' }}>
                              {$t(g?.label)}
                            </span>{' '}
                            <div
                              style={{
                                background: '#fff',
                                border: '1px solid #e7e5df',
                                borderRadius: '12px',
                                overflow: 'hidden',
                              }}
                            >
                              {' '}
                              {$arr(g?.items).map((e, $index) => (
                                <Fragment key={$index}>
                                  {' '}
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '76px 36px minmax(0,1fr) auto auto auto',
                                      gap: '12px',
                                      alignItems: 'center',
                                      padding: '10px 14px',
                                      borderTop: `${e?.divider ?? ''}`,
                                    }}
                                  >
                                    {' '}
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{$t(e?.time)}</span>{' '}
                                    <span
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '7px',
                                        background: `${e?.thumbOrBlank ?? ''}`,
                                      }}
                                    />{' '}
                                    <span
                                      style={{
                                        fontSize: '13px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {$t(e?.caption)}
                                    </span>{' '}
                                    <span style={{ display: 'flex', flex: 'none' }}>
                                      {$arr(e?.icons).map((c, $index) => (
                                        <Fragment key={$index}>
                                          <span
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              marginRight: '-4px',
                                              borderRadius: '50%',
                                              border: '1.5px solid #fff',
                                              background: `${c?.color ?? ''}`,
                                              display: 'grid',
                                              placeItems: 'center',
                                            }}
                                          >
                                            <span
                                              style={{
                                                width: '60%',
                                                height: '60%',
                                                background: `${c?.logo ?? ''} center/contain no-repeat`,
                                              }}
                                            />
                                          </span>
                                        </Fragment>
                                      ))}
                                    </span>{' '}
                                    <span
                                      style={{
                                        padding: '1px 7px',
                                        borderRadius: '999px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        background: `${e?.stBg ?? ''}`,
                                        color: `${e?.stFg ?? ''}`,
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {$t(e?.stLabel)}
                                    </span>{' '}
                                    <span style={{ display: 'flex', gap: '4px' }}>
                                      <button
                                        onClick={e?.open}
                                        style={{
                                          padding: '7px 10px',
                                          border: '1px solid #e7e5df',
                                          borderRadius: '9px',
                                          background: '#fff',
                                          fontSize: '13px',
                                          color: '#141619',
                                          cursor: 'pointer',
                                          padding: '5px 10px',
                                        }}
                                      >
                                        {'Edit'}
                                      </button>
                                      <button
                                        onClick={e?.duplicate}
                                        style={{
                                          padding: '7px 10px',
                                          border: '1px solid #e7e5df',
                                          borderRadius: '9px',
                                          background: '#fff',
                                          fontSize: '13px',
                                          color: '#141619',
                                          cursor: 'pointer',
                                          padding: '5px 10px',
                                        }}
                                      >
                                        {'Duplicate'}
                                      </button>
                                    </span>{' '}
                                  </div>{' '}
                                </Fragment>
                              ))}{' '}
                            </div>{' '}
                          </div>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isCompose'] ? (
            <>
              {' '}
              <section
                data-screen-label="Compose"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'dashIn .25s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div>
                  {' '}
                  <h1
                    style={{
                      margin: '0',
                      fontSize: '30px',
                      lineHeight: '1.1',
                      letterSpacing: '-0.03em',
                      fontWeight: '700',
                    }}
                  >
                    {$t($v['composeTitle'])}
                  </h1>{' '}
                  <p style={{ margin: '8px 0 0', color: '#677184', fontSize: '15px' }}>
                    {'Write once, then adjust per account if you need to.'}
                  </p>{' '}
                </div>{' '}
                {$v['composeTabs'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        border: '1px solid #e7e5df',
                        borderRadius: '10px',
                        background: '#fff',
                        padding: '3px',
                        gap: '2px',
                        alignSelf: 'flex-start',
                      }}
                    >
                      {' '}
                      {$arr($v['cTabs']).map((t, $index) => (
                        <Fragment key={$index}>
                          <button
                            onClick={t?.pick}
                            style={{
                              border: '0',
                              padding: '7px 16px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '14px',
                              background: `${t?.bg ?? ''}`,
                              color: `${t?.color ?? ''}`,
                            }}
                          >
                            {$t(t?.label)}
                          </button>
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `${$v['composeCols'] ?? ''}`,
                    gap: '16px',
                    alignItems: 'start',
                  }}
                >
                  {' '}
                  <div
                    style={{
                      display: `${$v['showAccCol'] ?? ''}`,
                      background: '#fff',
                      border: '1px solid #e7e5df',
                      borderRadius: '12px',
                      padding: '12px',
                      flexDirection: 'column',
                      gap: '8px',
                      position: 'sticky',
                      top: '20px',
                      minWidth: '0',
                    }}
                  >
                    {' '}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '2px 2px 0',
                      }}
                    >
                      {' '}
                      <strong style={{ fontSize: '14px' }}>{'Accounts'}</strong>{' '}
                      <button
                        onClick={$v['toggleAll']}
                        style={{
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#677184',
                          padding: '2px 4px',
                        }}
                      >
                        {$t($v['allLabel'])}
                      </button>{' '}
                    </div>{' '}
                    <input
                      value={$dv($v['accQ'])}
                      onChange={$v['onAccQ']}
                      placeholder="Search accounts"
                      aria-label="Search accounts"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        border: '1px solid #e7e5df',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '13px',
                      }}
                      className="dashboard-focus-f"
                    />{' '}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {' '}
                      {$arr($v['accountChips']).map((a, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <button
                            onClick={a?.toggle}
                            aria-pressed={a?.pressed}
                            style={{
                              display: 'flex',
                              width: '100%',
                              textAlign: 'left',
                              alignItems: 'center',
                              gap: '9px',
                              padding: '6px 8px 6px 6px',
                              borderRadius: '9px',
                              cursor: 'pointer',
                              border: `1px solid ${a?.border ?? ''}`,
                              background: `${a?.bg ?? ''}`,
                              color: '#141619',
                              transition: 'background .15s,border-color .15s',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                position: 'relative',
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                flex: 'none',
                                background: `${a?.pic ?? ''}`,
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  right: '-3px',
                                  bottom: '-3px',
                                  width: '13px',
                                  height: '13px',
                                  borderRadius: '50%',
                                  border: '2px solid #fff',
                                  background: `${a?.badge ?? ''}`,
                                  display: `${a?.badgeDisplay ?? ''}`,
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
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {$t(a?.username)}
                              </span>
                              <span style={{ fontSize: '11px', color: `${a?.subColor ?? ''}` }}>{$t(a?.sub)}</span>
                            </span>{' '}
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '5px',
                                flex: 'none',
                                border: `1.5px solid ${a?.boxBorder ?? ''}`,
                                background: `${a?.boxBg ?? ''}`,
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '11px',
                                fontWeight: '800',
                              }}
                            >
                              {$t(a?.mark)}
                            </span>{' '}
                          </button>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                  </div>{' '}
                  <div
                    style={{
                      display: `${$v['showEditCol'] ?? ''}`,
                      flexDirection: 'column',
                      gap: '14px',
                      minWidth: '0',
                    }}
                  >
                    {' '}
                    {$v['inlineAccounts'] ? (
                      <>
                        {' '}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {' '}
                          {$arr($v['accountChips']).map((a, $index) => (
                            <Fragment key={$index}>
                              {' '}
                              <button
                                onClick={a?.toggle}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '7px',
                                  padding: '4px 10px 4px 4px',
                                  borderRadius: '999px',
                                  cursor: 'pointer',
                                  border: `1px solid ${a?.border ?? ''}`,
                                  background: `${a?.bg ?? ''}`,
                                  fontSize: '13px',
                                }}
                              >
                                <span
                                  style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: `${a?.color ?? ''}`,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '56%',
                                      height: '56%',
                                      background: `${a?.logo ?? ''} center/contain no-repeat`,
                                    }}
                                  />
                                </span>
                                {$t(a?.username)}
                              </button>{' '}
                            </Fragment>
                          ))}{' '}
                        </div>{' '}
                      </>
                    ) : null}{' '}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}
                    >
                      {' '}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: '6px 6px 0',
                          borderBottom: '1px solid #efefea',
                          overflowX: 'auto',
                        }}
                      >
                        {' '}
                        {$arr($v['capTabs']).map((t, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <button
                              onClick={t?.pick}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 10px',
                                border: '0',
                                borderBottom: `2px solid ${t?.line ?? ''}`,
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: `${t?.weight ?? ''}`,
                                color: `${t?.color ?? ''}`,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {' '}
                              <span
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: `${t?.dotBg ?? ''}`,
                                  display: `${t?.iconDisplay ?? ''}`,
                                  placeItems: 'center',
                                }}
                              >
                                <span
                                  style={{
                                    width: '60%',
                                    height: '60%',
                                    background: `${t?.logo ?? ''} center/contain no-repeat`,
                                  }}
                                />
                              </span>
                              {$t(t?.label)}
                              <span style={{ fontSize: '11px', fontWeight: '500', color: `${t?.tagColor ?? ''}` }}>
                                {$t(t?.tag)}
                              </span>{' '}
                            </button>{' '}
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                      <textarea
                        value={$dv($v['capValue'])}
                        onChange={$v['onCapValue']}
                        placeholder={$v['capPlaceholder']}
                        aria-label="Caption"
                        style={{
                          width: '100%',
                          minHeight: '260px',
                          padding: '16px 18px',
                          border: '0',
                          outline: 'none',
                          resize: 'vertical',
                          fontSize: '16px',
                          lineHeight: '1.6',
                          background: '#fff',
                        }}
                      />{' '}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap',
                          padding: '10px 14px',
                          borderTop: '1px solid #efefea',
                          background: '#fcfcfa',
                        }}
                      >
                        {' '}
                        {$arr($v['counters']).map((c, $index) => (
                          <Fragment key={$index}>
                            <span
                              style={{ fontSize: '12px', color: `${c?.fg ?? ''}`, fontVariantNumeric: 'tabular-nums' }}
                            >
                              {$t(c?.label)} {$t(c?.text)}
                            </span>
                          </Fragment>
                        ))}{' '}
                        <span style={{ flex: '1' }} />{' '}
                        {$v['capIsCustom'] ? (
                          <>
                            <button
                              onClick={$v['capReset']}
                              style={{
                                border: '0',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#677184',
                                textDecoration: 'underline',
                              }}
                            >
                              {'Use main caption'}
                            </button>
                          </>
                        ) : null}{' '}
                        <span style={{ fontSize: '12px', color: '#677184' }} aria-live="polite">
                          {$t($v['savedLabel'])}
                        </span>{' '}
                      </div>{' '}
                      {$arr($v['capFields']).map((f, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 14px',
                              borderTop: '1px solid #efefea',
                            }}
                          >
                            {' '}
                            <span style={{ fontSize: '13px', color: '#677184', width: '120px' }}>
                              {$t(f?.label)}
                            </span>{' '}
                            {f?.isSelect ? (
                              <>
                                <select
                                  value={$dv(f?.value)}
                                  onChange={f?.onChange}
                                  style={{
                                    flex: '1',
                                    padding: '6px 10px',
                                    border: '1px solid #e7e5df',
                                    borderRadius: '8px',
                                    background: '#fff',
                                  }}
                                >
                                  {$arr(f?.options).map((o, $index) => (
                                    <Fragment key={$index}>
                                      <option value={$dv(o)}>{o}</option>
                                    </Fragment>
                                  ))}
                                </select>
                              </>
                            ) : null}{' '}
                            {f?.isText ? (
                              <>
                                <input
                                  value={$dv(f?.value)}
                                  onChange={f?.onChange}
                                  style={{
                                    flex: '1',
                                    padding: '6px 10px',
                                    border: '1px solid #e7e5df',
                                    borderRadius: '8px',
                                    outline: 'none',
                                  }}
                                />
                              </>
                            ) : null}{' '}
                          </div>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '14px',
                        borderRadius: '12px',
                        background: '#fff',
                        border: '1px solid #e7e5df',
                      }}
                    >
                      {' '}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {' '}
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184', width: '76px' }}>
                          {'Templates'}
                        </span>{' '}
                        {$arr($v['templates']).map((t, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <button
                              onClick={t?.use}
                              title={t?.text}
                              style={{
                                padding: '5px 11px',
                                borderRadius: '999px',
                                border: '1px solid #e7e5df',
                                background: '#fff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                              }}
                              className="dashboard-hover-5"
                            >
                              {$t(t?.name)}
                            </button>{' '}
                          </Fragment>
                        ))}{' '}
                        <button
                          onClick={$v['saveTemplate']}
                          style={{
                            padding: '5px 11px',
                            borderRadius: '999px',
                            border: '1px dashed #cfccc3',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#677184',
                          }}
                        >
                          {'Save current caption'}
                        </button>{' '}
                      </div>{' '}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {' '}
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184', width: '76px' }}>
                          {'Hashtags'}
                        </span>{' '}
                        {$arr($v['tagGroups']).map((g, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <button
                              onClick={g?.add}
                              title={g?.tags}
                              style={{
                                padding: '5px 11px',
                                borderRadius: '999px',
                                border: '1px solid #e7e5df',
                                background: '#fff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                              }}
                              className="dashboard-hover-5"
                            >
                              {$t(g?.name)} <span style={{ color: '#9aa0a8' }}>{$t(g?.count)}</span>
                            </button>{' '}
                          </Fragment>
                        ))}{' '}
                        <button
                          onClick={$v['saveTags']}
                          title="Saves the hashtags in your caption as a group"
                          style={{
                            padding: '5px 11px',
                            borderRadius: '999px',
                            border: '1px dashed #cfccc3',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#677184',
                          }}
                        >
                          {'Save hashtags from caption'}
                        </button>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {' '}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {' '}
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184' }}>{'Media'}</span>{' '}
                        {$v['hasMedia'] ? (
                          <>
                            {' '}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {' '}
                              {$arr($v['mediaTiles']).map((m, $index) => (
                                <Fragment key={$index}>
                                  {' '}
                                  <div
                                    style={{
                                      position: 'relative',
                                      width: '84px',
                                      height: '84px',
                                      borderRadius: '10px',
                                      background: `${m?.bg ?? ''}`,
                                      display: 'grid',
                                      placeItems: 'center',
                                      font: "500 11px 'Geist Mono',monospace",
                                      color: '#f3e9d8',
                                    }}
                                  >
                                    {' '}
                                    <span>{$t(m?.label)}</span>{' '}
                                    <button
                                      onClick={m?.remove}
                                      style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        border: '0',
                                        background: 'rgba(0,0,0,.6)',
                                        color: '#fff',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        lineHeight: '1',
                                      }}
                                    >
                                      {'×'}
                                    </button>{' '}
                                  </div>{' '}
                                </Fragment>
                              ))}{' '}
                            </div>{' '}
                          </>
                        ) : null}{' '}
                        <div
                          style={{
                            border: '1.5px dashed #d9d6cd',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap',
                            color: '#677184',
                          }}
                        >
                          {' '}
                          <span style={{ fontSize: '14px' }}>
                            {'Drop images or videos here. Several images become a carousel.'}
                          </span>{' '}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {' '}
                            <button
                              onClick={$v['addImage']}
                              style={{
                                whiteSpace: 'nowrap',
                                padding: '6px 10px',
                                fontSize: '13px',
                                borderRadius: '8px',
                                border: '1px solid #e5e3dc',
                                background: '#fff',
                                cursor: 'pointer',
                                fontWeight: '500',
                              }}
                            >
                              {'Add image'}
                            </button>{' '}
                            <button
                              onClick={$v['addVideo']}
                              style={{
                                whiteSpace: 'nowrap',
                                padding: '6px 10px',
                                fontSize: '13px',
                                borderRadius: '8px',
                                border: '1px solid #e5e3dc',
                                background: '#fff',
                                cursor: 'pointer',
                                fontWeight: '500',
                              }}
                            >
                              {'Add video'}
                            </button>{' '}
                            <button
                              onClick={$v['togglePicker']}
                              style={{
                                whiteSpace: 'nowrap',
                                padding: '6px 10px',
                                fontSize: '13px',
                                borderRadius: '8px',
                                border: '1px solid #141619',
                                background: '#141619',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: '500',
                              }}
                            >
                              {'From library'}
                            </button>{' '}
                          </div>{' '}
                        </div>{' '}
                        {$v['pickerOpen'] ? (
                          <>
                            {' '}
                            <div
                              style={{
                                border: '1px solid #e7e5df',
                                borderRadius: '12px',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              }}
                            >
                              {' '}
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {' '}
                                {$arr($v['folderTabs']).map((f, $index) => (
                                  <Fragment key={$index}>
                                    {' '}
                                    <button
                                      onClick={f?.pick}
                                      style={{
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        border: `1px solid ${f?.border ?? ''}`,
                                        background: `${f?.bg ?? ''}`,
                                        color: `${f?.color ?? ''}`,
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                      }}
                                    >
                                      {$t(f?.name)}
                                    </button>{' '}
                                  </Fragment>
                                ))}{' '}
                              </div>{' '}
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill,minmax(76px,1fr))',
                                  gap: '8px',
                                }}
                              >
                                {' '}
                                {$arr($v['libItems']).map((m, $index) => (
                                  <Fragment key={$index}>
                                    {' '}
                                    <button
                                      onClick={m?.use}
                                      title={`Add ${m?.name ?? ''}`}
                                      style={{
                                        aspectRatio: '1',
                                        border: '0',
                                        borderRadius: '9px',
                                        background: `${m?.thumb ?? ''}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        padding: '5px',
                                        color: '#f3e9d8',
                                        font: "600 9px 'Geist Mono',monospace",
                                        textShadow: '0 1px 2px rgba(0,0,0,.5)',
                                      }}
                                      className="dashboard-hover-g"
                                    >
                                      {$t(m?.badge)}
                                    </button>{' '}
                                  </Fragment>
                                ))}{' '}
                              </div>{' '}
                            </div>{' '}
                          </>
                        ) : null}{' '}
                      </div>{' '}
                    </div>{' '}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      {' '}
                      <button
                        onClick={$v['toggleAdv']}
                        aria-expanded={$v['advOpen']}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px 16px',
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {' '}
                        <strong style={{ fontSize: '14px' }}>{'Advanced options'}</strong>{' '}
                        <span
                          style={{
                            flex: '1',
                            fontSize: '12px',
                            color: '#677184',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {$t($v['advSummary'])}
                        </span>{' '}
                        <span style={{ color: '#677184', fontSize: '12px' }}>{$t($v['advChevron'])}</span>{' '}
                      </button>{' '}
                      <div
                        style={{
                          display: `${$v['advDisplay'] ?? ''}`,
                          padding: '0 16px 16px',
                          flexDirection: 'column',
                          gap: '14px',
                          borderTop: '1px solid #efefea',
                          paddingTop: '14px',
                        }}
                      >
                        {' '}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {' '}
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184' }}>
                            {'Labels '}
                            <span style={{ fontWeight: '400' }}>{'· internal, never published'}</span>
                          </span>{' '}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {' '}
                            {$arr($v['draftLabels']).map((l, $index) => (
                              <Fragment key={$index}>
                                {' '}
                                <button
                                  onClick={l?.toggle}
                                  style={{
                                    padding: '4px 11px',
                                    borderRadius: '7px',
                                    border: `1px solid ${l?.border ?? ''}`,
                                    background: `${l?.bg ?? ''}`,
                                    color: `${l?.color ?? ''}`,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                  }}
                                >
                                  {$t(l?.name)}
                                </button>{' '}
                              </Fragment>
                            ))}{' '}
                            <input
                              value={$dv($v['newLabel'])}
                              onChange={$v['onNewLabel']}
                              placeholder="New label"
                              style={{
                                width: '110px',
                                padding: '4px 10px',
                                border: '1px dashed #cfccc3',
                                borderRadius: '7px',
                                outline: 'none',
                                fontSize: '13px',
                              }}
                            />{' '}
                            <button
                              onClick={$v['addLabel']}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '7px',
                                border: '0',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#677184',
                              }}
                            >
                              {'Add'}
                            </button>{' '}
                          </div>{' '}
                        </div>{' '}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {' '}
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184' }}>
                            {'Note for reviewers '}
                            <span style={{ fontWeight: '400' }}>{'· private, never published'}</span>
                          </span>{' '}
                          <textarea
                            rows="2"
                            value={$dv($v['draftNote'])}
                            onChange={$v['onDraftNote']}
                            placeholder="Context for whoever approves this. e.g. Legal signed off on the claim in line 2."
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px dashed #d8d5cc',
                              borderRadius: '10px',
                              background: '#faf9f6',
                              outline: 'none',
                              fontSize: '14px',
                              lineHeight: '1.45',
                            }}
                            className="dashboard-focus-h"
                          />{' '}
                        </div>{' '}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {' '}
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184' }}>{'Repeat'}</span>{' '}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignSelf: 'flex-start',
                              border: '1px solid #e5e3dc',
                              borderRadius: '10px',
                              padding: '3px',
                              gap: '2px',
                            }}
                          >
                            {' '}
                            {$arr($v['repeatOpts']).map((r, $index) => (
                              <Fragment key={$index}>
                                {' '}
                                <button
                                  onClick={r?.pick}
                                  style={{
                                    border: '0',
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    background: `${r?.bg ?? ''}`,
                                    color: `${r?.color ?? ''}`,
                                  }}
                                >
                                  {$t(r?.label)}
                                </button>{' '}
                              </Fragment>
                            ))}{' '}
                          </div>{' '}
                          <span style={{ fontSize: '12px', color: '#677184' }}>{$t($v['repeatNote'])}</span>{' '}
                        </div>{' '}
                        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #efede7' }}>
                          {' '}
                          <button
                            onClick={$v['everToggle']}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 0',
                              border: '0',
                              background: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                width: '34px',
                                height: '20px',
                                borderRadius: '999px',
                                background: `${$v['everTrack'] ?? ''}`,
                                position: 'relative',
                                flex: 'none',
                                transition: 'background .2s',
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  left: `${$v['everKnob'] ?? ''}px`,
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: '#fff',
                                  boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                                  transition: 'left .2s',
                                }}
                              />
                            </span>{' '}
                            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                              <span style={{ fontWeight: '500', fontSize: '14px' }}>{'Evergreen'}</span>
                              <span style={{ fontSize: '12px', color: '#677184' }}>
                                {'Put this post back in the queue after it publishes'}
                              </span>
                            </span>{' '}
                          </button>{' '}
                          <button
                            onClick={$v['apprToggle']}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 0',
                              border: '0',
                              background: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                width: '34px',
                                height: '20px',
                                borderRadius: '999px',
                                background: `${$v['apprTrack'] ?? ''}`,
                                position: 'relative',
                                flex: 'none',
                                transition: 'background .2s',
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  left: `${$v['apprKnob'] ?? ''}px`,
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: '#fff',
                                  boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                                  transition: 'left .2s',
                                }}
                              />
                            </span>{' '}
                            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                              <span style={{ fontWeight: '500', fontSize: '14px' }}>{'Needs approval'}</span>
                              <span style={{ fontSize: '12px', color: '#677184' }}>
                                {'Won’t publish until someone approves it'}
                              </span>
                            </span>{' '}
                          </button>{' '}
                          <button
                            onClick={$v['remToggle']}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 0',
                              border: '0',
                              background: 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                            }}
                          >
                            {' '}
                            <span
                              style={{
                                width: '34px',
                                height: '20px',
                                borderRadius: '999px',
                                background: `${$v['remTrack'] ?? ''}`,
                                position: 'relative',
                                flex: 'none',
                                transition: 'background .2s',
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  left: `${$v['remKnob'] ?? ''}px`,
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: '#fff',
                                  boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                                  transition: 'left .2s',
                                }}
                              />
                            </span>{' '}
                            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                              <span style={{ fontWeight: '500', fontSize: '14px' }}>{'Email reminder'}</span>
                              <span style={{ fontSize: '12px', color: '#677184' }}>{$t($v['remindNote'])}</span>
                            </span>{' '}
                          </button>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div
                    style={{
                      display: `${$v['showRightCol'] ?? ''}`,
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'sticky',
                      top: '20px',
                      minWidth: '0',
                    }}
                  >
                    {' '}
                    {$v['showPreview'] ? (
                      <>
                        {' '}
                        <div
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                        >
                          {' '}
                          <strong style={{ fontSize: '14px' }}>{'Preview'}</strong>{' '}
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                              justifyContent: 'flex-end',
                              padding: '3px',
                            }}
                          >
                            {' '}
                            {$arr($v['previewTabs']).map((pt, $index) => (
                              <Fragment key={$index}>
                                {' '}
                                <button
                                  onClick={pt?.select}
                                  title={pt?.title}
                                  aria-label={`Preview ${pt?.title ?? ''}`}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    padding: '0',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: `${pt?.color ?? ''}`,
                                    border: '0',
                                    boxShadow: `${pt?.ringShadow ?? ''}`,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      background: `${pt?.logo ?? ''} center/contain no-repeat`,
                                    }}
                                  />
                                </button>{' '}
                              </Fragment>
                            ))}{' '}
                          </div>{' '}
                        </div>{' '}
                        <div
                          style={{
                            border: '1px solid #e7e5df',
                            borderRadius: '12px',
                            padding: '14px',
                            background: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          {' '}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {' '}
                            <span
                              style={{
                                position: 'relative',
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                flex: 'none',
                                background: `${$v['pv']?.pic ?? ''}`,
                              }}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  right: '-3px',
                                  bottom: '-3px',
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '50%',
                                  border: '2px solid #fff',
                                  background: `${$v['pv']?.badge ?? ''}`,
                                  display: `${$v['pv']?.badgeDisplay ?? ''}`,
                                }}
                              />
                            </span>{' '}
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                              {' '}
                              <span style={{ fontWeight: '600', fontSize: '14px' }}>{$t($v['pv']?.name)}</span>{' '}
                              <span style={{ fontSize: '12px', color: '#677184' }}>{$t($v['pv']?.handle)}</span>{' '}
                            </div>{' '}
                          </div>{' '}
                          <div
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontSize: '14px',
                              color: `${$v['pv']?.textColor ?? ''}`,
                            }}
                          >
                            {$t($v['pv']?.text)}
                          </div>{' '}
                          {$v['hasMedia'] ? (
                            <>
                              {' '}
                              <div
                                style={{ display: 'grid', gridTemplateColumns: `${$v['pv']?.cols ?? ''}`, gap: '4px' }}
                              >
                                {' '}
                                {$arr($v['pv']?.media).map((m, $index) => (
                                  <Fragment key={$index}>
                                    {' '}
                                    <div
                                      style={{
                                        aspectRatio: '1',
                                        borderRadius: '8px',
                                        background: `${m?.bg ?? ''}`,
                                        display: 'grid',
                                        placeItems: 'center',
                                        font: "500 11px 'Geist Mono',monospace",
                                        color: '#f3e9d8',
                                      }}
                                    >
                                      {$t(m?.label)}
                                    </div>{' '}
                                  </Fragment>
                                ))}{' '}
                              </div>{' '}
                            </>
                          ) : null}{' '}
                        </div>{' '}
                        <span style={{ fontSize: '11px', color: '#9aa0a8', marginTop: '-4px' }}>
                          {'Approximate preview. Each platform renders posts slightly differently.'}
                        </span>{' '}
                      </>
                    ) : null}{' '}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 18px 40px -30px rgba(20,22,25,.45)',
                      }}
                    >
                      {' '}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {' '}
                        {$arr($v['modes']).map((m, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <button
                              onClick={m?.select}
                              aria-pressed={m?.pressed}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '1px',
                                padding: '8px 10px',
                                borderRadius: '9px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                border: `1.5px solid ${m?.border ?? ''}`,
                                background: `${m?.bg ?? ''}`,
                                color: '#141619',
                              }}
                            >
                              {' '}
                              <span style={{ fontSize: '13px', fontWeight: '600' }}>{$t(m?.label)}</span>
                              <span style={{ fontSize: '11px', color: '#677184' }}>{$t(m?.hint)}</span>{' '}
                            </button>{' '}
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                      {$v['isSchedule'] ? (
                        <>
                          {' '}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {' '}
                            <input
                              type="datetime-local"
                              value={$dv($v['when'])}
                              onChange={$v['onWhen']}
                              aria-label="Date and time"
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                border: '1px solid #e7e5df',
                                borderRadius: '9px',
                                outline: 'none',
                              }}
                              className="dashboard-focus-f"
                            />{' '}
                            <span style={{ fontSize: '12px', color: '#677184' }}>{$t($v['tzShort'])}</span>{' '}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {' '}
                              {$arr($v['quickTimes']).map((q, $index) => (
                                <Fragment key={$index}>
                                  <button
                                    onClick={q?.pick}
                                    style={{
                                      padding: '4px 9px',
                                      fontSize: '12px',
                                      borderRadius: '999px',
                                      border: '1px solid #e7e5df',
                                      background: '#fff',
                                      cursor: 'pointer',
                                    }}
                                    className="dashboard-hover-5"
                                  >
                                    {$t(q?.label)}
                                  </button>
                                </Fragment>
                              ))}{' '}
                            </div>{' '}
                          </div>{' '}
                        </>
                      ) : null}{' '}
                      {$v['isQueueMode'] ? (
                        <>
                          {' '}
                          <div
                            style={{
                              padding: '10px 12px',
                              borderRadius: '9px',
                              background: '#f7ffd6',
                              border: '1px solid #e3f59a',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}
                          >
                            {' '}
                            <span style={{ fontSize: '12px', color: '#5c6b00' }}>{'Next open slot'}</span>
                            <strong style={{ fontSize: '14px' }}>{$t($v['nextSlotLabel'])}</strong>{' '}
                            <button
                              onClick={$v['goSettings']}
                              style={{
                                alignSelf: 'flex-start',
                                padding: '0',
                                border: '0',
                                background: 'transparent',
                                color: '#5c6b00',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              {'Edit posting slots'}
                            </button>{' '}
                          </div>{' '}
                        </>
                      ) : null}{' '}
                      {$v['hasConflictWarn'] ? (
                        <>
                          {' '}
                          <div
                            role="status"
                            style={{
                              padding: '9px 11px',
                              borderRadius: '9px',
                              border: '1px solid #f3dfb2',
                              background: '#fff8e6',
                              color: '#8a5a00',
                              fontSize: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}
                          >
                            <strong>{'Possible conflict'}</strong>
                            {$arr($v['conflictWarn']).map((w, $index) => (
                              <Fragment key={$index}>
                                <span>{$t(w)}</span>
                              </Fragment>
                            ))}
                          </div>{' '}
                        </>
                      ) : null}{' '}
                      {$v['hasProblems'] ? (
                        <>
                          {' '}
                          <div
                            role="alert"
                            style={{
                              padding: '9px 11px',
                              borderRadius: '9px',
                              border: '1px solid #f5c2c7',
                              background: '#fff5f5',
                              color: '#a1281f',
                              fontSize: '12px',
                              lineHeight: '1.45',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <strong>{'Fix before publishing'}</strong>
                            {$arr($v['problems']).map((pr, $index) => (
                              <Fragment key={$index}>
                                <span>
                                  {'• '}
                                  {$t(pr)}
                                </span>
                              </Fragment>
                            ))}
                          </div>{' '}
                        </>
                      ) : null}{' '}
                      <button
                        onClick={$v['submit']}
                        disabled={$v['submitDisabled']}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '0',
                          background: '#d9ff35',
                          color: '#141619',
                          fontWeight: '600',
                          fontSize: '15px',
                          cursor: 'pointer',
                          opacity: `${$v['submitOpacity'] ?? ''}`,
                        }}
                        className="dashboard-hover-1"
                      >
                        {$t($v['submitLabel'])}
                      </button>{' '}
                      <button
                        onClick={$v['goQueue']}
                        style={{
                          padding: '6px',
                          border: '0',
                          background: 'transparent',
                          color: '#677184',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        {'Cancel'}
                      </button>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isBulk'] ? (
            <>
              {' '}
              <section
                data-screen-label="Bulk"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'dashIn .25s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {' '}
                  <div>
                    {' '}
                    <h1
                      style={{
                        margin: '0',
                        fontSize: '30px',
                        lineHeight: '1.1',
                        letterSpacing: '-0.03em',
                        fontWeight: '700',
                      }}
                    >
                      {'Bulk schedule'}
                    </h1>{' '}
                    <p style={{ margin: '8px 0 0', color: '#677184', fontSize: '15px' }}>
                      {'Upload a batch of media or import a CSV. Each item becomes its own post.'}
                    </p>{' '}
                  </div>{' '}
                  <div
                    style={{
                      display: `${$v['bulkTabsDisplay'] ?? ''}`,
                      border: '1px solid #e5e3dc',
                      borderRadius: '10px',
                      background: '#fff',
                      padding: '3px',
                      gap: '2px',
                    }}
                  >
                    {' '}
                    {$arr($v['bulkTabs']).map((t, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={t?.select}
                          style={{
                            border: '0',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            background: `${t?.bg ?? ''}`,
                            color: `${t?.color ?? ''}`,
                          }}
                        >
                          {$t(t?.label)}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
                  aria-label="Progress"
                >
                  {' '}
                  {$arr($v['bulkSteps']).map((st, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <button
                        onClick={st?.go}
                        disabled={st?.disabled}
                        aria-current={st?.current}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px 6px 6px',
                          borderRadius: '999px',
                          border: `1px solid ${st?.border ?? ''}`,
                          background: `${st?.bg ?? ''}`,
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: `${st?.color ?? ''}`,
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '12px',
                            background: `${st?.numBg ?? ''}`,
                            color: `${st?.numFg ?? ''}`,
                          }}
                        >
                          {$t(st?.n)}
                        </span>
                        {$t(st?.label)}{' '}
                      </button>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                {$v['bulkStep1'] ? (
                  <>
                    {' '}
                    {$v['isBulkUpload'] ? (
                      <>
                        {' '}
                        <div
                          style={{
                            background: '#fff',
                            border: '1px solid #e7e5df',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            boxShadow: '0 1px 2px rgba(20,23,26,.06),0 8px 24px -16px rgba(20,23,26,.25)',
                          }}
                        >
                          {' '}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {' '}
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#677184' }}>
                              {'Post every file to'}
                            </span>{' '}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {' '}
                              {$arr($v['bulkAccChips']).map((a, $index) => (
                                <Fragment key={$index}>
                                  {' '}
                                  <button
                                    onClick={a?.toggle}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '5px 12px 5px 5px',
                                      borderRadius: '999px',
                                      cursor: 'pointer',
                                      border: `1px solid ${a?.border ?? ''}`,
                                      background: `${a?.bg ?? ''}`,
                                      color: `${a?.fg ?? ''}`,
                                    }}
                                  >
                                    {' '}
                                    <span
                                      style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        display: 'grid',
                                        placeItems: 'center',
                                        color: '#fff',
                                        fontSize: '9px',
                                        fontWeight: '800',
                                        background: `${a?.color ?? ''}`,
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '58%',
                                          height: '58%',
                                          background: `${a?.logo ?? ''} center/contain no-repeat`,
                                        }}
                                      />
                                    </span>{' '}
                                    <span style={{ fontSize: '14px' }}>{$t(a?.username)}</span>{' '}
                                  </button>{' '}
                                </Fragment>
                              ))}{' '}
                            </div>{' '}
                          </div>{' '}
                          <label
                            onDragOver={$v['bulkOver']}
                            onDrop={$v['bulkDrop']}
                            style={{
                              border: `1.5px dashed ${$v['dropBorder'] ?? ''}`,
                              background: `${$v['dropBg'] ?? ''}`,
                              borderRadius: '12px',
                              padding: '26px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'background .15s,border-color .15s',
                            }}
                          >
                            {' '}
                            <input
                              type="file"
                              multiple={true}
                              accept="image/*,video/*"
                              onChange={$v['onFiles']}
                              style={{ display: 'none' }}
                            />{' '}
                            <strong style={{ fontSize: '16px' }}>{'Drop images and videos here'}</strong>{' '}
                            <span style={{ fontSize: '14px', color: '#677184' }}>
                              {'Or click to choose files. Each file is placed in the next open posting slot.'}
                            </span>{' '}
                            <span style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              {' '}
                              <span
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  background: '#141619',
                                  color: '#fff',
                                  fontWeight: '500',
                                  fontSize: '14px',
                                }}
                              >
                                {'Choose files'}
                              </span>{' '}
                              <button
                                onClick={$v['addSamples']}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  border: '1px solid #e5e3dc',
                                  background: '#fff',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  fontSize: '14px',
                                }}
                              >
                                {'Use 6 sample files'}
                              </button>{' '}
                            </span>{' '}
                          </label>{' '}
                        </div>{' '}
                        {$v['hasBulkFiles'] ? (
                          <>
                            {' '}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: '#141619',
                                color: '#f8f9f6',
                                flexWrap: 'wrap',
                              }}
                            >
                              {' '}
                              <span style={{ fontSize: '14px' }}>
                                {$t($v['bulkCountLabel'])}
                                {' ready to customize'}
                              </span>{' '}
                              <button
                                onClick={$v['toStep2']}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '9px',
                                  border: '0',
                                  background: '#d9ff35',
                                  color: '#141619',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '14px',
                                }}
                              >
                                {'Continue →'}
                              </button>{' '}
                            </div>{' '}
                          </>
                        ) : null}{' '}
                      </>
                    ) : null}{' '}
                  </>
                ) : null}{' '}
                {$v['bulkStep2'] ? (
                  <>
                    {' '}
                    {$v['hasBulkFiles'] ? (
                      <>
                        {' '}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: '#fff',
                            border: '1px solid #e7e5df',
                          }}
                        >
                          {' '}
                          <span style={{ fontSize: '13px', color: '#677184' }}>{'Apply to all rows'}</span>{' '}
                          <input
                            value={$dv($v['bulkAllCap'])}
                            onChange={$v['onBulkAllCap']}
                            placeholder="Caption for every file"
                            style={{
                              flex: '1 1 220px',
                              padding: '7px 10px',
                              border: '1px solid #e7e5df',
                              borderRadius: '8px',
                              outline: 'none',
                              fontSize: '13px',
                            }}
                          />{' '}
                          <button
                            onClick={$v['applyAllCap']}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: '1px solid #141619',
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            {'Apply caption'}
                          </button>{' '}
                        </div>{' '}
                        <div
                          style={{
                            background: '#fff',
                            border: '1px solid #e7e5df',
                            borderRadius: '12px',
                            overflow: 'hidden',
                          }}
                        >
                          {' '}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '12px 16px',
                              borderBottom: '1px solid #e5e3dc',
                              background: '#faf9f6',
                              flexWrap: 'wrap',
                            }}
                          >
                            {' '}
                            <strong>{$t($v['bulkCountLabel'])}</strong>{' '}
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {' '}
                              <button
                                onClick={$v['respace']}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '13px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e3dc',
                                  background: '#fff',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                }}
                              >
                                {'Re-space into slots'}
                              </button>{' '}
                              <button
                                onClick={$v['clearBulk']}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '13px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e3dc',
                                  background: '#fff',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                }}
                              >
                                {'Clear'}
                              </button>{' '}
                            </span>{' '}
                          </div>{' '}
                          {$arr($v['bulkRows']).map((f, $index) => (
                            <Fragment key={$index}>
                              {' '}
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '24px 64px minmax(0,1fr) auto',
                                  gridTemplateAreas: "'ord thumb main x' 'ord thumb meta x'",
                                  columnGap: '12px',
                                  rowGap: '8px',
                                  alignItems: 'center',
                                  padding: '12px 16px',
                                  borderTop: `${f?.divider ?? ''}`,
                                }}
                              >
                                {' '}
                                <span style={{ gridArea: 'ord', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <button
                                    onClick={f?.up}
                                    aria-label="Move up"
                                    style={{
                                      border: '0',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      color: '#677184',
                                      fontSize: '11px',
                                      padding: '0',
                                    }}
                                  >
                                    {'▲'}
                                  </button>
                                  <button
                                    onClick={f?.down}
                                    aria-label="Move down"
                                    style={{
                                      border: '0',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      color: '#677184',
                                      fontSize: '11px',
                                      padding: '0',
                                    }}
                                  >
                                    {'▼'}
                                  </button>
                                </span>{' '}
                                <div
                                  style={{
                                    gridArea: 'thumb',
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '9px',
                                    overflow: 'hidden',
                                    background: `${f?.thumb ?? ''}`,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '5px',
                                    color: '#f3e9d8',
                                    font: "600 10px 'Geist Mono',monospace",
                                  }}
                                >
                                  {' '}
                                  <span style={{ textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>{$t(f?.kind)}</span>{' '}
                                </div>{' '}
                                <div
                                  style={{
                                    gridArea: 'main',
                                    minWidth: '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                  }}
                                >
                                  {' '}
                                  <span
                                    style={{
                                      font: "500 12px 'Geist Mono',monospace",
                                      color: '#677184',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {$t(f?.name)}
                                  </span>{' '}
                                  <input
                                    value={$dv(f?.caption)}
                                    onChange={f?.onCaption}
                                    placeholder="Caption"
                                    style={{
                                      width: '100%',
                                      padding: '8px 10px',
                                      border: '1px solid #e5e3dc',
                                      borderRadius: '8px',
                                      outline: 'none',
                                    }}
                                    className="dashboard-focus-f"
                                  />{' '}
                                  {f?.hasWarn ? (
                                    <>
                                      <span style={{ fontSize: '12px', color: '#d98c0b' }}>{$t(f?.warn)}</span>
                                    </>
                                  ) : null}{' '}
                                </div>{' '}
                                <span
                                  style={{
                                    gridArea: 'meta',
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <input
                                    type="datetime-local"
                                    value={$dv(f?.when)}
                                    onChange={f?.onWhen}
                                    aria-label="Scheduled date and time"
                                    style={{
                                      width: '200px',
                                      padding: '8px 10px',
                                      border: '1px solid #e5e3dc',
                                      borderRadius: '8px',
                                      outline: 'none',
                                      fontSize: '13px',
                                    }}
                                  />{' '}
                                  <span
                                    style={{
                                      padding: '2px 9px',
                                      borderRadius: '999px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      background: `${f?.vBg ?? ''}`,
                                      color: `${f?.vFg ?? ''}`,
                                      justifySelf: 'start',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {$t(f?.vLabel)}
                                  </span>
                                </span>{' '}
                                <button
                                  onClick={f?.remove}
                                  aria-label="Remove file"
                                  title="Remove"
                                  style={{
                                    gridArea: 'x',
                                    border: '0',
                                    background: 'transparent',
                                    color: '#9aa0a8',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    padding: '4px 8px',
                                  }}
                                >
                                  {'×'}
                                </button>{' '}
                              </div>{' '}
                            </Fragment>
                          ))}{' '}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              gap: '10px',
                              padding: '14px 16px',
                              borderTop: '1px solid #e5e3dc',
                              background: '#faf9f6',
                            }}
                          >
                            {' '}
                            <button
                              onClick={$v['toStep1']}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #e5e3dc',
                                background: '#fff',
                                cursor: 'pointer',
                                fontWeight: '500',
                                marginRight: 'auto',
                              }}
                            >
                              {'← Add more files'}
                            </button>{' '}
                            <button
                              onClick={$v['bulkDrafts']}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #e5e3dc',
                                background: '#fff',
                                cursor: 'pointer',
                                fontWeight: '500',
                              }}
                            >
                              {'Save as drafts'}
                            </button>{' '}
                            <button
                              onClick={$v['toStep3']}
                              style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: '0',
                                background: '#141619',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              {'Review →'}
                            </button>{' '}
                            <button
                              data-x="old"
                              style={{ display: 'none' }}
                              onClick={$v['bulkSchedule']}
                              disabled={$v['bulkDisabled']}
                            >
                              {$t($v['bulkSubmitLabel'])}
                            </button>{' '}
                          </div>{' '}
                        </div>{' '}
                      </>
                    ) : null}{' '}
                  </>
                ) : null}{' '}
                {$v['bulkStep3'] ? (
                  <>
                    {' '}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
                        gap: '10px',
                      }}
                    >
                      {' '}
                      {$arr($v['bulkSummary']).map((b, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <div
                            style={{
                              padding: '14px 16px',
                              borderRadius: '12px',
                              background: '#fff',
                              border: `1px solid ${b?.border ?? ''}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                letterSpacing: '-0.03em',
                                color: `${b?.color ?? ''}`,
                              }}
                            >
                              {$t(b?.value)}
                            </span>
                            <span style={{ fontSize: '12px', color: '#677184' }}>{$t(b?.label)}</span>
                          </div>{' '}
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                    <div
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5df',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {' '}
                      <strong style={{ fontSize: '14px' }}>{'Queue distribution'}</strong>{' '}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '70px' }}>
                        {' '}
                        {$arr($v['bulkDist']).map((d, $index) => (
                          <Fragment key={$index}>
                            <div
                              title={d?.title}
                              style={{
                                flex: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                height: '100%',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <span style={{ fontSize: '11px', color: '#677184' }}>{$t(d?.n)}</span>
                              <span
                                style={{
                                  width: '100%',
                                  height: `${d?.h ?? ''}%`,
                                  minHeight: '3px',
                                  borderRadius: '4px',
                                  background: `${d?.bg ?? ''}`,
                                }}
                              />
                              <span style={{ fontSize: '11px', color: '#677184' }}>{$t(d?.day)}</span>
                            </div>
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                      {$arr($v['bulkIssues']).map((x, $index) => (
                        <Fragment key={$index}>
                          <span style={{ fontSize: '13px', color: `${x?.color ?? ''}` }}>{$t(x?.text)}</span>
                        </Fragment>
                      ))}{' '}
                    </div>{' '}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      {' '}
                      <button
                        onClick={$v['toStep2']}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #e5e3dc',
                          background: '#fff',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        {'← Back to edit'}
                      </button>{' '}
                      <span style={{ display: 'flex', gap: '8px' }}>
                        {' '}
                        {$v['bulkHasInvalid'] ? (
                          <>
                            <button
                              onClick={$v['bulkReport']}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #e5e3dc',
                                background: '#fff',
                                cursor: 'pointer',
                                fontWeight: '500',
                              }}
                            >
                              {'Download error report'}
                            </button>
                          </>
                        ) : null}{' '}
                        <button
                          onClick={$v['bulkScheduleValid']}
                          disabled={$v['bulkNoValid']}
                          style={{
                            padding: '11px 18px',
                            borderRadius: '10px',
                            border: '0',
                            background: '#d9ff35',
                            color: '#141619',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: `${$v['bulkValidOp'] ?? ''}`,
                          }}
                        >
                          {$t($v['bulkValidLabel'])}
                        </button>{' '}
                      </span>{' '}
                    </div>{' '}
                  </>
                ) : null}{' '}
                {$v['bulkStep1'] ? (
                  <>
                    {' '}
                    {$v['isBulkCsv'] ? (
                      <>
                        {' '}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
                          {' '}
                          <div
                            style={{
                              flex: '1 1 380px',
                              minWidth: '0',
                              background: '#fff',
                              border: '1px solid #e7e5df',
                              borderRadius: '12px',
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            {' '}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              {' '}
                              <strong>{'Paste CSV'}</strong>{' '}
                              <span style={{ font: "500 12px 'Geist Mono',monospace", color: '#677184' }}>
                                {'date,time,accounts,caption'}
                              </span>{' '}
                            </div>{' '}
                            <textarea
                              rows="12"
                              value={$dv($v['csv'])}
                              onChange={$v['onCsv']}
                              spellCheck="false"
                              style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e3dc',
                                borderRadius: '10px',
                                outline: 'none',
                                font: "12px/1.6 'Geist Mono',monospace",
                                whiteSpace: 'pre',
                                overflowX: 'auto',
                              }}
                              className="dashboard-focus-f"
                            />{' '}
                            <span style={{ fontSize: '13px', color: '#677184' }}>
                              {
                                'Separate accounts with ; using platform names (x, bluesky, linkedin…). Times are in your workspace timezone.'
                              }
                            </span>{' '}
                          </div>{' '}
                          <div
                            style={{
                              flex: '1 1 460px',
                              minWidth: '0',
                              background: '#fff',
                              border: '1px solid #e7e5df',
                              borderRadius: '12px',
                              overflow: 'hidden',
                            }}
                          >
                            {' '}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '12px 16px',
                                borderBottom: '1px solid #e5e3dc',
                                background: '#faf9f6',
                              }}
                            >
                              {' '}
                              <strong>{'Preview'}</strong>{' '}
                              <span style={{ fontSize: '13px', color: '#677184' }}>{$t($v['csvSummary'])}</span>{' '}
                            </div>{' '}
                            {$arr($v['csvRows']).map((r, $index) => (
                              <Fragment key={$index}>
                                {' '}
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '22px 118px minmax(0,1fr)',
                                    gap: '12px',
                                    alignItems: 'start',
                                    padding: '11px 16px',
                                    borderTop: `${r?.divider ?? ''}`,
                                    background: `${r?.bg ?? ''}`,
                                  }}
                                >
                                  {' '}
                                  <span
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      display: 'grid',
                                      placeItems: 'center',
                                      fontSize: '11px',
                                      fontWeight: '800',
                                      background: `${r?.iconBg ?? ''}`,
                                      color: `${r?.iconFg ?? ''}`,
                                    }}
                                  >
                                    {$t(r?.icon)}
                                  </span>{' '}
                                  <span
                                    style={{
                                      font: "500 12px 'Geist Mono',monospace",
                                      color: '#141619',
                                      paddingTop: '2px',
                                    }}
                                  >
                                    {$t(r?.when)}
                                  </span>{' '}
                                  <div style={{ minWidth: '0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {' '}
                                    <span
                                      style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}
                                    >
                                      {' '}
                                      {$arr(r?.accs).map((a, $index) => (
                                        <Fragment key={$index}>
                                          <span
                                            style={{
                                              width: '18px',
                                              height: '18px',
                                              borderRadius: '50%',
                                              display: 'grid',
                                              placeItems: 'center',
                                              color: '#fff',
                                              fontSize: '8px',
                                              fontWeight: '800',
                                              background: `${a?.color ?? ''}`,
                                            }}
                                          >
                                            <span
                                              style={{
                                                width: '58%',
                                                height: '58%',
                                                background: `${a?.logo ?? ''} center/contain no-repeat`,
                                              }}
                                            />
                                          </span>
                                        </Fragment>
                                      ))}{' '}
                                      <span
                                        style={{
                                          fontSize: '13px',
                                          minWidth: '0',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          flex: '1',
                                        }}
                                      >
                                        {$t(r?.caption)}
                                      </span>{' '}
                                    </span>{' '}
                                    {r?.hasIssue ? (
                                      <>
                                        <span style={{ fontSize: '12px', color: `${r?.issueColor ?? ''}` }}>
                                          {$t(r?.issue)}
                                        </span>
                                      </>
                                    ) : null}{' '}
                                  </div>{' '}
                                </div>{' '}
                              </Fragment>
                            ))}{' '}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                padding: '14px 16px',
                                borderTop: '1px solid #e5e3dc',
                                background: '#faf9f6',
                              }}
                            >
                              {' '}
                              <button
                                onClick={$v['importCsv']}
                                disabled={$v['csvDisabled']}
                                style={{
                                  padding: '10px 16px',
                                  borderRadius: '10px',
                                  border: '0',
                                  background: '#d9ff35',
                                  color: '#141619',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  opacity: `${$v['csvOpacity'] ?? ''}`,
                                }}
                              >
                                {$t($v['csvSubmitLabel'])}
                              </button>{' '}
                            </div>{' '}
                          </div>{' '}
                        </div>{' '}
                      </>
                    ) : null}{' '}
                  </>
                ) : null}{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isLibrary'] ? (
            <>
              {' '}
              <section
                data-screen-label="Library"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'dashIn .25s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {' '}
                  <div>
                    {' '}
                    <h1
                      style={{
                        margin: '0',
                        fontSize: '30px',
                        lineHeight: '1.1',
                        letterSpacing: '-0.03em',
                        fontWeight: '700',
                      }}
                    >
                      {'Media library'}
                    </h1>{' '}
                    <p style={{ margin: '8px 0 0', color: '#677184', fontSize: '15px' }}>{$t($v['libSummary'])}</p>{' '}
                  </div>{' '}
                  <label
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      background: '#141619',
                      color: '#fff',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {' '}
                    <input
                      type="file"
                      multiple={true}
                      accept="image/*,video/*"
                      onChange={$v['onLibFiles']}
                      style={{ display: 'none' }}
                    />
                    {'Upload to '}
                    {$t($v['folderName'])}{' '}
                  </label>{' '}
                </div>{' '}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '190px minmax(0,1fr)',
                    gap: '18px',
                    alignItems: 'start',
                  }}
                  className="sfy-stack"
                >
                  {' '}
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #e7e5df',
                      borderRadius: '12px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {' '}
                    {$arr($v['folderTabs']).map((f, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={f?.pick}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '9px 10px',
                            borderRadius: '9px',
                            border: '0',
                            background: `${f?.navBg ?? ''}`,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontWeight: '500',
                            fontSize: '14px',
                          }}
                          className="dashboard-hover-i"
                        >
                          {' '}
                          <span
                            style={{
                              width: '18px',
                              height: '14px',
                              borderRadius: '3px',
                              background: `${f?.folderColor ?? ''}`,
                              flex: 'none',
                            }}
                          />{' '}
                          <span style={{ flex: '1' }}>{$t(f?.name)}</span>{' '}
                          <span style={{ fontSize: '12px', color: '#9aa0a8' }}>{$t(f?.count)}</span>{' '}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        padding: '8px 4px 4px',
                        borderTop: '1px solid #efede7',
                        marginTop: '6px',
                      }}
                    >
                      {' '}
                      <input
                        value={$dv($v['newFolder'])}
                        onChange={$v['onNewFolder']}
                        placeholder="New folder"
                        style={{
                          flex: '1',
                          minWidth: '0',
                          padding: '6px 10px',
                          border: '1px solid #e7e5df',
                          borderRadius: '8px',
                          outline: 'none',
                          fontSize: '13px',
                        }}
                      />{' '}
                      <button
                        onClick={$v['addFolder']}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #e7e5df',
                          background: '#fff',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        {'Add'}
                      </button>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '0' }}>
                    {' '}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {' '}
                      <input
                        value={$dv($v['libQ'])}
                        onChange={$v['onLibQ']}
                        placeholder="Search files"
                        aria-label="Search files by name"
                        style={{
                          flex: '1 1 180px',
                          padding: '7px 12px',
                          border: '1px solid #e7e5df',
                          borderRadius: '9px',
                          outline: 'none',
                          fontSize: '13px',
                          background: '#fff',
                        }}
                        className="dashboard-focus-f"
                      />{' '}
                      <select
                        value={$dv($v['libType'])}
                        onChange={$v['onLibType']}
                        aria-label="File type"
                        style={{
                          padding: '7px 10px',
                          border: '1px solid #e7e5df',
                          borderRadius: '9px',
                          background: '#fff',
                          fontSize: '13px',
                        }}
                      >
                        <option value="">{'All types'}</option>
                        <option value="IMG">{'Images'}</option>
                        <option value="VIDEO">{'Videos'}</option>
                      </select>{' '}
                      <select
                        value={$dv($v['libSort'])}
                        onChange={$v['onLibSort']}
                        aria-label="Sort"
                        style={{
                          padding: '7px 10px',
                          border: '1px solid #e7e5df',
                          borderRadius: '9px',
                          background: '#fff',
                          fontSize: '13px',
                        }}
                      >
                        <option value="new">{'Newest'}</option>
                        <option value="name">{'Name'}</option>
                        <option value="used">{'Most used'}</option>
                      </select>{' '}
                      <div
                        style={{
                          display: 'inline-flex',
                          border: '1px solid #e7e5df',
                          borderRadius: '9px',
                          background: '#fff',
                          padding: '2px',
                        }}
                      >
                        {' '}
                        {$arr($v['libViews']).map((v, $index) => (
                          <Fragment key={$index}>
                            <button
                              onClick={v?.pick}
                              style={{
                                border: '0',
                                padding: '4px 10px',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                background: `${v?.bg ?? ''}`,
                                color: `${v?.color ?? ''}`,
                              }}
                            >
                              {$t(v?.label)}
                            </button>
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                    </div>{' '}
                    {$v['libSelCount'] ? (
                      <>
                        {' '}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: '#141619',
                            color: '#f8f9f6',
                            fontSize: '13px',
                            flexWrap: 'wrap',
                          }}
                        >
                          {' '}
                          <strong>
                            {$t($v['libSelCount'])}
                            {' selected'}
                          </strong>{' '}
                          <span style={{ flex: '1' }} /> <span style={{ color: '#a3a9b4' }}>{'Move to'}</span>{' '}
                          <select
                            value=""
                            onChange={$v['libBulkMove']}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '7px',
                              border: '1px solid #3a3e45',
                              background: '#1f2226',
                              color: '#f8f9f6',
                              fontSize: '12px',
                            }}
                          >
                            <option value="">{'Choose folder'}</option>
                            {$arr($v['folderNames']).map((o, $index) => (
                              <Fragment key={$index}>
                                <option value={$dv(o)}>{o}</option>
                              </Fragment>
                            ))}
                          </select>{' '}
                          <button
                            onClick={$v['libClearSel']}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '7px',
                              border: '0',
                              background: '#d9ff35',
                              color: '#141619',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '12px',
                            }}
                          >
                            {'Done'}
                          </button>{' '}
                        </div>{' '}
                      </>
                    ) : null}{' '}
                    {$v['libEmpty'] ? (
                      <>
                        {' '}
                        <div
                          style={{
                            padding: '48px 20px',
                            border: '1px dashed #d8d5cc',
                            borderRadius: '12px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            alignItems: 'center',
                          }}
                        >
                          {' '}
                          <strong style={{ fontSize: '15px' }}>{'Nothing here yet'}</strong>{' '}
                          <span style={{ fontSize: '13px', color: '#677184' }}>
                            {'Upload images or videos to this folder, or change your search.'}
                          </span>{' '}
                        </div>{' '}
                      </>
                    ) : null}{' '}
                    <div style={{ display: 'grid', gridTemplateColumns: `${$v['libCols'] ?? ''}`, gap: '12px' }}>
                      {' '}
                      {$arr($v['libCards']).map((m, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <div
                            style={{
                              position: 'relative',
                              background: '#fff',
                              border: `1px solid ${m?.cardBorder ?? ''}`,
                              borderRadius: '12px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: `${$v['libDir'] ?? ''}`,
                              transition: 'transform .2s,box-shadow .2s',
                            }}
                            className="dashboard-hover-j"
                          >
                            {' '}
                            <button
                              onClick={m?.toggleSel}
                              aria-label={`Select ${m?.name ?? ''}`}
                              style={{
                                position: 'absolute',
                                margin: '8px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                border: `1.5px solid ${m?.selBorder ?? ''}`,
                                background: `${m?.selBg ?? ''}`,
                                color: '#141619',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '800',
                                padding: '0',
                                zIndex: '1',
                              }}
                            >
                              {$t(m?.selMark)}
                            </button>{' '}
                            <div
                              onClick={m?.preview}
                              style={{
                                cursor: 'zoom-in',
                                aspectRatio: `${$v['libRatio'] ?? ''}`,
                                width: `${$v['libThumbW'] ?? ''}`,
                                flex: `${$v['libThumbFlex'] ?? ''}`,
                                background: `${m?.thumb ?? ''}`,
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                                padding: '8px',
                                color: '#f3e9d8',
                                font: "600 10px 'Geist Mono',monospace",
                                textShadow: '0 1px 2px rgba(0,0,0,.5)',
                              }}
                            >
                              <span>{$t(m?.badge)}</span>
                              <span style={{ display: `${$v['libUsedThumb'] ?? ''}` }}>{$t(m?.used)}</span>
                            </div>{' '}
                            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {' '}
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {$t(m?.name)}
                              </span>{' '}
                              <span
                                style={{ display: `${$v['libUsedText'] ?? ''}`, fontSize: '12px', color: '#677184' }}
                              >
                                {$t(m?.used)}
                              </span>{' '}
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {' '}
                                <select
                                  value={$dv(m?.folder)}
                                  onChange={m?.move}
                                  title="Move to folder"
                                  style={{
                                    flex: '1',
                                    minWidth: '0',
                                    padding: '5px 6px',
                                    border: '1px solid #e7e5df',
                                    borderRadius: '7px',
                                    background: '#fff',
                                    fontSize: '12px',
                                  }}
                                >
                                  {$arr($v['folderNames']).map((o, $index) => (
                                    <Fragment key={$index}>
                                      <option value={$dv(o)}>{o}</option>
                                    </Fragment>
                                  ))}
                                </select>{' '}
                                <button
                                  onClick={m?.use}
                                  style={{
                                    padding: '5px 9px',
                                    borderRadius: '7px',
                                    border: '0',
                                    background: '#d9ff35',
                                    color: '#141619',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {'Use'}
                                </button>{' '}
                              </div>{' '}
                            </div>{' '}
                          </div>{' '}
                        </Fragment>
                      ))}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isAccounts'] ? (
            <>
              {' '}
              <section
                data-screen-label="Accounts"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'dashIn .25s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div>
                  {' '}
                  <h1
                    style={{
                      margin: '0',
                      fontSize: '30px',
                      lineHeight: '1.1',
                      letterSpacing: '-0.03em',
                      fontWeight: '700',
                    }}
                  >
                    {'Accounts'}
                  </h1>{' '}
                  <p style={{ margin: '8px 0 0', color: '#677184', fontSize: '15px' }}>
                    {$t($v['accountCount'])}
                    {' of '}
                    {$t($v['accountLimitLabel'])}
                    {' connected. Multiple accounts per platform are fine.'}
                  </p>{' '}
                </div>{' '}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {' '}
                  <input
                    value={$dv($v['acQ'])}
                    onChange={$v['onAcQ']}
                    placeholder="Search accounts"
                    aria-label="Search accounts"
                    style={{
                      flex: '1 1 200px',
                      padding: '7px 12px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      outline: 'none',
                      fontSize: '13px',
                      background: '#fff',
                    }}
                  />{' '}
                  <select
                    value={$dv($v['acPlat'])}
                    onChange={$v['onAcPlat']}
                    aria-label="Platform"
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                    }}
                  >
                    {$arr($v['calPlatOpts']).map((o, $index) => (
                      <Fragment key={$index}>
                        <option value={$dv(o?.v)}>{o?.l}</option>
                      </Fragment>
                    ))}
                  </select>{' '}
                  <select
                    value={$dv($v['acSt'])}
                    onChange={$v['onAcSt']}
                    aria-label="Connection status"
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                    }}
                  >
                    <option value="">{'All statuses'}</option>
                    <option value="issue">{'Needs attention'}</option>
                    <option value="ok">{'Connected'}</option>
                  </select>{' '}
                </div>{' '}
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e7e5df',
                    borderRadius: '12px',
                    boxShadow: '0 1px 0 rgba(20,23,26,.03),0 16px 40px -28px rgba(20,23,26,.3)',
                    overflow: 'hidden',
                  }}
                >
                  {' '}
                  {$arr($v['connected']).map((a, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 18px',
                          borderTop: `${a?.divider ?? ''}`,
                        }}
                        className="sfy-arow"
                      >
                        {' '}
                        <span
                          style={{
                            position: 'relative',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: `${a?.pic ?? ''}`,
                            flex: 'none',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              right: '-3px',
                              bottom: '-3px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: '2px solid #fff',
                              background: `${a?.badge ?? ''}`,
                              display: `${a?.badgeDisplay ?? ''}`,
                            }}
                          />
                        </span>{' '}
                        <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                          {' '}
                          <span style={{ fontWeight: '600' }}>{$t(a?.display)}</span>{' '}
                          <span style={{ fontSize: '13px', color: '#677184' }}>
                            {'@'}
                            {$t(a?.username)}
                            {' · '}
                            {$t(a?.platform)}
                            {' · '}
                            {$t(a?.healthDetail)}
                          </span>{' '}
                        </div>{' '}
                        <span style={{ fontSize: '13px', color: '#677184' }}>{$t(a?.queued)}</span>{' '}
                        <span
                          title={a?.healthDetail}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: `${a?.hFg ?? ''}`,
                            padding: '2px 9px',
                            borderRadius: '999px',
                            background: `${a?.hBg ?? ''}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {$t(a?.hLabel)}
                        </span>{' '}
                        {a?.needsFix ? (
                          <>
                            <button
                              onClick={a?.reconnect}
                              style={{
                                padding: '6px 10px',
                                fontSize: '13px',
                                borderRadius: '8px',
                                border: '0',
                                background: '#141619',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              {'Reconnect'}
                            </button>
                          </>
                        ) : null}{' '}
                        <button
                          onClick={a?.disconnect}
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '1px solid #e7e5df',
                            background: '#fff',
                            color: '#677184',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                          className="dashboard-hover-k"
                        >
                          {'Disconnect'}
                        </button>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <h3 style={{ margin: '8px 0 0', fontSize: '16px' }}>{'Connect a platform'}</h3>{' '}
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '12px' }}
                >
                  {' '}
                  {$arr($v['platformCards']).map((p, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          background: '#fff',
                          border: '1px solid #e7e5df',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {' '}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {' '}
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: '800',
                              background: `${p?.color ?? ''}`,
                            }}
                          >
                            <span
                              style={{
                                width: '58%',
                                height: '58%',
                                background: `${p?.logo ?? ''} center/contain no-repeat`,
                              }}
                            />
                          </span>{' '}
                          <strong>{$t(p?.label)}</strong> <span style={{ flex: '1' }} />{' '}
                          {p?.needsKeys ? (
                            <>
                              {' '}
                              <span
                                style={{
                                  padding: '1px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: '#677184',
                                  border: '1px solid #e5e3dc',
                                  background: '#f6f5f1',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {'Coming soon'}
                              </span>{' '}
                            </>
                          ) : null}{' '}
                          {p?.hasCount ? (
                            <>
                              {' '}
                              <span style={{ font: "500 12px 'Geist Mono',monospace", color: '#677184' }}>
                                {$t(p?.count)}
                              </span>{' '}
                            </>
                          ) : null}{' '}
                        </div>{' '}
                        <span style={{ fontSize: '13px', color: '#677184', minHeight: '40px', textWrap: 'pretty' }}>
                          {$t(p?.note)}
                        </span>{' '}
                        <button
                          onClick={p?.connect}
                          disabled={p?.needsKeys}
                          style={{
                            alignSelf: 'flex-start',
                            padding: '6px 10px',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '1px solid #e5e3dc',
                            background: '#fff',
                            cursor: `${p?.cursor ?? ''}`,
                            opacity: `${p?.btnOpacity ?? ''}`,
                            fontWeight: '500',
                          }}
                          className="dashboard-hover-5"
                        >
                          {'Connect '}
                          {$t(p?.label)}
                        </button>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isAnalytics'] ? (
            <>
              {' '}
              <section
                data-screen-label="Analytics"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'dashIn .25s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div>
                  {' '}
                  <h1
                    style={{
                      margin: '0',
                      fontSize: '30px',
                      lineHeight: '1.1',
                      letterSpacing: '-0.03em',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {'Analytics '}
                    <span
                      style={{
                        padding: '1px 9px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#d9ff35',
                        color: '#141619',
                      }}
                    >
                      {'beta'}
                    </span>
                  </h1>{' '}
                  <p style={{ margin: '8px 0 0', color: '#677184', fontSize: '15px' }}>
                    {'Publishing activity across every connected account.'}
                  </p>{' '}
                </div>{' '}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {' '}
                  <select
                    value={$dv($v['aRange'])}
                    onChange={$v['onARange']}
                    aria-label="Date range"
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                    }}
                  >
                    <option value="7">{'Last 7 days'}</option>
                    <option value="14">{'Last 14 days'}</option>
                    <option value="30">{'Last 30 days'}</option>
                  </select>{' '}
                  <select
                    value={$dv($v['aPlat'])}
                    onChange={$v['onAPlat']}
                    aria-label="Platform"
                    style={{
                      padding: '7px 10px',
                      border: '1px solid #e7e5df',
                      borderRadius: '9px',
                      background: '#fff',
                      fontSize: '13px',
                    }}
                  >
                    {$arr($v['calPlatOpts']).map((o, $index) => (
                      <Fragment key={$index}>
                        <option value={$dv(o?.v)}>{o?.l}</option>
                      </Fragment>
                    ))}
                  </select>{' '}
                  <span
                    style={{ fontSize: '12px', color: '#677184' }}
                    title="Success rate = published attempts ÷ (published + failed attempts) for posts whose time has passed, counted per account. Scheduled and draft posts are excluded."
                  >
                    {
                      'ⓘ Success rate = published ÷ (published + failed) attempts in the period, per account. Scheduled posts are excluded.'
                    }
                  </span>{' '}
                </div>{' '}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
                    gap: '1px',
                    background: '#e7e5df',
                    border: '1px solid #e7e5df',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 40px -28px rgba(20,23,26,.3)',
                  }}
                  className="sfy-g2"
                >
                  {' '}
                  {$arr($v['stats']).map((s, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          background: '#fff',
                          padding: '22px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        {' '}
                        <span style={{ fontSize: '13px', color: '#677184' }}>{$t(s?.label)}</span>{' '}
                        <span
                          style={{
                            fontSize: '34px',
                            fontWeight: '700',
                            letterSpacing: '-0.04em',
                            lineHeight: '1',
                            color: `${s?.color ?? ''}`,
                          }}
                        >
                          {$t(s?.value)}
                        </span>{' '}
                        <span style={{ fontSize: '12px', color: '#677184' }}>{$t(s?.delta)}</span>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e7e5df',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {' '}
                  <strong>{'Posts published, last 14 days'}</strong>{' '}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
                    {' '}
                    {$arr($v['bars']).map((b, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <div
                          title={b?.title}
                          style={{
                            flex: '1',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'stretch',
                            gap: '4px',
                          }}
                        >
                          {' '}
                          <span
                            style={{ font: "500 11px 'Geist Mono',monospace", color: '#677184', textAlign: 'center' }}
                          >
                            {$t(b?.n)}
                          </span>{' '}
                          <div
                            style={{ borderRadius: '4px', height: `${b?.h ?? ''}`, background: `${b?.bg ?? ''}` }}
                          />{' '}
                        </div>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {' '}
                    {$arr($v['bars']).map((b, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <span
                          style={{
                            flex: '1',
                            textAlign: 'center',
                            font: "500 11px 'Geist Mono',monospace",
                            color: '#9aa0a8',
                          }}
                        >
                          {$t(b?.day)}
                        </span>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{ background: '#fff', border: '1px solid #e7e5df', borderRadius: '12px', overflow: 'hidden' }}
                >
                  {' '}
                  {$arr($v['byPlatform']).map((r, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0,1fr) auto',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '12px 18px',
                          borderTop: `${r?.divider ?? ''}`,
                        }}
                      >
                        {' '}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {' '}
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: '800',
                              background: `${r?.color ?? ''}`,
                            }}
                          >
                            <span
                              style={{
                                width: '58%',
                                height: '58%',
                                background: `${r?.logo ?? ''} center/contain no-repeat`,
                              }}
                            />
                          </span>{' '}
                          <strong style={{ fontSize: '14px' }}>{$t(r?.label)}</strong>{' '}
                        </div>{' '}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {' '}
                          <span
                            style={{
                              padding: '1px 9px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#15803d',
                              border: '1px solid #cdebd8',
                              background: '#effaf3',
                            }}
                          >
                            {$t(r?.published)}
                            {' published'}
                          </span>{' '}
                          {r?.hasFailed ? (
                            <>
                              {' '}
                              <span
                                style={{
                                  padding: '1px 9px',
                                  borderRadius: '999px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: '#dc3545',
                                  border: '1px solid #f4c6c2',
                                  background: '#fff1f0',
                                }}
                              >
                                {$t(r?.failed)}
                                {' failed'}
                              </span>{' '}
                            </>
                          ) : null}{' '}
                        </div>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <div
                  style={{ background: '#fff', border: '1px solid #e7e5df', borderRadius: '12px', overflow: 'hidden' }}
                  className="sfy-tscroll"
                >
                  {' '}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0,1fr) 90px 100px 90px 70px',
                      gap: '12px',
                      padding: '10px 18px',
                      background: '#faf9f6',
                      borderBottom: '1px solid #e5e3dc',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#677184',
                    }}
                    className="sfy-trow"
                  >
                    {' '}
                    <span title="Shown only where the platform API reports the metric">
                      {'Recent posts · metrics as reported by each platform'}
                    </span>
                    <span style={{ textAlign: 'right' }}>{'Impressions'}</span>
                    <span style={{ textAlign: 'right' }}>{'Engagements'}</span>
                    <span style={{ textAlign: 'right' }}>{'Link clicks'}</span>
                    <span style={{ textAlign: 'right' }}>{'Rate'}</span>{' '}
                  </div>{' '}
                  {$arr($v['postStats']).map((r, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0,1fr) 90px 100px 90px 70px',
                          gap: '12px',
                          alignItems: 'center',
                          padding: '11px 18px',
                          borderTop: `${r?.divider ?? ''}`,
                        }}
                        className="sfy-trow"
                      >
                        {' '}
                        <div style={{ minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {' '}
                          <span
                            style={{
                              fontSize: '14px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {$t(r?.caption)}
                          </span>{' '}
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              color: '#677184',
                            }}
                          >
                            {' '}
                            {$arr(r?.dots).map((c, $index) => (
                              <Fragment key={$index}>
                                <span
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    marginRight: '-5px',
                                    borderRadius: '50%',
                                    flex: 'none',
                                    border: '1.5px solid #ffffff',
                                    background: `${c?.color ?? ''}`,
                                    display: 'grid',
                                    placeItems: 'center',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '60%',
                                      height: '60%',
                                      background: `${c?.logo ?? ''} center/contain no-repeat`,
                                    }}
                                  />
                                </span>
                              </Fragment>
                            ))}{' '}
                            {$t(r?.when)}{' '}
                          </span>{' '}
                        </div>{' '}
                        <span style={{ textAlign: 'right', font: "500 13px 'Geist Mono',monospace" }}>
                          {$t(r?.imp)}
                        </span>{' '}
                        <span style={{ textAlign: 'right', font: "500 13px 'Geist Mono',monospace" }}>
                          {$t(r?.eng)}
                        </span>{' '}
                        <span style={{ textAlign: 'right', font: "500 13px 'Geist Mono',monospace" }}>
                          {$t(r?.clicks)}
                        </span>{' '}
                        <span
                          style={{
                            textAlign: 'right',
                            font: "600 13px 'Geist Mono',monospace",
                            color: `${r?.rateColor ?? ''}`,
                          }}
                        >
                          {$t(r?.rate)}
                        </span>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
              </section>{' '}
            </>
          ) : null}{' '}
          {$v['isSettings'] ? (
            <>
              {' '}
              <section
                data-screen-label="Settings"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'dashIn .25s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                {' '}
                <div>
                  {' '}
                  <h1
                    style={{
                      margin: '0',
                      fontSize: '30px',
                      lineHeight: '1.1',
                      letterSpacing: '-0.03em',
                      fontWeight: '700',
                    }}
                  >
                    {'Settings'}
                  </h1>{' '}
                  <p style={{ margin: '8px 0 0', color: '#677184', fontSize: '15px' }}>
                    {'Posting schedule, API keys, agent access and team.'}
                  </p>{' '}
                </div>{' '}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))',
                    gap: '16px',
                  }}
                >
                  {' '}
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #e7e5df',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {' '}
                    <h3 style={{ margin: '0', fontSize: '16px' }}>{'Timezone'}</h3>{' '}
                    <select
                      value={$dv($v['tzValue'])}
                      onChange={$v['onTz']}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #e7e5df',
                        borderRadius: '10px',
                        background: '#fff',
                      }}
                    >
                      {$arr($v['tzOptions']).map((o, $index) => (
                        <Fragment key={$index}>
                          <option value={$dv(o?.value)}>{o?.label}</option>
                        </Fragment>
                      ))}
                    </select>{' '}
                    <span style={{ fontSize: '13px', color: '#677184' }}>
                      {"Times in the queue and composer show in this zone. It's "}
                      {$t($v['tzNow'])}
                      {' there now.'}
                    </span>{' '}
                  </div>{' '}
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid #e7e5df',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {' '}
                    <h3 style={{ margin: '0', fontSize: '16px' }}>{'Email reminders'}</h3>{' '}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {' '}
                      <button
                        onClick={$v['remAllToggle']}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            width: '34px',
                            height: '20px',
                            borderRadius: '999px',
                            background: `${$v['remAllTrack'] ?? ''}`,
                            position: 'relative',
                            flex: 'none',
                            transition: 'background .2s',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: `${$v['remAllKnob'] ?? ''}px`,
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                              transition: 'left .2s',
                            }}
                          />
                        </span>{' '}
                        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>{'Remind me before posts go out'}</span>
                          <span style={{ fontSize: '12px', color: '#677184' }}>
                            {'Sent to '}
                            {$t($v['userEmail'])}
                          </span>
                        </span>{' '}
                      </button>{' '}
                    </div>{' '}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', flexWrap: 'wrap' }}
                    >
                      {' '}
                      <span style={{ color: '#677184' }}>{'Send'}</span>{' '}
                      <select
                        value={$dv($v['remindLead'])}
                        onChange={$v['onRemindLead']}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #e7e5df',
                          borderRadius: '8px',
                          background: '#fff',
                        }}
                      >
                        {$arr($v['leadOptions']).map((o, $index) => (
                          <Fragment key={$index}>
                            <option value={$dv(o?.value)}>{o?.label}</option>
                          </Fragment>
                        ))}
                      </select>{' '}
                      <span style={{ color: '#677184' }}>{'before each post'}</span>{' '}
                    </div>{' '}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderTop: '1px solid #efede7',
                        marginTop: '6px',
                      }}
                    >
                      {' '}
                      <button
                        onClick={$v['failMailToggle']}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            width: '34px',
                            height: '20px',
                            borderRadius: '999px',
                            background: `${$v['failMailTrack'] ?? ''}`,
                            position: 'relative',
                            flex: 'none',
                            transition: 'background .2s',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: `${$v['failMailKnob'] ?? ''}px`,
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                              transition: 'left .2s',
                            }}
                          />
                        </span>{' '}
                        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>
                            {'Email me right away when a post fails'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#677184' }}>
                            {'Sent the moment a platform rejects a post, with the reason and a retry link'}
                          </span>
                        </span>{' '}
                      </button>{' '}
                      <button
                        onClick={$v['digestToggle']}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                          border: '0',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        {' '}
                        <span
                          style={{
                            width: '34px',
                            height: '20px',
                            borderRadius: '999px',
                            background: `${$v['digestTrack'] ?? ''}`,
                            position: 'relative',
                            flex: 'none',
                            transition: 'background .2s',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: `${$v['digestKnob'] ?? ''}px`,
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                              transition: 'left .2s',
                            }}
                          />
                        </span>{' '}
                        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.3' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>
                            {'Daily digest of what published'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#677184' }}>
                            {'One summary email at 6 PM. Failures are never held for the digest.'}
                          </span>
                        </span>{' '}
                      </button>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e7e5df',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {' '}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {' '}
                    <h3 style={{ margin: '0', fontSize: '16px' }}>{'Posting slots'}</h3>{' '}
                    <span style={{ fontSize: '13px', color: '#677184' }}>
                      {'"Add to queue" and bulk uploads fill these in order.'}
                    </span>{' '}
                  </div>{' '}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {' '}
                    {$arr($v['slotDayBtns']).map((d, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <button
                          onClick={d?.toggle}
                          style={{
                            width: '40px',
                            height: '34px',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            border: `1px solid ${d?.border ?? ''}`,
                            background: `${d?.bg ?? ''}`,
                            color: `${d?.color ?? ''}`,
                          }}
                        >
                          {$t(d?.label)}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {' '}
                    {$arr($v['slotChips']).map((c, $index) => (
                      <Fragment key={$index}>
                        {' '}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 6px 5px 12px',
                            borderRadius: '999px',
                            background: '#141619',
                            color: '#f6f5f1',
                            font: "500 13px 'Geist Mono',monospace",
                          }}
                        >
                          {$t(c?.label)}
                          <button
                            onClick={c?.remove}
                            title="Remove slot"
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '0',
                              background: '#3a3e45',
                              color: '#f6f5f1',
                              cursor: 'pointer',
                              fontSize: '12px',
                              lineHeight: '1',
                            }}
                          >
                            {'×'}
                          </button>
                        </span>{' '}
                      </Fragment>
                    ))}{' '}
                    <input
                      type="time"
                      value={$dv($v['newSlot'])}
                      onChange={$v['onNewSlot']}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #e5e3dc',
                        borderRadius: '999px',
                        outline: 'none',
                      }}
                    />{' '}
                    <button
                      onClick={$v['addSlot']}
                      style={{
                        padding: '6px 10px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        border: '1px solid #e5e3dc',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: '500',
                        borderRadius: '999px',
                      }}
                    >
                      {'Add slot'}
                    </button>{' '}
                  </div>{' '}
                  <span style={{ fontSize: '13px', color: '#677184' }}>
                    {'Next open: '}
                    {$t($v['nextSlotsLabel'])}
                  </span>{' '}
                </div>{' '}
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e7e5df',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {' '}
                  <h3 style={{ margin: '0', fontSize: '16px' }}>{'API keys'}</h3>{' '}
                  <p style={{ margin: '0', fontSize: '13px', color: '#677184' }}>
                    {'Send a key as '}
                    <span style={{ fontFamily: "'Geist Mono',monospace" }}>{'Authorization: Bearer sfy_…'}</span>
                    {' to '}
                    <span style={{ fontFamily: "'Geist Mono',monospace" }}>{'/api/v1'}</span>
                    {'. Keys are shown once.'}
                  </p>{' '}
                  {$v['hasNewKey'] ? (
                    <>
                      {' '}
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cdebd8',
                          background: '#effaf3',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        {' '}
                        <span style={{ fontSize: '13px', color: '#15803d' }}>
                          {"Copy this now. It won't be shown again."}
                        </span>{' '}
                        <span style={{ font: "600 13px 'Geist Mono',monospace", wordBreak: 'break-all' }}>
                          {$t($v['newKey'])}
                        </span>{' '}
                      </div>{' '}
                    </>
                  ) : null}{' '}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {' '}
                    <input
                      placeholder="Key name (e.g. Claude Desktop)"
                      value={$dv($v['keyName'])}
                      onChange={$v['onKeyName']}
                      style={{
                        flex: '0 1 320px',
                        padding: '9px 12px',
                        border: '1px solid #e5e3dc',
                        borderRadius: '10px',
                        outline: 'none',
                      }}
                      className="dashboard-focus-f"
                    />{' '}
                    <button
                      onClick={$v['makeKey']}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #141619',
                        background: '#141619',
                        color: '#fff',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      {'Create key'}
                    </button>{' '}
                  </div>{' '}
                  {$arr($v['keys']).map((k, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          borderTop: '1px solid #e5e3dc',
                          paddingTop: '10px',
                        }}
                      >
                        {' '}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {' '}
                          <span>
                            <strong>{$t(k?.name)}</strong>{' '}
                            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: '13px', color: '#677184' }}>
                              {$t(k?.prefix)}
                              {'…'}
                            </span>
                          </span>{' '}
                          <span style={{ fontSize: '13px', color: '#677184' }}>{$t(k?.meta)}</span>{' '}
                        </div>{' '}
                        <button
                          onClick={k?.revoke}
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '0',
                            background: 'transparent',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          {'Revoke'}
                        </button>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <div
                  style={{
                    background: '#141619',
                    color: '#f6f5f1',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {' '}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {' '}
                    <h3 style={{ margin: '0', fontSize: '16px' }}>{'Post from an AI agent'}</h3>{' '}
                    <span
                      style={{
                        padding: '1px 9px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#d9ff35',
                        color: '#141619',
                      }}
                    >
                      {'MCP'}
                    </span>{' '}
                  </div>{' '}
                  <p style={{ margin: '0', fontSize: '13px', color: '#a7abb2', textWrap: 'pretty' }}>
                    {
                      'Add this to Claude Desktop, Claude Code or Cursor. The agent gets list_accounts, create_post, list_posts, publish_post and delete_post.'
                    }
                  </p>{' '}
                  <pre
                    style={{
                      margin: '0',
                      background: '#22252a',
                      padding: '14px',
                      borderRadius: '10px',
                      overflowX: 'auto',
                      font: "400 13px/1.55 'Geist Mono',monospace",
                      color: '#d9ff35',
                    }}
                  >
                    {$t($v['mcpText'])}
                  </pre>{' '}
                </div>{' '}
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e7e5df',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {' '}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {' '}
                    <h3 style={{ margin: '0', fontSize: '16px' }}>{'Team'}</h3>{' '}
                    <span
                      style={{
                        padding: '1px 9px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: '1px solid #e5e3dc',
                      }}
                    >
                      {'Pro plan'}
                    </span>{' '}
                  </div>{' '}
                  {$arr($v['members']).map((m, $index) => (
                    <Fragment key={$index}>
                      {' '}
                      <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                      >
                        {' '}
                        <span>
                          {$t(m?.name)} <span style={{ fontSize: '13px', color: '#677184' }}>{$t(m?.email)}</span>
                        </span>{' '}
                        <span
                          style={{
                            padding: '1px 9px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: `1px solid ${m?.border ?? ''}`,
                            background: `${m?.bg ?? ''}`,
                            color: `${m?.color ?? ''}`,
                          }}
                        >
                          {$t(m?.role)}
                        </span>{' '}
                      </div>{' '}
                    </Fragment>
                  ))}{' '}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {' '}
                    <input
                      type="email"
                      placeholder="teammate@company.com"
                      value={$dv($v['invite'])}
                      onChange={$v['onInvite']}
                      style={{
                        flex: '0 1 320px',
                        padding: '9px 12px',
                        border: '1px solid #e5e3dc',
                        borderRadius: '10px',
                        outline: 'none',
                      }}
                      className="dashboard-focus-f"
                    />{' '}
                    <button
                      onClick={$v['sendInvite']}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #e5e3dc',
                        background: '#fff',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      {'Create invite link'}
                    </button>{' '}
                  </div>{' '}
                  {$v['hasInviteUrl'] ? (
                    <>
                      {' '}
                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cdebd8',
                          background: '#effaf3',
                          fontSize: '13px',
                        }}
                      >
                        {'Send them this link: '}
                        <span style={{ fontFamily: "'Geist Mono',monospace", wordBreak: 'break-all' }}>
                          {$t($v['inviteUrl'])}
                        </span>
                      </div>{' '}
                    </>
                  ) : null}{' '}
                </div>{' '}
              </section>{' '}
            </>
          ) : null}{' '}
        </main>
      </div>
      {$v['hasSelection'] ? (
        <>
          {' '}
          <div
            style={{
              position: 'fixed',
              left: '256px',
              right: '24px',
              bottom: '20px',
              margin: '0 auto',
              width: 'max-content',
              maxWidth: 'calc(100vw - 280px)',
              background: '#141619',
              color: '#f6f5f1',
              padding: '8px 8px 8px 16px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              boxShadow: '0 20px 40px -16px rgba(20,23,26,.6)',
              zIndex: '11',
            }}
          >
            {' '}
            <strong style={{ fontSize: '14px', marginRight: '6px', whiteSpace: 'nowrap' }}>
              {$t($v['selCount'])}
              {' selected'}
            </strong>{' '}
            {$arr($v['shiftBtns']).map((b, $index) => (
              <Fragment key={$index}>
                {' '}
                <button
                  onClick={b?.go}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #3a3e45',
                    background: 'transparent',
                    color: '#f6f5f1',
                    cursor: 'pointer',
                    font: "500 12px 'Geist Mono',monospace",
                  }}
                  className="dashboard-hover-l"
                >
                  {$t(b?.label)}
                </button>{' '}
              </Fragment>
            ))}{' '}
            <input
              type="date"
              value={$dv($v['moveDate'])}
              onChange={$v['onMoveDate']}
              title="Move to date (keeps each post's time)"
              style={{
                padding: '5px 8px',
                borderRadius: '8px',
                border: '1px solid #3a3e45',
                background: '#22252a',
                color: '#f6f5f1',
                colorScheme: 'dark',
                fontSize: '12px',
              }}
            />{' '}
            <select
              value=""
              onChange={$v['bulkLabel']}
              title="Add a label"
              style={{
                padding: '5px 8px',
                borderRadius: '8px',
                border: '1px solid #3a3e45',
                background: '#22252a',
                color: '#f6f5f1',
                fontSize: '12px',
              }}
            >
              <option value="">{'+ Label'}</option>
              {$arr($v['labelNames']).map((o, $index) => (
                <Fragment key={$index}>
                  <option value={$dv(o)}>{o}</option>
                </Fragment>
              ))}
            </select>{' '}
            <button
              onClick={$v['bulkDuplicate']}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #3a3e45',
                background: 'transparent',
                color: '#f6f5f1',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {'Duplicate'}
            </button>{' '}
            <button
              onClick={$v['bulkDelete']}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '0',
                background: 'transparent',
                color: '#ff8a80',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {'Delete'}
            </button>{' '}
            <button
              onClick={$v['toggleSelect']}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '0',
                background: '#d9ff35',
                color: '#141619',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              {'Done'}
            </button>{' '}
          </div>
        </>
      ) : null}
      {$v['hasPreviewMedia'] ? (
        <>
          {' '}
          <div
            onClick={$v['closePreview']}
            role="dialog"
            aria-label="Media preview"
            style={{
              position: 'fixed',
              inset: '0',
              background: 'rgba(15,16,18,.6)',
              display: 'grid',
              placeItems: 'center',
              zIndex: '30',
              padding: '24px',
            }}
          >
            {' '}
            <div
              style={{
                width: 'min(720px,100%)',
                background: '#fff',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 30px 80px -30px rgba(0,0,0,.6)',
              }}
            >
              {' '}
              <div
                style={{
                  aspectRatio: '16/10',
                  background: `${$v['pvMedia']?.thumb ?? ''}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '14px',
                  color: '#f6efe3',
                  font: "600 12px 'Geist Mono',monospace",
                }}
              >
                {$t($v['pvMedia']?.badge)}
              </div>{' '}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px' }}>
                {' '}
                <span style={{ flex: '1', fontWeight: '600' }}>{$t($v['pvMedia']?.name)}</span>{' '}
                <span style={{ fontSize: '13px', color: '#677184' }}>{$t($v['pvMedia']?.folder)}</span>{' '}
                <button
                  onClick={$v['pvMedia']?.use}
                  style={{
                    padding: '7px 13px',
                    borderRadius: '8px',
                    border: '0',
                    background: '#d9ff35',
                    color: '#141619',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                  }}
                >
                  {'Use in post'}
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>
        </>
      ) : null}
      {$v['hasCalPost'] ? (
        <>
          {' '}
          <div
            onClick={$v['closeCalPost']}
            style={{ position: 'fixed', inset: '0', zIndex: '25', background: 'rgba(15,16,18,.25)' }}
          />{' '}
          <aside
            role="dialog"
            aria-label="Post details"
            style={{
              position: 'fixed',
              top: '0',
              right: '0',
              bottom: '0',
              zIndex: '26',
              width: 'min(420px,100vw)',
              background: '#fff',
              borderLeft: '1px solid #e7e5df',
              boxShadow: '-30px 0 60px -40px rgba(0,0,0,.5)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'dashIn .2s ease-out',
            }}
          >
            {' '}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 18px',
                borderBottom: '1px solid #efefea',
              }}
            >
              {' '}
              <span
                style={{
                  padding: '2px 9px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: `${$v['cp']?.stBg ?? ''}`,
                  color: `${$v['cp']?.stFg ?? ''}`,
                }}
              >
                {$t($v['cp']?.stLabel)}
              </span>{' '}
              <strong style={{ flex: '1', fontSize: '15px' }}>{$t($v['cp']?.when)}</strong>{' '}
              <button
                onClick={$v['closeCalPost']}
                aria-label="Close"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid #e7e5df',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                {'×'}
              </button>{' '}
            </div>{' '}
            <div
              style={{
                flex: '1',
                overflowY: 'auto',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {' '}
              <div
                style={{
                  aspectRatio: '16/9',
                  borderRadius: '10px',
                  background: `${$v['cp']?.thumb ?? ''}`,
                  display: `${$v['cp']?.thumbDisplay ?? ''}`,
                }}
              />{' '}
              <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
                {$t($v['cp']?.caption)}
              </p>{' '}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {' '}
                <span style={{ fontSize: '12px', color: '#677184' }}>{'Accounts'}</span>{' '}
                {$arr($v['cp']?.accs).map((a, $index) => (
                  <Fragment key={$index}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: `${a?.color ?? ''}`,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            width: '56%',
                            height: '56%',
                            background: `${a?.logo ?? ''} center/contain no-repeat`,
                          }}
                        />
                      </span>
                      {$t(a?.name)}
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: `${a?.stColor ?? ''}` }}>
                        {$t(a?.st)}
                      </span>
                    </span>
                  </Fragment>
                ))}{' '}
              </div>{' '}
              {$v['cp']?.canMove ? (
                <>
                  {' '}
                  <label
                    style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#677184' }}
                  >
                    {'Publish time '}
                    <input
                      type="datetime-local"
                      value={$dv($v['cp']?.local)}
                      onChange={$v['cp']?.onTime}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid #e7e5df',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#141619',
                      }}
                    />{' '}
                  </label>{' '}
                </>
              ) : null}{' '}
            </div>{' '}
            <div style={{ display: 'flex', gap: '8px', padding: '14px 18px', borderTop: '1px solid #efefea' }}>
              {' '}
              <button
                onClick={$v['cp']?.edit}
                style={{
                  flex: '1',
                  padding: '10px',
                  borderRadius: '9px',
                  border: '0',
                  background: '#141619',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                {'Open in editor'}
              </button>{' '}
              <button
                onClick={$v['cp']?.dup}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: '1px solid #e7e5df',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {'Duplicate'}
              </button>{' '}
              <button
                onClick={$v['cp']?.del}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9px',
                  border: '1px solid #f5c2c7',
                  background: '#fff',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {'Delete'}
              </button>{' '}
            </div>{' '}
          </aside>
        </>
      ) : null}
      {$v['hasConfirm'] ? (
        <>
          {' '}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={$v['cfTitle']}
            style={{
              position: 'fixed',
              inset: '0',
              zIndex: '40',
              background: 'rgba(15,16,18,.45)',
              display: 'grid',
              placeItems: 'center',
              padding: '20px',
            }}
          >
            {' '}
            <div
              style={{
                width: 'min(420px,100%)',
                background: '#fff',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 30px 80px -30px rgba(0,0,0,.6)',
              }}
            >
              {' '}
              <strong style={{ fontSize: '17px' }}>{$t($v['cfTitle'])}</strong>{' '}
              <span style={{ fontSize: '14px', color: '#677184', lineHeight: '1.5' }}>{$t($v['cfBody'])}</span>{' '}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                {' '}
                <button
                  onClick={$v['cfCancel']}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '9px',
                    border: '1px solid #e7e5df',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  {'Cancel'}
                </button>{' '}
                {$v['cfHasAlt'] ? (
                  <>
                    <button
                      onClick={$v['cfAlt']}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '9px',
                        border: '1px solid #141619',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      {$t($v['cfAltLabel'])}
                    </button>
                  </>
                ) : null}{' '}
                <button
                  onClick={$v['cfGo']}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '9px',
                    border: '0',
                    background: `${$v['cfBg'] ?? ''}`,
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {$t($v['cfCta'])}
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>
        </>
      ) : null}{' '}
      <nav aria-label="Quick navigation" className="sfy-tabs">
        {' '}
        {$arr($v['mobTabs']).map((m, $index) => (
          <Fragment key={$index}>
            {' '}
            <button onClick={m?.go} aria-current={m?.current} data-kind={m?.kind} data-on={m?.on} className="sfy-tab">
              {' '}
              <span style={{ backgroundImage: `${m?.icon ?? ''}` }} className="sfy-tab-ic" />{' '}
              <span className="sfy-tab-label">{$t(m?.label)}</span>{' '}
              {m?.badge ? (
                <>
                  <span className="sfy-tab-badge">{$t(m?.badge)}</span>
                </>
              ) : null}{' '}
            </button>{' '}
          </Fragment>
        ))}{' '}
      </nav>
      {$v['hasToast'] ? (
        <>
          {' '}
          <div
            style={{
              position: 'fixed',
              left: '50%',
              bottom: '24px',
              transform: 'translateX(-50%)',
              animation: 'toastIn .3s cubic-bezier(.2,.8,.2,1)',
              background: '#141619',
              color: '#f6f5f1',
              padding: '10px 16px',
              borderRadius: '999px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 12px 32px -12px rgba(20,23,26,.5)',
              zIndex: '10',
            }}
            className="sfy-toast"
          >
            {' '}
            <span role="status" aria-live="polite">
              {$t($v['toast'])}
            </span>{' '}
            {$v['toastUndo'] ? (
              <>
                <button
                  onClick={$v['doUndo']}
                  style={{
                    border: '0',
                    background: 'transparent',
                    color: '#d9ff35',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    padding: '0 0 0 6px',
                  }}
                >
                  {'Undo'}
                </button>
              </>
            ) : null}{' '}
          </div>
        </>
      ) : null}
    </>
  );
}
