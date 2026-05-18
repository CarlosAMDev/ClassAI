import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, Clock, Plus, Search, Trash2, Share2 } from 'lucide-react'
import { useState, useCallback } from 'react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { getPlansByUserId, deletePlanFn, getSharedPlansFn } from '#/server/ai'

export const Route = createFileRoute('/_authenticated/dashboard/plans/')({
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-1 w-fit">
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

      {currentTab === 'my-plans' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search plans..."
              className="pl-10"
            />
          </div>
          <Select
            value={levelFilter}
            onChange={(e) => handleFilter('level', e.target.value)}
            className="sm:w-32"
          >
            <option value="">All Levels</option>
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
            <option>C2</option>
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => handleFilter('classType', e.target.value)}
            className="sm:w-36"
          >
            <option value="">All Types</option>
            <option>listening</option>
            <option>reading</option>
            <option>writing</option>
            <option>speaking</option>
            <option>integrated</option>
          </Select>
        </div>
      )}

      {plans.length > 0 ? (
        <>
          <div className="hidden lg:block rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan: any) => (
                  <tr key={plan.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        to="/dashboard/plans/$planId"
                        params={{ planId: plan.id }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{plan.title}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {plan.duration} &middot; {plan.studentCount} students
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {plan.level}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm capitalize text-muted-foreground">
                      {plan.classType}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(plan.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {currentTab === 'my-plans' ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(plan.id)}
                          disabled={isDeleting === plan.id}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          aria-label="Delete plan"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          plan.sharePermission === 'edit'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {plan.sharePermission}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {plans.map((plan: any) => (
              <Link
                key={plan.id}
                to="/dashboard/plans/$planId"
                params={{ planId: plan.id }}
                className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <BookOpen className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{plan.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.classType} &middot; {plan.level}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.duration} &middot; {plan.studentCount} students
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {currentTab === 'my-plans' ? (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleDelete(plan.id) }}
                      disabled={isDeleting === plan.id}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label="Delete plan"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : (
                    <Badge
                      variant={plan.sharePermission === 'edit' ? 'default' : 'secondary'}
                      className={plan.sharePermission === 'edit' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {plan.sharePermission}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(plan.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  <span className="sr-only sm:not-sr-only">Previous</span>
                  <span aria-hidden="true">&larr;</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasMore}
                >
                  <span className="sr-only sm:not-sr-only">Next</span>
                  <span aria-hidden="true">&rarr;</span>
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
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