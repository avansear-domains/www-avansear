import { Metadata } from 'next'
import { SongArchive } from '../components/song-archive'
import { AnimatedHeading } from '../components/animated-heading'
import { FetchSongsTrigger } from '../components/fetch-songs-trigger'
import { getArchivedSongs } from './archive'

export const metadata: Metadata = {
  title: 'song of the week',
  description: 'song of the week',
}

export default function MusixPage() {
  const archivedSongs = getArchivedSongs()
  const latestSong = archivedSongs.length > 0
    ? archivedSongs.sort((a, b) => {
        const weekA = parseInt(a.week.replace(/\D/g, ''))
        const weekB = parseInt(b.week.replace(/\D/g, ''))
        return weekB - weekA
      })[0]
    : null

  return (
    <section>
      <FetchSongsTrigger />
      <div className="mb-8">
        <AnimatedHeading className="title font-semibold text-2xl tracking-tighter">
          song of the week
        </AnimatedHeading>
      </div>
      
      {latestSong ? (
        <div className="w-full">
          <iframe 
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${latestSong.youtubeId}?&autoplay=1&controls=0&color=white&rel=0`}
            style={{ borderRadius: '12px', aspectRatio: '1/1' }}
          />
        </div>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center border border-gray-300 rounded-xl">
          <p className="text-gray-500">No songs yet. Fetching from playlist...</p>
        </div>
      )}

      <div className="mt-16">
        <h2 className="text-xl font-semibold mb-6">weekly archive</h2>
        <SongArchive />
      </div>
    </section>
  )
} 