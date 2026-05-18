import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

import DashboardShell from '#/components/DashboardShell'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardShell,
})
