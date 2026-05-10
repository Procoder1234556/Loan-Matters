import { useState, useEffect } from "react"
import { useLocation } from "wouter"
import { GraduationCap, Plus, Pencil, Trash2, Eye, EyeOff, Loader2, LogOut, FileText, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  is_published: boolean
  created_at: string
  tags: string[]
}

const SESSION_KEY = "loanmatters_admin_token"

export default function AdminPage() {
  const [, navigate] = useLocation()
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY))
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", tags: "", is_published: false })
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const authHeaders = (extra?: Record<string, string>) => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  })

  useEffect(() => {
    if (token) fetchPosts()
  }, [token])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    try {
      const res = await fetch("/api/admin/blogs", {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, password)
        setToken(password)
        setPassword("")
      } else if (res.status === 401 || res.status === 403) {
        setAuthError("Incorrect password")
      } else if (res.status === 503) {
        setAuthError("Admin not configured on server. Set ADMIN_PASSWORD env var.")
      } else {
        setAuthError("Login failed — please try again")
      }
    } catch {
      setAuthError("Cannot reach server — is the API running?")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setToken(null)
    setPassword("")
    setPosts([])
  }

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/blogs", { headers: authHeaders() })
      if (res.status === 401 || res.status === 403) {
        handleLogout()
        return
      }
      if (res.ok) {
        const data = await res.json() as { posts: BlogPost[] }
        setPosts(data.posts || [])
      }
    } catch {
      // ignore network errors
    } finally {
      setIsLoading(false)
    }
  }

  const openCreate = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", tags: "", is_published: false })
    setEditingPost(null)
    setIsCreating(true)
  }

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(", "),
      is_published: post.is_published,
    })
    setEditingPost(post)
    setIsCreating(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus("saving")
    const payload = {
      ...form,
      published: form.is_published,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      ...(editingPost ? { id: editingPost.id } : {}),
    }
    try {
      const res = await fetch("/api/admin/blogs", {
        method: editingPost ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSaveStatus("saved")
        setIsCreating(false)
        await fetchPosts()
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("error")
      }
    } catch {
      setSaveStatus("error")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return
    try {
      await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE", headers: authHeaders() })
      await fetchPosts()
    } catch {
      // ignore
    }
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ...post, published: !post.is_published }),
      })
      await fetchPosts()
    } catch {
      // ignore
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Admin Panel</CardTitle>
                <p className="text-xs text-muted-foreground">LoanMatters Blog Management</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
                {authError && <p className="text-xs text-destructive">{authError}</p>}
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">LoanMatters Admin</h1>
            <p className="text-xs text-muted-foreground">Blog Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className="gap-2 text-muted-foreground">
            <Globe className="w-4 h-4" />
            View Blog
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {isCreating ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                {editingPost ? "Edit Post" : "New Blog Post"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="post-url-slug" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Excerpt</Label>
                  <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short description for the listing" />
                </div>
                <div className="space-y-1.5">
                  <Label>Content (Markdown)</Label>
                  <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your post in markdown..." className="min-h-[300px] font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tags (comma separated)</Label>
                    <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="education loan, SBI, abroad" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <div className="flex items-center gap-3 h-10">
                      <Button
                        type="button"
                        variant={form.is_published ? "default" : "outline"}
                        size="sm"
                        onClick={() => setForm({ ...form, is_published: !form.is_published })}
                      >
                        {form.is_published ? "Published" : "Draft"}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={saveStatus === "saving"}>
                    {saveStatus === "saving" ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : "Save Post"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                  {saveStatus === "saved" && <span className="text-sm text-green-600">Saved!</span>}
                  {saveStatus === "error" && <span className="text-sm text-destructive">Save failed — check server auth</span>}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Blog Posts</h2>
                <p className="text-sm text-muted-foreground">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
              </div>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="w-10 h-10 mb-3 opacity-40" />
                  <p className="font-medium">No posts yet</p>
                  <p className="text-sm">Create your first blog post to get started</p>
                  <Button onClick={openCreate} className="mt-4 gap-2" variant="outline">
                    <Plus className="w-4 h-4" />
                    New Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="space-y-1 flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                          <Badge variant={post.is_published ? "default" : "secondary"} className="shrink-0">
                            {post.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">/blog/{post.slug}</p>
                        <div className="flex gap-1 flex-wrap">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handleTogglePublish(post)} title={post.is_published ? "Unpublish" : "Publish"}>
                          {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
