import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { unstructuredDetails, jobDescription, jobTitle, companyName, apiKey } = await request.json()

    if (!unstructuredDetails || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use Tavily to get job market insights
    const tavilyApiKey = process.env.TAVILY_API_KEY
    let jobContext = ""
    
    if (tavilyApiKey) {
      try {
        const searchResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query: `${jobTitle} ${companyName || ""} resume keywords ATS optimization skills required 2024`,
            search_depth: "basic",
            max_results: 3,
          }),
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          jobContext = searchData.results
            ?.map((r: { content: string }) => r.content)
            .join("\n")
            .slice(0, 2000)
        }
      } catch (e) {
        console.error("Tavily search error:", e)
      }
    }

    const aiApiKey = apiKey || process.env.AI_GATEWAY_API_KEY

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume optimizer and career coach.
Your job is to create a highly ATS-optimized resume that will score 85%+ on ATS systems.

Job Market Context:
${jobContext || "Use general best practices for the industry."}

ATS Optimization Rules:
1. Use exact keywords from the job description
2. Use standard section headers (Experience, Education, Skills)
3. Use reverse chronological order
4. Quantify achievements with numbers and percentages
5. Use action verbs at the start of bullet points
6. Include both hard skills and soft skills from the JD
7. Match the exact job title if candidate is qualified
8. Use simple formatting (no tables, columns, or graphics)
9. Include relevant certifications and tools mentioned in JD

Create a JSON response with:
{
  "name": "Full Name",
  "title": "Professional Title (matching job if qualified)",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, State",
  "linkedin": "linkedin url if mentioned",
  "summary": "3-4 sentence professional summary with keywords from JD",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "location": "City, State",
      "bullets": ["Achievement 1 with metrics", "Achievement 2 with metrics"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "Graduation Year",
      "gpa": "GPA if strong",
      "relevant": "Relevant coursework/honors"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "soft": ["skill1", "skill2"]
  },
  "certifications": ["cert1", "cert2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description with tech stack and impact"
    }
  ],
  "atsScore": 85,
  "keywordMatches": ["keyword1", "keyword2"],
  "improvementTips": ["tip1", "tip2"]
}`

    const response = await fetch("https://ai.vercel.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Candidate Details (unstructured - extract and organize):
${unstructuredDetails}

Job Description:
${jobDescription}

Target Job Title: ${jobTitle || "Not specified"}
Target Company: ${companyName || "Not specified"}

Create an ATS-optimized resume that maximizes keyword matching and scores high on ATS systems.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      throw new Error("AI API request failed")
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    
    let resumeData
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        resumeData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found")
      }
    } catch {
      resumeData = {
        name: "Candidate",
        title: jobTitle || "Professional",
        summary: content.slice(0, 500),
        experience: [],
        education: [],
        skills: { technical: [], tools: [], soft: [] },
        certifications: [],
        projects: [],
        atsScore: 0,
        keywordMatches: [],
        improvementTips: [],
      }
    }

    return NextResponse.json({
      success: true,
      resume: resumeData,
      jobTitle,
      companyName,
    })
  } catch (error) {
    console.error("Resume builder error:", error)
    return NextResponse.json(
      { error: "Failed to build resume" },
      { status: 500 }
    )
  }
}
