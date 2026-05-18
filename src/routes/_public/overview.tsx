import { SignInButton } from '@clerk/tanstack-react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import {
  BookOpen,
  Brain,
  Clock,
  FileText,
  Languages,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

const checkSignedIn = createServerFn().handler(async () => {
  const { isAuthenticated } = await auth()
  if (isAuthenticated) {
    throw redirect({ to: '/dashboard' })
  }
  return { isPublic: true }
})

export const Route = createFileRoute('/_public/overview')({
  component: Overview,
  beforeLoad: async () => await checkSignedIn(),
})

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Lesson Generation',
    description:
      'Describe your class topic, student level, and goals. Our AI generates complete lesson plans with warm-ups, main activities, and cool-downs in seconds.',
  },
  {
    icon: Languages,
    title: 'CEFR Level Alignment',
    description:
      'Every lesson is automatically calibrated to A1-C2 levels with appropriate vocabulary, grammar structures, and difficulty progression.',
  },
  {
    icon: Wand2,
    title: 'Interactive Activities',
    description:
      'Get role-plays, pair work, group discussions, games, and multimedia exercises tailored to your classroom dynamics.',
  },
  {
    icon: FileText,
    title: 'Printable Materials',
    description:
      'Download worksheets, reading passages, quizzes, and homework assignments ready to print or share digitally.',
  },
  {
    icon: Target,
    title: 'Learning Objectives & Assessment',
    description:
      'Clear, measurable objectives for every lesson. Track student progress with built-in assessment rubrics and feedback tools.',
  },
  {
    icon: Clock,
    title: 'Time-Saving Templates',
    description:
      'Start from proven templates for common class types: conversation, grammar, vocabulary, exam prep, and business English.',
  },
  {
    icon: Sparkles,
    title: 'Adaptive Content',
    description:
      'AI learns from your feedback and adjusts future lessons to match your teaching style and student needs.',
  },
  {
    icon: BookOpen,
    title: 'Curriculum Builder',
    description:
      'Organize lessons into courses, set learning paths, and ensure complete coverage of your syllabus throughout the term.',
  },
]

function Overview() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center sm:mb-16">
          <Badge variant="secondary" className="mb-4">
            Platform Overview
          </Badge>
          <h1 className="display-title text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need to Teach
            <br />
            <span className="text-primary">English Effectively</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
            ClassAI combines the power of artificial intelligence with proven
            teaching methodologies to help you create better lessons in less
            time.
          </p>
        </div>

        <div className="mb-12 grid gap-4 sm:mb-16 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="feature-card">
              <CardHeader className="pb-3">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12 sm:mb-16">
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight">
            How It Works
          </h2>
          <div className="mt-8 grid gap-8 sm:mt-12 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Describe Your Class',
                desc: 'Tell us the topic, level, duration, and any specific requirements.',
              },
              {
                step: '2',
                title: 'AI Generates the Plan',
                desc: 'Our AI creates a complete lesson with activities, materials, and assessments.',
              },
              {
                step: '3',
                title: 'Customize & Teach',
                desc: 'Review, edit, and adapt the plan to your style. Then teach with confidence.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="island-shell text-center">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Create your free account and generate your first lesson plan in
              minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInButton mode="modal">
              <Button size="lg">
                <Sparkles className="mr-2 size-4" />
                Start Free Trial
              </Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}