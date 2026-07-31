'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSiteContent } from '@/components/providers/site-content-provider';
import { BrandLockup } from '@/components/layout/brand-lockup';
import { PhoneIcon, WhatsAppIcon } from '@/components/common/icons';
import { StatusBadge } from '@/components/common/status-badge';
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider';
import { PRIMARY_NAV } from '@/constants/navigation';
import { WHATSAPP_INTENTS } from '@/constants/site';
import { DURATION, EASE_EDITORIAL, STAGGER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

/** « Voile en verre dépoli, entrées en cascade de 60 ms, fermeture 2× plus rapide. » */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.page, ease: EASE_EDITORIAL } },
  exit: { opacity: 0, transition: { duration: DURATION.page / 2, ease: EASE_EDITORIAL } },
};

const panelVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.page,
      ease: EASE_EDITORIAL,
      staggerChildren: STAGGER.tight,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.page / 2, ease: EASE_EDITORIAL, staggerChildren: 0 },
  },
};

const entryVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE_EDITORIAL } },
  exit: { opacity: 0, transition: { duration: DURATION.page / 2 } },
};

interface MobileMenuProps {
  readonly theme: Theme;
}

export function MobileMenu({ theme }: MobileMenuProps) {
  const { contact, links } = useSiteContent();
  const [open, setOpen] = useState(false);
  const smoothScroll = useSmoothScroll();

  // Le défilement inertiel doit s'arrêter tant que le voile est ouvert.
  useEffect(() => {
    if (open) {
      smoothScroll?.stop();
    } else {
      smoothScroll?.start();
    }
  }, [open, smoothScroll]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          data-touch-target
          aria-label="Ouvrir le menu"
          className={cn(
            'flex size-11 flex-col items-center justify-center gap-[5px] lg:hidden',
            theme === 'dark' ? 'text-ivory' : 'text-ink',
          )}
        >
          <span aria-hidden="true" className="block h-px w-5 bg-current" />
          <span aria-hidden="true" className="block h-px w-5 bg-current" />
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <m.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-90 bg-obsidian/70 backdrop-blur-xl lg:hidden"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild aria-describedby={undefined}>
              <m.div
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-100 flex flex-col bg-obsidian lg:hidden"
              >
                <Dialog.Title className="sr-only">Menu principal</Dialog.Title>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-[14%] -left-[30%] size-[32.5rem] rounded-full bg-[radial-gradient(circle,rgba(192,138,98,0.2),rgba(192,138,98,0)_66%)]"
                />

                <div className="relative flex h-15 shrink-0 items-center justify-between px-5 pt-[env(safe-area-inset-top)]">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      data-touch-target
                      aria-label="Fermer le menu"
                      className="flex size-11 items-center justify-center text-ivory"
                    >
                      <X size={22} strokeWidth={1.2} aria-hidden="true" />
                    </button>
                  </Dialog.Close>

                  <BrandLockup theme="dark" size="sm" asLink={false} />
                  <span className="w-11" />
                </div>

                <nav aria-label="Menu principal" className="relative flex-1 px-6 pt-9">
                  {PRIMARY_NAV.map((link, index) => (
                    <m.div key={link.href} variants={entryVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-baseline gap-3.5 border-b border-rule-dark py-4"
                      >
                        <span className="font-serif text-caption tracking-(--tracking-nav) text-gold">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="font-serif text-[2.5rem] leading-none font-light text-ivory">
                          {link.label}
                        </span>
                      </Link>
                    </m.div>
                  ))}
                </nav>

                <m.div
                  variants={entryVariants}
                  className="relative px-6 pb-[max(1.625rem,env(safe-area-inset-bottom))]"
                >
                  <StatusBadge variant="plain" className="mb-5" />
                  <div className="flex gap-3">
                    <a
                      href={links.whatsappWithMessage(WHATSAPP_INTENTS.appointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-14 flex-1 items-center justify-center gap-2.5 bg-gold-gradient px-5 text-caption font-medium tracking-[0.14em] text-cacao uppercase"
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
                  </div>
                </m.div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
