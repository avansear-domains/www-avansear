import { Metadata } from 'next'
import { AnimatedHeading } from '../components/animated-heading'
import { FontPosts } from '../components/font-posts'
import { getWeeklingEntries } from '../weeklings/utils'
import { InternalHoverButton } from '../components/hover-button'

export const metadata: Metadata = {
  title: 'mi favorita fonts',
  description: 'my favorite fonts',
}

export default function MiFavoritaFontsPage() {
  // Get weekling entries for navigation
  const weeklingEntries = getWeeklingEntries().sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1
    }
    return 1
  })
  const currentIndex = weeklingEntries.findIndex((entry) => entry.url === '/mifavoritafonts')
  const prevEntry = currentIndex > 0 ? weeklingEntries[currentIndex - 1] : null
  const nextEntry = currentIndex < weeklingEntries.length - 1 ? weeklingEntries[currentIndex + 1] : null

  return (
    <section>
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
              mi favorita fonts
            </AnimatedHeading>
            <p className="text-[var(--color-dark)] dark:text-[var(--color-light)]">click on any to download!</p>
          </div>
          <div className="flex space-x-2">
            {prevEntry && (
              <InternalHoverButton href={prevEntry.url} aria-label="Previous weekling">
                &lt;
              </InternalHoverButton>
            )}
            {nextEntry && (
              <InternalHoverButton href={nextEntry.url} aria-label="Next weekling">
                &gt;
              </InternalHoverButton>
            )}
          </div>
        </div>
      </div>

      <FontPosts />
    </section>
  )
}

