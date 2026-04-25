import { NextResponse } from "next/server"

const TAVILY_API_KEY = process.env.TAVILY_API_KEY

export async function GET() {
  try {
    if (!TAVILY_API_KEY) {
      return NextResponse.json(
        { error: "Tavily API key not configured", useStatic: true },
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
        query: "education loan interest rates India 2024 2025 SBI HDFC Credila Axis Bank latest",
        search_depth: "advanced",
        max_results: 8,
        include_answer: true,
        include_raw_content: false,
        include_images: false,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch loan rates", useStatic: true },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Parse the search results to extract rate information
    const rateInfo = {
      answer: data.answer,
      sources: data.results?.map((r: { title: string; url: string; content: string }) => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.substring(0, 200),
      })) || [],
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(rateInfo)
  } catch (error) {
    console.error("Loan rates API error:", error)
    return NextResponse.json(
      { error: "Internal server error", useStatic: true },
      { status: 500 }
    )
  }
}
