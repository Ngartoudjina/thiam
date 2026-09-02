import { Eyebrow } from '@/components/common/eyebrow';
import { JsonLd } from '@/components/common/json-ld';
import { MediaFrame } from '@/components/common/media-frame';
import { PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/common/icons';
import { StatusBadge } from '@/components/common/status-badge';
import { CompactFooter } from '@/components/layout/compact-footer';
import { Reveal } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { AccessMap } from '@/features/contact/access-map';
import { ChannelCard } from '@/features/contact/channel-card';
import { ContactForm } from '@/features/contact/contact-form';
import { OpeningHoursTable } from '@/features/contact/opening-hours-table';
import { MEDIA } from '@/constants/media';
import { CONTACT_FORM_TOPICS } from '@/constants/services';
import { ROUTES } from '@/constants/navigation';
import { WHATSAPP_INTENTS } from '@/constants/site';
import { contactLinks, getSiteSettings } from '@/services/content';
import { SHOP_QUOTE } from '@/constants/craft';
import { createMetadata } from '@/lib/seo';
import { buildWebPageSchema } from '@/lib/structured-data';
import { resolveVisual } from '@/services/content/media';

export const metadata = createMetadata({
  title: 'Contact — bijouterie à Cotonou',
  description:
    'WhatsApp, téléphone ou visite en boutique à Cotonou. Ouvert du lundi au samedi, 09h — 21h. Réponse en général dans l’heure.',
  path: ROUTES.contact,
  keywords: ['contact bijouterie Cotonou', 'rendez-vous bijoutier Bénin', 'WhatsApp bijouterie'],
});

/** Écran 1f de la maquette — la page Contact. */
export default async function ContactPage() {
  const settings = await getSiteSettings();
  const contact = settings.contact;
  const links = contactLinks(contact);

  return (
    <>
      <JsonLd
        id="schema-page-contact"
        data={buildWebPageSchema({
          name: 'Contact — Bijouterie THIAM 24 Carats',
          description:
            'WhatsApp, téléphone ou visite en boutique à Cotonou. Ouvert du lundi au samedi.',
          path: ROUTES.contact,
          trail: [
            { name: 'Accueil', path: ROUTES.home },
            { name: 'Contact', path: ROUTES.contact },
          ],
        })}
      />

      {/* `pt` compense la hauteur de la barre fixe : les deux colonnes, texte
          comme photo, démarrent sous la navigation, comme sur la maquette. */}
      <section
        aria-labelledby="contact-titre"
        className="grid bg-ivory pt-15 lg:grid-cols-[1fr_38.75rem] lg:pt-26"
      >
        <div className="gutter py-14 lg:py-25 lg:pr-17.5">
          <Eyebrow className="mb-6 lg:mb-7">Contact</Eyebrow>

          <TextLines
            as="h1"
            id="contact-titre"
            lines={[
              'Trois façons',
              <>
                de nous <em className="font-light">joindre</em>
              </>,
            ]}
            className="mb-5 font-serif text-contact leading-[0.98] font-light tracking-(--tracking-display-tight) text-ink lg:mb-6.5"
          />

          <Reveal variant="up-sm" as="p" className="mb-9 lg:mb-11.5">
            <span className="block max-w-[29.375rem] text-body leading-[1.75] font-normal text-stone">
              La plus rapide reste WhatsApp : envoyez une photo, une question ou un budget, et nous
              répondons en général dans l’heure.
            </span>
          </Reveal>

          <div className="mb-12 flex flex-col gap-4 lg:mb-14">
            <ChannelCard
              href={links.whatsappWithMessage(WHATSAPP_INTENTS.appointment)}
              title="Écrire sur WhatsApp"
              subtitle={`${contact.phoneDisplay} · réponse sous 1 h`}
              icon={<WhatsAppIcon size={24} />}
              tone="gold"
              size="full"
              external
            />
            <ChannelCard
              href={links.phoneHref}
              title="Appeler la boutique"
              subtitle="Du lundi au samedi, 09h — 21h"
              icon={<PhoneIcon size={24} className="text-gold-dim" />}
              tone="outlineLight"
              size="full"
            />
            <ChannelCard
              href={links.directionsHref}
              title="Venir en boutique"
              subtitle={`${links.cityCountry} · itinéraire`}
              icon={<PinIcon size={24} className="text-gold-dim" />}
              tone="outlineLight"
              size="full"
              external
            />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="mb-5 text-micro tracking-(--tracking-address) text-gold-ink uppercase">
                Horaires
              </h2>
              <OpeningHoursTable theme="light" days={settings.hours.days} />
            </div>

            <div>
              <h2 className="mb-5 text-micro tracking-(--tracking-address) text-gold-ink uppercase">
                Adresse
              </h2>
              <p className="mb-2.5 font-serif text-2xl leading-[1.45] font-light text-ink">
                Bijouterie THIAM
                <br />
                24 Carats
              </p>
              <p className="mb-1.5 text-body-sm leading-[1.7] font-normal text-clay">
                {links.cityCountry}
              </p>
              <p className="text-caption-lg font-normal text-clay">
                {contact.streetAddress || 'Rue et repère à compléter'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[20rem] bg-slate lg:min-h-full">
          <MediaFrame
            asset={resolveVisual(settings.visuals.contactPhoto, MEDIA.parureCristaux)}
            alt="Vitrine éclairée de la bijouterie"
            sizes="(min-width: 1024px) 620px, 100vw"
            className="absolute inset-0 h-full w-full"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,12,0.15),rgba(11,11,12,0.55))]"
          />

          <figure className="absolute inset-x-6 bottom-6 border border-[rgb(247_244_239/0.16)] glass-dark px-7 py-6 lg:inset-x-10 lg:bottom-10 lg:px-7.5 lg:py-7">
            <StatusBadge variant="plain" withClosingTime className="mb-4" />
            <blockquote className="font-serif text-2xl leading-[1.45] font-light text-ivory italic">
              « {SHOP_QUOTE.quote} »
            </blockquote>
          </figure>
        </div>
      </section>

      <section aria-labelledby="formulaire-titre" className="bg-obsidian gutter py-14 lg:py-25">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-20">
          <div>
            <h2 className="mb-5.5 text-micro tracking-(--tracking-address) text-gold-dim uppercase">
              Plan d’accès
            </h2>
            <AccessMap contact={contact} />
          </div>

          <div>
            <p className="mb-5.5 text-micro tracking-(--tracking-address) text-gold-dim uppercase">
              Formulaire
            </p>
            <h2
              id="formulaire-titre"
              className="mb-9 font-serif text-form leading-[1.06] font-light text-ink lg:mb-10"
            >
              Écrivez-nous,
              <br />
              même brièvement
            </h2>

            <ContactForm
              id="contact"
              topics={CONTACT_FORM_TOPICS}
              topicLegend="Objet"
              submitLabel="Envoyer"
              note="Ou écrivez directement sur WhatsApp — c’est plus rapide."
              messageRows={4}
            />
          </div>
        </div>
      </section>

      <CompactFooter variant="copyright" contact={contact} hours={settings.hours} />
    </>
  );
}
