'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const CONTROL = [
  'w-full rounded-lg border bg-panel px-3 py-2 font-sans text-sm text-panel-ink',
  'placeholder:text-panel-faint',
  'transition-[border-color,box-shadow] duration-150 ease-out',
  'focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20',
  'dark:bg-panel-dark-sunken dark:text-panel-dark-ink dark:placeholder:text-panel-dark-faint',
].join(' ');

const BORDER_OK = 'border-panel-border dark:border-panel-dark-border';
const BORDER_ERROR = 'border-danger dark:border-danger';

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly error?: string | undefined;
  readonly required?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="font-sans text-[0.8125rem] font-medium text-panel-ink dark:text-panel-dark-ink"
      >
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-panel-soft dark:text-panel-dark-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface BaseFieldProps {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly error?: string | undefined;
  readonly wrapperClassName?: string;
}

export function TextInput({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className,
  required,
  ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, error ? BORDER_ERROR : BORDER_OK, className)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextArea({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className,
  required,
  ...props
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <textarea
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, 'min-h-24 resize-y', error ? BORDER_ERROR : BORDER_OK, className)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectInput({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className,
  required,
  options,
  ...props
}: BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  }) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(CONTROL, 'cursor-pointer', error ? BORDER_ERROR : BORDER_OK, className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function SwitchField({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-panel-border px-3.5 py-3 dark:border-panel-dark-border">
      <div>
        <label
          htmlFor={id}
          className="font-sans text-[0.8125rem] font-medium text-panel-ink dark:text-panel-dark-ink"
        >
          {label}
        </label>
        {hint ? (
          <p className="mt-0.5 text-xs text-panel-soft dark:text-panel-dark-soft">{hint}</p>
        ) : null}
      </div>

      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-out',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          'data-[state=checked]:bg-accent data-[state=unchecked]:bg-panel-sunken',
          'dark:data-[state=unchecked]:bg-panel-dark-border',
        )}
      >
        <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-150 ease-out data-[state=checked]:translate-x-[1.375rem]" />
      </SwitchPrimitive.Root>
    </div>
  );
}
