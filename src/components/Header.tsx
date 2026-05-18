import { useState, useEffect } from 'react'
import { useClerk, SignOutButton, useAuth } from '@clerk/tanstack-react-start'
import { Link } from '@tanstack/react-router'
import { BookOpen, LayoutDashboard, Menu, X } from 'lucide-react'

import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'

const navLinks = [
  { href: '/overview', label: 'Overview' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/help', label: 'Help' },
]

export default function Header() {
  const { isSignedIn } = useAuth()
  const clerk = useClerk()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'border-b bg-background/95 backdrop-blur-md shadow-sm'
            : 'border-b bg-background/80 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to={isSignedIn ? '/dashboard' : '/'}
            className="flex items-center gap-2 text-lg font-bold"
          >
            <BookOpen className="size-5 text-primary" />
            <span>ClassAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {!isSignedIn && navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isSignedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-primary transition-colors hover:bg-accent"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <SignOutButton>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex border-primary/30 text-primary hover:bg-accent">
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clerk.openSignIn()}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => clerk.openSignIn()}
                >
                  Get Started
                </Button>
              </>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="fixed right-0 top-16 bottom-0 w-72 bg-background border-l shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex flex-col p-4 gap-2">
              {!isSignedIn && navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 border-t" />

              {isSignedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent"
                  >
                    <LayoutDashboard className="size-5" />
                    Dashboard
                  </Link>
                  <SignOutButton>
                    <span className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer">
                      Sign Out
                    </span>
                  </SignOutButton>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileOpen(false)
                      clerk.openSignIn()
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileOpen(false)
                      clerk.openSignIn()
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}