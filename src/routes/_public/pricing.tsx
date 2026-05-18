import { SignInButton } from '@clerk/tanstack-react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { Check } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
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
    throw redirect({ to: '/dashboard/billing' })
  }
  return { isPublic: true }
})

export const Route = createFileRoute('/_public/pricing')({
  component: Pricing,
  beforeLoad: async () => await checkSignedIn(),
})

const plans = [
  {
    slug: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out ClassAI',
    features: [
      '5 lesson plans per month',
      'Basic AI generation',
      'CEFR levels A1-B2',
      'Export to DOCX',
      'Email support',
    ],
    popular: false,
  },
  {
    slug: 'pro',
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For teachers who want the full experience',
    features: [
      'Unlimited lesson plans',
      'Advanced AI with adaptive learning',
      'All CEFR levels (A1-C2)',
      'Share plans with other teachers',
      'Priority support',
      'Export to PDF & Google Docs',
      'Class analytics & progress tracking',
    ],
    popular: true,
  },
  {
    slug: 'school',
    name: 'School',
    price: '$49',
    period: '/month',
    description: 'For schools and teaching teams',
    features: [
      'Everything in Pro',
      'Up to 20 teacher accounts',
      'Shared curriculum library',
      'Admin dashboard',
      'Dedicated account manager',
      'Custom branding',
      'API access',
      'Training & onboarding sessions',
    ],
    popular: false,
  },
]

function Pricing() {
  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h1 className="display-title text-4xl font-bold tracking-tight md:text-5xl">
            Simple, Transparent
            <br />
            <span className="text-lagoon-deep">Pricing</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Start free and upgrade when you need more. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.slug}
              className={`flex flex-col feature-card ${plan.popular ? 'border-lagoon-deep ring-2 ring-lagoon-deep/20' : ''}`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-lagoon-deep" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <SignInButton mode="modal">
                    <span
                      className={`flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-6 text-sm font-medium transition-all ${
                        plan.popular
                          ? 'bg-lagoon-deep text-white shadow-md shadow-lagoon-deep/20 hover:bg-lagoon-deep/90'
                          : 'border border-lagoon-deep/30 text-lagoon-deep hover:bg-lagoon/10'
                      }`}
                    >
                      {plan.slug === 'free' ? 'Get Started' : `Start ${plan.name} Trial`}
                    </span>
                  </SignInButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel at any time. You will continue to have access to your plan until the end of your billing period.',
              },
              {
                q: 'What happens to my lesson plans if I downgrade?',
                a: 'Your existing lesson plans are always saved. You just won\'t be able to generate new ones beyond your plan limits.',
              },
              {
                q: 'Is there a free trial for Pro?',
                a: 'Yes! Every new account gets a 14-day free trial of Pro with full access to all features.',
              },
              {
                q: 'Do you offer discounts for schools?',
                a: 'Yes, we offer volume discounts for schools with more than 20 teachers. Contact us for a custom quote.',
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-lg border p-6">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
