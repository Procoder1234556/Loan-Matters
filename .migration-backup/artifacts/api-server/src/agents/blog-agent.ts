/**
 * BlogAgent — SEO Content Drafter
 * Adapted from the LangGraph blueprint to TypeScript.
 * Given a keyword/topic, produces outline → RAG → full draft → SEO metadata.
 */

import { getKBContext, getLenderSummary } from "../knowledge-base"

export interface BlogDraft {
  keyword: string
  outline: string
  draft: string
  seoTitle: string
  metaDescription: string
  slug: string
  tags: string[]
  wordCount: number
}

export async function runBlogAgent(
  keyword: string,
  callAI: (system: string, user: string) => Promise<string>
): Promise<BlogDraft> {
  const kbContext = getKBContext(keyword, 6)
  const lenderData = getLenderSummary()

  // Step 1: Outline
  const outline = await callAI(
    `You are an SEO content strategist for LoanMatters — India's education loan comparison platform for STEM students.
Create a detailed, structured blog post outline. Format as numbered headings (H2 and H3 only).
Target audience: Indian STEM students planning to study abroad.
Tone: helpful, honest, practical — like a knowledgeable friend.`,
    `Keyword/topic: "${keyword}"
Create an outline for a 1800–2500 word blog post.
Must include: intro, comparison/analysis section, practical tips, FAQ (5 questions), conclusion.`
  )

  // Step 2: Write full draft
  const draft = await callAI(
    `You are an expert education loan content writer for LoanMatters.
Write SEO-optimized blog posts in markdown format.
Use ONLY real data from the provided knowledge base — do NOT invent interest rates or lender claims.
Include internal link placeholders like [Compare HDFC Credila →](/compare/hdfc-credila).
Add a Disclaimer section at the end.`,
    `Write a complete blog post for: "${keyword}"

Follow this outline:
${outline}

Use these accurate facts (do NOT deviate from these numbers):
KNOWLEDGE BASE:
${kbContext}

LENDER DATA:
${lenderData}

Requirements:
- Write in markdown
- 1800+ words
- Include 5 FAQ at the end: **Q: ...?** A: ...
- Add disclaimer at end
- Use specific interest rates and lender names from the knowledge base`
  )

  // Step 3: SEO metadata
  const seoRaw = await callAI(
    `Generate SEO metadata JSON. Return ONLY valid JSON, no markdown.`,
    `Generate SEO metadata for this blog post about: "${keyword}"
First 300 chars of draft: ${draft.slice(0, 300)}

Return ONLY this JSON:
{
  "seoTitle": "under 60 chars, include main keyword",
  "metaDescription": "under 155 chars, compelling, include keyword",
  "slug": "url-friendly-slug",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}`
  )

  let seoMeta = { seoTitle: keyword, metaDescription: "", slug: keyword.toLowerCase().replace(/\s+/g, "-"), tags: [] as string[] }
  try {
    const match = seoRaw.match(/\{[\s\S]*\}/)
    if (match) seoMeta = { ...seoMeta, ...JSON.parse(match[0]) }
  } catch { /* use defaults */ }

  const wordCount = draft.split(/\s+/).length

  return {
    keyword,
    outline,
    draft,
    seoTitle: seoMeta.seoTitle || keyword,
    metaDescription: seoMeta.metaDescription || "",
    slug: seoMeta.slug || keyword.toLowerCase().replace(/\s+/g, "-"),
    tags: seoMeta.tags || [],
    wordCount,
  }
}
