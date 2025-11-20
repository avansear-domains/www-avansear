import { Metadata } from 'next'
import { SongArchive } from '../components/song-archive'
import { AnimatedHeading } from '../components/animated-heading'
import { getArchivedSongs } from './archive'
import { getWeeklingEntries } from '../weeklings/utils'
import { InternalHoverButton } from '../components/hover-button'

export const metadata: Metadata = {
  title: 'song of the week',
  description: 'song of the week',
}

export default function MusixPage() {
  const archivedSongs = getArchivedSongs()
  const latestSong = archivedSongs.sort((a, b) => {
    const weekA = parseInt(a.week.replace(/\D/g, ''))
    const weekB = parseInt(b.week.replace(/\D/g, ''))
    return weekB - weekA
  })[0]

  // Get weekling entries for navigation
  const weeklingEntries = getWeeklingEntries().sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1
    }
    return 1
  })
  const currentIndex = weeklingEntries.findIndex((entry) => entry.url === '/musix')
  const prevEntry = currentIndex > 0 ? weeklingEntries[currentIndex - 1] : null
  const nextEntry = currentIndex < weeklingEntries.length - 1 ? weeklingEntries[currentIndex + 1] : null

  return (
    <section>
      <div className="flex items-start justify-between mb-8">
        <AnimatedHeading className="title font-semibold text-2xl tracking-tighter">
          song of the week
        </AnimatedHeading>
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
      
      <div className="w-full">
        <iframe 
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${latestSong.youtubeId}?&autoplay=1&controls=0&color=white&rel=0`}
          style={{ borderRadius: '12px', aspectRatio: '1/1' }}
        />
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold mb-6">weekly archive</h2>
        <SongArchive />
      </div>
    </section>
  )
} 