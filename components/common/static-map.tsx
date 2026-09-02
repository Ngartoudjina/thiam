import Image from 'next/image';
import { PinIcon } from '@/components/common/icons';
import { buildStaticMap, TILE_SIZE } from '@/lib/static-map';
import { cn } from '@/lib/utils';

interface StaticMapProps {
  readonly latitude: number;
  readonly longitude: number;
  readonly label: string;
  /** Lien ouvert au clic — la fiche de l'établissement. */
  readonly href: string;
  readonly zoom?: number;
  readonly className?: string;
}

/**
 * Plan de situation.
 *
 * Une mosaïque de tuiles OpenStreetMap, décalée pour que la boutique tombe au
 * centre du cadre, et surmontée d'un repère aux couleurs de la maison. Aucun
 * `iframe`, donc aucune dépendance à la politique d'affichage d'un tiers : la
 * carte s'affiche toujours.
 *
 * Les deux valeurs passées en style sont de la géométrie calculée — le décalage
 * de la mosaïque en pixels — et non des choix graphiques ; elles ne peuvent pas
 * s'exprimer en classes utilitaires.
 */
export function StaticMap({
  latitude,
  longitude,
  label,
  href,
  zoom = 16,
  className,
}: StaticMapProps) {
  const map = buildStaticMap(latitude, longitude, { zoom });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — ouvrir le plan`}
      className={cn(
        'group relative block overflow-hidden border border-rule-dark bg-sand',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2"
        style={
          {
            '--map-x': `-${map.markerX}px`,
            '--map-y': `-${map.markerY}px`,
            transform: 'translate(var(--map-x), var(--map-y))',
            width: map.width,
            height: map.height,
          } as React.CSSProperties
        }
      >
        {map.tiles.map((tile) => (
          <Image
            key={tile.key}
            src={tile.src}
            alt=""
            width={TILE_SIZE}
            height={TILE_SIZE}
            sizes="256px"
            unoptimized={false}
            className="absolute max-w-none saturate-[0.75] contrast-[1.02]"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      {/* Voile chaud : la carte entre dans la palette de la maison. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[rgb(237_227_212/0.16)] mix-blend-multiply"
      />

      {/* Repère, exactement au centre du cadre. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-gold-deep text-ivory shadow-[0_6px_16px_-6px_rgb(22_18_15/0.6)] ring-2 ring-[rgb(255_252_247/0.9)] transition-transform duration-(--duration-state) ease-out group-hover:-translate-y-1">
          <PinIcon size={18} />
        </span>
      </span>

      <span className="pointer-events-none absolute right-1.5 bottom-1.5 bg-[rgb(255_252_247/0.82)] px-1.5 py-0.5 text-[0.5625rem] text-taupe">
        © OpenStreetMap
      </span>
    </a>
  );
}
