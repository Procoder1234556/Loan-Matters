/**
 * CompareAgent — Personalized Loan Advisor
 * Adapted from the LangGraph blueprint to TypeScript/Express.
 * Multi-turn: extracts profile from conversation, queries KB, returns ranked recommendations.
 */

import { getKBContext, getLenderSummary } from "../knowledge-base"

export interface UserProfile {
  country: string | null
  course: string | null
  universityTier: string | null
  loanAmountLakhs: number | null
  collateralAvailable: boolean | null
  familyIncomeLPA: number | null
  collegeBackground: string | null
  needsPreVisa: boolean | null
}

export interface ConversationMessage {
  role: "user" | "assistant"
  content: string
}

export interface CompareAgentState {
  messages: ConversationMessage[]
  userProfile: UserProfile
  questionsAsked: number
  recommendation: string | null
  needsMoreInfo: boolean
}

const EMPTY_PROFILE: UserProfile = {
  country: null,
  course: null,
  universityTier: null,
  loanAmountLakhs: null,
  collateralAvailable: null,
  familyIncomeLPA: null,
  collegeBackground: null,
  needsPreVisa: null,
}

/**
 * Extract structured profile from conversation using the AI.
 */
export async function extractProfile(
  messages: ConversationMessage[],
  callAI: (system: string, user: string) => Promise<string>
): Promise<UserProfile> {
  const conversation = messages
    .map((m) => `${m.role === "user" ? "Student" : "Advisor"}: ${m.content}`)
    .join("\n")

  const systemPrompt = `You are a data extraction assistant. Extract loan-related information from the conversation.
Return ONLY valid JSON, no markdown, no explanation.`

  const userPrompt = `Extract the student's education loan requirements from this conversation:

${conversation}

Return ONLY this JSON structure (use null for unknown fields):
{
  "country": "USA" | "UK" | "Canada" | "Germany" | "Australia" | "other" | null,
  "course": "MS" | "MBA" | "PhD" | "MBBS" | "BE" | "other" | null,
  "universityTier": "top20" | "top50" | "top100" | "lower" | null,
  "loanAmountLakhs": number | null,
  "collateralAvailable": true | false | null,
  "familyIncomeLPA": number | null,
  "collegeBackground": "IIT" | "NIT" | "IIM" | "BITS" | "private_premier" | "other" | null,
  "needsPreVisa": true | false | null
}`

  try {
    const result = await callAI(systemPrompt, userPrompt)
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return EMPTY_PROFILE
    return { ...EMPTY_PROFILE, ...JSON.parse(jsonMatch[0]) }
  } catch {
    return EMPTY_PROFILE
  }
}

/**
 * Check if we have enough info to make a recommendation.
 */
export function hasEnoughProfile(profile: UserProfile, questionsAsked: number): boolean {
  const hasCountry = profile.country !== null
  const hasCourse = profile.course !== null
  const hasCollateral = profile.collateralAvailable !== null
  return (hasCountry && hasCourse) || questionsAsked >= 2 || (questionsAsked >= 1 && hasCollateral)
}

/**
 * Generate a clarifying question to get missing profile info.
 */
export async function generateClarifyingQuestion(
  messages: ConversationMessage[],
  profile: UserProfile,
  callAI: (system: string, user: string) => Promise<string>
): Promise<string> {
  const missing: string[] = []
  if (!profile.country) missing.push("destination country")
  if (!profile.course) missing.push("degree type (MS/MBA/PhD)")
  if (!profile.universityTier) missing.push("university ranking/tier")
  if (profile.collateralAvailable === null) missing.push("collateral availability")
  if (!profile.loanAmountLakhs) missing.push("loan amount needed")

  const systemPrompt = `You are a friendly, expert education loan advisor for Indian students going abroad.
Ask ONE natural, conversational question to understand the student's needs better.
Be concise — one sentence only. Do not number the question.`

  const conversation = messages.map((m) => `${m.role === "user" ? "Student" : "You"}: ${m.content}`).join("\n")
  const userPrompt = `Conversation so far:\n${conversation}\n\nI still need to find out: ${missing.slice(0, 2).join(" and ")}.
Ask ONE specific question about the most important missing detail.`

  try {
    const result = await callAI(systemPrompt, userPrompt)
    return result.trim()
  } catch {
    return "Could you tell me which country you're planning to study in, and roughly how much loan you'll need?"
  }
}

