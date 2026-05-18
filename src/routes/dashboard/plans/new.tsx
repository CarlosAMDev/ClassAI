import { useState, useEffect, useRef } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BookOpen,
  Check,
  Clock,
  Copy,
  Download,
  Edit3,
  FileText,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
  Users,
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
import { generateLessonPlan, updatePlanFn, exportDocxFn, saveDraftFn, getDraftFn } from '#/server/ai'

export const Route = createFileRoute('/dashboard/plans/new')({
  component: CreatePlan,
  loader: async () => {
    const draft = await getDraftFn()
    return { draft }
  },
})

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const classTypes = [
  { id: 'listening', label: 'Listening', icon: Headphones, description: 'Audio comprehension activities' },
  { id: 'reading', label: 'Reading', icon: BookOpen, description: 'Text analysis and comprehension' },
  { id: 'writing', label: 'Writing', icon: PenLine, description: 'Written expression practice' },
  { id: 'speaking', label: 'Speaking', icon: Mic, description: 'Oral communication skills' },
  { id: 'integrated', label: 'Integrated', icon: FileText, description: 'Combines multiple skills' },
]

const durations = ['30 min', '45 min', '60 min', '90 min']

const studentCounts = ['1-5', '6-10', '11-15', '16-20', '21-30', '30+']

const exampleTopics: Record<string, string[]> = {
  A1: ['Greetings and Introductions', 'Numbers and Days of the Week', 'My Family', 'Colors and Clothes', 'Food and Drinks', 'My House', 'Daily Routines'],
  A2: ['Talking About Hobbies', 'Shopping and Money', 'Asking for Directions', 'Past Experiences', 'Weather and Seasons', 'Making Plans', 'At the Restaurant'],
  B1: ['Travel and Transportation', 'Health and Fitness', 'Job Interviews', 'Environmental Issues', 'Technology in Daily Life', 'Cultural Differences', 'Giving Opinions'],
  B2: ['Debate: Social Media', 'Business English', 'News and Current Events', 'Idioms and Expressions', 'Academic Writing', 'Film and Literature', 'Negotiation Skills'],
  C1: ['Advanced Argumentation', 'Scientific Discourse', 'Literary Analysis', 'Political Debates', 'Humor and Sarcasm', 'Academic Presentations', 'Ethical Dilemmas'],
  C2: ['Philosophical Discussions', 'Nuanced Persuasion', 'Creative Writing Workshop', 'Diplomatic Language', 'Linguistic Analysis', 'Abstract Concepts', 'Masterclass: Public Speaking'],
}

