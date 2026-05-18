import { useState, useEffect, useRef } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Edit3,
  X,
  Share2,
  Search,
  User,
  Shield,
  Trash2,
  Eye,
  Pencil,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  getPlanById,
  updatePlanFn,
  exportDocxFn,
  searchUsersFn,
  sharePlanFn,
  getPlanSharesFn,
  revokeShareFn,
} from '#/server/ai'

export const Route = createFileRoute('/dashboard/plans/$planId')({
  component: PlanDetail,
  loader: async ({ params }) => {
    const result = await (getPlanById as unknown as (opts: { data: { planId: string } }) => Promise<{ success: boolean; plan?: any; error?: string }>)(
      { data: { planId: params.planId } }
    )
    if (!result.success || !result.plan) {
      throw notFound()
    }
    return { plan: result.plan }
  },
})

function PlanDetail() {
  const { plan } = Route.useLoaderData()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(plan.content)
  }

  const handleEdit = () => {
    setEditedContent(plan.content)
    setIsEditing(true)
    setSaveSuccess(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await (updatePlanFn as unknown as (opts: { data: { planId: string; content: string } }) => Promise<{ success: boolean }>)(
        { data: { planId: plan.id, content: editedContent } }
      )
      if (result.success) {
        setIsEditing(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch {
      setError('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportDocx = async () => {
    try {
      const result = await (exportDocxFn as unknown as (opts: { data: { content: string; title: string } }) => Promise<{ success: boolean; base64?: string; error?: string }>)(
        { data: { content: isEditing ? editedContent : plan.content, title: plan.title } }
      )
      if (result.success && result.base64) {
        const binary = atob(result.base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${plan.title.toLowerCase().replace(/\s+/g, '-')}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch {
      setError('Failed to export document')
    }
  }

  const canEdit = plan.isOwner || plan.sharePermission === 'edit'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/plans">
              <ArrowLeft className="mr-1 size-4" />
              Back to Plans
            </Link>
          </Button>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
              <Check className="size-3.5" />
              Saved
            </span>
          )}
          {!plan.isOwner && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-2.5 py-1 text-xs font-medium text-lagoon-deep">
              <Share2 className="size-3" />
              Shared with you ({plan.sharePermission})
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-1 size-4" />
                Cancel
              </Button>
              <Button className="bg-lagoon-deep text-white hover:bg-lagoon-deep/90" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : (
                  <>
                    <Check className="mr-1 size-4" />
                    Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="border-lagoon-deep/30 text-lagoon-deep hover:bg-lagoon/10" onClick={handleCopy}>
                <Copy className="mr-1 size-4" />
                Copy
              </Button>
              <Button variant="outline" onClick={handleExportDocx}>
                <Download className="mr-1 size-4" />
                Export DOCX
              </Button>
              {canEdit && (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit3 className="mr-1 size-4" />
                  Edit
                </Button>
              )}
              {plan.isOwner && <ShareDialog planId={plan.id} />}
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{plan.title}</CardTitle>
          <CardDescription>
            {plan.level} &middot; {plan.classType} &middot; {plan.duration} &middot; {plan.studentCount} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[600px] w-full rounded-lg border bg-background p-4 font-mono text-sm leading-relaxed outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
            />
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-lagoon-deep prose-strong:text-foreground prose-a:text-lagoon-deep prose-li:marker:text-lagoon-deep">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {plan.content}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {plan.isOwner && <SharedWithList planId={plan.id} />}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}

function ShareDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [sharing, setSharing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [shareError, setShareError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setUsers([])
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await (searchUsersFn as unknown as (opts: { data: { query: string } }) => Promise<{ users: any[]; error?: string }>)(
          { data: { query } }
        )
        setUsers(result.users || [])
      } catch {
        setUsers([])
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleShare = async () => {
    if (!selectedUser) return
    setSharing(true)
    setShareError('')
    try {
      const result = await (sharePlanFn as unknown as (opts: { data: { planId: string; recipientId: string; permission: string } }) => Promise<{ success: boolean; error?: string }>)(
        { data: { planId, recipientId: selectedUser.id, permission } }
      )
      if (result.success) {
        setSuccess(true)
        setSelectedUser(null)
        setQuery('')
        setUsers([])
        setTimeout(() => {
          setSuccess(false)
          setOpen(false)
        }, 1500)
      } else {
        setShareError(result.error || 'Failed to share')
      }
    } catch {
      setShareError('An error occurred')
    } finally {
      setSharing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-1 size-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Lesson Plan</DialogTitle>
          <DialogDescription>
            Search for a user by email or name to share this plan with them.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
              <Check className="size-6 text-green-600" />
            </div>
            <p className="font-medium text-green-700">Plan shared successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedUser(null) }}
                placeholder="Search by email or name..."
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
              />
            </div>

            {selectedUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <UserAvatar user={selectedUser} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedUser.firstName || selectedUser.email}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Permission</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPermission('view')}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                        permission === 'view'
                          ? 'border-lagoon-deep bg-lagoon-deep/10 text-lagoon-deep'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Eye className="size-4" />
                      Can view
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermission('edit')}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                        permission === 'edit'
                          ? 'border-lagoon-deep bg-lagoon-deep/10 text-lagoon-deep'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Pencil className="size-4" />
                      Can edit
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full bg-lagoon-deep text-white hover:bg-lagoon-deep/90"
                  onClick={handleShare}
                  disabled={sharing}
                >
                  {sharing ? 'Sharing...' : (
                    <>
                      <Share2 className="mr-1 size-4" />
                      Share Plan
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-lg border">
                {searching ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <UserAvatar user={user} />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">
                          {user.firstName || user.email}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))
                ) : query.length >= 2 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            )}

            {shareError && (
              <p className="text-sm text-destructive">{shareError}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function UserAvatar({ user }: { user: any }) {
  if (user.imageUrl) {
    return (
      <img
        src={user.imageUrl}
        alt=""
        className="size-8 shrink-0 rounded-full"
      />
    )
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lagoon-deep/10 text-xs font-medium text-lagoon-deep">
      {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
    </div>
  )
}

function SharedWithList({ planId }: { planId: string }) {
  const [shares, setShares] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const result = await (getPlanSharesFn as unknown as (opts: { data: { planId: string } }) => Promise<{ shares: any[]; error?: string }>)(
          { data: { planId } }
        )
        setShares(result.shares || [])
      } catch {
        setShares([])
      } finally {
        setLoading(false)
      }
    }
    fetchShares()
  }, [planId])

  const handleRevoke = async (shareId: string) => {
    try {
      const result = await (revokeShareFn as unknown as (opts: { data: { shareId: string } }) => Promise<{ success: boolean }>)(
        { data: { shareId } }
      )
      if (result.success) {
        setShares((prev) => prev.filter((s) => s.id !== shareId))
      }
    } catch {
      // silently fail
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-lagoon-deep" />
          <CardTitle className="text-base">Shared With</CardTitle>
        </div>
        <CardDescription>
          People who have access to this plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : shares.length > 0 ? (
          <div className="space-y-2">
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={share.recipient} />
                  <div>
                    <p className="text-sm font-medium">
                      {share.recipient.firstName || share.recipient.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {share.recipient.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    share.permission === 'edit'
                      ? 'bg-lagoon-deep/10 text-lagoon-deep'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {share.permission === 'edit' ? (
                      <Pencil className="size-3" />
                    ) : (
                      <Eye className="size-3" />
                    )}
                    {share.permission}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevoke(share.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Revoke access"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This plan has not been shared with anyone yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
