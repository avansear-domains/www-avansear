import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/writings/utils'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/writings/${post.slug}`}
          >
            <div className="w-full flex flex-row space-x-2">
              <p className="text-[var(--color-light-80)] w-fit tracking-tighter whitespace-nowrap flex-shrink-0">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tighter truncate">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}
