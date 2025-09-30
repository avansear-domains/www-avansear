'use client'

import { motion } from 'motion/react'

interface AnimatedHeadingProps {
  children: React.ReactNode
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function AnimatedHeading({ children, className, onMouseEnter, onMouseLeave }: AnimatedHeadingProps) {
  return (
    <motion.h1 
      className={className}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.h1>
  )
}
