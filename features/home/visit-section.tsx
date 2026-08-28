import { Eyebrow } from '@/components/common/eyebrow';
import { PhoneIcon, WhatsAppIcon } from '@/components/common/icons';
import { MediaFrame } from '@/components/common/media-frame';
import { StatusBadge } from '@/components/common/status-badge';
import { Reveal } from '@/components/motion/reveal';
import { TextLines } from '@/components/motion/text-lines';
import { AccessMap } from '@/features/contact/access-map';
import { ChannelCard } from '@/features/contact/channel-card';
import { ContactForm } from '@/features/contact/contact-form';
import { OpeningHoursTable } from '@/features/contact/opening-hours-table';
import { MEDIA } from '@/constants/media';
import { HOME_FORM_TOPICS } from '@/constants/services';
import { SITE, WHATSAPP_INTENTS } from '@/constants/site';
import { contactLinks } from '@/services/content';
import type { ContactSettings, HoursContent } from '@/lib/schemas/content';
import { SECTIONS } from '@/constants/navigation';

/** « Passez la porte, le reste est simple » — bloc de visite et de rendez-vous. */
interface VisitSectionProps {
  readonly contact: ContactSettings;
  readonly hours: HoursContent;
}

export function VisitSection({ contact, hours }: VisitSectionProps) {
  const links = contactLinks(contact);

  return (
    <section id={SECTIONS.visit} aria-labelledby="visite-titre" className="relative bg-obsidian">
      <div className="relative h-[18rem] overflow-hidden lg:h-[28.75rem]">
        <MediaFrame
          asset={MEDIA.ecrinParure}
          sizes="100vw"
          objectPosition="object-[50%_45%]"
          className="absolute inset-0 h-full w-full"
        />
        {/* Double voile : vertical pour la couture avec la section, latéral
            pour garantir le contraste du titre quelle que soit la photo. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#EDE3D4_2%,rgba(11,11,12,0.5)_45%,rgba(11,11,12,0.62)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,12,0.85)_0%,rgba(11,11,12,0.45)_45%,rgba(11,11,12,0.15)_100%)]"
        />

        <div className="absolute inset-x-0 bottom-8 gutter lg:bottom-14">
          <Eyebrow theme="dark" className="mb-5 lg:mb-6">
            Nous rendre visite
          </Eyebrow>
          <TextLines
            id="visite-titre"
            lines={[
              'Passez la porte,',
              <>
                le reste est <em className="font-light text-gold-light">simple</em>
              </>,
            ]}
            className="font-serif text-[clamp(2.625rem,1.9rem+2.98vw,5.125rem)] leading-none font-light tracking-(--tracking-display) text-ivory"
          />
        </div>
      </div>

      <div className="grid border-t border-rule-dark lg:grid-cols-2">
        <div className="border-rule-dark gutter py-14 lg:border-r lg:py-25 lg:pr-20">
          <div className="mb-14 flex flex-col gap-4.5">
            <ChannelCard
              href={links.whatsappWithMessage(WHATSAPP_INTENTS.appointment)}
              title="Écrire sur WhatsApp"
              subtitle="Réponse en moins d’une heure"
              icon={<WhatsAppIcon size={19} />}
              tone="gold"
              external
            />
            <ChannelCard
              href={links.phoneHref}
              title="Appeler la boutique"
              subtitle={contact.phoneDisplay}
              icon={<PhoneIcon size={19} />}
              tone="outlineDark"
            />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="mb-5 text-micro tracking-(--tracking-address) text-gold-dim uppercase">
                Adresse
              </h3>
              <p className="mb-3.5 font-serif text-[1.5625rem] leading-[1.45] font-light text-ink">
                {SITE.name}
                <br />
                {links.cityCountry}
              </p>
              <p className="text-caption-lg font-light text-on-dark-faint">
                {contact.streetAddress || 'Adresse détaillée à compléter'}
              </p>

              <AccessMap className="mt-6.5" withActions={false} contact={contact} />
            </div>

            <div>
              <h3 className="mb-5 text-micro tracking-(--tracking-address) text-gold-dim uppercase">
                Horaires
              </h3>
              <OpeningHoursTable theme="dark" days={hours.days} />
              <StatusBadge variant="panel" className="mt-6.5" />
            </div>
          </div>
        </div>

        <div className="gutter py-14 lg:py-25 lg:pl-20">
          <Reveal variant="up-sm">
            <p className="mb-5.5 text-micro tracking-(--tracking-address) text-gold-dim uppercase">
              Demande de rendez-vous
            </p>
            <h3 className="mb-10 font-serif text-form leading-[1.1] font-light text-ink lg:mb-11.5">
              Dites-nous ce que
              <br />
              vous cherchez
            </h3>
          </Reveal>

          <ContactForm
            id="accueil"
            topics={HOME_FORM_TOPICS}
            topicLegend="Votre projet"
            submitLabel="Envoyer ma demande"
            note="Vos informations restent confidentielles et ne sont jamais partagées."
          />
        </div>
      </div>
    </section>
  );
}
