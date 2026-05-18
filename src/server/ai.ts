import { createServerFn } from '@tanstack/react-start'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { prisma } from '#/lib/prisma'
import { generateLessonPlanContent, type GenerationInput } from '#/lib/openrouter'
import { generateDocx } from '#/server/docx'

const FREE_PLAN_LIMIT = 5

export const generateLessonPlan = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const data = ctx.data as unknown as GenerationInput
    const { userId, has } = await auth()

    if (!userId) {
      return { success: false, error: 'You must be signed in to generate plans' }
    }

    const isPro = has({ plan: 'pro' })
    const hasUnlimited = has({ feature: 'unlimited_plans' })
    const planLimit = isPro || hasUnlimited ? 999999 : FREE_PLAN_LIMIT

    if (!isPro && !hasUnlimited) {
      const plansThisMonth = await prisma.lessonPlan.count({
        where: {
          clerkUserId: userId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      })

      if (plansThisMonth >= planLimit) {
        return {
          success: false,
          error: 'plan_limit',
          message: `You have reached your monthly limit of ${planLimit} plans. Upgrade to Pro for unlimited lesson plans.`,
          planLimit,
          plansThisMonth,
        }
      }
    }

    try {
      const result = await generateLessonPlanContent(data)

      const plan = await prisma.lessonPlan.create({
        data: {
          clerkUserId: userId,
          title: data.topic,
          level: data.level,
          classType: data.classType as any,
          duration: data.duration,
          studentCount: data.studentCount,
          topic: data.topic,
          objectives: data.objectives,
          notes: data.notes,
          content: result.content,
          status: 'completed',
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.totalTokens,
        },
      })

      await prisma.draft.deleteMany({
        where: { clerkUserId: userId },
      })

      return { success: true, content: result.content, planId: plan.id }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: `AI generation failed: ${message}` }
    }
  }
)

export const getPlansByUserId = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    const { userId } = await auth()

    if (!userId) {
      return { plans: [], total: 0, hasMore: false }
    }

    const params = ctx.data as unknown as { page?: number; limit?: number; search?: string; level?: string; classType?: string } | undefined
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10
    const search = params?.search
    const level = params?.level
    const classType = params?.classType

    const where = {
      clerkUserId: userId,
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { topic: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
      ...(level ? { level } : {}),
      ...(classType ? { classType: classType as any } : {}),
    }

    const [plans, total] = await Promise.all([
      prisma.lessonPlan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          level: true,
          classType: true,
          duration: true,
          studentCount: true,
          topic: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.lessonPlan.count({ where }),
    ])

    return {
      plans: plans.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      hasMore: (page * limit) < total,
    }
  }
)

export const getPlanById = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { planId } = ctx.data as unknown as { planId: string }

    let plan = await prisma.lessonPlan.findFirst({
      where: { id: planId, clerkUserId: userId },
    })

    let sharePermission: string | null = null

    if (!plan) {
      const share = await prisma.planShare.findFirst({
        where: { planId, recipientId: userId },
        include: { plan: true },
      })

      if (!share) {
        return { success: false, error: 'Plan not found' }
      }

      plan = share.plan
      sharePermission = share.permission
    }

    return {
      success: true,
      plan: {
        ...plan,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
        isOwner: plan.clerkUserId === userId,
        sharePermission,
      },
    }
  }
)

export const deletePlanFn = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { planId } = ctx.data as unknown as { planId: string }
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'You must be signed in' }
    }

    const deleted = await prisma.lessonPlan.deleteMany({
      where: { id: planId, clerkUserId: userId },
    })

    return { success: deleted.count > 0 }
  }
)

export const updatePlanFn = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { planId, content, title } = ctx.data as unknown as { planId: string; content: string; title?: string }
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'You must be signed in' }
    }

    const owned = await prisma.lessonPlan.count({
      where: { id: planId, clerkUserId: userId },
    })

    if (owned === 0) {
      const share = await prisma.planShare.findFirst({
        where: { planId, recipientId: userId },
      })

      if (!share || share.permission !== 'edit') {
        return { success: false, error: 'You do not have permission to edit this plan' }
      }
    }

    const updated = await prisma.lessonPlan.updateMany({
      where: { id: planId },
      data: {
        content,
        ...(title ? { title } : {}),
        updatedAt: new Date(),
      },
    })

    return { success: updated.count > 0 }
  }
)

export const saveDraftFn = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const data = ctx.data as unknown as {
      title?: string
      level?: string
      classType?: string
      duration?: string
      studentCount?: string
      topic?: string
      objectives?: string
      notes?: string
      content?: string
    }
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'You must be signed in' }
    }

    await prisma.draft.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        ...data,
      },
      update: data,
    })

    return { success: true }
  }
)

export const getDraftFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const draft = await prisma.draft.findUnique({
      where: { clerkUserId: userId },
    })

    return draft
      ? {
          ...draft,
          createdAt: draft.createdAt.toISOString(),
          updatedAt: draft.updatedAt.toISOString(),
        }
      : null
  }
)

