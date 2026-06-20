export const motionTiming = {
  spring: { type: 'spring' as const, stiffness: 200, damping: 26, mass: 0.9 },
  soft: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as any },
  quick: { duration: 0.18, ease: [0.35, 0.7, 0.3, 1] as any },
  page: { type: 'spring' as const, stiffness: 190, damping: 24, mass: 0.88 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 18 },
};

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const hoverGrow = {
  whileHover: { y: -3, scale: 1.01 },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
};

export const hoverLift = {
  whileHover: { y: -2, scale: 1.006 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

export const panelFade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
};
