import { UserButton, useUser, useAuth } from '@clerk/tanstack-react-start'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  CreditCard,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/dashboard/plans', label: 'My Plans', icon: BookOpen },
  { href: '/dashboard/plans/new', label: 'Create Plan', icon: Plus },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardShell() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background/95 backdrop-blur-md">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <BookOpen className="size-5 text-lagoon-deep" />
          <span className="text-lg font-bold">ClassAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map((link) => (
            <SidebarLink key={link.href} href={link.href} icon={link.icon}>
              {link.label}
            </SidebarLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <UserInfo />
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  const location = useLocation()
  const isActive =
    href === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(href)

  return (
    <Link
      to={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-lagoon-deep/10 text-lagoon-deep'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  )
}

function UserInfo() {
  const { user } = useUser()
  const { has } = useAuth()
  const isPro = has?.({ plan: 'pro' })

  return (
    <div className="flex items-center gap-3">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: 'size-8',
          },
        }}
      />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">
          {user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {isPro ? 'Pro Plan' : 'Free Plan'}
        </p>
      </div>
      <SignOutButton />
    </div>
  )
}

function SignOutButton() {
  return (
    <button
      type="button"
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      title="Sign out"
    >
      <LogOut className="size-4" />
    </button>
  )
}
