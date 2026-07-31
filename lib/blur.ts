/**
 * Génère un `blurDataURL` léger pour `next/image`.
 *
 * Les photos de la maison sont toutes des bijoux dorés sur fond sombre :
 * un dégradé radial chaud approche la dominante réelle et évite le flash
 * blanc au chargement, pour un poids de quelques dizaines d'octets — sans
 * dépendance de traitement d'image au build.
 */
const encode = (svg: string): string => `data:image/svg+xml;base64,${btoaSafe(svg)}`;

const btoaSafe = (value: string): string =>
  typeof window === 'undefined'
    ? Buffer.from(value).toString('base64')
    : window.btoa(unescape(encodeURIComponent(value)));

export function createBlurDataUrl(from = '#2a211a', to = '#0f0d0c'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><defs><radialGradient id="g" cx="50%" cy="42%" r="72%"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></radialGradient></defs><rect width="8" height="8" fill="url(#g)"/></svg>`;
  return encode(svg);
}

/** Dominante chaude par défaut, calculée une seule fois. */
export const DEFAULT_BLUR_DATA_URL = createBlurDataUrl();
