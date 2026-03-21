import { createClient } from '@supabase/supabase-js'

export async function incrementFormVisitCount(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn(
      'form visit counter: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (and run scripts/form-visit-counter.sql)',
    )
    return null
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.rpc('increment_form_visit_count')
  if (error) {
    console.error('form visit counter:', error.message)
    return null
  }

  if (data == null) return null
  return typeof data === 'bigint' ? Number(data) : Number(data)
}
