import { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const hoverLift: Variants = {
  hover: { y: -6, scale: 1.01, transition: { duration: 0.25, ease: 'easeOut' } },
}
