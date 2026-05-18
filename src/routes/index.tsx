import { useClerk, useAuth } from '@clerk/tanstack-react-start'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Brain,
  Clock,
  Sparkles,
  Wand2,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { isSignedIn } = useAuth()
  const clerk = useClerk()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-28 md:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-1 size-3" />
            AI-Powered Teaching Assistant
          </Badge>
          <h1 className="display-title text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Plan English Classes
            <br />
            <span className="text-lagoon-deep">in Minutes, Not Hours</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Let AI create personalized lesson plans, activities, and materials
            for your English classes. Focus on teaching, let us handle the
            planning.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {isSignedIn ? (
              <Button size="lg" asChild className="bg-lagoon-deep text-white shadow-md shadow-lagoon-deep/20 hover:bg-lagoon-deep/90">
                <Link to="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-lagoon-deep px-6 text-sm font-medium text-white shadow-md shadow-lagoon-deep/20 transition-all hover:bg-lagoon-deep/90"
                onClick={() => clerk.openSignIn()}
              >
                Get Started Free
                <Sparkles className="size-4" />
              </button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to="/overview">
                See How It Works
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick benefits */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: Brain,
              stat: '80%',
              label: 'Less planning time',
            },
            {
              icon: Wand2,
              stat: '10K+',
              label: 'Lessons generated',
            },
            {
              icon: Clock,
              stat: '5 min',
              label: 'Average creation time',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border bg-background/60 p-6 text-center backdrop-blur-sm"
            >
              <item.icon className="mx-auto mb-3 size-6 text-lagoon-deep" />
              <div className="text-2xl font-bold">{item.stat}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="island-shell rounded-2xl p-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-lagoon-deep/10">
              <Sparkles className="size-7 text-lagoon-deep" />
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              Ready to Transform Your Teaching?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Join thousands of English teachers who save time and create
              better lessons with AI.
            </p>
            <div className="mt-8">
              {!isSignedIn ? (
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-lagoon-deep px-6 text-sm font-medium text-white shadow-md shadow-lagoon-deep/20 transition-all hover:bg-lagoon-deep/90"
                  onClick={() => clerk.openSignIn()}
                >
                  Start Planning for Free
                  <Sparkles className="size-4" />
                </button>
              ) : (
                <Button size="lg" asChild className="bg-lagoon-deep text-white shadow-md shadow-lagoon-deep/20 hover:bg-lagoon-deep/90">
                  <Link to="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-sm text-muted-foreground">
            2026 ClassAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
