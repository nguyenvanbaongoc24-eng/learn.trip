"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { sounds } from "@/utils/soundEffects";
import { springs } from "@/lib/design/tokens";

export type SquishButtonVariant =
  | "primary" // emerald
  | "amber" // gold/yellow
  | "rose" // red/pink
  | "violet" // purple
  | "sky" // blue
  | "slate" // neutral secondary
  | "outline"
  | "ghost";

export type SquishButtonSize = "sm" | "md" | "lg" | "xl";

export interface SquishButtonProps
  extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: SquishButtonVariant;
  size?: SquishButtonSize;
  playSound?: boolean;
  haptic?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<SquishButtonVariant, string> = {
  primary:
    "bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 shadow-md shadow-emerald-500/25",
  amber:
    "bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 shadow-md shadow-amber-500/25",
  rose:
    "bg-rose-500 hover:bg-rose-600 text-white border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 shadow-md shadow-rose-500/25",
  violet:
    "bg-violet-500 hover:bg-violet-600 text-white border-b-4 border-violet-700 active:border-b-0 active:translate-y-1 shadow-md shadow-violet-500/25",
  sky:
    "bg-sky-500 hover:bg-sky-600 text-white border-b-4 border-sky-700 active:border-b-0 active:translate-y-1 shadow-md shadow-sky-500/25",
  slate:
    "bg-slate-100 hover:bg-slate-200 text-slate-700 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1",
  outline:
    "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 border-b-4 border-b-slate-400 active:border-b-2 active:translate-y-0.5",
  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-700 border-b-0 active:scale-95",
};

const sizeStyles: Record<SquishButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-bold rounded-xl gap-1.5 min-h-[36px]",
  md: "px-4 py-2.5 text-sm font-extrabold rounded-2xl gap-2 min-h-[44px]",
  lg: "px-6 py-3.5 text-base font-black rounded-2xl gap-2.5 min-h-[52px]",
  xl: "px-8 py-4.5 text-lg font-black rounded-3xl gap-3 min-h-[60px]",
};

export const SquishButton = React.forwardRef<HTMLButtonElement, SquishButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      playSound = true,
      haptic = true,
      children,
      icon,
      iconRight,
      fullWidth = false,
      className = "",
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (playSound) {
        sounds.playClick();
      }

      if (haptic && typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(10);
        } catch {
          // Ignore haptic failures
        }
      }

      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={handleClick}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={springs.squish}
        className={`inline-flex items-center justify-center font-sans tracking-wide cursor-pointer transition-colors select-none ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${
          fullWidth ? "w-full" : ""
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed border-b-2 border-slate-300 shadow-none pointer-events-none"
            : ""
        } ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </motion.button>
    );
  }
);

SquishButton.displayName = "SquishButton";
