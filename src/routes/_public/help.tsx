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
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4">
            Help Center
          </Badge>
          <h1 className="display-title text-4xl font-bold tracking-tight md:text-5xl">
            How Can We
            <br />
            <span className="text-lagoon-deep">Help You?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Browse our guides, watch tutorials, or get in touch with our
            support team.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-16 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full rounded-lg border bg-background py-3 pl-12 pr-4 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-20 grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.title} className="feature-card">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-lagoon-deep/10">
                  <cat.icon className="size-5 text-lagoon-deep" />
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
                        className="text-sm text-muted-foreground transition-colors hover:text-lagoon-deep"
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

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-lg border p-6">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <Card className="island-shell text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-lagoon-deep/10">
              <LifeBuoy className="size-6 text-lagoon-deep" />
            </div>
            <CardTitle className="text-2xl">Still Need Help?</CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Our support team is here to help. Reach out and well get back to
              you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button variant="outline" size="lg" className="border-lagoon-deep/30 text-lagoon-deep hover:bg-lagoon/10">
              <MessageCircle className="mr-2 size-4" />
              Live Chat
            </Button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-lagoon-deep px-6 text-sm font-medium text-white shadow-md shadow-lagoon-deep/20 transition-all hover:bg-lagoon-deep/90"
            >
              <Mail className="mr-2 size-4" />
              Email Us
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
