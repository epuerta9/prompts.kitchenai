import React from 'react';
import { useFormContext, Controller, FieldValues, Path } from 'react-hook-form';

interface FormProps<T extends FieldValues> extends React.FormHTMLAttributes<HTMLFormElement> {
  form: ReturnType<typeof useFormContext>;
}

export function Form<T extends FieldValues>({ form, ...props }: FormProps<T>) {
  return <form {...props} />;
}

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: any;
  render: (props: { field: any }) => React.ReactNode;
}

export function FormField<T extends FieldValues>({ name, control, render }: FormFieldProps<T>) {
  return <Controller name={name} control={control} render={({ field }) => render({ field })} />;
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormItem({ children, className = '', ...props }: FormItemProps) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function FormLabel({ children, className = '', ...props }: FormLabelProps) {
  return (
    <label className={`text-sm font-medium leading-none ${className}`} {...props}>
      {children}
    </label>
  );
}

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormControl({ children, className = '', ...props }: FormControlProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

export function FormMessage({ children, className = '', ...props }: FormMessageProps) {
  if (!children) return null;
  
  return (
    <p className={`text-sm font-medium text-red-500 ${className}`} {...props}>
      {children}
    </p>
  );
} 