export const exportDocxFn = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { content, title } = ctx.data as unknown as { content: string; title: string }
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'You must be signed in' }
    }

    try {
      const buffer = await generateDocx(content, title)
      const base64 = Buffer.from(buffer).toString('base64')
      return { success: true, base64 }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: `Failed to generate DOCX: ${message}` }
    }
  }
)

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { userId, has } = await auth()

    if (!userId) {
      return {
        totalPlans: 0,
        plansThisMonth: 0,
        plansRemaining: FREE_PLAN_LIMIT,
        planLimit: FREE_PLAN_LIMIT,
        planType: 'Free',
        totalHours: 0,
        recentPlans: [],
      }
    }

    const isPro = has({ plan: 'pro' })
    const hasUnlimited = has({ feature: 'unlimited_plans' })
    const planLimit = isPro || hasUnlimited ? 999999 : FREE_PLAN_LIMIT
    const planType = isPro ? 'Pro' : 'Free'

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const [totalPlans, plansThisMonth, recentPlans] = await Promise.all([
      prisma.lessonPlan.count({ where: { clerkUserId: userId } }),
      prisma.lessonPlan.count({
        where: { clerkUserId: userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.lessonPlan.findMany({
        where: { clerkUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          level: true,
          classType: true,
          duration: true,
          studentCount: true,
          topic: true,
          createdAt: true,
        },
      }),
    ])

    return {
      totalPlans,
      plansThisMonth,
      plansRemaining: isPro || hasUnlimited ? 999999 : Math.max(0, planLimit - plansThisMonth),
      planLimit,
      planType,
      totalHours: Math.round(totalPlans * 1.5 * 10) / 10,
      recentPlans: recentPlans.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    }
  }
)

export const searchUsersFn = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { userId } = await auth()

    if (!userId) {
      return { users: [], error: 'Not authenticated' }
    }

    const { query } = ctx.data as unknown as { query: string }

    if (!query || query.length < 2) {
      return { users: [] }
    }

    try {
      const response = await (await clerkClient()).users.getUserList({
        query,
        limit: 10,
      })

      const users = response.data
        .filter((u) => u.id !== userId)
        .map((u) => ({
          id: u.id,
          email: u.emailAddresses[0]?.emailAddress || '',
          firstName: u.firstName,
          lastName: u.lastName,
          imageUrl: u.imageUrl,
        }))

      return { users }
    } catch {
      return { users: [], error: 'Failed to search users' }
    }
  }
)

export const sharePlanFn = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { planId, recipientId, permission } = ctx.data as unknown as {
      planId: string
      recipientId: string
      permission: 'view' | 'edit'
    }

    if (!planId || !recipientId) {
      return { success: false, error: 'Plan and recipient are required' }
    }

    if (recipientId === userId) {
      return { success: false, error: 'You cannot share a plan with yourself' }
    }

    const plan = await prisma.lessonPlan.findFirst({
      where: { id: planId, clerkUserId: userId },
    })

    if (!plan) {
      return { success: false, error: 'Plan not found or you do not own it' }
    }

    try {
      await prisma.planShare.upsert({
        where: {
          planId_recipientId: { planId, recipientId },
        },
        create: {
          planId,
          ownerUserId: userId,
          recipientId,
          permission: permission || 'view',
        },
        update: {
          permission: permission || 'view',
        },
      })

      return { success: true }
    } catch {
      return { success: false, error: 'Failed to share plan' }
    }
  }
)

export const getSharedPlansFn = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    const { userId } = await auth()

    if (!userId) {
      return { plans: [], total: 0, hasMore: false }
    }

    const params = ctx.data as unknown as { page?: number; limit?: number } | undefined
    const page = params?.page ?? 1
    const limit = params?.limit ?? 10

    const [shares, total] = await Promise.all([
      prisma.planShare.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          plan: {
            select: {
              id: true,
              title: true,
              level: true,
              classType: true,
              duration: true,
              studentCount: true,
              topic: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              clerkUserId: true,
            },
          },
        },
      }),
      prisma.planShare.count({ where: { recipientId: userId } }),
    ])

    return {
      plans: shares.map((s) => ({
        ...s.plan,
        createdAt: s.plan.createdAt.toISOString(),
        updatedAt: s.plan.updatedAt.toISOString(),
        sharePermission: s.permission,
        sharedBy: s.ownerUserId,
      })),
      total,
      hasMore: (page * limit) < total,
    }
  }
)

export const getPlanSharesFn = createServerFn({ method: 'GET' }).handler(
  async (ctx) => {
    const { userId } = await auth()

    if (!userId) {
      return { shares: [] }
    }

    const { planId } = ctx.data as unknown as { planId: string }

    const plan = await prisma.lessonPlan.findFirst({
      where: { id: planId, clerkUserId: userId },
    })

    if (!plan) {
      return { shares: [], error: 'Plan not found or you do not own it' }
    }

    const shares = await prisma.planShare.findMany({
      where: { planId },
      orderBy: { createdAt: 'desc' },
    })

    const recipientIds = shares.map((s) => s.recipientId)

    if (recipientIds.length === 0) {
      return { shares: [] }
    }

    try {
      const usersResponse = await (await clerkClient()).users.getUserList({
        userId: recipientIds,
      })

      const userMap = new Map(
        usersResponse.data.map((u) => [
          u.id,
          {
            email: u.emailAddresses[0]?.emailAddress || '',
            firstName: u.firstName,
            lastName: u.lastName,
            imageUrl: u.imageUrl,
          },
        ])
      )

      const enrichedShares = shares.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        recipient: userMap.get(s.recipientId) || {
          email: 'Unknown',
          firstName: null,
          lastName: null,
          imageUrl: '',
        },
      }))

      return { shares: enrichedShares }
    } catch {
      return {
        shares: shares.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
          recipient: {
            email: 'Unknown',
            firstName: null,
            lastName: null,
            imageUrl: '',
          },
        })),
      }
    }
  }
)

export const revokeShareFn = createServerFn({ method: 'POST' }).handler(
  async (ctx) => {
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    const { shareId } = ctx.data as unknown as { shareId: string }

    const share = await prisma.planShare.findFirst({
      where: { id: shareId, ownerUserId: userId },
    })

    if (!share) {
      return { success: false, error: 'Share not found or you do not own it' }
    }

    await prisma.planShare.delete({
      where: { id: shareId },
    })

    return { success: true }
  }
)
