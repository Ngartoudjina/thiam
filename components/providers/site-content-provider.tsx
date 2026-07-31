'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_CONTACT, DEFAULT_HOURS } from '@/constants/defaults';
import type { ContactSettings, HoursContent } from '@/lib/schemas/content';

interface SiteContentValue {
  readonly contact: ContactSettings;
  readonly hours: HoursContent;
  readonly links: {
    readonly phoneHref: string;
    readonly whatsappHref: string;
    readonly whatsappWithMessage: (message: string) => string;
    readonly directionsHref: string;
    readonly cityCountry: string;
  };
}

const FALLBACK: Pick<SiteContentValue, 'contact' | 'hours'> = {
  contact: DEFAULT_CONTACT,
  hours: DEFAULT_HOURS,
};

const SiteContentContext = createContext<SiteContentValue | null>(null);

function buildLinks(contact: ContactSettings): SiteContentValue['links'] {
  const wa = `https://wa.me/${contact.whatsappNumber}`;

  return {
    phoneHref: `tel:${contact.phoneE164}`,
    whatsappHref: wa,
    whatsappWithMessage: (message) => `${wa}?text=${encodeURIComponent(message)}`,
    directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      contact.mapsQuery || `${contact.city}, ${contact.country}`,
    )}`,
    cityCountry: `${contact.city}, ${contact.country}`,
  };
}

/**
 * Coordonnées et horaires mis à disposition des composants clients.
 *
 * La barre de navigation, le menu plein écran, la barre d'action mobile et la
 * pastille d'ouverture en ont besoin sans que la page ait à les leur passer de
 * main en main. Les valeurs viennent de Supabase via la mise en page racine.
 */
export function SiteContentProvider({
  contact,
  hours,
  children,
}: {
  readonly contact: ContactSettings;
  readonly hours: HoursContent;
  readonly children: ReactNode;
}) {
  const value = useMemo<SiteContentValue>(
    () => ({ contact, hours, links: buildLinks(contact) }),
    [contact, hours],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

/** Retombe sur les valeurs de la maquette hors du fournisseur (ex. tableau de bord). */
export function useSiteContent(): SiteContentValue {
  const value = useContext(SiteContentContext);

  return (
    value ?? {
      ...FALLBACK,
      links: buildLinks(FALLBACK.contact),
    }
  );
}
