import { useState } from 'react'
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
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { getPlanById, updatePlanFn, exportDocxFn } from '#/server/ai'

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
              <Button variant="outline" onClick={handleEdit}>
                <Edit3 className="mr-1 size-4" />
                Edit
              </Button>
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

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
