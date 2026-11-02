import styles from './best-time.module.css';
import { WEEKDAY_NAMES, formatHour } from '@/lib/best-time';

/**
 * 7×24 heatmap of slot scores (0–100), server-rendered as a table so the numbers are in the HTML.
 * `highlightDay` dims the other days (weekday pages). Colours are set inline per cell from the score.
 */
export default function BestTimeHeatmap({ scores, highlightDay = null, caption }) {
  const color = (s) => `rgba(220, 255, 46, ${0.06 + (s / 100) * 0.9})`;
  const text = (s) => (s >= 55 ? '#0f1012' : '#a7abb2');
  return (
    <div className={styles.wrap}>
      <table className={styles.grid}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead>
          <tr>
            <th scope="col" className={styles.corner}>Local time</th>
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} scope="col" className={styles.hour}>{h % 3 === 0 ? formatHour(h).replace(' ', '') : ''}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scores.map((row, d) => (
            <tr key={d} className={highlightDay !== null && highlightDay !== d ? styles.dim : undefined}>
              <th scope="row" className={styles.day}>{WEEKDAY_NAMES[d].slice(0, 3)}</th>
              {row.map((s, h) => (
                <td key={h} className={styles.cell} style={{ background: color(s), color: text(s) }} title={`${WEEKDAY_NAMES[d]} ${formatHour(h)}: ${s}/100`}>
                  <span className={styles.score}>{s}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.legend}><span>Quieter</span><i className={styles.scale} aria-hidden="true" /><span>Best slots</span></div>
    </div>
  );
}
