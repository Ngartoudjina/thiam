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
