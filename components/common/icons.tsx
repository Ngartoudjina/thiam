import { cn } from '@/lib/utils';
import type { ServiceIcon } from '@/types';

/**
 * Pictogrammes dessinés pour la maison, repris trait pour trait de la
 * direction artistique. Ils font partie de l'identité au même titre que la
 * typographie : Lucide est réservé au mobilier d'interface (menu, fermeture,
 * accordéon, réseaux), ces tracés-ci restent maison.
 */

interface IconProps {
  readonly className?: string;
  readonly size?: number;
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function WhatsAppIcon({ className, size = 15 }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
      strokeWidth={1.2}
    >
      <path d="M14 7.6c0 3-2.7 5.4-6 5.4-.86 0-1.68-.16-2.42-.46L2.4 13.6l.72-2.6A5.1 5.1 0 0 1 2 7.6C2 4.6 4.7 2.2 8 2.2s6 2.4 6 5.4Z" />
    </svg>
  );
}

export function ArrowRightIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 8"
      width={size}
      height={size / 2}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
    >
      <path d="M0 4h14M10.6.8 14.4 4l-3.8 3.2" />
    </svg>
  );
}

export function PhoneIcon({ className, size = 19 }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
      strokeWidth={1.1}
    >
      <path d="M6.4 3.4 8.6 6l-1.8 2.2c.9 1.9 2.5 3.5 4.4 4.4L13.4 11l2.6 2.2-1.4 2.6c-4.6.5-10-4.9-9.5-9.5Z" />
    </svg>
  );
}

export function PinIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
      strokeWidth={1.1}
    >
      <path d="M10 17.5s5.6-4.9 5.6-9a5.6 5.6 0 1 0-11.2 0c0 4.1 5.6 9 5.6 9Z" />
      <circle cx="10" cy="8.4" r="2.1" />
    </svg>
  );
}

export function CheckIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
    >
      <path d="M4 10.4l3.6 3.6L16 5.6" />
    </svg>
  );
}

export function StarIcon({ className, size = 15 }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={cn('shrink-0', className)}
    >
      <path d="M10 1.4l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.4 4.8 17.3 6 11.5 1.6 7.5l5.9-.7Z" />
    </svg>
  );
}

export function InstagramIcon({ className, size = 15 }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
      strokeWidth={1.2}
    >
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3.4" />
      <circle cx="14.2" cy="5.8" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className, size = 15 }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
      strokeWidth={1.2}
    >
      <path d="M11.6 17v-6h2.2l.4-2.6h-2.6V6.8c0-.8.2-1.3 1.3-1.3h1.4V3.1C13.9 3 13.2 3 12.4 3c-2.1 0-3.5 1.3-3.5 3.6v1.8H6.6V11h2.3v6Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Signes de réassurance et pictogrammes de services                          */
/* -------------------------------------------------------------------------- */

const TRUST_PATHS = {
  hallmark: (
    <>
      <circle cx="10" cy="8" r="5" />
      <path d="M7 12.6 5.6 18l4.4-2.3L14.4 18 13 12.6" />
    </>
  ),
  certificate: (
    <>
      <path d="M10 2.2 16.4 4.6v5.2c0 3.6-2.6 6.6-6.4 8-3.8-1.4-6.4-4.4-6.4-8V4.6Z" />
      <path d="M7.4 9.9l1.9 1.9 3.4-3.7" />
    </>
  ),
  workshop: (
    <>
      <path d="M3 12.6 9.4 6.2M12.4 3.2l4.4 4.4-3 3-4.4-4.4Z" />
      <circle cx="5.4" cy="14.6" r="2.2" />
    </>
  ),
} as const;

export type TrustIconName = keyof typeof TRUST_PATHS;

export function TrustIcon({
  name,
  className,
  size = 17,
}: IconProps & { readonly name: TrustIconName }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
    >
      {TRUST_PATHS[name]}
    </svg>
  );
}

const SERVICE_PATHS: Record<ServiceIcon, React.ReactNode> = {
  repair: (
    <>
      <path d="M3 12.6 9.4 6.2M12.4 3.2l4.4 4.4-3 3-4.4-4.4Z" />
      <circle cx="5.4" cy="14.6" r="2.2" />
    </>
  ),
  polish: (
    <path d="M6.5 13.5 3 17M13.6 2.6a4 4 0 0 1 0 5.6l-5.4 5.4-5.6-5.6L8 2.6a4 4 0 0 1 5.6 0Z" />
  ),
  engrave: <path d="M4 16h12M5.6 12.8 13 5.4l1.8 1.8-7.4 7.4-2.4.6Z" />,
  bespoke: <path d="M10 2.4 13 7.6h-6ZM7 7.6h6l3.2 4.2L10 17.6 3.8 11.8Z" />,
  appraise: (
    <>
      <circle cx="9" cy="9" r="5.6" />
      <path d="M13.2 13.2 17.4 17.4" />
    </>
  ),
  buyback: <path d="M10 2.6v14.8M6 5.6h6.2a2.4 2.4 0 0 1 0 4.8H7.4a2.4 2.4 0 0 0 0 4.8H14" />,
  advice: (
    <path d="M17 9.6c0 3.5-3.1 6.4-7 6.4-1 0-1.96-.19-2.82-.54L3.6 16.6l.84-3.04A6.2 6.2 0 0 1 3 9.6C3 6.1 6.1 3.2 10 3.2s7 2.9 7 6.4Z" />
  ),
};

export function ServicePictogram({
  name,
  className,
  size = 21,
}: IconProps & { readonly name: ServiceIcon }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...strokeProps}
    >
      {SERVICE_PATHS[name]}
    </svg>
  );
}
