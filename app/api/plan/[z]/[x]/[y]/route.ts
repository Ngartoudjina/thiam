import { NextResponse } from 'next/server';
import { LOCATION, SITE } from '@/constants/site';

export const runtime = 'nodejs';

/**
 * Relais des tuiles du plan de situation.
 *
 * OpenStreetMap refuse — en 403 — les requêtes qui n'identifient pas
 * l'application appelante : sa politique d'usage impose un en-tête
 * `User-Agent` explicite et une mise en cache côté client. Une image demandée
 * directement par l'optimiseur de Next n'en fournit aucun, d'où l'échec.
 *
 * Ce relais fournit les deux : il s'identifie au nom de la maison et renvoie
 * la tuile avec un cache d'un an. Chaque tuile n'est donc récupérée qu'une
 * fois, et la charge sur les serveurs bénévoles d'OpenStreetMap reste nulle.
 */

/** Bornes autorisées : le plan ne sert que les abords de la boutique. */
const ZOOM_RANGE = { min: 14, max: 18 } as const;
const AREA_DEGREES = 0.5;

const USER_AGENT = `${SITE.name} (${SITE.url})`;

/** Enveloppe de tuiles admissibles, pour ne pas devenir un relais ouvert. */
function isWithinShopArea(z: number, x: number, y: number): boolean {
  const n = 2 ** z;
  const latRad = (LOCATION.latitude * Math.PI) / 180;

  const centreX = ((LOCATION.longitude + 180) / 360) * n;
  const centreY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

  // Un demi-degré autour de la boutique, converti en tuiles à ce zoom.
  const span = Math.max(4, Math.ceil((AREA_DEGREES / 360) * n));

  return Math.abs(x - centreX) <= span && Math.abs(y - centreY) <= span;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ z: string; x: string; y: string }> },
): Promise<NextResponse> {
  const { z, x, y } = await params;

  const zoom = Number(z);
  const tileX = Number(x);
  const tileY = Number(y);

  const isValid =
    Number.isInteger(zoom) &&
    Number.isInteger(tileX) &&
    Number.isInteger(tileY) &&
    zoom >= ZOOM_RANGE.min &&
    zoom <= ZOOM_RANGE.max &&
    tileX >= 0 &&
    tileY >= 0 &&
    tileX < 2 ** zoom &&
    tileY < 2 ** zoom &&
    isWithinShopArea(zoom, tileX, tileY);

  if (!isValid) {
    return NextResponse.json({ error: 'Tuile hors du périmètre servi.' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'image/png,image/*' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 31_536_000 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Tuile indisponible.' }, { status: 502 });
    }

    return new NextResponse(await upstream.arrayBuffer(), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fournisseur injoignable.' }, { status: 504 });
  }
}