function CreatePlan() {
  const loaderData = Route.useLoaderData()
  const draft = loaderData?.draft

  const [level, setLevel] = useState(draft?.level || '')
  const [classType, setClassType] = useState(draft?.classType || '')
  const [duration, setDuration] = useState(draft?.duration || '')
  const [studentCount, setStudentCount] = useState(draft?.studentCount || '')
  const [customTopic, setCustomTopic] = useState(draft?.topic || '')
  const [selectedExample, setSelectedExample] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState(draft?.notes || '')
  const [learningObjectives, setLearningObjectives] = useState(draft?.objectives || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [planId, setPlanId] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const topic = customTopic || selectedExample
  const canGenerate = level !== '' && classType !== '' && duration !== '' && studentCount !== '' && topic.trim() !== ''

  const draftDataRef = useRef({ level, classType, duration, studentCount, topic, learningObjectives, additionalNotes })
  draftDataRef.current = { level, classType, duration, studentCount, topic, learningObjectives, additionalNotes }

  useEffect(() => {
    const timer = setTimeout(async () => {
      const data = draftDataRef.current
      if (data.level || data.classType || data.topic) {
        setIsAutoSaving(true)
        try {
          await saveDraftFn({
            data: {
              level: data.level || undefined,
              classType: data.classType || undefined,
              duration: data.duration || undefined,
              studentCount: data.studentCount || undefined,
              topic: data.topic || undefined,
              objectives: data.learningObjectives || undefined,
              notes: data.additionalNotes || undefined,
            },
          })
          setLastSaved(new Date())
        } catch {
          // Silently fail autosave
        } finally {
          setIsAutoSaving(false)
        }
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [level, classType, duration, studentCount, customTopic, selectedExample, learningObjectives, additionalNotes])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')
    setGeneratedPlan('')

    try {
      const result = await (generateLessonPlan as unknown as (opts: { data: {
        level: string
        classType: string
        duration: string
        studentCount: string
        topic: string
        objectives?: string
        notes?: string
      } }) => Promise<{ success: boolean; content?: string; error?: string }>)(
        {
          data: {
            level,
            classType,
            duration,
            studentCount,
            topic,
            objectives: learningObjectives,
            notes: additionalNotes,
          },
        }
      )

      if (result.success && result.content) {
        setGeneratedPlan(result.content)
        setPlanId((result as unknown as { planId?: string }).planId || '')
      } else if ((result as unknown as { error: string }).error === 'plan_limit') {
        setError('plan_limit')
      } else {
        setError(result.error || 'Failed to generate lesson plan')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPlan)
  }

  const handleEdit = () => {
    setEditedContent(generatedPlan)
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
        { data: { planId, content: editedContent } }
      )
      if (result.success) {
        setGeneratedPlan(editedContent)
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
        { data: { content: generatedPlan, title: `Lesson Plan - ${customTopic || selectedExample}` } }
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
        a.download = `lesson-plan-${(customTopic || selectedExample || 'plan').toLowerCase().replace(/\s+/g, '-')}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch {
      setError('Failed to export document')
    }
  }

  if (generatedPlan) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Generated Lesson Plan</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon-deep/10 px-2.5 py-1 text-xs font-medium text-lagoon-deep">
                <Check className="size-3" />
                Saved to My Plans
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              {level} &middot; {classTypes.find((t) => t.id === classType)?.label} &middot; {duration} &middot; {studentCount} students
            </p>
          </div>
          <div className="flex gap-2">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                <Check className="size-3.5" />
                Saved
              </span>
            )}
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
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-lagoon-deep px-4 text-sm font-medium text-white shadow-md shadow-lagoon-deep/20 transition-all hover:bg-lagoon-deep/90"
                  onClick={() => setGeneratedPlan('')}
                >
                  Create Another
                </button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[600px] w-full rounded-lg border bg-background p-4 font-mono text-sm leading-relaxed outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
              />
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:text-lagoon-deep prose-strong:text-foreground prose-a:text-lagoon-deep prose-li:marker:text-lagoon-deep">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedPlan}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Lesson Plan</h1>
            <p className="mt-1 text-muted-foreground">
              Fill in the details and let AI generate a complete lesson plan for your English class
            </p>
          </div>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              {isAutoSaving ? 'Saving...' : `Draft saved ${lastSaved.toLocaleTimeString()}`}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CEFR Level</CardTitle>
              <CardDescription>Select your students level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {levels.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => { setLevel(l); setSelectedExample('') }}
                    className={`rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all ${
                      level === l
                        ? 'border-lagoon-deep bg-lagoon-deep/10 text-lagoon-deep'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class Type</CardTitle>
              <CardDescription>What skill will you focus on?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {classTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setClassType(type.id)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                      classType === type.id
                        ? 'border-lagoon-deep bg-lagoon-deep/10'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className={`flex size-9 items-center justify-center rounded-lg ${
                      classType === type.id ? 'bg-lagoon-deep/20' : 'bg-muted'
                    }`}>
                      <type.icon className={`size-4 ${classType === type.id ? 'text-lagoon-deep' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${classType === type.id ? 'text-lagoon-deep' : ''}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        duration === d
                          ? 'border-lagoon-deep bg-lagoon-deep/10 text-lagoon-deep'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Clock className="size-3.5" />
                      {d}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {studentCounts.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStudentCount(s)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        studentCount === s
                          ? 'border-lagoon-deep bg-lagoon-deep/10 text-lagoon-deep'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Users className="size-3.5" />
                      {s}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic</CardTitle>
              <CardDescription>
                {level ? `Suggested topics for ${level} level` : 'Select a level first to see suggested topics'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {level && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Example Topics</label>
                  <div className="flex flex-wrap gap-2">
                    {(exampleTopics[level] || []).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setSelectedExample(t); setCustomTopic('') }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedExample === t
                            ? 'border-lagoon-deep bg-lagoon-deep/10 text-lagoon-deep'
                            : 'hover:bg-accent'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Or write your own</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => { setCustomTopic(e.target.value); setSelectedExample('') }}
                  placeholder="e.g., Past Perfect Continuous, Environmental Vocabulary..."
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Objectives</CardTitle>
              <CardDescription>Optional: What should students achieve?</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
                placeholder="e.g., Students will be able to use the target grammar in real conversations..."
                rows={3}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Notes</CardTitle>
              <CardDescription>Optional: Any special requirements or context</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g., Students are teenagers, include a game, focus on pronunciation..."
                rows={3}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem label="Level" value={level || '—'} />
            <SummaryItem label="Type" value={classTypes.find((t) => t.id === classType)?.label || '—'} />
            <SummaryItem label="Duration" value={duration || '—'} />
            <SummaryItem label="Students" value={studentCount || '—'} />
          </div>
          {topic && (
            <div className="mb-4 rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Topic</p>
              <p className="mt-1 font-medium">{topic}</p>
            </div>
          )}

          {error === 'plan_limit' ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Monthly plan limit reached</p>
                  <p className="mt-1 text-sm text-amber-700">
                    You have used all 5 free plans for this month. Upgrade to Pro for unlimited lesson plans.
                  </p>
                  <Button asChild className="mt-3 bg-lagoon-deep text-white hover:bg-lagoon-deep/90" size="sm">
                    <Link to="/dashboard/billing">Upgrade to Pro</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-lagoon-deep px-4 text-sm font-medium text-white shadow-md shadow-lagoon-deep/20 transition-all hover:bg-lagoon-deep/90 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 size-4 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Generate Lesson Plan
              </>
            )}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
