import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { LOCATION, OPENING_SUMMARY, SITE } from '@/constants/site';

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Vignette de partage.
 *
 * C'est le premier visuel qu'un client voit quand le lien circule sur
 * WhatsApp : il porte donc les couleurs réelles de la maison — ivoire, beige
 * et or — et non un fond sombre qui trancherait avec le site.
 *
 * Le logotype est intégré en base64 : la vignette porte la typographie réelle
 * de la marque sans dépendre d'une fonte externe, et se génère au build sans
 * aucun appel réseau.
 */
export default async function OpengraphImage(): Promise<ImageResponse> {
  const logo = await readFile(join(process.cwd(), 'public', 'brand', 'thiam-logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#FFFCF7',
        padding: '72px 80px',
        position: 'relative',
      }}
    >
      {/* Halo chaud repris du hero, pour que la vignette et la page d'accueil
          se reconnaissent au premier regard. */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -160,
          width: 780,
          height: 780,
          borderRadius: 999,
          background: 'radial-gradient(circle, rgba(169,113,63,0.20), rgba(169,113,63,0) 68%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 1, background: '#A9713F' }} />
        <div style={{ fontSize: 20, letterSpacing: 8, textTransform: 'uppercase', color: '#8E5C3D' }}>
          {LOCATION.cityCountry}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={300} height={300} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.04,
              color: '#16120F',
              letterSpacing: -1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>{SITE.tagline}</span>
            <span style={{ color: '#8E5C3D' }}>{SITE.taglineSecond}</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: 'rgba(22,18,15,0.68)' }}>
            Or 14 · 18 · 21 · 24 carats — alliances, diamants, rachat d’or
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(22,18,15,0.14)',
          paddingTop: 28,
          fontSize: 22,
          color: 'rgba(22,18,15,0.62)',
        }}
      >
        <span>{SITE.name}</span>
        <span>{OPENING_SUMMARY}</span>
      </div>
    </div>,
    size,
  );
}
