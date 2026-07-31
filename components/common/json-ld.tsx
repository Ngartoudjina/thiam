interface JsonLdProps {
  readonly id: string;
  readonly data: Record<string, unknown>;
}

/**
 * Injecte un bloc `application/ld+json`.
 * Les chevrons sont échappés : un contenu éditorial ne peut pas fermer la
 * balise script prématurément.
 */
export function JsonLd({ id, data }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
