'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { AnimatedHeading } from 'app/components/animated-heading'
import { SimpleWhiteboard } from 'app/components/simple-whiteboard'

export default function Page() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section>
      <div className="p-4 -m-4">
        <AnimatedHeading 
          className="sm:mb-8 text-2xl font-semibold tracking-tighter"
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
      
      {/* Simple Whiteboard */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Draw something</h2>
        <div className="w-80 h-80 mx-auto">
          <SimpleWhiteboard size={320} />
        </div>
      </div>
    </section>
  )
}