import { Metadata } from 'next'
import { AnimatedHeading } from '../components/animated-heading'
import { SpinningDisc } from '../components/spinning-disc'
import { BackgroundAudio } from '../components/background-audio'
import { FetchSongsTrigger } from '../components/fetch-songs-trigger'
import { getArchivedSongs } from './db'

export const metadata: Metadata = {
  title: 'song of the week',
  description: 'song of the week',
}

// Force dynamic rendering to ensure archive updates with latest songs from Supabase
export const dynamic = 'force-dynamic'

export default async function MusixPage() {
  const archivedSongs = await getArchivedSongs()
  const latestSong = archivedSongs.length > 0 ? archivedSongs[0] : null

  return (
    <section>
      <div className="mb-8">
        <AnimatedHeading className="title font-semibold text-2xl tracking-tighter">
          song of the week
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] dark:text-[var(--color-light)]">
          you have to interact for the audio to play coz of browser conventions u_u
        </p>
      </div>
      
      <FetchSongsTrigger />
      <BackgroundAudio />
      <SpinningDisc />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">weekly archive</h2>
        <div>
          {archivedSongs.map((song) => (
            <a
              key={song.spotifyTrackId || song.youtubeId}
              className="flex flex-col space-y-1 mb-4"
              href={song.spotifyTrackId 
                ? `https://open.spotify.com/track/${song.spotifyTrackId}`
                : song.youtubeId 
                ? `https://open.spotify.com/search/${encodeURIComponent(song.songName + ' ' + song.artist)}`
                : '#'}
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
