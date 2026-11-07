import { DEVELOPER } from '@/constants/site';
import { cn } from '@/lib/utils';

/** Signature du développeur, discrète, en pied de page. */
export function DeveloperCredit({ className }: { readonly className?: string }) {
  return (
    <p className={cn('text-caption-lg font-normal text-on-dark-faint', className)}>
      Site conçu et développé par{' '}
      <a
        href={DEVELOPER.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-on-dark-soft underline-offset-4 transition-colors duration-(--duration-state) ease-out hover:text-gold-light hover:underline"
      >
        {DEVELOPER.name}
      </a>
    </p>
  );
}
