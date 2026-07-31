import { GoldHalo, Section } from '@/components/common/section';
import { SectionHeading } from '@/components/common/section-heading';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { CRAFT_PILLARS, MOBILE_PILLAR_COUNT } from '@/constants/craft';
import { SECTIONS } from '@/constants/navigation';
import { cn } from '@/lib/utils';

const mobilePillars = CRAFT_PILLARS.slice(0, MOBILE_PILLAR_COUNT);

/**
 * « Ce qui ne se voit pas sur la photo » — l'escalier de garanties.
 *
 * À l'arrivée : chaque ligne glisse de 24 px depuis la gauche, en cascade.
 * Au survol : le filet passe à l'or, le numéro se décale de 6 px et les autres
 * lignes descendent à 40 % — géré par `:has()`, sans un octet de JavaScript.
 */
export function CraftSection() {
  return (
    <Section
      id={SECTIONS.craft}
      theme="dark"
      labelledBy="savoir-faire-titre"
      className="overflow-hidden pb-0 lg:pb-0"
    >
      <GoldHalo className="top-[8%] -right-[10%] size-[47.5rem]" />

      <SectionHeading
        id="savoir-faire-titre"
        theme="dark"
        eyebrow="Pourquoi la maison THIAM"
        lines={[
          'Ce qui ne se voit pas',
          <em key="photo" className="font-light text-gold">
            sur la photo
          </em>,
        ]}
        description="Un bijou se choisit deux fois : le jour de l'achat, et chaque fois qu'on le fait réparer, nettoyer, agrandir. Nous sommes là pour les deux."
        className="relative mb-12 lg:mb-26"
      />

      {/* Mobile : quatre promesses, formulation courte de la maquette. */}
      <RevealGroup as="ul" className="relative border-t border-rule-dark lg:hidden">
        {mobilePillars.map((pillar) => (
          <RevealItem
            as="li"
            key={pillar.index}
            variant="left"
            className="grid grid-cols-[2.5rem_1fr] border-b border-[rgb(247_244_239/0.09)] py-5.5"
          >
            <span className="pt-2 font-serif text-meta tracking-(--tracking-badge) text-gold">
              {pillar.index}
            </span>
            <div>
              <h3 className="mb-1.5 font-serif text-[1.625rem] font-normal text-ivory">
                {pillar.mobileTitle ?? pillar.title}
              </h3>
              <p className="text-body-sm leading-[1.65] font-light text-on-dark-faint">
                {pillar.mobileDescription ?? pillar.description}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Desktop : les sept lignes en escalier. */}
      <RevealGroup as="ul" className="craft-list relative hidden lg:block">
        {CRAFT_PILLARS.map((pillar, index) => (
          <RevealItem
            as="li"
            key={pillar.index}
            variant="left"
            step={index + 1}
            className={cn(
              'craft-row group grid grid-cols-[4rem_18.125rem_1fr] items-start border-t border-[rgb(247_244_239/0.11)] py-8.5',
              'transition-[opacity,border-color] duration-(--duration-state) ease-out',
              'focus-within:border-t-[rgb(192_138_98/0.55)] hover:border-t-[rgb(192_138_98/0.55)]',
              index === CRAFT_PILLARS.length - 1 && 'border-b border-b-[rgb(247_244_239/0.11)]',
            )}
          >
            <span className="pt-3 font-serif text-[0.9375rem] tracking-[0.24em] text-gold transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1.5">
              {pillar.index}
            </span>
            <h3 className="font-serif text-row leading-[1.05] font-light text-ivory">
              {pillar.title}
            </h3>
            <p className="max-w-[32.5rem] pt-2.5 text-body-sm leading-[1.7] font-light text-on-dark-faint">
              {pillar.description}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
