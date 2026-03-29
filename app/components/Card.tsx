import Link from 'next/link'

interface CardProps {
  title: React.ReactNode
  href: string
  description?: React.ReactNode
  className?: string
  variant?: 'arrow-left' | 'arrow-right'
}

function ArrowIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Card({
  title,
  href,
  description,
  className = '',
  variant = 'arrow-left',
}: CardProps) {
  const isArrowRight = variant === 'arrow-right'
  const hasDescription = Boolean(description)
  const overlayLabel = typeof title === 'string' ? title : 'Open'

  return (
    <div
      className={`group relative block w-full rounded-xl border border-[var(--color-light)]/80 bg-[var(--color-light)]/5 p-4 transition-colors duration-300 ease-out hover:bg-[var(--color-light)]/20 ${className}`}
    >
      <Link
        href={href}
        className="absolute inset-0 z-0 rounded-xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--color-dark)] dark:focus-visible:outline-[var(--color-light)]"
        aria-label={overlayLabel}
      />
      <div
        className={`pointer-events-none relative z-[1] flex justify-between gap-4 ${hasDescription ? 'items-start' : 'items-center'}`}
      >
        {!isArrowRight && (
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <ArrowIcon />
          </span>
        )}

        <div className={`${isArrowRight ? 'text-left' : 'text-right'} px-1`}>
          <h3 className="font-semibold text-2xl [letter-spacing:-0.08em]">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-[var(--color-dark)] dark:text-[var(--color-light)] [&_a]:pointer-events-auto [&_a]:relative [&_a]:z-[2]">
              {description}
            </p>
          )}
        </div>

        {isArrowRight && (
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <ArrowIcon />
          </span>
        )}
      </div>
    </div>
  )
}
