'use client';
// Logic ported from the Claude Design prototype "Logo.dc.html".
import React from 'react';
import { renderBrand, css } from './BrandView';

const DCLogic = React.Component;
const P = 'M41.01 14.69 A11 11 0 1 0 32 32 A11 11 0 1 1 22.99 49.31';
class Component extends DCLogic {
  heroMark() {
    const h = React.createElement,
      D = '4.6s';
    const ripple = (delay) =>
      h('circle', {
        cx: 22.99,
        cy: 49.31,
        r: 6,
        fill: 'none',
        stroke: '#dcff2e',
        strokeWidth: 1.2,
        style: {
          transformBox: 'fill-box',
          transformOrigin: 'center',
          animation: `lgRipple ${D} ease-out ${delay}s infinite`,
        },
      });
    return h(
      'svg',
      { width: 340, height: 340, viewBox: '0 0 64 64', style: { display: 'block' } },
      h('rect', { width: 64, height: 64, rx: 18, fill: '#15171a' }),
      h('rect', {
        x: 0.25,
        y: 0.25,
        width: 63.5,
        height: 63.5,
        rx: 17.8,
        fill: 'none',
        stroke: '#2a2e34',
        strokeWidth: 0.5,
      }),
      h('path', { d: P, fill: 'none', stroke: '#23272c', strokeWidth: 7.5, strokeLinecap: 'round' }),
      h('path', {
        d: P,
        fill: 'none',
        stroke: '#f6f5f1',
        strokeWidth: 7.5,
        strokeLinecap: 'round',
        pathLength: 100,
        strokeDasharray: '100 101',
        style: { animation: `lgDraw ${D} cubic-bezier(.65,0,.25,1) infinite` },
      }),
      ripple(0),
      ripple(0.22),
      h(
        'circle',
        { r: 6, fill: '#dcff2e', style: { animation: `lgFade ${D} linear infinite` } },
        h('animateMotion', {
          path: P,
          dur: D,
          repeatCount: 'indefinite',
          keyPoints: '0;1;1',
          keyTimes: '0;0.42;1',
          calcMode: 'spline',
          keySplines: '.65 0 .25 1;0 0 1 1',
        }),
      ),
    );
  }
  renderVals() {
    return {
      heroMark: this.heroMark(),
      sizes: [128, 64, 32, 24, 16].map((px) => ({ px, sw: px < 24 ? 9 : 7.5, r: px < 24 ? 7 : 6 })),
    };
  }
}

Component.defaultProps = { ...{}, ...(Component.defaultProps || {}) };
Component.prototype.render = function () {
  const vals = { ...this.props, ...(this.renderVals() || {}) };
  return (
    <div id="dc-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sc-host">{renderBrand(vals)}</div>
    </div>
  );
};

export default Component;