/**
 * Generate final ranked loan recommendations using KB + profile.
 */
export async function generateRecommendation(
  profile: UserProfile,
  messages: ConversationMessage[],
  callAI: (system: string, user: string) => Promise<string>
): Promise<string> {
  // Build targeted KB context
  const kbQuery = [
    profile.country && `loans for ${profile.country}`,
    profile.collateralAvailable === false && "no collateral unsecured loan",
    profile.universityTier && `${profile.universityTier} university`,
    profile.course && profile.course,
    profile.country === "USA" && "pre-visa disbursement",
    profile.familyIncomeLPA && profile.familyIncomeLPA < 4.5 && "CSIS subsidy government",
  ]
    .filter(Boolean)
    .join(" ")

  const kbContext = getKBContext(kbQuery, 5)
  const lenderSummary = getLenderSummary()
  const conversation = messages.map((m) => `${m.role === "user" ? "Student" : "Advisor"}: ${m.content}`).join("\n")

  const systemPrompt = `You are an expert, impartial education loan advisor for Indian students going abroad.
Give a clear, ranked recommendation (top 3 lenders) based on the student's specific situation.

KNOWLEDGE BASE (use these facts — do not invent rates):
${kbContext}

ALL LENDER DATA:
${lenderSummary}

FORMAT YOUR RESPONSE:
1. Start with a 1-sentence summary of the student's situation
2. Rank top 3 lenders with: why it suits them, one risk, one action step
3. End with a strategy tip (e.g., apply to NBFC + PSU simultaneously)
4. Add disclaimer: "Rates are indicative as of 2025. Verify directly with lenders."

Write like a knowledgeable friend — plain language, specific numbers, under 350 words.`

  const userPrompt = `Student Profile:
- Country: ${profile.country || "Not specified"}
- Course: ${profile.course || "Not specified"}
- University tier: ${profile.universityTier || "Not specified"}
- Loan amount needed: ${profile.loanAmountLakhs ? `₹${profile.loanAmountLakhs}L` : "Not specified"}
- Collateral available: ${profile.collateralAvailable === null ? "Unknown" : profile.collateralAvailable ? "Yes" : "No"}
- Family income: ${profile.familyIncomeLPA ? `₹${profile.familyIncomeLPA}L/year` : "Not specified"}
- Academic background: ${profile.collegeBackground || "Not specified"}
- Needs pre-visa disbursement: ${profile.needsPreVisa === null ? "Unknown" : profile.needsPreVisa ? "Yes" : "No"}

Conversation context:
${conversation}

Give the best 3 lenders for this specific student with actionable advice.`

  const result = await callAI(systemPrompt, userPrompt)
  return result.trim()
}

/**
 * Main CompareAgent entry point — processes one turn of conversation.
 * Returns either a clarifying question OR a full recommendation.
 */
export async function runCompareAgent(
  state: CompareAgentState,
  callAI: (system: string, user: string) => Promise<string>
): Promise<CompareAgentState> {
  // Step 1: Extract profile from full conversation
  const profile = await extractProfile(state.messages, callAI)
  const updatedState = { ...state, userProfile: profile }

  // Step 2: Decide — clarify or recommend
  if (!hasEnoughProfile(profile, state.questionsAsked)) {
    const question = await generateClarifyingQuestion(state.messages, profile, callAI)
    return {
      ...updatedState,
      needsMoreInfo: true,
      questionsAsked: state.questionsAsked + 1,
      recommendation: question,
    }
  }

  // Step 3: Generate recommendation
  const recommendation = await generateRecommendation(profile, state.messages, callAI)
  return {
    ...updatedState,
    needsMoreInfo: false,
    recommendation,
  }
}
