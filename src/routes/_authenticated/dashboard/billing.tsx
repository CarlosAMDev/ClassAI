import { createFileRoute } from '@tanstack/react-router'
import { UserProfile, useAuth } from '@clerk/tanstack-react-start'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/_authenticated/dashboard/billing')({
  component: Billing,
})

function Billing() {
  const { has, isLoaded } = useAuth()

  if (!isLoaded) return null

  const isPro = has?.({ plan: 'pro' })
  const isSchool = has?.({ plan: 'school' })

  const currentPlan = isSchool ? 'School' : isPro ? 'Pro' : 'Free'

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
                {isSchool ? '🏫' : isPro ? '⚡' : '📝'}
              </span>
            </div>
            <div>
              <p className="font-medium">{currentPlan} Plan</p>
              <p className="text-sm text-muted-foreground">
                {isSchool
                  ? 'Full team access & all features'
                  : isPro
                    ? 'Unlimited lesson plans & all features'
                    : '5 lesson plans per month'}
              </p>
            </div>
            {(isPro || isSchool) && (
              <Badge className="bg-lagoon-deep text-white">Active</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isPro || isSchool ? 'Manage Subscription' : 'Upgrade Your Plan'}
          </CardTitle>
          <CardDescription>
            {isPro || isSchool
              ? 'View plan details, upgrade, downgrade, or cancel'
              : 'Choose a plan that fits your teaching needs'}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[360px]">
            <UserProfile routing="hash" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
