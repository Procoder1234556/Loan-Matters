/**
 * LoanMatters Knowledge Base
 * Adapted from the agentic blueprint — rich structured knowledge
 * used by CompareAgent, Ask AI, BlogAgent for RAG-style grounding.
 */

export interface KBDoc {
  id: string
  text: string
  metadata: Record<string, string>
}

export const KNOWLEDGE_BASE: KBDoc[] = [
  // ── LENDER OVERVIEWS ────────────────────────────────────────────────────────
  {
    id: "sbi_overview",
    text: `SBI Global Ed-Vantage is SBI's flagship education loan for studying abroad.
Interest rate: 8.15% to 10.15% floating (MCLR-linked). Women get 0.5% concession making it 7.65%+.
Maximum loan: ₹1.5 crore for abroad.
Collateral required above ₹7.5 lakh (property, FD, LIC).
Disbursement: AFTER visa — this is a major downside vs NBFCs.
Moratorium: course duration + 12 months (no repayment during studies).
Repayment tenure: up to 15 years.
Processing fee: 1% of sanctioned amount (min ₹10,000).
Tax benefit: full interest deduction under Section 80E for 8 years.
Government subsidy: eligible for CSIS scheme for EWS students.
Best for: students with strong collateral, IIT/NIT background, or who qualify for CSIS subsidy.
Weakness: slow processing (4–8 weeks), disbursement only after visa, strict documentation.`,
    metadata: { lender: "SBI", type: "psu_bank", topic: "overview" },
  },
  {
    id: "hdfc_credila_overview",
    text: `HDFC Credila is India's first dedicated education loan NBFC, backed by HDFC Bank.
Interest rate: 9.5% to 13.5% floating (HDFC PLRR benchmark, resets every quarter).
Maximum loan: ₹1.5 crore for abroad, no upper limit for select profiles.
Collateral: negotiable above ₹7.5 lakh — often waived for IIT/NIT/IIM admits to top-50 universities.
Disbursement BEFORE visa: YES — major advantage for university deposits and I-20 fees.
Countries: USA, UK, Canada, Germany, Australia, France, Ireland, Singapore.
Processing fee: 1% of loan amount (minimum ₹15,000).
Moratorium: course duration + 6 months.
Repayment tenure: up to 10 years post moratorium.
Tax benefit: Section 80E applies.
Best for: top-university admits who need pre-visa disbursement, mid-tier college students rejected by banks.
Weakness: rates can be high (10%+) for lower-ranked colleges, shorter tenure than SBI.`,
    metadata: { lender: "HDFC Credila", type: "nbfc", topic: "overview" },
  },
  {
    id: "avanse_overview",
    text: `Avanse Financial Services is an NBFC education lender backed by HDFC and Warburg Pincus.
Interest rate: 10.5% to 13.75% floating.
Maximum loan: ₹1 crore for abroad (no hard upper limit for good profiles).
Collateral required above ₹40 lakh (more lenient than banks).
Disbursement BEFORE visa: YES.
Countries: USA, UK, Canada, Germany, Australia, New Zealand.
Processing fee: 1–2% of loan amount.
Moratorium: course duration + 6 months.
Repayment tenure: up to 12 years.
Best for: mid-tier college students, students where banks may reject, need faster processing.
Weakness: higher floor rate than SBI, lower max amount vs HDFC Credila, no government subsidy.`,
    metadata: { lender: "Avanse", type: "nbfc", topic: "overview" },
  },
  {
    id: "auxilo_overview",
    text: `Auxilo Finserve is a tech-first NBFC education lender.
Interest rate: 11% to 14% floating.
Maximum loan: ₹75 lakh without collateral for strong profiles (IIT/NIT/top-50 admits).
Collateral: can get up to ₹40L without collateral; negotiable for premier institutes.
Disbursement BEFORE visa: YES.
Processing fee: 1–2%.
Moratorium: course + 6 months.
Best for: students needing no-collateral loans, STEM students at top universities.
Known for: fully digital process, quick 1-week turnaround, good for US admits.`,
    metadata: { lender: "Auxilo", type: "nbfc", topic: "overview" },
  },
  {
    id: "bob_overview",
    text: `Bank of Baroda Baroda Scholar is a PSU bank education loan for abroad.
Interest rate: 9.15% to 10.50% floating (MCLR-linked).
Maximum loan: ₹1.5 crore for premier institutions, ₹80L for others.
Collateral required above ₹7.5 lakh.
Disbursement: after visa (PSU bank standard).
Processing fee: 1% (max ₹10,000 for education loans).
Women concession: 0.5%.
Moratorium: course + 12 months.
Best for: students targeting non-US destinations, those eligible for CSIS subsidy.
CSIS eligible: YES (for EWS students with family income < ₹4.5L/year).`,
    metadata: { lender: "Bank of Baroda", type: "psu_bank", topic: "overview" },
  },
  {
    id: "mpower_overview",
    text: `MPOWER Financing is a US-based lender for international students already in USA/Canada.
Interest rate: 12% to 14% fixed USD (not rupee-linked).
Maximum loan: $100,000 (~₹83L).
NO collateral required. NO co-signer required. NO credit history needed.
Available ONLY after I-20/Letter of Admission — not pre-visa.
Best for: students already admitted to US/Canada universities who cannot get Indian bank loans.
Weakness: USD interest rate is high, only for US/Canada, no pre-visa disbursement.`,
    metadata: { lender: "MPOWER", type: "foreign_lender", topic: "overview" },
  },

  // ── COMPARISON GUIDES ───────────────────────────────────────────────────────
  {
    id: "psu_vs_nbfc",
    text: `PSU Banks (SBI, Bank of Baroda, Canara, Union Bank, PNB) vs NBFCs (HDFC Credila, Avanse, Auxilo):

PSU Banks — ADVANTAGES:
- Lower interest rates: 8.15% to 10.5% (2–3% cheaper than NBFCs)
- Government CSIS subsidy eligible (EWS students)
- Women get 0.5% concession
- Tax deduction under Section 80E
- Longer repayment tenure (up to 15 years)
- More trusted for visa purposes in conservative countries

PSU Banks — DISADVANTAGES:
- SLOW processing: 4–8 weeks
- Disbursement ONLY AFTER visa — cannot use for admission deposits or I-20 fees
- Strict collateral requirements (usually > ₹7.5L)
- Less flexible for non-premier college students
- Higher paperwork burden

NBFCs — ADVANTAGES:
- Faster approval: 1–2 weeks
- Disbursement BEFORE visa — covers university deposits, SEVIS fees, initial costs
- More flexible for mid-tier university admits
- Less documentation
- Some offer no-collateral loans up to ₹40–75L

NBFCs — DISADVANTAGES:
- Higher interest rates: 9.5% to 14%
- No CSIS government subsidy
- Some have prepayment charges
- Shorter repayment tenure

SMART STRATEGY: Apply to SBI/BoB simultaneously with an NBFC.
Use NBFC for initial disbursement (university deposit, visa fees, SEVIS fee).
Then switch to or supplement with PSU bank after visa if rate is significantly lower.`,
    metadata: { topic: "comparison", type: "guide" },
  },
  {
    id: "no_collateral_options",
    text: `Education loans WITHOUT collateral (unsecured) for abroad studies:

Best no-collateral options ranked:
1. Auxilo: up to ₹75L without collateral for IIT/NIT/top-50 admits
2. HDFC Credila: negotiable case-by-case for premier colleges (often waived for IIT/top-20 US)
3. Avanse: up to ₹40L without collateral
4. MPOWER Financing: US-based, truly no collateral, no co-signer (but USD rates, only for USA/Canada)

Factors that INCREASE no-collateral eligibility:
- IIT, NIT, IIM, BITS academic background
- MS in CS, Data Science, AI — high-demand fields
- Admission to top-50 QS-ranked university
- Strong co-applicant income (parent earning > ₹8L/year)
- GRE score above 320

PSU banks (SBI, BoB) typically require collateral above ₹7.5 lakh for all cases.

If you have NO collateral and need > ₹40L: consider HDFC Credila + Auxilo combination, or MPOWER for US admits.`,
    metadata: { topic: "no_collateral", type: "guide" },
  },
  {
    id: "govt_subsidy_csis",
    text: `Central Sector Interest Subsidy Scheme (CSIS) — Government of India:

Provides FULL interest subsidy during the moratorium period (course duration + repayment holiday).
Maximum loan eligible: ₹7.5 lakh from scheduled banks.
Eligibility: students from Economically Weaker Sections (EWS) with family income under ₹4.5 lakh/year.
How to claim: apply at bank branch at time of loan sanction with income certificate.
Subsidy credited directly to loan account — no out-of-pocket payment needed during studies.

Eligible banks: SBI, Bank of Baroda, Canara Bank, Union Bank, PNB, and other PSU banks.
NOT applicable to NBFCs like HDFC Credila, Avanse, Auxilo.

Example benefit: On a ₹7.5L loan at 9% over 2-year course + 12 months moratorium,
the subsidy saves approximately ₹2.02 lakh in interest.

Padho Pradesh Scheme: Additional interest subsidy for minority community students.`,
    metadata: { topic: "subsidy", type: "guide" },
  },
  {
    id: "tax_benefits_80e",
    text: `Section 80E Tax Deduction on Education Loan Interest:

Who can claim: the person who took the loan (student or parent as co-applicant).
Deduction: FULL interest amount paid — no upper limit.
Duration: 8 consecutive years from the year repayment starts.
Applicable to: loans from banks and notified financial institutions only.
NOT available on loans from NBFCs like HDFC Credila, Avanse (verify with your lender — some NBFCs are now notified).

Example: If you pay ₹3.5L interest in a year at 30% tax bracket, you save ₹1.05L in taxes.
This effectively reduces your real interest rate by ~1% for tax-paying co-applicants.

SBI, BoB, Canara, Union Bank: 80E confirmed eligible.
HDFC Credila: contact them to confirm notified status.`,
    metadata: { topic: "tax", type: "guide" },
  },
  {
    id: "visa_disbursement_importance",
    text: `Pre-visa vs Post-visa Disbursement — Critical for International Students:

WHAT IS PRE-VISA DISBURSEMENT?
Some lenders (mostly NBFCs) release funds BEFORE you get your student visa.
This allows you to pay: university enrollment deposit, SEVIS fee (US: $350), initial rent deposit.

WHY IT MATTERS:
Many US universities require a "Proof of Financial Support" showing you have funds available.
Some require the I-20 fee or enrollment deposit BEFORE issuing I-20.
Without I-20, you cannot apply for F-1 visa.

PSU BANKS (SBI, BoB): disburse ONLY after visa — problematic for US admits.
Workaround: personal savings or family funds for initial deposit, then SBI loan post-visa.

NBFCs that disburse PRE-VISA:
- HDFC Credila: YES (most popular for this reason)
- Avanse: YES
- Auxilo: YES

RECOMMENDED APPROACH for US admits:
Step 1: Get NBFC sanction letter for visa application (shows financial ability)
Step 2: NBFC pays enrollment deposit before visa
Step 3: After visa, evaluate if you want to switch to SBI (lower rate) or stay with NBFC (faster, pre-visa benefit already used)`,
    metadata: { topic: "visa_disbursement", type: "guide" },
  },
  {
    id: "loan_amount_limits",
    text: `Education Loan Amount Limits for Studying Abroad (2024–25):

Without collateral:
- SBI: up to ₹7.5L (then collateral mandatory)
- HDFC Credila: negotiable, often up to ₹40L for premier college backgrounds
- Avanse: up to ₹40L
- Auxilo: up to ₹75L for top admits

With collateral (property/FD):
- SBI: up to ₹1.5 crore
- HDFC Credila: up to ₹1.5 crore (higher for special profiles)
- Avanse: up to ₹1 crore
- Bank of Baroda: up to ₹1.5 crore (premier) / ₹80L (others)
- Axis Bank: up to ₹7.5 crore (with immovable property)

What counts as collateral:
- Immovable property (house, flat, land with clear title)
- Fixed Deposits (FD) — easiest and fastest, valued at 100%
- LIC policy (surrender value considered)
- NSC, KVP (government savings)

FD as collateral is FASTEST — get a loan against FD at the same bank.`,
    metadata: { topic: "loan_amounts", type: "guide" },
  },
  {
    id: "country_specific_advice",
    text: `Country-specific Education Loan Strategy for Indian Students:

USA (most common):
- Need pre-visa disbursement → prefer NBFC first (HDFC Credila, Auxilo)
- F-1 visa needs proof of funds — NBFC sanction letter is accepted
- SEVIS fee ($350) must be paid before visa application
- Best lender mix: Auxilo/HDFC Credila + SBI in parallel

UK:
- Tier 4 visa: needs CAS (Confirmation of Acceptance for Studies) from university first
- PSU banks usually okay since CAS process is slower (more time to get loan)
- SBI or BoB work well for UK
- Costs: tuition £15–25K/year + living £10–15K/year in London

Canada:
- Study permit timeline: 8–12 weeks, longer than US
- SBI or BoB + NBFC sanction letter for proof of funds
- Quebec: French-language programs often cheaper

Germany:
- LOWEST COST: tuition nearly free (€150–300/semester administration fee)
- Need blocked account (Sperrkonto): ~€11,208 for 2024 (approx ₹10L)
- SBI Germany blocked account loan works well
- Deutsche Bank India blocked account service available

Australia:
- Student visa needs proof of 12 months expenses: AUD 21,041 (2024)
- Biometric and health check fees add up
- HDFC Credila and Avanse both have Australia-specific products`,
    metadata: { topic: "country_advice", type: "guide" },
  },
  {
    id: "interest_rate_benchmark",
    text: `Understanding Education Loan Interest Rate Benchmarks in India (2025):

MCLR (Marginal Cost of Funds-based Lending Rate) — used by PSU banks:
- SBI MCLR (1Y): ~8.75% (as of early 2025)
- SBI Ed-Vantage: MCLR + spread = ~8.15% effective (varies)
- Resets annually — your rate changes every year

PLRR (Prime Lending Rate Reference Rate) — used by HDFC Credila:
- Resets quarterly — rate can change 4 times a year
- Currently HDFC PLRR + 1%–4% spread = 9.5%–13.5%

Repo Rate impact: RBI repo rate cuts reduce MCLR-linked rates (good for SBI borrowers).
When RBI cuts rates, PSU bank loans get cheaper. NBFCs may not follow immediately.

Current rate landscape (2025):
- SBI: 8.15%–10.15% (lowest among all lenders)
- Bank of Baroda: 9.15%–10.5%
- HDFC Credila: 9.5%–13.5%
- Avanse: 10.5%–13.75%
- Auxilo: 11%–14%
- Axis Bank: 13.5%+ (generally expensive for education loans)`,
    metadata: { topic: "interest_rates", type: "guide" },
  },
  {
    id: "application_process",
    text: `How to Apply for an Education Loan in India — Step by Step:

DOCUMENTS NEEDED (standard for all lenders):
Student documents:
- Admission letter / I-20 / CAS from university
- Academic marksheets (10th, 12th, graduation)
- GRE/GMAT/TOEFL/IELTS scores
- Passport (valid)
- Visa (if already received — for post-visa lenders)

Co-applicant (parent/guardian) documents:
- PAN card, Aadhaar
- 2 years Income Tax Returns (ITR)
- 3 months salary slips (if salaried)
- Bank statements (6 months)
- Form 16

Collateral documents (if applicable):
- Property title deed / FD receipt / LIC policy
- Property valuation report (for immovable property)

TIMELINE:
- Auxilo, HDFC Credila: 1–2 weeks for sanction
- SBI, BoB: 4–8 weeks (full documentation required)

PRO TIP: Apply to NBFC first (faster) to get sanction letter for visa.
Apply to SBI simultaneously — if approved, evaluate rate vs NBFC before drawdown.`,
    metadata: { topic: "process", type: "guide" },
  },
]

