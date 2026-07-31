'use client';

import { useState } from 'react';
import { DEFAULT_CONTACT } from '@/constants/defaults';
import type { ContactSettings } from '@/lib/schemas/content';
import { cn } from '@/lib/utils';

interface AccessMapProps {
  readonly className?: string;
  readonly withActions?: boolean;
  readonly contact?: ContactSettings;
}

/**
 * Plan d'accès.
 *
 * L'iframe Google Maps n'est montée que si l'adresse d'intégration est
 * renseignée : sans elle, on affiche un cadre de la maison plutôt qu'un bloc
 * vide, et aucune requête tierce ne part au chargement de la page.
 */
export function AccessMap({
  className,
  withActions = true,
  contact = DEFAULT_CONTACT,
}: AccessMapProps) {
  const mapsQuery = contact.mapsQuery || `${contact.city}, ${contact.country}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`;
  const [copied, setCopied] = useState(false);

  const address = [contact.streetAddress, `${contact.city}, ${contact.country}`]
    .filter(Boolean)
    .join(', ');

  const copyAddress = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-[12.5rem] overflow-hidden border border-[rgb(247_244_239/0.12)] bg-slate lg:h-[26.25rem]">
        {contact.mapsEmbedSrc ? (
          <iframe
            src={contact.mapsEmbedSrc}
            title={`Plan d'accès — ${mapsQuery}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full grayscale-[0.35]"
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(192,138,98,0.18),transparent_65%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(247,244,239,0.05)_0_1px,transparent_1px_64px),repeating-linear-gradient(0deg,rgba(247,244,239,0.05)_0_1px,transparent_1px_64px)]"
            />
            <p className="absolute inset-x-6 bottom-6 text-caption font-light text-on-dark-faint">
              {`${contact.city}, ${contact.country}`}
            </p>
          </>
        )}
      </div>

      {withActions ? (
        <div className="mt-4 flex gap-3">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-[rgb(247_244_239/0.22)] px-5 py-4 text-center text-label-lg tracking-(--tracking-label) text-ivory uppercase transition-colors duration-(--duration-state) ease-out hover:border-gold-pale hover:text-gold-pale"
          >
            Ouvrir l’itinéraire
          </a>
          <button
            type="button"
            onClick={copyAddress}
            className="flex-1 border border-[rgb(247_244_239/0.22)] px-5 py-4 text-label-lg tracking-(--tracking-label) text-ivory uppercase transition-colors duration-(--duration-state) ease-out hover:border-gold-pale hover:text-gold-pale"
          >
            <span aria-live="polite">{copied ? 'Adresse copiée' : 'Copier l’adresse'}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
