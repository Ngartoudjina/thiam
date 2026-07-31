import Image from 'next/image';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/blur';
import { cn } from '@/lib/utils';
import type { MediaAsset } from '@/types';

interface MediaFrameProps {
  /** `null` lorsque la photo reste à fournir par la maison. */
  readonly asset: MediaAsset | null;
  /** Description de la photo attendue, conservée pour l'équipe éditoriale. */
  readonly placeholder?: string;
  /** Remplace le texte alternatif du visuel lorsque le contexte l'exige. */
  readonly alt?: string;
  readonly sizes: string;
  readonly priority?: boolean;
  readonly className?: string;
  readonly imageClassName?: string;
  /** Cadrage Tailwind, ex. `object-[52%_45%]` — pas de style en ligne. */
  readonly objectPosition?: string;
  /** Zoom au survol — 1.045 ou 1.05 selon les blocs de la maquette. */
  readonly hoverZoom?: 'none' | 'soft' | 'firm';
  readonly quality?: number;
}

const HOVER_ZOOM: Record<'none' | 'soft' | 'firm', string> = {
  none: '',
  soft: 'group-hover:scale-[1.045] group-focus-visible:scale-[1.045]',
  firm: 'group-hover:scale-[1.05] group-focus-visible:scale-[1.05]',
};

/**
 * Cadre photo unique du site : recadrage, dominante de chargement, zoom au
 * survol et emplacement de remplacement lorsque le visuel n'est pas encore
 * livré. Aucun composant n'appelle `next/image` directement.
 *
 * Le visuel est reçu déjà résolu : le composant ignore s'il provient des
 * fichiers du dépôt ou de Supabase Storage.
 */
export function MediaFrame({
  asset,
  placeholder,
  alt,
  sizes,
  priority = false,
  className,
  imageClassName,
  objectPosition,
  hoverZoom = 'none',
  quality = 82,
}: MediaFrameProps) {
  if (asset === null) {
    return (
      <div
        className={cn('relative overflow-hidden bg-slate', className)}
        data-media-slot={placeholder ?? 'Visuel à fournir'}
        role="presentation"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(192,138,98,0.16),transparent_68%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-10 w-10 rotate-45 border border-gold/25" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-ink-soft', className)}>
      <Image
        src={asset.src}
        alt={alt ?? asset.alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        placeholder="blur"
        blurDataURL={DEFAULT_BLUR_DATA_URL}
        className={cn(
          'object-cover transition-transform duration-(--duration-zoom) ease-(--ease-editorial)',
          objectPosition,
          HOVER_ZOOM[hoverZoom],
          imageClassName,
        )}
      />
    </div>
  );
}
