import Link from 'next/link';
import { ArrowRightIcon, TrustIcon, WhatsAppIcon } from '@/components/common/icons';
import { EyebrowStatic } from '@/components/common/eyebrow-static';
import { MediaFrame } from '@/components/common/media-frame';
import { Parallax } from '@/components/motion/parallax';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { MEDIA } from '@/constants/media';
import { TRUST_SIGNALS } from '@/constants/craft';
import type { HeroContent } from '@/lib/schemas/content';
import { resolveVisual } from '@/services/content/media';
import type { VisualsContent } from '@/lib/schemas/content';

/**
 * Hero de l'accueil.
 *
 * Desktop : diptyque texte / photo, halos dorés en fond, carte flottante et
 * mention verticale de la collection.
 * Mobile : la photo devient le fond du titre, les appels à l'action passent
 * sous le pli et les signes de réassurance défilent horizontalement — la
 * version mobile de la maquette, pas une réduction de la version large.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Composant serveur, sans une ligne de JavaScript client.
 *
 * L'entrée était pilotée par Framer Motion depuis `opacity: 0` : le premier
 * écran restait donc blanc jusqu'à l'hydratation, et le premier rendu utile
 * arrivait une seconde après que le HTML était prêt. Les mêmes mouvements sont
 * désormais décrits en CSS (`hero-rise`, `hero-line`, `hero-unmask`) et
 * démarrent dès l'application de la feuille de style. Le décalage entre
 * éléments est porté par `--hero-step`, conformément à la règle des 80 ms.
 *
 * Les deux mises en page partagent volontairement les mêmes `sizes` et la même
 * qualité : le navigateur choisit alors la même source pour l'une et l'autre,
 * et ne télécharge la photo qu'une seule fois.
 */
