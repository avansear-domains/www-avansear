import { cookies } from 'next/headers'
import { AnimatedHeading } from '../../components/animated-heading'
import { Navbar } from '../../components/nav'
import { verifyTravelogueAdminSessionToken, TRAVELOGUE_ADMIN_COOKIE } from 'lib/travelogue-admin-session'
import { TravelogueAdminClient } from './travelogue-admin-client'

export const dynamic = 'force-dynamic'

export default async function TravelogueAdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TRAVELOGUE_ADMIN_COOKIE)?.value
  const initialAuthenticated = verifyTravelogueAdminSessionToken(token)
  const mapPassConfigured = Boolean(process.env.MAP_PASS)
  const supabaseServiceConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  return (
    <div className="relative min-h-[100dvh] w-full pb-16">
      <Navbar variant="floating" />
      <div className="title-spacing px-0 pt-8">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter lowercase">
          travelogue admin
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">
          add pins that appear on the public travelogue map. sign in with <code className="font-mono">MAP_PASS</code>.
        </p>
      </div>
      <TravelogueAdminClient
        initialAuthenticated={initialAuthenticated}
        mapPassConfigured={mapPassConfigured}
        supabaseServiceConfigured={supabaseServiceConfigured}
      />
    </div>
  )
}
