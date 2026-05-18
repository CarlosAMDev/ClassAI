import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, Clock, Plus, Search, Trash2, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { useState, useCallback } from 'react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { getPlansByUserId, deletePlanFn, getSharedPlansFn } from '#/server/ai'

export const Route = createFileRoute('/dashboard/plans/')({
  component: PlansList,
  loader: async ({ search }) => {
    const page = Number((search as any)?.page) || 1
    const searchQuery = (search as any)?.search || ''
    const level = (search as any)?.level || ''
    const classType = (search as any)?.classType || ''
    const tab = (search as any)?.tab || 'my-plans'

    let result: any

    if (tab === 'shared') {
      result = await (getSharedPlansFn as unknown as (opts: { data: { page: number; limit: number } }) => Promise<{ plans: any[]; total: number; hasMore: boolean }>)(
        { data: { page, limit: 10 } }
      )
    } else {
      result = await getPlansByUserId({
        data: { page, limit: 10, search: searchQuery, level, classType },
      })
    }

    return { plans: result.plans, total: result.total, hasMore: result.hasMore, tab }
  },
})

function PlansList() {
  const loaderData = Route.useLoaderData()
  const { navigate } = Route.useNavigate()
  const { search } = Route.useSearch()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const page = Number((search as any)?.page) || 1
  const searchQuery = (search as any)?.search || ''
  const levelFilter = (search as any)?.level || ''
  const typeFilter = (search as any)?.classType || ''
  const tab = (search as any)?.tab || 'my-plans'

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    await deletePlanFn({ data: { planId: id } as never })
    navigate({ search: { page: 1, search: searchQuery, level: levelFilter, classType: typeFilter, tab } })
  }

  const handleSearch = useCallback((value: string) => {
    navigate({ search: { page: 1, search: value, level: levelFilter, classType: typeFilter, tab } })
  }, [levelFilter, typeFilter, navigate, tab])

  const handleFilter = useCallback((field: string, value: string) => {
    navigate({ search: { page: 1, search: searchQuery, [field]: value, tab } })
  }, [searchQuery, navigate, tab])

  const handlePageChange = useCallback((newPage: number) => {
    navigate({ search: { page: newPage, search: searchQuery, level: levelFilter, classType: typeFilter, tab } })
  }, [searchQuery, levelFilter, typeFilter, navigate, tab])

  const handleTabChange = (newTab: string) => {
    navigate({ search: { page: 1, tab: newTab } })
  }

  const plans = loaderData?.plans ?? []
  const total = loaderData?.total ?? 0
  const hasMore = loaderData?.hasMore ?? false
  const currentTab = loaderData?.tab || 'my-plans'
  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {currentTab === 'shared' ? 'Shared with Me' : 'My Plans'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {total} plan{total !== 1 ? 's' : ''} {currentTab === 'shared' ? 'shared with you' : 'total'}
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/plans/new">
            <Plus className="mr-1 size-4" />
            New Plan
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1 w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('my-plans')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            currentTab === 'my-plans'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="size-4" />
          My Plans
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('shared')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            currentTab === 'shared'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Share2 className="size-4" />
          Shared with Me
        </button>
      </div>

      {/* Filters - only show for My Plans */}
      {currentTab === 'my-plans' && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => handleFilter('level', e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-lagoon-deep"
          >
            <option value="">All Levels</option>
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
            <option>C2</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => handleFilter('classType', e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-lagoon-deep"
          >
            <option value="">All Types</option>
            <option>listening</option>
            <option>reading</option>
            <option>writing</option>
            <option>speaking</option>
            <option>integrated</option>
          </select>
        </div>
      )}

      {plans.length > 0 ? (
        <>
          <div className="rounded-lg border">
            <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Plan</div>
              <div className="col-span-2">Level</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1" />
            </div>
            {plans.map((plan: any) => (
              <Link
                key={plan.id}
                to="/dashboard/plans/$planId"
                params={{ planId: plan.id }}
                className="grid grid-cols-12 items-center gap-4 border-b px-4 py-4 last:border-b-0 transition-colors hover:bg-accent/50 cursor-pointer"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-lagoon-deep/10">
                    <BookOpen className="size-4 text-lagoon-deep" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{plan.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {plan.duration} &middot; {plan.studentCount} students
                    </p>
                  </div>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className="border-lagoon-deep/30 text-lagoon-deep">
                    {plan.level}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm capitalize text-muted-foreground">
                  {plan.classType}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {formatDate(plan.createdAt)}
                </div>
                <div className="col-span-1 flex justify-end">
                  {currentTab === 'my-plans' ? (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(plan.id) }}
                      disabled={isDeleting === plan.id}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      plan.sharePermission === 'edit'
                        ? 'bg-lagoon-deep/10 text-lagoon-deep'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {plan.sharePermission}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasMore}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center">
          {currentTab === 'shared' ? (
            <>
              <Share2 className="mb-4 size-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No shared plans</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Plans shared with you by other teachers will appear here
              </p>
            </>
          ) : (
            <>
              <BookOpen className="mb-4 size-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                {total === 0 && !searchQuery && !levelFilter && !typeFilter
                  ? 'No plans yet'
                  : 'No matching plans'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {total === 0 && !searchQuery && !levelFilter && !typeFilter
                  ? 'Create your first lesson plan to get started'
                  : 'Try adjusting your search or filters'}
              </p>
              {total === 0 && (
                <Button className="mt-4" asChild>
                  <Link to="/dashboard/plans/new">
                    <Plus className="mr-1 size-4" />
                    Create Plan
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
