'use client'

import { HoverButton } from './hover-button'
import { useState } from 'react'

function ArrowIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)
  const email = 'me@avansear.com'

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <footer className="mb-16">
      <ul className="font-sm mt-8 flex flex-col space-x-0 space-y-2 text-[var(--color-light-80)] md:flex-row md:space-x-2 md:space-y-0 dark:text-[var(--color-light-80)]">
        <li>
          <HoverButton href="https://www.instagram.com/avansear/">
            <div className="flex items-center">
              <ArrowIcon />
              <p className="ml-2 h-7">instagram</p>
            </div>
          </HoverButton>
        </li>
        <li>
          <HoverButton href="https://unsplash.com/@avansear">
            <div className="flex items-center">
              <ArrowIcon />
              <p className="ml-2 h-7">unsplash</p>
            </div>
          </HoverButton>
        </li>
        <li>
          <HoverButton href="https://github.com/avansear/">
            <div className="flex items-center">
              <ArrowIcon />
              <p className="ml-2 h-7">github</p>
            </div>
          </HoverButton>
        </li>
        <li>
          <HoverButton href="https://linkedin.com/in/avansear">
            <div className="flex items-center">
              <ArrowIcon />
              <p className="ml-2 h-7">linkedin</p>
            </div>
          </HoverButton>
        </li>
        <li>
          <button
            onClick={handleEmailClick}
            className="inline-block px-2 rounded-full transition-all duration-300 ease-out hover:bg-[var(--color-light)] hover:text-[var(--color-dark)] hover:scale-105 active:scale-95"
          >
            <div className="flex items-center">
              <ArrowIcon />
              <p className="ml-2 h-7">{emailCopied ? 'email copied' : 'email'}</p>
            </div>
          </button>
        </li>
      </ul>
    </footer>
  )
}
