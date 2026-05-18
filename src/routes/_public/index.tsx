import { useClerk } from '@clerk/tanstack-react-start'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import {
  ArrowRight,
  Brain,
  Clock,
  Sparkles,
  Wand2,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

const checkSignedIn = createServerFn().handler(async () => {
  const { isAuthenticated } = await auth()
  if (isAuthenticated) {
    throw redirect({ to: '/dashboard' })
  }
  return { isPublic: true }
})

export const Route = createFileRoute('/_public/')({
  component: Home,
  beforeLoad: async () => await checkSignedIn(),
})

function Home() {
  const clerk = useClerk()

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 md:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-1 size-3" />
            AI-Powered Teaching Assistant
          </Badge>
          <h1 className="display-title text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Plan English Classes
            <br />
            <span className="text-primary">in Minutes, Not Hours</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Let AI create personalized lesson plans, activities, and materials
            for your English classes. Focus on teaching, let us handle the
            planning.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
            <Button size="lg" onClick={() => clerk.openSignIn()}>
              <Sparkles className="mr-2 size-4" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/overview">
                See How It Works
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
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
              className="rounded-xl border bg-background/60 p-5 sm:p-6 text-center backdrop-blur-sm"
            >
              <item.icon className="mx-auto mb-3 size-6 text-primary" />
              <div className="text-xl sm:text-2xl font-bold">{item.stat}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="island-shell rounded-2xl p-6 sm:p-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-7 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Ready to Transform Your Teaching?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Join thousands of English teachers who save time and create
              better lessons with AI.
            </p>
            <div className="mt-6 sm:mt-8">
              <Button size="lg" onClick={() => clerk.openSignIn()}>
                <Sparkles className="mr-2 size-4" />
                Start Planning for Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto flex flex-col gap-4 sm:max-w-6xl sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            2026 ClassAI. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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