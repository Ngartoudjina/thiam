'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useSiteContent } from '@/components/providers/site-content-provider';
import { PhoneIcon, WhatsAppIcon } from '@/components/common/icons';
import { useScrollState } from '@/hooks/use-scroll-state';
import { WHATSAPP_INTENTS } from '@/constants/site';
import { DURATION, EASE_EDITORIAL } from '@/lib/motion';

/**
 * Barre d'action mobile.
 * « Sur mobile, la barre d'action apparaît après 40 % de scroll » — elle ne
 * masque donc jamais le hero, et reste ensuite à portée du pouce.
 */
export function MobileActionBar() {
  const { contact, links } = useSiteContent();
  const { isPastThreshold } = useScrollState({ thresholdRatio: 0.4 });

  return (
    <AnimatePresence>
      {isPastThreshold ? (
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: DURATION.page, ease: EASE_EDITORIAL }}
          className="fixed inset-x-0 bottom-0 z-70 flex gap-3 bg-[linear-gradient(0deg,rgba(11,11,12,0.96)_40%,rgba(11,11,12,0))] px-5 pt-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <a
            href={links.whatsappWithMessage(WHATSAPP_INTENTS.appointment)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 flex-1 items-center justify-center gap-2.5 bg-gold-gradient text-caption font-medium tracking-[0.14em] text-cacao uppercase"
          >
            <WhatsAppIcon size={15} />
            WhatsApp
          </a>
          <a
            href={links.phoneHref}
            aria-label={`Appeler le ${contact.phoneDisplay}`}
            className="flex min-h-14 w-15 items-center justify-center border border-[rgb(247_244_239/0.28)] text-ivory"
          >
            <PhoneIcon size={19} />
          </a>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
