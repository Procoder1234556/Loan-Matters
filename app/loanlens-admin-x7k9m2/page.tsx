"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { IMAGES } from "@/lib/images"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Loader2, 
  Save, 
  X,
  FileText,
  Star,
  Clock,
  Image as ImageIcon
} from "lucide-react"

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  category: string
  tags: string[]
  author_name: string
  author_avatar: string | null
  read_time: number
  is_published: boolean
  is_featured: boolean
  views: number
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  "Education Loans",
  "Study Abroad",
  "STEM Careers",
  "Financial Planning",
  "Scholarships",
  "Visa Guide",
  "University Guide",
  "General",
]

const DEFAULT_BLOG: Partial<Blog> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "General",
  tags: [],
  author_name: "LoanMatters Team",
  author_avatar: "",
  read_time: 5,
  is_published: false,
  is_featured: false,
}

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blogs")
      const data = await res.json()
      if (data.blogs) {
        setBlogs(data.blogs)
      }
    } catch {
      setError("Failed to fetch blogs")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    if (editingBlog) {
      setEditingBlog({
        ...editingBlog,
        title,
        slug: editingBlog.id ? editingBlog.slug : generateSlug(title),
      })
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && editingBlog) {
      const currentTags = editingBlog.tags || []
      if (!currentTags.includes(tagInput.trim())) {
        setEditingBlog({
          ...editingBlog,
          tags: [...currentTags, tagInput.trim()],
        })
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (editingBlog) {
      setEditingBlog({
        ...editingBlog,
        tags: (editingBlog.tags || []).filter((t) => t !== tag),
      })
    }
  }

  const handleSave = async () => {
    if (!editingBlog) return
    
    setSaving(true)
    setError(null)

    try {
      const method = editingBlog.id ? "PUT" : "POST"
      const res = await fetch("/api/admin/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBlog),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to save blog")
      }

      await fetchBlogs()
      setEditingBlog(null)
      setIsCreating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save blog")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      await fetchBlogs()
    } catch {
      setError("Failed to delete blog")
    }
  }

  const startCreating = () => {
    setEditingBlog({ ...DEFAULT_BLOG })
    setIsCreating(true)
  }

  const startEditing = (blog: Blog) => {
    setEditingBlog({ ...blog })
    setIsCreating(false)
  }

  const cancelEditing = () => {
    setEditingBlog(null)
    setIsCreating(false)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Blog Admin</h1>
              <p className="text-sm text-muted-foreground">Manage your blog posts</p>
            </div>
          </div>
          <Button onClick={startCreating} disabled={!!editingBlog}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editor Panel */}
        {editingBlog && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>{isCreating ? "Create New Post" : "Edit Post"}</CardTitle>
              <CardDescription>
                Fill in the blog post details using the predefined schema below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title & Slug */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editingBlog.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter blog title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={editingBlog.slug || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    placeholder="url-friendly-slug"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt * (Short description for cards)</Label>
                <Textarea
                  id="excerpt"
                  value={editingBlog.excerpt || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  placeholder="Brief summary of the blog post (150-200 characters)"
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content * (Supports Markdown)</Label>
                <Textarea
                  id="content"
                  value={editingBlog.content || ""}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  placeholder="Write your blog content here... Supports Markdown formatting."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              {/* Cover Image & Category */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cover_image"
                      value={editingBlog.cover_image || ""}
                      onChange={(e) => setEditingBlog({ ...editingBlog, cover_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button variant="outline" size="icon">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={editingBlog.category || "General"}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {(editingBlog.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Author & Read Time */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author_name">Author Name</Label>
                  <Input
                    id="author_name"
                    value={editingBlog.author_name || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author_name: e.target.value })}
                    placeholder="Author name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author_avatar">Author Avatar URL</Label>
                  <Input
                    id="author_avatar"
                    value={editingBlog.author_avatar || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author_avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="read_time">Read Time (minutes)</Label>
                  <Input
                    id="read_time"
                    type="number"
                    min={1}
                    value={editingBlog.read_time || 5}
                    onChange={(e) => setEditingBlog({ ...editingBlog, read_time: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_published"
                    checked={editingBlog.is_published || false}
                    onCheckedChange={(checked) => setEditingBlog({ ...editingBlog, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_featured"
                    checked={editingBlog.is_featured || false}
                    onCheckedChange={(checked) => setEditingBlog({ ...editingBlog, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Post
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Posts ({blogs.length})</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : blogs.length === 0 ? (
            <Card className="bg-card/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="relative w-32 h-32 mb-4 opacity-30">
                  <Image src={IMAGES.ai} alt="No posts" fill className="object-contain" />
                </div>
                <FileText className="w-12 h-12 mb-4" />
                <p>No blog posts yet. Create your first post!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {blogs.map((blog) => (
                <Card key={blog.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {blog.cover_image && (
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                          <Image
                            src={blog.cover_image}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{blog.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{blog.excerpt}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {blog.is_featured && (
                              <Badge variant="default" className="gap-1">
                                <Star className="w-3 h-3" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant={blog.is_published ? "default" : "secondary"}>
                              {blog.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{blog.category}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {blog.read_time} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {blog.views} views
                          </span>
                          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/blog/${blog.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => startEditing(blog)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
