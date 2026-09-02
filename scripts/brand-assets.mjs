/**
 * Dérive les fichiers de marque à partir des originaux.
 *
 *   node scripts/brand-assets.mjs
 *
 * Les deux logotypes livrés par la maison sont posés au milieu d'un grand
 * carré transparent : le dessin n'occupe que 26 % du fichier pour le logotype
 * complet, 41 % pour le symbole. Tel quel, tout ce qui les met à l'échelle —
 * la vignette d'un onglet, l'icône d'une application, le logo qu'affiche
 * Google — réduit surtout du vide.
 *
 * On détoure donc le dessin, puis on le repose avec une marge choisie :
 *
 *   brand/logo-marque.png   logotype détouré, fond blanc — c'est celui que
 *                           déclarent les données structurées, où Google
 *                           attend une image nette sur fond opaque.
 *   icon.png / apple-icon.png / brand/icon-192 / brand/icon-512
 *                           symbole détouré sur l'ivoire de la maison.
 *
 * Les originaux ne sont jamais modifiés.
 */
import sharp from 'sharp';

const IVOIRE = { r: 255, g: 252, b: 247, alpha: 1 };
const BLANC = { r: 255, g: 255, b: 255, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** Détoure les bords transparents et rend le dessin utile. */
const detourer = (fichier) => sharp(fichier).trim({ threshold: 1 });

/**
 * Logotype complet pour les données structurées.
 * Fond blanc opaque : Google compose le logo sur ses propres surfaces, et une
 * transparence s'y retrouve parfois remplie de noir.
 */
async function logoMarque() {
  const dessin = await detourer('public/brand/thiam-logo.png')
    .resize({ width: 600, withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });

  const marge = 24;
  await sharp({
    create: {
      width: dessin.info.width + marge * 2,
      height: dessin.info.height + marge * 2,
      channels: 4,
      background: BLANC,
    },
  })
    .composite([{ input: dessin.data, top: marge, left: marge }])
    .png({ compressionLevel: 9 })
    .toFile('public/brand/logo-marque.png');

  return { width: dessin.info.width + marge * 2, height: dessin.info.height + marge * 2 };
}

/**
 * Icônes carrées, à partir du symbole seul.
 * La marge de 8 % laisse respirer le médaillon sans le noyer : à 16 px dans un
 * onglet, chaque pixel rendu au dessin compte.
 */
async function icone(taille, sortie) {
  const interieur = Math.round(taille * 0.84);
  const dessin = await detourer('public/brand/thiam-mark.png')
    .resize(interieur, interieur, { fit: 'contain', background: TRANSPARENT })
    .toBuffer();
  const decalage = Math.round((taille - interieur) / 2);

  await sharp({
    create: { width: taille, height: taille, channels: 4, background: IVOIRE },
  })
    .composite([{ input: dessin, top: decalage, left: decalage }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(sortie);
}

const logo = await logoMarque();
await icone(64, 'app/icon.png');
await icone(180, 'app/apple-icon.png');
await icone(192, 'public/brand/icon-192.png');
await icone(512, 'public/brand/icon-512.png');

console.log(`Logotype des données structurées : ${logo.width}x${logo.height}`);
console.log('Icônes régénérées : 64, 180, 192, 512.');
