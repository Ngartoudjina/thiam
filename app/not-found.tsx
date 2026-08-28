import Link from 'next/link';
import { ArrowRightIcon, WhatsAppIcon } from '@/components/common/icons';
import { CompactFooter } from '@/components/layout/compact-footer';
import { Eyebrow } from '@/components/common/eyebrow';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/navigation';
import { CONTACT, WHATSAPP_INTENTS } from '@/constants/site';

export const metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <section className="flex min-h-[70vh] flex-col justify-center bg-obsidian gutter pt-[10rem] pb-24 lg:pt-[14rem] lg:pb-32">
        <Eyebrow theme="dark" className="mb-6 lg:mb-7">
          Erreur 404
        </Eyebrow>

        <h1 className="mb-6 font-serif text-section leading-[1.02] font-light tracking-(--tracking-display) text-ink">
          Cette vitrine
          <br />
          <em className="font-light text-gold">est vide</em>
        </h1>

        <p className="mb-10 max-w-[30rem] text-body leading-[1.75] font-light text-on-dark-faint">
          La page que vous cherchez n’existe plus, ou n’a jamais existé. Nos pièces, elles, sont
          toujours là.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button asChild variant="gold" size="lg">
            <Link href={ROUTES.collections}>
              Voir les collections
              <ArrowRightIcon size={16} />
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <a
              href={CONTACT.whatsappWithMessage(WHATSAPP_INTENTS.question)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={15} />
              Nous écrire
            </a>
          </Button>
        </div>
      </section>

      <CompactFooter variant="copyright" />
    </>
  );
}
