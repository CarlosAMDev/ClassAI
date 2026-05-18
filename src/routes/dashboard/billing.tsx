import { createFileRoute } from '@tanstack/react-router'
import { PricingTable } from '@clerk/tanstack-react-start'
import { useAuth } from '@clerk/tanstack-react-start'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/dashboard/billing')({
  component: Billing,
})

function Billing() {
  const { has, isLoaded } = useAuth()

  if (!isLoaded) return null

  const isPro = has?.({ plan: 'pro' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and plan
        </p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-lagoon-deep/10">
              <span className="text-lg">
                {isPro ? '⚡' : '📝'}
              </span>
            </div>
            <div>
              <p className="font-medium">
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPro
                  ? 'Unlimited lesson plans & all features'
                  : '5 lesson plans per month'}
              </p>
            </div>
            {isPro && (
              <Badge className="bg-lagoon-deep text-white">Active</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isPro ? 'Change Plan' : 'Upgrade Your Plan'}
          </CardTitle>
          <CardDescription>
            {isPro
              ? 'Compare plans or manage your subscription'
              : 'Choose a plan that fits your teaching needs'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingTable />
        </CardContent>
      </Card>
    </div>
  )
}
