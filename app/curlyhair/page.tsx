import { AnimatedHeading } from '../components/animated-heading'

export const metadata = {
  title: 'curly hair routine',
  description: 'curly hair care routine',
}

export default function Page() {
  return (
    <section>
      <div className="mb-8">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          curly hair routine
        </AnimatedHeading>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-dark)] dark:border-[var(--color-light)]">
              <th className="text-left p-2 font-semibold">product</th>
              <th className="text-left p-2 font-semibold">usage</th>
              <th className="text-left p-2 font-semibold">frequency</th>
              <th className="text-left p-2 font-semibold">notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--color-dark)]/20 dark:border-[var(--color-light)]/20">
              <td className="p-2">kinky curly shampoo</td>
              <td className="p-2">apply to scalp<br />(use in pair with kc conditioner)</td>
              <td className="p-2">min: 1x a week<br />max: 2x a week</td>
              <td className="p-2">to clean off build-up + previously applied product</td>
            </tr>
            <tr className="border-b border-[var(--color-dark)]/20 dark:border-[var(--color-light)]/20">
              <td className="p-2">kinky curly conditioner</td>
              <td className="p-2">apply to scalp + hair<br />(use in pair with kc shampoo)</td>
              <td className="p-2">min: 1x a week<br />max: 2x a week</td>
              <td className="p-2">to add shit + moisture to ur hair becuz shampoo strips away shit</td>
            </tr>
            <tr className="border-b border-[var(--color-dark)]/20 dark:border-[var(--color-light)]/20">
              <td className="p-2">ogx shampoo</td>
              <td className="p-2">apply to scalp</td>
              <td className="p-2">min: none<br />max: 1x a day</td>
              <td className="p-2">to clean off light dust + make ur hair feel less sweaty</td>
            </tr>
            <tr className="border-b border-[var(--color-dark)]/20 dark:border-[var(--color-light)]/20">
              <td className="p-2">cantu leave in conditioner</td>
              <td className="p-2">apply to mids + ends only</td>
              <td className="p-2">1x a day</td>
              <td className="p-2">to add texture and moisture to hair</td>
            </tr>
            <tr className="border-b border-[var(--color-dark)]/20 dark:border-[var(--color-light)]/20">
              <td className="p-2">jojoba oil</td>
              <td className="p-2">apply to mids + ends only</td>
              <td className="p-2">1x a day</td>
              <td className="p-2">final layer to add protection</td>
            </tr>
            <tr>
              <td className="p-2">cantu comeback curl spray</td>
              <td className="p-2">spray all over ur hair<br />(make sure to shampoo next day)</td>
              <td className="p-2">max: 3x a week</td>
              <td className="p-2">to get instant curls if ur going out soon and don't have time for full routine</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

