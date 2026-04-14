import { cookies } from 'next/headers'
import { AnimatedHeading } from '../../components/animated-heading'
import { Navbar } from '../../components/nav'
import { verifyWritingsAdminSessionToken, WRITINGS_ADMIN_COOKIE } from 'lib/writings-admin-session'
import { WritingsAdminClient } from './writings-admin-client'

export const dynamic = 'force-dynamic'

export default async function WritingsAdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(WRITINGS_ADMIN_COOKIE)?.value
  const initialAuthenticated = verifyWritingsAdminSessionToken(token)
  const writingsPassConfigured = Boolean(process.env.WRITINGS_PASS)
  const githubConfigured = Boolean(process.env.GITHUB_TOKEN) && Boolean(process.env.GITHUB_REPO)

  return (
    <div className="relative min-h-[100dvh] w-full pb-16">
      <Navbar variant="floating" />
      <div className="title-spacing px-0 pt-8">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter lowercase">
          writings admin
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">
          write a new post in markdown and publish it directly to github.
        </p>
      </div>
      <WritingsAdminClient
        initialAuthenticated={initialAuthenticated}
        writingsPassConfigured={writingsPassConfigured}
        githubConfigured={githubConfigured}
      />
    </div>
  )
}
