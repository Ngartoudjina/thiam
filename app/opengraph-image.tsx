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
 * Le logotype de la maison est intégré en base64 : la vignette porte donc la
 * typographie réelle de la marque sans dépendre d'une fonte externe, et se
 * génère au build sans aucun appel réseau.
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
        background: '#0B0B0C',
        padding: '72px 80px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -180,
          left: -140,
          width: 760,
          height: 760,
          borderRadius: 999,
          background: 'radial-gradient(circle, rgba(192,138,98,0.26), rgba(192,138,98,0) 66%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 1, background: '#C08A62' }} />
        <div
          style={{
            fontSize: 20,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#C99A76',
          }}
        >
          {LOCATION.cityCountry}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={300} height={300} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.04,
              color: '#F7F4EF',
              letterSpacing: -1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>L’éclat</span>
            <span style={{ color: '#E3B79A' }}>qui se transmet</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: 'rgba(247,244,239,0.62)' }}>
            Or 18 · 21 · 24 carats — diamants, alliances, sur mesure
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(247,244,239,0.14)',
          paddingTop: 28,
          fontSize: 22,
          color: 'rgba(247,244,239,0.58)',
        }}
      >
        <span>{SITE.name}</span>
        <span>{OPENING_SUMMARY}</span>
      </div>
    </div>,
    size,
  );
}
