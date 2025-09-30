import { Metadata } from 'next'
import { SongArchive } from '../components/song-archive'
import { AnimatedHeading } from '../components/animated-heading'
import { getArchivedSongs } from './archive'

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

  return (
    <section>
      <AnimatedHeading className="title font-semibold text-2xl tracking-tighter mb-8">
        song of the week
      </AnimatedHeading>
      
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