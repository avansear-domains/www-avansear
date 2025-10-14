import Link from 'next/link'
import { AnimatedHeading } from '../components/animated-heading'
import { getAllWeeklingPosts, formatDate } from './utils'

export default function WeeklingsPage() {
  const posts = getAllWeeklingPosts()

  return (
    <section>
      <AnimatedHeading className="font-semibold text-2xl tracking-tighter mb-8">
        weeklings
      </AnimatedHeading>

      <div>
        {posts.map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/weeklings/${post.slug}`}
          >
            <div className="w-full flex flex-row space-x-2">
              <p className="text-[var(--color-light-80)] w-fit tracking-tighter whitespace-nowrap flex-shrink-0">
                {formatDate(post.publishedAt, false)}
              </p>
              <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tighter truncate">
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
