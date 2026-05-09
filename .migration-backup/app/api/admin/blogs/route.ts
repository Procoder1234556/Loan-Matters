import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const NOT_CONFIGURED = NextResponse.json({ error: "Auth not configured" }, { status: 503 })

// GET all blogs (including unpublished) for admin
export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NOT_CONFIGURED

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ blogs: data })
}

// POST - Create new blog
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NOT_CONFIGURED

  const body = await request.json()

  const slug =
    body.slug ||
    body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const { data, error } = await supabase
    .from("blogs")
    .insert({ ...body, slug })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ blog: data })
}

// PUT - Update blog
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NOT_CONFIGURED

  const body = await request.json()
  const { id, ...updateData } = body

  if (!id) {
    return NextResponse.json({ error: "Blog ID is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("blogs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ blog: data })
}

// DELETE - Delete blog
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NOT_CONFIGURED

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Blog ID is required" }, { status: 400 })
  }

  const { error } = await supabase.from("blogs").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
