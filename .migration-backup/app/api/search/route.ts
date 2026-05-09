import { NextRequest, NextResponse } from "next/server"

const TAVILY_API_KEY = process.env.TAVILY_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { query, searchDepth = "basic", maxResults = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    if (!TAVILY_API_KEY) {
      return NextResponse.json(
        { error: "Tavily API key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: searchDepth,
        max_results: maxResults,
        include_answer: true,
        include_raw_content: false,
        include_images: false,
        days: 90,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Tavily API error:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch search results" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
