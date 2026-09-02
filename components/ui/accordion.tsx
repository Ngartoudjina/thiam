'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Accordéon de la maison, bâti sur Radix : clavier, ARIA et gestion du focus
 * sont conformes au patron APG sans une ligne de code supplémentaire.
 * « Une seule question ouverte à la fois. »
 */
export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-t border-[rgb(22_18_15/0.14)] last:border-b', className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex flex-1 items-center justify-between gap-6 py-7 text-left',
          'transition-colors duration-(--duration-state) ease-out hover:text-gold-ink lg:gap-7.5',
          className,
        )}
        {...props}
      >
        <span className="font-serif text-question font-normal text-ink transition-colors duration-(--duration-state) ease-out group-hover:text-gold-ink">
          {children}
        </span>

        <span aria-hidden="true" className="relative block size-4 shrink-0 text-gold-dim">
          <span className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 bg-current" />
          <span
            className={cn(
              'absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 bg-current',
              'transition-transform duration-(--duration-state) ease-out',
              'rotate-90 group-data-[state=open]:rotate-0',
            )}
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div
        className={cn(
          'max-w-[41.25rem] pb-7 text-body leading-[1.8] font-normal text-stone',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}
