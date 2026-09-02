import type { ImageResponse } from 'next/og';
import { SITE } from '@/constants/site';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og-card';

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Vignette de partage de la maison — reprise partout où une page n'a pas la sienne. */
export default function OpengraphImage(): Promise<ImageResponse> {
  return renderOgCard({
    eyebrow: 'Cotonou · Bénin',
    titleTop: SITE.tagline,
    titleBottom: SITE.taglineSecond,
    footnote: 'Or 14 · 18 · 21 · 24 carats — alliances, diamants, rachat d’or',
  });
}
