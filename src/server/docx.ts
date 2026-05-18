import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx'

interface Section {
  type: 'heading' | 'paragraph' | 'list' | 'bold'
  level?: number
  content?: string
  items?: string[]
}

function parseMarkdownToSections(markdown: string): Section[] {
  const sections: Section[] = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      sections.push({ type: 'heading', level: 1, content: line.replace('# ', '').trim() })
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'heading', level: 2, content: line.replace('## ', '').trim() })
    } else if (line.startsWith('### ')) {
      sections.push({ type: 'heading', level: 3, content: line.replace('### ', '').trim() })
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].replace(/^[-*] /, '').trim())
        i++
      }
      sections.push({ type: 'list', items })
      continue
    } else if (line.trim() === '') {
      i++
      continue
    } else {
      sections.push({ type: 'paragraph', content: line.trim() })
    }
    i++
  }

  return sections
}

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = []
  const regex = /\*\*(.*?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index), bold: false }))
    }
    runs.push(new TextRun({ text: match[1], bold: true }))
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIndex), bold: false }))
  }

  return runs.length > 0 ? runs : [new TextRun({ text })]
}

export async function generateDocx(markdown: string, title: string): Promise<Uint8Array> {
  const sections = parseMarkdownToSections(markdown)

  const children = sections.flatMap((section) => {
    switch (section.type) {
      case 'heading': {
        const headingLevel =
          section.level === 1
            ? HeadingLevel.HEADING_1
            : section.level === 2
              ? HeadingLevel.HEADING_2
              : HeadingLevel.HEADING_3

        return [
          new Paragraph({
            heading: headingLevel,
            spacing: { before: section.level === 1 ? 400 : 240, after: 120 },
            children: parseInline(section.content),
          }),
        ]
      }
      case 'paragraph':
        return [
          new Paragraph({
            spacing: { after: 120 },
            children: parseInline(section.content),
          }),
        ]
      case 'list':
        return (section.items || []).map((item) =>
          new Paragraph({
            spacing: { after: 60 },
            indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
            children: [
              new TextRun({ text: '•  ', bold: true }),
              ...parseInline(item),
            ],
          })
        )
      case 'bold':
        return [
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: section.content, bold: true })],
          }),
        ]
      default:
        return []
    }
  })

  const doc = new Document({
    creator: 'ClassAI',
    title: title || 'Lesson Plan',
    description: 'AI-generated English lesson plan',
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          run: { size: 32, bold: true, color: '328F97', font: 'Calibri' },
          paragraph: { spacing: { after: 200 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          run: { size: 26, bold: true, color: '328F97', font: 'Calibri' },
          paragraph: { spacing: { after: 160 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          run: { size: 22, bold: true, color: '4FB8B2', font: 'Calibri' },
          paragraph: { spacing: { after: 120 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: title || 'Lesson Plan', bold: true, size: 36, color: '328F97' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: '328F97' },
            },
            children: [
              new TextRun({ text: 'Generated by ClassAI', italics: true, size: 20, color: '888888' }),
            ],
          }),
          ...children,
        ],
      },
    ],
  })

  return Packer.toBuffer(doc)
}
