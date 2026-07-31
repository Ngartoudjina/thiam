/**
 * Lien d'évitement : première cible de tabulation de chaque page.
 * Invisible tant qu'il n'a pas le focus, conformément à WCAG 2.4.1.
 */
export function SkipLink() {
  return (
    <a
      href="#contenu"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-200 focus-visible:bg-ivory focus-visible:px-5 focus-visible:py-3 focus-visible:text-caption focus-visible:tracking-(--tracking-button) focus-visible:text-ink focus-visible:uppercase"
    >
      Aller au contenu principal
    </a>
  );
}
