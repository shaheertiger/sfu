import { imageLd } from '@/lib/figures';
import { abs } from '@/lib/seo-pages';

/**
 * An illustration card from lib/figures.js, on our own domain (stored in Vercel Blob, see
 * lib/figure-url.js): the 720-px file on phones,
 * width and height from the file name so nothing shifts while it loads. `priority` for the
 * first image on the page (it is usually the largest thing above the fold).
 */
export default function Figure({ fig, priority = false }) {
  if (!fig) return null;
  const src = fig.src;
  return (
    <figure style={{ margin: '24px auto', maxWidth: 760 }}>
      <a className="img-zoom" href={src} target="_blank" rel="noopener" style={{ display: 'block', cursor: 'zoom-in' }}>
        <img
          src={src}
          srcSet={`${fig.small} 720w, ${src} 1200w`}
          sizes="(max-width: 760px) 100vw, 760px"
          width={fig.width}
          height={fig.height}
          alt={fig.alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 12, border: '1px solid rgba(19,20,23,.08)' }}
        />
      </a>
    </figure>
  );
}

/** JSON-LD for a page's figures: ImageObject nodes plus the WebPage's primaryImageOfPage. */
export function figuresLd(figs) {
  const nodes = figs.map((f) => imageLd(f, abs));
  return { nodes, primary: nodes[0] ? { primaryImageOfPage: { '@id': nodes[0]['@id'] }, image: nodes.map((n) => ({ '@id': n['@id'] })) } : {} };
}
