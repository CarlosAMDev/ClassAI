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
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and plan
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg">{isSchool ? '🏫' : isPro ? '⚡' : '📝'}</span>
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
              <Badge className="bg-primary text-primary-foreground">Active</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          {isPro || isSchool ? 'Manage Subscription' : 'Upgrade Your Plan'}
        </h2>
        <Card>
          <CardContent className="p-0">
            <UserProfile routing="hash" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}