import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Boutons de la maison.
 * Les six variantes correspondent exactement aux six traitements présents dans
 * la maquette ; aucune n'a été inventée, aucune n'a été fusionnée.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-3 text-center align-middle',
    'font-sans uppercase leading-none whitespace-nowrap',
    'transition-[background,color,border-color,transform] duration-(--duration-state) ease-out',
    'disabled:pointer-events-none disabled:opacity-55',
    // La flèche avance de 4 à 8 px au survol — micro-interaction de la spec.
    '[&_svg]:transition-transform [&_svg]:duration-(--duration-state) [&_svg]:ease-out',
  ],
  {
    variants: {
      variant: {
        /** CTA principal : dégradé or, texte cacao. */
        gold: [
          'sheen bg-gold-gradient text-cacao font-medium tracking-(--tracking-button)',
          'hover:bg-gold-gradient-hover hover:[&_svg]:translate-x-1',
        ],
        /** Contour clair sur fond sombre. */
        /** Contour posé sur photographie : il conserve son encre claire. */
        outlineLight: [
          'border border-[rgb(247_244_239/0.26)] text-ivory tracking-(--tracking-button)',
          'hover:border-gold-pale hover:text-gold-pale hover:[&_svg]:translate-x-1',
        ],
        /** Contour posé sur l'aplat beige. */
        outlineBeige: [
          'border border-[rgb(22_18_15/0.24)] text-ink tracking-(--tracking-button)',
          'hover:border-gold-ink hover:text-gold-ink hover:[&_svg]:translate-x-1',
        ],
        /** Contour sombre sur fond ivoire. */
        outlineDark: [
          'border border-[rgb(22_18_15/0.2)] text-ink tracking-(--tracking-label)',
          'hover:border-gold-dim hover:text-gold-ink hover:[&_svg]:translate-x-1',
        ],
        /** Contour or sur fond ivoire, s'inverse au survol. */
        outlineGold: [
          'border border-[rgb(169_128_95/0.55)] text-gold-ink tracking-(--tracking-button)',
          'hover:border-ink hover:bg-ink hover:text-ivory',
        ],
        /** Aplat encre sur fond clair. */
        /** Aplat or profond : le noir plein sortait de la palette de la maison. */
        ink: [
          'bg-gold-deep text-ivory font-medium tracking-(--tracking-button)',
          'hover:bg-gold-ink hover:[&_svg]:translate-x-1',
        ],
        /** Aplat ivoire sur fond sombre — envoi de formulaire. */
        ivory: [
          'bg-ivory text-cacao font-medium tracking-(--tracking-button)',
          'hover:bg-gold-light hover:[&_svg]:translate-x-1',
        ],
      },
      size: {
        sm: 'px-[22px] py-[14px] text-label',
        md: 'px-[26px] py-[17px] text-label-lg',
        lg: 'px-[30px] py-5 text-caption',
        xl: 'px-9 py-[21px] text-caption',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'lg',
      block: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Rend le style sur l'enfant direct — indispensable pour `next/link`. */
  readonly asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...props}
    />
  );
}

export { buttonVariants };
