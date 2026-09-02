import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { LOCATION, OPENING_SUMMARY, SITE } from '@/constants/site';

/** Format imposé par Open Graph et Twitter : 1,91:1. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

interface OgCardInput {
  /** Ligne de rappel en haut, en capitales espacées. */
  readonly eyebrow: string;
  readonly titleTop: string;
  readonly titleBottom: string;
  /** Ligne d'appui sous le titre — ce que la page promet concrètement. */
  readonly footnote: string;
}

/**
 * Vignette de partage de la maison.
 *
 * C'est le premier visuel qu'un client voit quand un lien circule sur
 * WhatsApp, où passe l'essentiel du bouche-à-oreille à Cotonou. Elle porte
 * donc les couleurs réelles du site — ivoire, beige, or — et le logotype
 * intégré en base64, sans dépendance à une fonte ou à un appel réseau.
 *
 * Chaque page importante a la sienne : un lien vers le rachat d'or ne doit pas
 * s'afficher avec la vignette générique de l'accueil.
 */
export async function renderOgCard({
  eyebrow,
  titleTop,
  titleBottom,
  footnote,
}: OgCardInput): Promise<ImageResponse> {
  const logo = await readFile(join(process.cwd(), 'public', 'brand', 'thiam-logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  /**
   * Corps du titre, calé sur la ligne la plus longue.
   *
   * La colonne fait 684 px et un glyphe occupe en moyenne la moitié du corps :
   * au-delà d'environ 1368 / nombre de caractères, la ligne passe à la ligne
   * suivante et le bloc déborde sur le filet de pied. Le plafond de 74 garde
   * l'échelle voulue pour les titres courts.
   */
  const longest = Math.max(titleTop.length, titleBottom.length);
  const titleSize = Math.max(46, Math.min(74, Math.floor(1368 / longest)));

  return new ImageResponse(
    (
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
        {/* Halo chaud repris du hero, pour que la vignette et la page se
            reconnaissent au premier regard. */}
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
          <div
            style={{
              fontSize: 20,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: '#8E5C3D',
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={300} height={300} />

          {/* Largeur bornée : 1200 moins les marges (160) et la colonne du
              logotype (300 + 56 de gouttière). Sans cette borne, une ligne
              d'appui un peu longue sort du cadre au lieu de passer à la
              ligne — Satori ne réduit rien tout seul. */}
          <div style={{ display: 'flex', flexDirection: 'column', width: 684 }}>
            <div
              style={{
                fontSize: titleSize,
                lineHeight: 1.04,
                color: '#16120F',
                letterSpacing: -1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span>{titleTop}</span>
              <span style={{ color: '#8E5C3D' }}>{titleBottom}</span>
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 25,
                lineHeight: 1.4,
                color: 'rgba(22,18,15,0.68)',
              }}
            >
              {footnote}
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
          <span>
            {SITE.name} · {LOCATION.cityCountry}
          </span>
          <span>{OPENING_SUMMARY}</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

/**
 * Vignettes nommées.
 *
 * Elles sont servies par `app/og/[carte]/route.tsx`, à des adresses stables du
 * type `/og/rachat-or`. La convention `opengraph-image.tsx` de Next suffixe
 * les routes imbriquées d'un identifiant régénéré à chaque build
 * (`opengraph-image-zf8yay`) : impossible de les référencer depuis la
 * metadata, et un lien déjà partagé cesserait d'afficher son image.
 */
export const OG_CARDS = {
  'rachat-or': {
    alt: 'Rachat d’or à Cotonou — Bijouterie THIAM 24 Carats',
    eyebrow: 'Rachat d’or · Cotonou',
    titleTop: 'Nous rachetons',
    titleBottom: 'votre or',
    footnote: 'Au cours du jour — pesé et testé devant vous, paiement immédiat',
  },
  'alliances-mariage': {
    alt: 'Alliances et bijoux de mariage à Cotonou — Bijouterie THIAM 24 Carats',
    eyebrow: 'Mariage · Cotonou',
    titleTop: 'Alliances',
    titleBottom: 'et mariage',
    footnote: 'Gravées à la main dans notre atelier — gravure offerte',
  },
} as const;

export type OgCardKey = keyof typeof OG_CARDS;

export const isOgCardKey = (value: string): value is OgCardKey => value in OG_CARDS;
