/**
 * Formatage des nombres au standard francophone : espace insécable fine
 * comme séparateur de milliers, virgule décimale.
 */
const NARROW_NBSP = ' ';

export function formatNumber(value: number, decimals = 0): string {
  const fixed = value.toFixed(decimals);
  const [integerPart = '0', decimalPart] = fixed.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP);
  return decimalPart ? `${grouped},${decimalPart}` : grouped;
}

/** Découpe un titre en lignes pour l'animation « ligne par ligne ». */
export function splitLines(text: string): readonly string[] {
  return text.split('\n').filter((line) => line.length > 0);
}

/**
 * Poids d'une pièce, tel qu'affiché en vitrine : « 3,2 g », « 62 g ».
 * Deux décimales au plus, sans zéro superflu ; chaîne vide sans poids.
 */
export function formatWeight(grams: number | null | undefined): string {
  if (grams === null || grams === undefined || !Number.isFinite(grams) || grams <= 0) return '';

  const rounded = Math.round(grams * 100) / 100;
  const decimals = Number.isInteger(rounded) ? 0 : Number.isInteger(rounded * 10) ? 1 : 2;

  return `${formatNumber(rounded, decimals)} g`;
}

/** « 3,2 g » ou « 3.2 » → 3.2 ; `null` si la chaîne ne porte pas de poids. */
export function parseWeight(weight: string): number | null {
  const value = Number(weight.replace(/[^\d,.]/g, '').replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}
