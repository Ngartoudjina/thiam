'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const CONTROL_CLASSES = [
  'w-full border-0 border-b bg-transparent pt-2.5 pb-2.5 font-sans text-input font-light text-ink',
  'placeholder:text-[rgb(22_18_15/0.32)] focus:outline-none focus-visible:outline-none',
  'transition-colors duration-(--duration-state) ease-out',
].join(' ');

interface FieldShellProps {
  readonly id: string;
  readonly label: string;
  readonly error?: string | undefined;
  readonly className?: string;
  readonly children: React.ReactNode;
}

/**
 * Enveloppe d'un champ : libellé en capitales espacées, filet inférieur,
 * message d'erreur relié par `aria-describedby`.
 * « Focus : le filet du champ passe à l'or et son libellé remonte. »
 */
function FieldShell({ id, label, error, className, children }: FieldShellProps) {
  return (
    <div className={cn('group flex flex-col gap-3', className)}>
      <label
        htmlFor={id}
        className={cn(
          'text-micro tracking-[0.24em] uppercase transition-colors duration-(--duration-state) ease-out',
          error ? 'text-gold-light' : 'text-[rgb(22_18_15/0.55)] group-focus-within:text-gold',
        )}
      >
        {label}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption font-normal text-gold-light">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly id: string;
  readonly label: string;
  readonly error?: string | undefined;
  readonly wrapperClassName?: string;
}

export function TextField({
  id,
  label,
  error,
  wrapperClassName,
  className,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} className={wrapperClassName}>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          CONTROL_CLASSES,
          'focus:border-b-gold',
          error ? 'border-b-gold-light' : 'border-b-[rgb(22_18_15/0.2)]',
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly id: string;
  readonly label: string;
  readonly error?: string | undefined;
  readonly wrapperClassName?: string;
}

export function TextAreaField({
  id,
  label,
  error,
  wrapperClassName,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} className={wrapperClassName}>
      <textarea
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          CONTROL_CLASSES,
          'resize-none focus:border-b-gold',
          error ? 'border-b-gold-light' : 'border-b-[rgb(22_18_15/0.2)]',
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

interface TopicChoiceProps {
  readonly name: string;
  readonly legend: string;
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string | undefined;
  readonly className?: string;
}

/**
 * Sélecteur de sujet.
 * Rendu visuel de pastilles, sémantique de boutons radio : navigable aux
 * flèches et annoncé comme un groupe unique par les lecteurs d'écran.
 */
export function TopicChoice({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  className,
}: TopicChoiceProps) {
  return (
    <fieldset className={cn('flex flex-col gap-3', className)}>
      <legend className="mb-3 text-micro tracking-[0.24em] text-[rgb(22_18_15/0.55)] uppercase">
        {legend}
      </legend>

      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const isSelected = value === option.value;

          return (
            <span key={option.value} className="relative">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="peer absolute inset-0 size-full cursor-pointer opacity-0"
              />
              <label
                htmlFor={id}
                className={cn(
                  'block cursor-pointer px-4.5 py-3 text-caption tracking-[0.1em] transition-colors duration-(--duration-state) ease-out',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-gold',
                  isSelected
                    ? 'bg-gold-light text-cacao'
                    : 'border border-[rgb(22_18_15/0.2)] text-on-dark-muted hover:border-gold-dim hover:text-gold-light',
                )}
              >
                {option.label}
              </label>
            </span>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-caption font-normal text-gold-light">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
