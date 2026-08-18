import { Eye, EyeOff, Info } from "lucide-react";
import React, { useState, InputHTMLAttributes } from "react";

type InputProps = any;

export function Input({
  label,
  hint,
  error,
  type = "text",
  id,
  ...props
}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <label
          className="block text-xs font-semibold text-slate-400 uppercase tracking-wider"
          htmlFor={id}
          id={id ? `${id}-label` : undefined}
        >
          {label}
        </label>
      </div>

      <div className="relative">
        <input
          {...props}
          id={id}
          type={inputType}
          title={props.title ?? label ?? props.placeholder}
          aria-labelledby={id ? `${id}-label` : undefined}
          className={`
            w-full px-4 py-3 bg-slate-50 border rounded-lg outline-none transition-all
            ${error ? "border-red-500 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-tax-orange focus:ring-2 focus:ring-orange-50"}
            text-slate-700 placeholder:text-slate-300 text-sm
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : null}
    </div>
  );
}
