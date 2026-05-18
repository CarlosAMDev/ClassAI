import { useUser, useAuth } from '@clerk/tanstack-react-start'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Bell,
  Globe,
  Key,
  Mail,
  Moon,
  Palette,
  Shield,
  User,
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

export const Route = createFileRoute('/_authenticated/dashboard/settings')({
  component: Settings,
})

function Settings() {
  const { user } = useUser()
  const { has } = useAuth()
  const isPro = has?.({ plan: 'pro' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="size-4 text-lagoon-deep" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>
              Your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-lagoon-deep/10 text-xl font-bold text-lagoon-deep">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || 'U'}
              </div>
              <div>
                <p className="font-medium">
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.firstName || ''}
                  className="w-full rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.lastName || ''}
                  className="w-full rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                defaultValue={user?.emailAddresses[0]?.emailAddress}
                className="w-full rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-lagoon-deep px-4 text-sm font-medium text-white shadow-md shadow-lagoon-deep/20 transition-all hover:bg-lagoon-deep/90"
            >
              Save Changes
            </button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="size-4 text-lagoon-deep" />
              <CardTitle>Subscription</CardTitle>
            </div>
            <CardDescription>Your current plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
                <Badge
                  variant="outline"
                  className={isPro ? 'border-lagoon-deep/30 text-lagoon-deep' : ''}
                >
                  {isPro ? 'Active' : 'Free'}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {isPro ? 'Unlimited plans per month' : '5 plans per month'}
              </p>
            </div>
            <Button asChild className="w-full bg-lagoon-deep text-white hover:bg-lagoon-deep/90">
              <Link to="/dashboard/billing">
                {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-lagoon-deep" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="size-4 text-muted-foreground" />
                <span className="text-sm">Dark Mode</span>
              </div>
              <ToggleSwitch />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-sm">Language</span>
              </div>
              <select className="rounded-lg border bg-background px-2 py-1 text-sm outline-none">
                <option>English</option>
                <option>Espanol</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-lagoon-deep" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm">Email Notifications</span>
              </div>
              <ToggleSwitch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm">Push Notifications</span>
              </div>
              <ToggleSwitch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-lagoon-deep" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-lagoon-deep/30 text-lagoon-deep hover:bg-lagoon/10">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start border-lagoon-deep/30 text-lagoon-deep hover:bg-lagoon/10">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start border-lagoon-deep/30 text-lagoon-deep hover:bg-lagoon/10">
              Active Sessions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions. Please be careful.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-lagoon-deep peer-checked:after:translate-x-full" />
    </label>
  )
}
