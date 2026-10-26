'use client';

import { createContext, useContext } from 'react';
import { formatNumber, widgetLabel, widgetString } from '@/lib/i18n';

/** The language of the page a tool widget sits on ('en' on the English pages). */
export const ToolLocale = createContext('en');

/** Widget strings for the current page language: t(key, vars), label(table, id, fallback), num(n). */
export function useToolText() {
  const locale = useContext(ToolLocale);
  return {
    locale,
    t: (key, vars) => widgetString(locale, key, vars),
    label: (table, id, fallback) => widgetLabel(locale, table, id, fallback),
    num: (n) => formatNumber(locale, n),
  };
}
