import { BlogPosts } from 'app/components/posts'
import { AnimatedHeading } from 'app/components/animated-heading'
import Link from 'next/link'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

function RSSIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-[var(--color-light-80)]"
    >
      <circle cx="3.429" cy="20.571" r="1.429" fill="currentColor"/>
      <path d="M11.429 20.571H8.857C8.857 16.046 5.239 12.428 0.714 12.428V9.857C6.665 9.857 11.429 14.621 11.429 20.571Z" fill="currentColor"/>
      <path d="M20.571 20.571H18C18 13.174 11.826 7 4.429 7V4.429C13.245 4.429 20.571 11.755 20.571 20.571Z" fill="currentColor"/>
    </svg>
  )
}

export default function Page() {
  return (
    <section>
      <AnimatedHeading className="font-semibold text-2xl tracking-tighter mb-8">
        writings
      </AnimatedHeading>

      <div>
        {/* RSS Feed as pinned post */}
        <Link
          className="flex flex-col space-y-1 mb-4 border-[var(--color-light-80)]"
          href="/rss"
        >
          <div className="w-full flex flex-row space-x-2 items-center">
            <p className="text-[var(--color-light-80)] w-fit tracking-tighter whitespace-nowrap flex-shrink-0">
              rss feed
            </p>
            <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tighter truncate">
              here's the rss if you wanna do stuff w it :D
            </p>
          </div>
        </Link>
        
        {/* Regular blog posts */}
        <BlogPosts />
      </div>
    </section>
  )
}
