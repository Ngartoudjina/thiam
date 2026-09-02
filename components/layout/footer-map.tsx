import { ArrowRightIcon, PinIcon } from '@/components/common/icons';
import { LOCATION, MAPS } from '@/constants/site';
import { contactLinks } from '@/services/content';
import type { ContactSettings } from '@/lib/schemas/content';

/**
 * Plan d'accès du pied de page.
 *
 * La carte est chargée en différé et sans clé d'API : elle vise les
 * coordonnées exactes de la fiche Google de la maison, pas une recherche par
 * nom — un client qui lance l'itinéraire ne peut pas atterrir ailleurs.
 */
export function FooterMap({ contact }: { readonly contact: ContactSettings }) {
  const links = contactLinks(contact);
  const address = [contact.streetAddress, links.cityCountry].filter(Boolean).join(' · ');

  return (
    <section aria-labelledby="pied-plan" className="w-full">
      <h2
        id="pied-plan"
        className="mb-4 flex items-center gap-2.5 text-micro tracking-(--tracking-address) text-gold-ink uppercase"
      >
        <PinIcon size={14} />
        Nous trouver
      </h2>

      <div className="overflow-hidden border border-rule-dark">
        <iframe
          src={MAPS.embedSrc}
          title={`Plan d’accès — ${LOCATION.mapsQuery}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-44 w-full border-0 grayscale-[0.15] lg:h-52"
        />
      </div>

      {MAPS.usesOpenStreetMap ? (
        <p className="mt-2 text-[0.6875rem] text-on-dark-faint">
          Fond de plan{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gold-ink"
          >
            © OpenStreetMap
          </a>
        </p>
      ) : null}

      <p className="mt-3.5 text-caption-lg font-normal text-on-dark-soft">{address}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <a
          href={MAPS.directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group/arrow inline-flex items-center gap-2.5 text-label-lg tracking-(--tracking-label) text-gold-ink uppercase transition-colors duration-(--duration-state) ease-out hover:text-gold-deep"
        >
          Itinéraire
          <ArrowRightIcon
            size={16}
            className="transition-transform duration-(--duration-state) ease-out group-hover/arrow:translate-x-1"
          />
        </a>
        <a
          href={MAPS.placeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-label-lg tracking-(--tracking-label) text-on-dark-faint uppercase transition-colors duration-(--duration-state) ease-out hover:text-gold-ink"
        >
          Voir la fiche Google
        </a>
      </div>
    </section>
  );
}
