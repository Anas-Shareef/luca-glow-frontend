import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-[#6B6B6B] font-medium block mb-1.5">
        {label}
        {required && <span className="text-[#C0392B] ml-0.5">*</span>}
      </span>
      {children}
      {error ? (
        <span className="text-[11px] text-[#C0392B] block mt-1">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-[#9E9E9E] block mt-1">{hint}</span>
      ) : null}
    </label>
  );
}

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full border border-[#E8E4DF] rounded-lg px-3 py-2.5 text-sm bg-white",
        "focus:outline-none focus:ring-2 focus:ring-[#1A2F23] focus:border-transparent",
        "min-h-[44px] disabled:opacity-60",
        props.className,
      )}
    />
  );
}

export function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full border border-[#E8E4DF] rounded-lg px-3 py-2.5 text-sm bg-white",
        "focus:outline-none focus:ring-2 focus:ring-[#1A2F23] focus:border-transparent",
        "min-h-[100px] disabled:opacity-60",
        props.className,
      )}
    />
  );
}

export function AdminSelect(props: InputHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props as any;
  return (
    <select
      {...rest}
      className={cn(
        "w-full border border-[#E8E4DF] rounded-lg px-3 py-2.5 text-sm bg-white",
        "focus:outline-none focus:ring-2 focus:ring-[#1A2F23] focus:border-transparent",
        "min-h-[44px] disabled:opacity-60",
        props.className,
      )}
    >
      {children}
    </select>
  );
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
