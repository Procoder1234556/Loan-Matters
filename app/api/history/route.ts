import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from("user_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ history: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const body = await request.json()
  const { action_type, action_data } = body
  
  if (!action_type || !action_data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from("user_history")
    .insert({
      user_id: user.id,
      action_type,
      action_data,
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ history: data })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (id) {
    // Delete specific history item
    const { error } = await supabase
      .from("user_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Delete all history
    const { error } = await supabase
      .from("user_history")
      .delete()
      .eq("user_id", user.id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
  
  return NextResponse.json({ success: true })
}
