import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-semibold text-2xl tracking-tighter">blogs</h1>
        <a
          href="/rss"
          className="text-sm text-[var(--color-light-80)] hover:text-[var(--color-dark)] dark:hover:text-[var(--color-light)] transition-colors duration-200"
          title="Subscribe to RSS feed"
        >
          rss
        </a>
      </div>
      <BlogPosts />
    </section>
  )
}
