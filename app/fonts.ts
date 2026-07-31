import { Cormorant_Garamond, Jost } from 'next/font/google';

/**
 * Les deux fontes de la direction artistique, auto-hébergées par `next/font` :
 * aucun appel réseau tiers, pas de FOIT, et le préchargement du sous-ensemble
 * latin est géré au build.
 */
/**
 * Sous-ensembles et graisses réduits au strict nécessaire.
 *
 * Le latin couvre l'intégralité des caractères français, y compris « œ »
 * (U+0152-0153) ; `latin-ext` ne servirait qu'aux langues d'Europe centrale.
 * Côté graisses, le serif n'est employé qu'en 300 et 400 sur tout le site —
 * charger 500 et 600 revenait à télécharger quatre fichiers jamais peints.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: true,
});

export const jost = Jost({
  subsets: ['latin'],
  // 600 est employé par les titres du tableau de bord.
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: true,
});

export const fontVariables = `${cormorant.variable} ${jost.variable}`;
