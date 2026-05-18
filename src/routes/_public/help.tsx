import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import {
  BookOpen,
  FileText,
  LifeBuoy,
  Mail,
  MessageCircle,
  Search,
  Video,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
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

export const Route = createFileRoute('/_public/help')({
  component: Help,
  beforeLoad: async () => await checkSignedIn(),
})

const categories = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn the basics of creating your first lesson plan.',
    articles: [
      'Creating your first lesson plan',
      'Understanding CEFR levels',
      'Customizing AI-generated content',
      'Exporting and sharing materials',
    ],
  },
  {
    icon: FileText,
    title: 'Features & Tools',
    description: 'Deep dive into all ClassAI features.',
    articles: [
      'Using the curriculum builder',
      'Creating custom templates',
      'Tracking student progress',
      'Working with assessments',
    ],
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides and tips.',
    articles: [
      'ClassAI walkthrough (5 min)',
      'Advanced AI prompting tips',
      'Building a full course curriculum',
      'Tips for exam preparation lessons',
    ],
  },
]

const faqs = [
  {
    q: 'How does the AI generate lesson plans?',
    a: 'Our AI is trained on thousands of effective English lesson plans and teaching methodologies. It considers the CEFR level, topic, class duration, and your preferences to create structured, engaging lessons.',
  },
  {
    q: 'Can I edit AI-generated lessons?',
    a: 'Absolutely! Every lesson plan is fully editable. You can modify activities, add your own content, change timing, and adjust difficulty. The AI learns from your edits to improve future suggestions.',
  },
  {
    q: 'What file formats can I export to?',
    a: 'Pro users can export to PDF, Google Docs, and plain text. Free users can export to PDF. All exports include proper formatting and are ready to print or share.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use industry-standard encryption and never share your data. Your lesson plans and student information are stored securely and are only accessible to you.',
  },
]

function Help() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center sm:mb-16">
          <Badge variant="secondary" className="mb-4">
            Help Center
          </Badge>
          <h1 className="display-title text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How Can We
            <br />
            <span className="text-primary">Help You?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
            Browse our guides, watch tutorials, or get in touch with our
            support team.
          </p>
        </div>

        <div className="mx-auto mb-12 max-w-xl sm:mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              className="pl-12"
            />
          </div>
        </div>

        <div className="mb-12 grid gap-4 sm:mb-16 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.title} className="feature-card">
              <CardHeader className="pb-3">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <cat.icon className="size-5 text-primary" />
                </div>
                <CardTitle>{cat.title}</CardTitle>
                <CardDescription>{cat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cat.articles.map((article) => (
                    <li key={article}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12 sm:mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="island-shell text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <LifeBuoy className="size-6 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Still Need Help?</CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Our support team is here to help. Reach out and we will get back to
              you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline">
              <MessageCircle className="mr-2 size-4" />
              Live Chat
            </Button>
            <Button>
              <Mail className="mr-2 size-4" />
              Email Us
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}