/**
 * Simple in-memory semantic search using keyword matching.
 * Adapted from ChromaDB RAG pattern in the blueprint.
 * Returns top-N most relevant KB docs for a given query.
 */
export function searchKB(query: string, topN = 4): KBDoc[] {
  const q = query.toLowerCase()

  // Score each doc by keyword overlap
  const scored = KNOWLEDGE_BASE.map((doc) => {
    const text = (doc.text + " " + Object.values(doc.metadata).join(" ")).toLowerCase()
    const words = q.split(/\W+/).filter((w) => w.length > 3)
    let score = 0
    for (const word of words) {
      // Count occurrences — more mentions = more relevant
      const count = (text.match(new RegExp(word, "g")) || []).length
      score += count
    }
    // Boost for exact phrase matches
    if (text.includes(q.slice(0, 20))) score += 10
    return { doc, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.doc)
}

/**
 * Get KB context string for a given query — ready to inject into AI prompts.
 */
export function getKBContext(query: string, topN = 4): string {
  const docs = searchKB(query, topN)
  if (docs.length === 0) return ""
  return docs.map((d) => d.text).join("\n\n---\n\n")
}

/**
 * Get all lender data as a structured summary for CompareAgent.
 */
export function getLenderSummary(): string {
  const lenderDocs = KNOWLEDGE_BASE.filter((d) => d.metadata.topic === "overview")
  return lenderDocs.map((d) => d.text).join("\n\n---\n\n")
}
