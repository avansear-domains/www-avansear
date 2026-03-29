type TravelogueLegendProps = {
  visitedCount?: number
  wishesCount?: number
}

/**
 * Map marker legend — matches floating navbar pill styling (blur, border, rounded-full).
 */
export function TravelogueLegend({ visitedCount = 0, wishesCount = 0 }: TravelogueLegendProps) {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-[4.5rem] z-[59] flex justify-center px-3 sm:top-[4.75rem] sm:px-4"
      role="region"
      aria-label="map legend"
    >
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 lowercase">
        <div className="flex items-center gap-2 rounded-full border border-[var(--color-dark)]/15 bg-[var(--color-light)]/85 px-3 py-1.5 text-xs shadow-sm backdrop-blur-md dark:border-[var(--color-light)]/15 dark:bg-[var(--color-dark)]/85">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[var(--color-light)] bg-[var(--color-dark)] shadow-sm dark:border-[var(--color-dark)] dark:bg-[var(--color-light)]"
            aria-hidden
          />
          <span className="text-[var(--color-dark)] dark:text-[var(--color-light)]">visited</span>
          <span className="tabular-nums text-[var(--color-dark)] dark:text-[var(--color-light)]">
            {visitedCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-dark)]/15 bg-[var(--color-light)]/85 px-3 py-1.5 text-xs shadow-sm backdrop-blur-md dark:border-[var(--color-light)]/15 dark:bg-[var(--color-dark)]/85">
          <span
            className="select-none text-[15px] leading-none text-[var(--color-dark)] drop-shadow-sm dark:text-[var(--color-light)]"
            aria-hidden
          >
            ★
          </span>
          <span className="text-[var(--color-dark)] dark:text-[var(--color-light)]">wishes</span>
          <span className="tabular-nums text-[var(--color-dark)] dark:text-[var(--color-light)]">
            {wishesCount}
          </span>
        </div>
      </div>
    </div>
  )
}
