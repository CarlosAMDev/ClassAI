import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'

const getAuth = createServerFn().handler(async () => {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) {
    throw redirect({ to: '/' })
  }
  return { userId }
})

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => await getAuth(),
  component: () => <Outlet />,
})