export function HeroSection({
  hero,
  visuals,
}: {
  readonly hero: HeroContent;
  readonly visuals: VisualsContent;
}) {
  const heroImage = (
    <MediaFrame
      asset={resolveVisual(visuals.heroMain, MEDIA.heroParure)}
      priority
      quality={86}
      sizes="(min-width: 1024px) 42vw, 100vw"
      objectPosition="object-[52%_45%]"
      className="h-full w-full"
    />
  );

  return (
    <section
      aria-labelledby="hero-titre"
      className="relative isolate overflow-hidden bg-obsidian text-ink"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[24%] -left-[14%] size-[58.75rem] rounded-full bg-[radial-gradient(circle,rgba(192,138,98,0.22),rgba(192,138,98,0)_66%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-30%] left-[34%] size-[43.75rem] rounded-full bg-[radial-gradient(circle,rgba(232,191,163,0.1),rgba(232,191,163,0)_68%)]"
      />

      {/* ---------------------------------------------------------------- */}
      {/*  Mobile & tablette                                                */}
      {/* ---------------------------------------------------------------- */}
      {/* La photo commence sous la barre de navigation, comme en maquette. */}
      {/* Le texte de ce bloc repose sur la photographie : encre claire. */}
      <div className="pt-15 text-ivory lg:hidden">
        <div className="relative h-[min(70vh,35rem)] min-h-[26rem] overflow-hidden">
          <div className="hero-unmask absolute inset-0">
            <Parallax distance={44} className="absolute inset-0">
              {heroImage}
            </Parallax>
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(0deg,#0B0B0C_3%,rgba(11,11,12,0.45)_42%,rgba(11,11,12,0.15)_100%)]"
          />

          <div className="absolute inset-x-6 bottom-9">
            <div className="hero-rise [--hero-step:0]">
              <EyebrowStatic theme="dark" fade className="mb-4.5 [&_span:last-child]:text-gold-pale">
                {hero.eyebrow}
              </EyebrowStatic>
            </div>

            <h1
              id="hero-titre"
              className="mb-4 font-serif text-hero leading-[0.96] font-light tracking-(--tracking-display)"
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="hero-line [--hero-step:1]">{hero.titleLine1}</span>
              </span>
              <span className="block overflow-hidden pb-[0.08em]">
                <em className="hero-line block font-light text-gold-light [--hero-step:2]">
                  {hero.titleLine2}
                </em>
              </span>
            </h1>

            <p className="hero-rise text-lead leading-[1.65] font-normal text-[rgb(247_244_239/0.82)] [--hero-step:3]">
              {hero.descriptionMobile || hero.description}
            </p>
          </div>
        </div>

        <div className="hero-rise flex flex-col gap-3 gutter pt-6 pb-5.5 [--hero-step:4]">
          <Button asChild variant="gold" size="lg" block className="min-h-14">
            <a href={hero.primaryCta.href} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={15} />
              {hero.primaryCta.label}
            </a>
          </Button>
          <Button asChild variant="outlineBeige" size="lg" block className="min-h-14">
            <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>

        <ul className="hero-rise flex scrollbar-none gap-2.5 overflow-x-auto px-5 pt-1.5 pb-7.5 text-ink [--hero-step:5]">
          {TRUST_SIGNALS.map((signal) => (
            <li
              key={signal.icon}
              className="flex shrink-0 items-center gap-2.5 border border-[rgb(22_18_15/0.16)] px-4 py-3.5"
            >
              <TrustIcon name={signal.icon} size={15} className="text-gold" />
              <span className="text-micro tracking-[0.12em] whitespace-nowrap text-on-dark-soft uppercase">
                {signal.mobileLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Desktop — diptyque 1fr / 604 px du canvas 1440                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="hidden lg:grid lg:h-[56.25rem] lg:grid-cols-[1fr_37.75rem] lg:pt-26">
        <div className="relative z-4 flex flex-col justify-center pr-[4.375rem] pl-[clamp(1.25rem,0.712rem+2.21vw,3.75rem)]">
          <div className="hero-rise [--hero-step:0]">
            <EyebrowStatic theme="light" fade className="mb-8.5">
              {hero.eyebrow}
            </EyebrowStatic>
          </div>

          <h1
            id="hero-titre-desktop"
            className="mb-7.5 font-serif text-hero leading-[0.94] font-light tracking-(--tracking-display)"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line [--hero-step:1]">{hero.titleLine1}</span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <em className="hero-line block text-gold-gradient font-light [--hero-step:2]">
                {hero.titleLine2}
              </em>
            </span>
          </h1>

          <p className="hero-rise mb-11 max-w-[26.875rem] text-lead leading-[1.72] font-normal text-on-dark-muted [--hero-step:3]">
            {hero.description}
          </p>

          <div className="hero-rise flex flex-wrap items-center gap-4 [--hero-step:4]">
            <Button asChild variant="gold" size="lg" className="px-8.5">
              <a href={hero.primaryCta.href} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={15} />
                {hero.primaryCta.label}
              </a>
            </Button>
            <Button asChild variant="outlineBeige" size="lg">
              <Link href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
                <ArrowRightIcon size={16} />
              </Link>
            </Button>
          </div>

          <ul className="hero-rise mt-[4.375rem] flex gap-9 border-t border-rule-dark pt-6.5 [--hero-step:5]">
            {TRUST_SIGNALS.map((signal) => (
              <li key={signal.icon} className="flex items-center gap-2.5">
                <TrustIcon name={signal.icon} size={17} className="text-gold" />
                <span className="text-label-lg tracking-[0.14em] text-on-dark-soft uppercase">
                  {signal.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="hero-unmask h-full w-full">
            <Parallax distance={72} className="h-full w-full">
              {heroImage}
            </Parallax>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#EDE3D4_0%,rgba(237,227,212,0.72)_18%,rgba(237,227,212,0)_52%)]"
          />

          <div className="hero-rise absolute bottom-33 -left-26 h-[19.375rem] w-[14.875rem] border border-[rgb(232_191_163/0.24)] shadow-(--shadow-float) [--hero-step:7]">
            <MediaFrame
              asset={resolveVisual(visuals.heroCard, MEDIA.bouclesPerle)}
              sizes="238px"
              quality={82}
              className="h-full w-full"
            />
          </div>

          <div className="absolute top-11 right-8.5">
            <StatusBadge />
          </div>

          <p className="absolute right-6 bottom-14 text-[0.625rem] tracking-(--tracking-address) text-on-dark-faint uppercase [writing-mode:vertical-rl]">
            Collection Héritage · Parure or 21K
          </p>
        </div>
      </div>
    </section>
  );
}
