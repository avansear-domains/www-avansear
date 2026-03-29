'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import Link from 'next/link'
import { Music, Star } from 'lucide-react'
import { AnimatedHeading } from 'app/components/animated-heading'
import { BackgroundAudio } from 'app/components/background-audio'
import { SpinningDisc } from 'app/components/spinning-disc'

const homePillClassName =
  'inline-flex items-center gap-2 rounded-full border border-[var(--color-dark)]/15 bg-[var(--color-light)]/85 px-3 py-1.5 text-xs shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-light)]/95 dark:border-[var(--color-light)]/15 dark:bg-[var(--color-dark)]/85 dark:hover:bg-[var(--color-dark)]/95 text-[var(--color-dark)] dark:text-[var(--color-light)]'

export default function Page() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section>
      <BackgroundAudio />
      <div className="p-4 -m-4 mb-4 sm:-mb-4">
        <AnimatedHeading 
          className="text-2xl font-semibold tracking-tighter"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span>i'm avan</span>
          <motion.span
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            sear (vishruth)
          </motion.span>
        </AnimatedHeading>
        <p className="sm:mb-4">
          {`high functioning insomniac. 20 y/o weirdo who does things based on instincts and intuition.`}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-start gap-2 sm:mt-4">
          <Link href="/travelogue" className={homePillClassName}>
            <Star className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span>my map hehe</span>
          </Link>
          <Link href="/musix" className={homePillClassName}>
            <Music className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span>my music yayay</span>
          </Link>
        </div>
      </div>

      <SpinningDisc />
    </section>
  )
}