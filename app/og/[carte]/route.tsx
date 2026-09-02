import { isOgCardKey, OG_CARDS, renderOgCard } from '@/lib/og-card';

/** Les vignettes sont figées au build : rien n'y varie d'une requête à l'autre. */
export const dynamic = 'force-static';

export function generateStaticParams(): Array<{ carte: string }> {
  return Object.keys(OG_CARDS).map((carte) => ({ carte }));
}

/**
 * Vignettes de partage à adresse stable.
 * `/og/rachat-or`, `/og/alliances-mariage` — référencées telles quelles dans
 * la metadata des pages correspondantes.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ carte: string }> },
): Promise<Response> {
  const { carte } = await params;
  if (!isOgCardKey(carte)) return new Response('Vignette inconnue', { status: 404 });

  const { alt: _alt, ...contenu } = OG_CARDS[carte];
  return renderOgCard(contenu);
}
