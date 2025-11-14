import { Metadata } from 'next'
import { AnimatedHeading } from '../components/animated-heading'
import { FontPosts } from '../components/font-posts'

export const metadata: Metadata = {
  title: 'mi favorita fonts',
  description: 'my favorite fonts',
}

export default function MiFavoritaFontsPage() {
  return (
    <section>
      <div className="mb-8">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          mi favorita fonts
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] dark:text-[var(--color-light)]">click on any to download!</p>
      </div>

      <FontPosts />
    </section>
  )
}

