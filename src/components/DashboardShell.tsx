import { useState, useEffect } from 'react'
import { UserButton, useUser, useAuth } from '@clerk/tanstack-react-start'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  CreditCard,
  LogOut,
  Menu,
  Plus,
  Settings,
  X,
} from 'lucide-react'

import { Button } from './ui/button'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/dashboard/plans', label: 'My Plans', icon: BookOpen },
  { href: '/dashboard/plans/new', label: 'Create Plan', icon: Plus },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-background transition-transform duration-300 ${
          isMobile
            ? sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'relative translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center border-b px-6">
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              {link.label}
            </SidebarLink>
          ))}
        </nav>

        <div className="border-t p-4">
          <UserInfo />
        </div>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 ${
          isMobile ? '' : 'ml-2'
        }`}
      >
        {isMobile && (
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <BookOpen className="size-5 text-primary" />
              <span>ClassAI</span>
            </Link>
          </div>
        )}

        <div className="p-2 sm:p-3">
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
  onClick,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onClick?: () => void
}) {
  const location = useLocation()
  const isActive =
    href === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(href)

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      <Icon className="size-4 shrink-0" />
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
            userButtonAvatarBox: 'size-9',
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
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      title="Sign out"
    >
      <LogOut className="size-4" />
    </button>
  )
}