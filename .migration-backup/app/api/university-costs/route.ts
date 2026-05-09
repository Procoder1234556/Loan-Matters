import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "Tavily API key not configured" },
      { status: 500 }
    )
  }

  try {
    const { country, field, university } = await request.json()

    const query = university
      ? `${university} ${field} master's degree tuition fees living costs 2024 2025 international students`
      : `${country} ${field} master's degree tuition fees living costs 2024 2025 international students average`

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      answer: data.answer || null,
      results: data.results?.map((r: { title: string; url: string; content: string }) => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.substring(0, 200) + "...",
      })) || [],
      query,
    })
  } catch (error) {
    console.error("University costs search error:", error)
    return NextResponse.json(
      { error: "Failed to fetch university cost data" },
      { status: 500 }
    )
  }
}
