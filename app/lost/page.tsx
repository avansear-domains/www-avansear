'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { AnimatedHeading } from 'app/components/animated-heading'

export default function Page() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section>
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
      
      <p className="mb-4 sm:mb-8">
        {`if you're seeing this page because you tapped on an nfc sticker on a random device you found, you're in the right place!`}
      </p>
      <p className="mb-4 sm:mb-8">
        {`i put nfc stickers on all my devices in case they ever get lost. please use the below contact details to get in touch with me. thank you so much for your help!`}
      </p>
      <p className="mb-4 sm:mb-4">
        {`in case you choose not to return this, then boooo :(`}
      </p>
    </section>
  )
}

