// Design Tokens for Learn.Trip — Kid-friendly, Duolingo-inspired
// Vibrant colors, large touch targets, playful typography

// ─── Tab Color Identity ─────────────────────────────────────
export const tabColors = {
  explore: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    bgMuted: "bg-emerald-500/10",
    text: "text-emerald-600",
    textActive: "text-emerald-500",
    border: "border-emerald-500",
    borderLight: "border-emerald-200",
    gradient: "from-emerald-500 to-teal-500",
    hex: "#10b981",
  },
  passport: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    bgMuted: "bg-amber-500/10",
    text: "text-amber-600",
    textActive: "text-amber-500",
    border: "border-amber-500",
    borderLight: "border-amber-200",
    gradient: "from-amber-400 to-yellow-500",
    hex: "#f59e0b",
  },
  challenges: {
    bg: "bg-rose-500",
    bgLight: "bg-rose-50",
    bgMuted: "bg-rose-500/10",
    text: "text-rose-600",
    textActive: "text-rose-500",
    border: "border-rose-500",
    borderLight: "border-rose-200",
    gradient: "from-rose-500 to-orange-500",
    hex: "#f43f5e",
  },
  profile: {
    bg: "bg-violet-500",
    bgLight: "bg-violet-50",
    bgMuted: "bg-violet-500/10",
    text: "text-violet-600",
    textActive: "text-violet-500",
    border: "border-violet-500",
    borderLight: "border-violet-200",
    gradient: "from-violet-500 to-purple-500",
    hex: "#8b5cf6",
  },
} as const;

// ─── Framer Motion Spring Presets ───────────────────────────
export const springs = {
  /** Snappy button press feedback */
  squish: { type: "spring" as const, stiffness: 500, damping: 15 },
  /** Gentle page/content transitions */
  gentle: { type: "spring" as const, stiffness: 200, damping: 20 },
  /** Bouncy celebration / reward animations */
  bouncy: { type: "spring" as const, stiffness: 300, damping: 10 },
  /** Smooth sidebar / panel transitions */
  smooth: { type: "spring" as const, stiffness: 250, damping: 25 },
} as const;

// ─── Framer Motion Variants ─────────────────────────────────
export const motionVariants = {
  /** Button squish: scale down on tap, bounce back */
  squishButton: {
    rest: { scale: 1 },
    tap: { scale: 0.92, transition: springs.squish },
    hover: { scale: 1.03, transition: springs.squish },
  },

  /** Fade + slide up entrance */
  slideUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: springs.gentle },
    exit: { opacity: 0, y: 12 },
  },

  /** Scale + fade entrance */
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: springs.gentle },
    exit: { opacity: 0, scale: 0.95 },
  },

  /** Tab content transition */
  tabContent: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: springs.smooth },
    exit: { opacity: 0, x: -20 },
  },

  /** Active tab indicator dot bounce */
  tabDot: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: springs.bouncy },
    exit: { scale: 0, opacity: 0 },
  },

  /** Stagger children container */
  staggerParent: {
    animate: { transition: { staggerChildren: 0.06 } },
  },

  /** Individual stagger child */
  staggerChild: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

// ─── Size Constants ─────────────────────────────────────────
export const sizes = {
  /** Minimum touch target for children (48px) */
  touchTarget: 48,
  /** Sidebar width on desktop */
  sidebarWidth: 220,
  /** Sidebar collapsed width */
  sidebarCollapsed: 72,
  /** Top bar height */
  topBarHeight: 56,
  /** Bottom tab bar height */
  bottomTabHeight: 64,
  /** Border radius for cards */
  cardRadius: 20,
  /** Border radius for buttons */
  buttonRadius: 16,
} as const;
