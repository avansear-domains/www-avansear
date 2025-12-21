import { Metadata } from 'next'
import { AnimatedHeading } from '../components/animated-heading'
import { FetchSongsTrigger } from '../components/fetch-songs-trigger'
import { getArchivedSongs } from './db'

export const metadata: Metadata = {
  title: 'song of the week',
  description: 'song of the week',
}

export default async function MusixPage() {
  const archivedSongs = await getArchivedSongs()
  const latestSong = archivedSongs.length > 0 ? archivedSongs[0] : null

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
        <div>
          {archivedSongs.map((song) => (
            <a
              key={song.youtubeId}
              className="flex flex-col space-y-1 mb-4"
              href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-full flex flex-row space-x-2">
                <p className="text-[var(--color-light-80)] w-fit tabular-nums flex-shrink-0">
                  {song.week.toLowerCase()}
                </p>
                <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tight">
                  {song.songName.toLowerCase()} - {song.artist.toLowerCase()}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
} 