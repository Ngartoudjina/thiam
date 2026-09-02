/**
 * Carte statique composée de tuiles OpenStreetMap.
 *
 * Pourquoi pas un cadre `iframe` : son affichage dépend de l'en-tête
 * `X-Frame-Options` du fournisseur. Google refuse d'être affiché ainsi, et
 * lorsqu'un fournisseur refuse, le navigateur impose sa propre page d'erreur —
 * impossible à détecter depuis la page, impossible à remplacer. Des images ne
 * connaissent pas cette restriction : la carte s'affiche toujours.
 *
 * Les tuiles passent par `next/image` : le serveur ne les récupère qu'une fois,
 * les convertit en AVIF/WebP et les garde en cache un an. La charge sur les
 * serveurs d'OpenStreetMap reste donc négligeable.
 */

export const TILE_SIZE = 256;

export interface MapTile {
  readonly key: string;
  readonly src: string;
  readonly left: number;
  readonly top: number;
}

export interface StaticMapLayout {
  readonly tiles: readonly MapTile[];
  readonly width: number;
  readonly height: number;
  /** Position du point recherché à l'intérieur de la mosaïque, en pixels. */
  readonly markerX: number;
  readonly markerY: number;
}

interface BuildOptions {
  readonly zoom?: number;
  readonly cols?: number;
  readonly rows?: number;
}

/**
 * Projection Web Mercator, telle que l'utilisent toutes les cartes en tuiles.
 * Renvoie la position fractionnaire du point dans la grille de tuiles.
 */
function project(latitude: number, longitude: number, zoom: number) {
  const n = 2 ** zoom;
  const latRad = (latitude * Math.PI) / 180;

  return {
    x: ((longitude + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  };
}

export function buildStaticMap(
  latitude: number,
  longitude: number,
  { zoom = 16, cols = 4, rows = 3 }: BuildOptions = {},
): StaticMapLayout {
  const point = project(latitude, longitude, zoom);

  const originX = Math.floor(point.x) - Math.floor(cols / 2);
  const originY = Math.floor(point.y) - Math.floor(rows / 2);

  const tiles: MapTile[] = [];
  const max = 2 ** zoom;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = originX + col;
      const y = originY + row;

      // Aux bords du planisphère, une tuile peut sortir de la grille.
      if (y < 0 || y >= max) continue;
      const wrappedX = ((x % max) + max) % max;

      tiles.push({
        key: `${zoom}-${wrappedX}-${y}`,
        src: `/api/plan/${zoom}/${wrappedX}/${y}`,
        left: col * TILE_SIZE,
        top: row * TILE_SIZE,
      });
    }
  }

  return {
    tiles,
    width: cols * TILE_SIZE,
    height: rows * TILE_SIZE,
    markerX: (point.x - originX) * TILE_SIZE,
    markerY: (point.y - originY) * TILE_SIZE,
  };
}
