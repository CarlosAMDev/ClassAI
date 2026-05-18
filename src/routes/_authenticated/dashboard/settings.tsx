import { useUser, useAuth } from '@clerk/tanstack-react-start'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Bell,
  Globe,
  Key,
  Mail,
  Palette,
  Shield,
  User,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Switch } from '#/components/ui/switch'

export const Route = createFileRoute('/_authenticated/dashboard/settings')({
  component: Settings,
})

function Settings() {
  const { user } = useUser()
  const { has } = useAuth()
  const isPro = has?.({ plan: 'pro' })

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary shrink-0">
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
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                defaultValue={user?.firstName || ''}
                placeholder="First name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                defaultValue={user?.lastName || ''}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.emailAddresses[0]?.emailAddress}
              placeholder="Email"
            />
          </div>
          <Button>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="size-4 text-primary" />
              <CardTitle>Subscription</CardTitle>
            </div>
            <CardDescription>Your current plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
                <Badge
                  variant={isPro ? 'default' : 'outline'}
                  className={isPro ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-primary'}
                >
                  {isPro ? 'Active' : 'Free'}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {isPro ? 'Unlimited plans per month' : '5 plans per month'}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/dashboard/billing">
                {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-sm">Dark Mode</span>
              </div>
              <Switch id="dark-mode" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-sm">Language</span>
              </div>
              <Select className="w-28" defaultValue="en">
                <option value="en">English</option>
                <option value="es">Español</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
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
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-muted-foreground" />
                <span className="text-sm">Push Notifications</span>
              </div>
              <Switch id="push-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Active Sessions
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions. Please be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="outline" className="shrink-0 border-destructive text-destructive hover:bg-destructive/10">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}