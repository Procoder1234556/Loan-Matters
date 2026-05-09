import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.TAVILY_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "Tavily API key not configured" },
      { status: 500 }
    )
  }

  try {
    const query = "India education loan trends 2024 2025 interest rates international students STEM abroad"

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
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Market trends search error:", error)
    return NextResponse.json(
      { error: "Failed to fetch market trends" },
      { status: 500 }
    )
  }
}
