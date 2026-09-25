import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

function FieldWrapper({ label, hint, required, children, className = '', htmlFor }: FieldWrapperProps & { htmlFor?: string }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-on-surface mb-1.5">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-secondary mt-1.5">{hint}</p>}
    </div>
  );
}

const inputBase =
  'w-full rounded-xl border border-outline-variant/40 bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-secondary/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>, Omit<FieldWrapperProps, 'children' | 'className'> {
  icon?: LucideIcon;
  wrapperClassName?: string;
}

export function TextField({ label, hint, required, icon: Icon, wrapperClassName, className = '', ...rest }: TextFieldProps) {
  const autoId = useId();
  const id = rest.id ?? autoId;
  return (
    <FieldWrapper label={label} hint={hint} required={required} className={wrapperClassName} htmlFor={id}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />}
        <input className={`${inputBase} ${Icon ? 'pl-9' : ''} ${className}`} {...rest} id={id} />
      </div>
    </FieldWrapper>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<FieldWrapperProps, 'children' | 'className'> {
  wrapperClassName?: string;
}

export function TextareaField({ label, hint, required, wrapperClassName, className = '', ...rest }: TextareaFieldProps) {
  const autoId = useId();
  const id = rest.id ?? autoId;
  return (
    <FieldWrapper label={label} hint={hint} required={required} className={wrapperClassName} htmlFor={id}>
      <textarea className={`${inputBase} resize-none ${className}`} {...rest} id={id} />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, Omit<FieldWrapperProps, 'children' | 'className'> {
  wrapperClassName?: string;
}

export function SelectField({ label, hint, required, wrapperClassName, className = '', children, ...rest }: SelectFieldProps) {
  const autoId = useId();
  const id = rest.id ?? autoId;
  return (
    <FieldWrapper label={label} hint={hint} required={required} className={wrapperClassName} htmlFor={id}>
      <select className={`${inputBase} ${className}`} {...rest} id={id}>
        {children}
      </select>
    </FieldWrapper>
  );
}
