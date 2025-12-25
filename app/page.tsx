'use client'

import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { AnimatedHeading } from 'app/components/animated-heading'
import { BackgroundAudio } from 'app/components/background-audio'
import { SpinningDisc } from 'app/components/spinning-disc'

export default function Page() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section>
      <BackgroundAudio />
      <div className="p-4 -m-4">
        <AnimatedHeading 
          className="mb-4 sm:mb-8 text-2xl font-semibold tracking-tighter"
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
            sear (vishruth siddi)
          </motion.span>
        </AnimatedHeading>
      </div>
      
      <p className="sm:mb-4">
        {`high functioning insomniac. 20 y/o weirdo who does things based on instincts and intuition.`}
      </p>
      
      <SpinningDisc />
    </section>
  )
}