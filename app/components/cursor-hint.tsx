'use client'

import { useCursor } from './cursor-context'

export function CursorHint() {
  const { isCursorEnabled } = useCursor()

  return (
    <div className="hidden md:block fixed bottom-4 right-4 z-40 font-mono text-xs text-[var(--color-dark)]">
      <div className="bg-[var(--color-light-80)] px-2 py-1 rounded-lg">
        <kbd>ctrl + shift + space</kbd>
        <span className="ml-1.5">
          to {isCursorEnabled ? 'disable' : 'enable'} custom cursor :&gt;
        </span>
      </div>
    </div>
  )
}