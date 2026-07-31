import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-panel-border bg-panel shadow-(--shadow-panel)',
        'dark:border-panel-dark-border dark:bg-panel-dark-muted dark:shadow-none',
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-panel-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        'dark:border-panel-dark-border',
        className,
      )}
    >
      <div>
        <h2 className="font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  En-tête de page                                                            */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-sans text-[1.375rem] font-semibold tracking-[-0.01em] text-panel-ink dark:text-panel-dark-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-panel-soft dark:text-panel-dark-soft">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Boutons                                                                    */
/* -------------------------------------------------------------------------- */

const adminButton = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-lg font-sans font-medium',
    'transition-[background,border-color,color,box-shadow] duration-150 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-white hover:bg-accent-strong dark:bg-accent dark:hover:bg-accent-strong',
        secondary: [
          'border border-panel-border bg-panel text-panel-ink hover:bg-panel-muted',
          'dark:border-panel-dark-border dark:bg-panel-dark-sunken dark:text-panel-dark-ink dark:hover:bg-panel-dark-border',
        ],
        ghost: [
          'text-panel-soft hover:bg-panel-muted hover:text-panel-ink',
          'dark:text-panel-dark-soft dark:hover:bg-panel-dark-sunken dark:hover:text-panel-dark-ink',
        ],
        danger: 'bg-danger text-white hover:brightness-110',
      },
      size: {
        sm: 'h-8 px-3 text-[0.8125rem]',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-10 px-4 text-sm',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export interface AdminButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof adminButton> {
  readonly asChild?: boolean;
}

export function AdminButton({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: AdminButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(adminButton({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Pastille de statut                                                         */
/* -------------------------------------------------------------------------- */

export function StatusPill({ status }: { readonly status: 'visible' | 'hidden' }) {
  const isVisible = status === 'visible';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium',
        isVisible
          ? 'bg-success-soft text-success dark:bg-success/15 dark:text-success-soft'
          : 'bg-panel-sunken text-panel-soft dark:bg-panel-dark-sunken dark:text-panel-dark-soft',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', isVisible ? 'bg-success' : 'bg-panel-faint')}
      />
      {isVisible ? 'Visible' : 'Masquée'}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  États                                                                      */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className }: { readonly className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-panel-sunken dark:bg-panel-dark-sunken',
        className,
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-panel-border px-6 py-16 text-center dark:border-panel-dark-border">
      <span aria-hidden="true" className="size-8 rotate-45 rounded-[3px] border border-accent/40" />
      <p className="font-sans text-sm font-medium text-panel-ink dark:text-panel-dark-ink">
        {title}
      </p>
      <p className="max-w-sm text-[0.8125rem] text-panel-soft dark:text-panel-dark-soft">
        {description}
      </p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
