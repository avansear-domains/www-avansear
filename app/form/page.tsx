import { FormRedirect } from 'app/components/form-redirect'
import { incrementFormVisitCount } from 'lib/form-visit-counter'

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSexn4jMqW6XyyFU6fVmLdhZid5J_xb5LECesXtaGRRBJw6HTg/viewform?usp=pp_url&entry.48645891=33658544'

export const dynamic = 'force-dynamic'

export async function FormPage() {
  const visitCount = await incrementFormVisitCount()
  return <FormRedirect url={FORM_URL} visitCount={visitCount} />
}

export default FormPage
