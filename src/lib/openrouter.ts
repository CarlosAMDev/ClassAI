import { OpenRouter } from '@openrouter/sdk'

export interface GenerationResult {
  content: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface GenerationInput {
  level: string
  classType: string
  duration: string
  studentCount: string
  topic: string
  objectives?: string
  notes?: string
}

const SYSTEM_PROMPT = `You are an expert ESL/EFL lesson plan generator. Create detailed, practical, and engaging lesson plans for English language teachers.

Your lesson plans must follow this exact structure:

# LESSON PLAN: [Topic]

## Overview
- **Level:** [CEFR level]
- **Class Type:** [type]
- **Duration:** [duration]
- **Number of Students:** [count]

## Learning Objectives
By the end of this lesson, students will be able to:
1. [objective 1]
2. [objective 2]
3. [objective 3]

## Materials Needed
- [list of materials]

## Lesson Procedure

### 1. Warm-Up (5-10 min)
[Detailed warm-up activity with instructions]

### 2. Presentation (10-15 min)
[How to introduce the new content - include examples, explanations, and board work]

### 3. Practice (15-20 min)
[Controlled practice activities - exercises, drills, or guided activities]

### 4. Production (15-20 min)
[Freer practice - communicative activities, role-plays, discussions, or projects]

### 5. Cool-Down & Review (5 min)
[Wrap-up activity, feedback, and homework assignment]

## Assessment
[How to check if objectives were met]

## Homework / Extension
[Follow-up activities for students]

## Teacher Notes
[Tips, common errors to watch for, differentiation suggestions]

IMPORTANT RULES:
- All activities must be appropriate for the specified CEFR level
- Include specific examples of language, vocabulary, or grammar points
- Make activities interactive and student-centered
- Include timing for each stage
- Provide clear instructions that a teacher can follow directly
- Adapt the content to the class type (listening, reading, writing, speaking, or integrated)
- If student count is small (1-5), include pair/individual activities; if large (20+), include group work strategies`

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  httpReferer: 'https://classai.app',
  appTitle: 'ClassAI',
})

export async function generateLessonPlanContent(
  input: GenerationInput,
  model = 'openrouter/free'
): Promise<GenerationResult> {
  const userPrompt = `Generate a complete lesson plan with these specifications:

- **CEFR Level:** ${input.level}
- **Class Type:** ${input.classType}
- **Duration:** ${input.duration}
- **Number of Students:** ${input.studentCount}
- **Topic:** ${input.topic}
${input.objectives ? `- **Learning Objectives:** ${input.objectives}` : ''}
${input.notes ? `- **Additional Notes:** ${input.notes}` : ''}

Please follow the exact structure provided in the system prompt.`

  const completion = await client.chat.send({
    chatRequest: {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 4000,
      stream: false,
    },
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content generated from AI')
  }

  const usage = completion.usage

  return {
    content,
    promptTokens: (usage as any)?.prompt_tokens ?? (usage as any)?.promptTokens ?? 0,
    completionTokens: (usage as any)?.completion_tokens ?? (usage as any)?.completionTokens ?? 0,
    totalTokens: (usage as any)?.total_tokens ?? (usage as any)?.totalTokens ?? 0,
  }
}
