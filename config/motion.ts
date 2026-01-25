export const motionVariants = {
  revealUp: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.5, // Ultra Slow Motion
        ease: [0.25, 0.46, 0.45, 0.94], // Cubic Bezier Suave
      },
    },
  },
  stagger: {
    visible: {
      transition: {
        staggerChildren: 0.2, // Cascata mais lenta
        delayChildren: 0.2,
      },
    },
  },
  hoverLift: {
    rest: { y: 0 },
    hover: {
      y: -6,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  },
}

export const parallaxConfig = {
  maxOffset: 32,
  smoothness: 0.1,
}
