import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { getDashboardStats } from '#/server/ai'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardOverview,
  loader: async () => {
    const stats = await getDashboardStats()
    return { stats }
  },
})

function DashboardOverview() {
  const loaderData = Route.useLoaderData()
  const stats = loaderData?.stats ?? {
    totalPlans: 0,
    plansThisMonth: 0,
    plansRemaining: 5,
    planLimit: 5,
    planType: 'Free',
    totalHours: 0,
    recentPlans: [],
  }
  const usagePercent = (stats.plansThisMonth / stats.planLimit) * 100

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here is an overview of your teaching activity.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/plans/new">
            <Plus className="mr-1 size-4" />
            New Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total Plans"
          value={stats.totalPlans.toString()}
          description="All time"
        />
        <StatCard
          icon={Calendar}
          label="This Month"
          value={stats.plansThisMonth.toString()}
          description="Plans generated"
        />
        <StatCard
          icon={Clock}
          label="Time Saved"
          value={`${stats.totalHours}h`}
          description="Approximate"
        />
        <StatCard
          icon={Target}
          label="Plan Type"
          value={stats.planType}
          description={stats.planType === 'Pro' ? 'Unlimited plans' : `${stats.planLimit} plans/month`}
        />
      </div>

      {stats.planType === 'Free' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Usage</CardTitle>
            <CardDescription>
              {stats.plansThisMonth} of {stats.planLimit} plans used this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {stats.plansRemaining} plans remaining
                </span>
                <span className="font-medium">{Math.round(usagePercent)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
            {usagePercent >= 80 && (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:bg-amber-950/30 dark:border-amber-800">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-800 dark:text-amber-300">
                  You are close to your monthly limit.{' '}
                  <Link
                    to="/dashboard/billing"
                    className="font-medium text-amber-900 underline dark:text-amber-200"
                  >
                    Upgrade to Pro
                  </Link>{' '}
                  for unlimited plans.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Recent Plans</CardTitle>
              <CardDescription>
                Your latest generated lesson plans
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to="/dashboard/plans">
                View All
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentPlans.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPlans.map((plan) => (
                  <Link
                    key={plan.id}
                    to="/dashboard/plans/$planId"
                    params={{ planId: plan.id }}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{plan.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.classType} &middot; {plan.level} &middot;{' '}
                          {plan.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(plan.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No plans generated yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link to="/dashboard/plans/new">
                <Sparkles className="mr-2 size-4" />
                Generate New Plan
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/plans">
                <BookOpen className="mr-2 size-4" />
                Browse My Plans
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/settings">
                <Target className="mr-2 size-4" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  description: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Icon className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}