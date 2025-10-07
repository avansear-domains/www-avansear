import { baseUrl } from 'app/sitemap'
import { getBlogPosts } from 'app/writings/utils'

export async function GET() {
  let allBlogs = await getBlogPosts()

  const itemsXml = allBlogs
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1
      }
      return 1
    })
    .map(
      (post) =>
        `<item>
          <title><![CDATA[${post.metadata.title}]]></title>
          <link>${baseUrl}/writings/${post.slug}</link>
          <description><![CDATA[${post.metadata.summary || post.metadata.title}]]></description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
          <guid isPermaLink="true">${baseUrl}/writings/${post.slug}</guid>
          <author>avan@avansear.com (Avan)</author>
        </item>`
    )
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>avan's writings</title>
        <link>${baseUrl}</link>
        <description>random stories by avan :D</description>
        <language>en-US</language>
        <managingEditor>me@avansear.com (avan)</managingEditor>
        <webMaster>me@avansear.com (avan)</webMaster>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
