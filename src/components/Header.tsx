import { useClerk, SignOutButton, useAuth } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { BookOpen, LayoutDashboard } from 'lucide-react'

const navLinks = [
  { href: '/overview', label: 'Overview' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/help', label: 'Help' },
]

export default function Header() {
  const { isSignedIn } = useAuth()
  const clerk = useClerk()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <BookOpen className="size-5 text-lagoon-deep" />
          <span>ClassAI</span>
        </Link>

        <nav className="flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-lagoon/10 hover:text-lagoon-deep"
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-3 flex h-6 items-center self-center border-l" />

          {isSignedIn ? (
            <>
              <Link
                to="/dashboard"
                className="ml-2 inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-lagoon-deep transition-colors hover:bg-lagoon/10"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <SignOutButton>
                <span className="ml-1 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-lagoon-deep/30 px-4 text-sm font-medium text-lagoon-deep transition-all hover:bg-lagoon/10">
                  Sign Out
                </span>
              </SignOutButton>
            </>
          ) : (
            <>
              <button
                type="button"
                className="ml-2 inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-lagoon/10 hover:text-lagoon-deep"
                onClick={() => clerk.openSignIn()}
              >
                Sign In
              </button>
              <button
                type="button"
                className="ml-1 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-lagoon-deep px-4 text-sm font-medium text-white shadow-md shadow-lagoon-deep/20 transition-all hover:bg-lagoon-deep/90"
                onClick={() => clerk.openSignIn()}
              >
                Get Started
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
