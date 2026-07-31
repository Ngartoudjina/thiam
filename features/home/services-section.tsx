import { ArrowRightIcon, ServicePictogram } from '@/components/common/icons';
import { GoldHalo, Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import type { Service } from '@/types';
import { CONTACT, WHATSAPP_INTENTS } from '@/constants/site';
import { SECTIONS } from '@/constants/navigation';

/**
 * « Tout ce que l'on fait après la vente ».
 *
 * Chaque ligne est un lien direct vers WhatsApp, avec un message déjà rédigé
 * au nom du service : le visiteur n'a plus qu'à envoyer.
 * Au survol : fond or à 5 %, pictogramme qui pivote de 8°, flèche qui avance
 * de 8 px, tarif en blanc plein.
 */
export function ServicesSection({ services }: { readonly services: readonly Service[] }) {
  return (
    <Section
      id={SECTIONS.services}
      theme="dark"
      labelledBy="services-titre"
      className="overflow-hidden"
    >
      <GoldHalo className="-bottom-[14%] -left-[8%] size-[43.75rem]" />

      <SectionHeading
        id="services-titre"
        theme="dark"
        eyebrow="Services"
        lines={[
          'Tout ce que l’on fait',
          <em key="apres" className="font-light text-gold">
            après la vente
          </em>,
        ]}
        description="Tarifs indicatifs, annoncés avant l'intervention. Aucun travail n'est lancé sans votre accord."
        className="relative mb-12 lg:mb-22"
      />

      <RevealGroup
        as="ul"
        stagger={0.06}
        className="relative border-t border-[rgb(247_244_239/0.12)]"
      >
        {services.map((service) => (
          <RevealItem as="li" key={service.title} variant="up-sm">
            <a
              href={CONTACT.whatsappWithMessage(WHATSAPP_INTENTS.service(service.title))}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 border-b border-[rgb(247_244_239/0.09)] px-0 py-6 transition-colors duration-(--duration-state) ease-out hover:bg-[rgb(232_191_163/0.055)] lg:grid-cols-[3.5rem_18.75rem_1fr_12.5rem_2.5rem] lg:gap-0 lg:px-6.5 lg:py-8"
            >
              <ServicePictogram
                name={service.icon}
                className="text-gold transition-transform duration-(--duration-state) ease-out group-hover:rotate-8"
              />

              <h3 className="font-serif text-question font-normal text-ivory">{service.title}</h3>

              <p className="col-span-2 text-body-sm font-light text-on-dark-faint lg:col-span-1 lg:pr-[3.125rem]">
                {service.description}
              </p>

              <span className="col-start-3 row-start-1 text-caption tracking-[0.14em] text-gold-light uppercase transition-colors duration-(--duration-state) ease-out group-hover:text-ivory lg:col-start-auto lg:row-start-auto lg:pr-6 lg:text-right">
                {service.price}
              </span>

              <ArrowRightIcon
                size={17}
                className="hidden justify-self-end text-gold transition-transform duration-(--duration-state) ease-out group-hover:translate-x-2 lg:block"
              />
            </a>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
