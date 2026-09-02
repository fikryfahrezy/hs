import {
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import "./styles.css";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export function FormField({ error, id, label, ...input }: FormFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        id={id}
        {...input}
      />
      {error ? (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  label: string;
};

export function SelectField({
  children,
  error,
  id,
  label,
  ...select
}: SelectFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <select
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        id={id}
        {...select}
      >
        {children}
      </select>
      {error ? (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label: string;
};

export function TextareaField({
  error,
  id,
  label,
  ...textarea
}: TextareaFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <textarea
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        id={id}
        {...textarea}
      />
      {error ? (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
