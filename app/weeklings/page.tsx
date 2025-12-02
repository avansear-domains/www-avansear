import { Metadata } from 'next'
import Link from 'next/link'
import { AnimatedHeading } from '../components/animated-heading'
import { getWeeklingEntries, formatDate } from './utils'

export const metadata: Metadata = {
  title: 'weeklings',
  description: "i called this page weeklings because i'd make a diff thing every week and put it here lol, but we're not on a weekly time anymore hehe, i'll still make shit tho :>",
}

export default function WeeklingsPage() {
  const entries = getWeeklingEntries()
    .sort((a, b) => {
      if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
        return -1
      }
      return 1
    })

  return (
    <section>
      <div className="mb-8">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          weeklings
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] dark:text-[var(--color-light)]">
          {"i called this page weeklings because i'd make a diff thing every week and put it here lol, but we're not on a weekly time anymore hehe, i'll still make shit tho :>"}
        </p>
      </div>

      <div>
        {entries.map((entry) => (
          <Link
            key={entry.week}
            className="flex flex-col space-y-1 mb-4"
            href={entry.url}
          >
            <div className="w-full flex flex-row space-x-2">
              <p className="text-[var(--color-light-80)] w-fit tracking-tighter whitespace-nowrap flex-shrink-0">
                {formatDate(entry.publishedAt, false)}
              </p>
              <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tighter truncate">
                {entry.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}