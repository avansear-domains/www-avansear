import { notFound } from 'next/navigation'
import { formatDate, getBlogPosts } from 'app/writings/utils'
import { baseUrl } from 'app/sitemap'
import { ClientContent } from 'app/components/client-content'
import { InternalHoverButton } from 'app/components/hover-button'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  let post = getBlogPosts().find((post) => post.slug === resolvedParams.slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/writings/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog({ params }) {
  const resolvedParams = await params
  let allPosts = getBlogPosts()
  let post = allPosts.find((post) => post.slug === resolvedParams.slug)

  if (!post) {
    notFound()
  }

  let ordered = [...allPosts].sort((a, b) =>
    new Date(a.metadata.publishedAt) < new Date(b.metadata.publishedAt) ? -1 : 1
  )
  let index = ordered.findIndex((p) => p.slug === post!.slug)
  let prevSlug = index > 0 ? ordered[index - 1].slug : null
  let nextSlug = index < ordered.length - 1 ? ordered[index + 1].slug : null

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post!.metadata.title,
            datePublished: post!.metadata.publishedAt,
            dateModified: post!.metadata.publishedAt,
            description: post!.metadata.summary,
            image: post!.metadata.image
              ? `${baseUrl}${post!.metadata.image}`
              : `/og?title=${encodeURIComponent(post!.metadata.title)}`,
            url: `${baseUrl}/writings/${post!.slug}`,
            author: {
              '@type': 'Person',
              name: 'My Portfolio',
            },
          }),
        }}
      />

      <div className="flex items-center justify-between">
        <h1 className="title font-semibold text-2xl tracking-tighter">
          {post!.metadata.title}
        </h1>
        <div className="flex space-x-2">
          {prevSlug && (
            <InternalHoverButton href={`/writings/${prevSlug}`} aria-label="Previous post">
              &lt;
            </InternalHoverButton>
          )}
          {nextSlug && (
            <InternalHoverButton href={`/writings/${nextSlug}`} aria-label="Next post">
              &gt;
            </InternalHoverButton>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-[var(--color-light-80)]">
          {formatDate(post!.metadata.publishedAt)}
        </p>
      </div>
      <article className="prose">
        <ClientContent content={post!.content} />
      </article>
    </section>
  )
}


