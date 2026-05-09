import { Router } from "express"
import type { Request, Response, NextFunction } from "express"
import { randomUUID } from "crypto"

const router = Router()

interface BlogPost {
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

const posts: Map<string, BlogPost> = new Map()

// ── Server-side admin auth ──────────────────────────────────────────────────
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    res.status(503).json({ error: "Admin not configured: set ADMIN_PASSWORD env var" })
    return
  }
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" })
    return
  }
  const token = auth.slice(7)
  if (token !== adminPassword) {
    res.status(403).json({ error: "Invalid admin password" })
    return
  }
  next()
}

// ── Public read endpoints (no auth) ─────────────────────────────────────────

// GET /api/blogs  — all published posts
router.get("/blogs", (_req: Request, res: Response) => {
  const published = Array.from(posts.values())
    .filter((p) => p.is_published)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  res.json({ posts: published })
})

// GET /api/blogs/:slug  — single published post by slug
router.get("/blogs/:slug", (req: Request, res: Response): void => {
  const { slug } = req.params
  const post = Array.from(posts.values()).find((p) => p.slug === slug && p.is_published)
  if (!post) {
    res.status(404).json({ error: "Post not found" })
    return
  }
  posts.set(post.id, { ...post, views: post.views + 1 })
  res.json({ post })
})

// ── Admin CRUD endpoints (auth required) ─────────────────────────────────────

// GET /api/admin/blogs
router.get("/admin/blogs", requireAdminAuth, (_req: Request, res: Response) => {
  const all = Array.from(posts.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  res.json({ posts: all })
})

// POST /api/admin/blogs
router.post("/admin/blogs", requireAdminAuth, (req: Request, res: Response): void => {
  const { title, slug, excerpt, content, tags, published, cover_image, category,
          author_name, author_avatar, read_time, is_featured } = req.body
  if (!title || !slug) {
    res.status(400).json({ error: "title and slug are required" })
    return
  }
  const now = new Date().toISOString()
  const post: BlogPost = {
    id: randomUUID(),
    title,
    slug,
    excerpt: excerpt || "",
    content: content || "",
    cover_image: cover_image || null,
    category: category || "Education Loans",
    tags: Array.isArray(tags) ? tags : [],
    author_name: author_name || "LoanMatters Team",
    author_avatar: author_avatar || null,
    read_time: typeof read_time === "number" ? read_time : 5,
    is_published: Boolean(published),
    is_featured: Boolean(is_featured),
    views: 0,
    created_at: now,
    updated_at: now,
  }
  posts.set(post.id, post)
  res.status(201).json({ post })
})

// PUT /api/admin/blogs
router.put("/admin/blogs", requireAdminAuth, (req: Request, res: Response): void => {
  const { id, title, slug, excerpt, content, tags, published, cover_image, category,
          author_name, author_avatar, read_time, is_featured } = req.body
  if (!id || !posts.has(id)) {
    res.status(404).json({ error: "Post not found" })
    return
  }
  const existing = posts.get(id)!
  const updated: BlogPost = {
    ...existing,
    title: title ?? existing.title,
    slug: slug ?? existing.slug,
    excerpt: excerpt ?? existing.excerpt,
    content: content ?? existing.content,
    cover_image: cover_image !== undefined ? cover_image : existing.cover_image,
    category: category ?? existing.category,
    tags: Array.isArray(tags) ? tags : existing.tags,
    author_name: author_name ?? existing.author_name,
    author_avatar: author_avatar !== undefined ? author_avatar : existing.author_avatar,
    read_time: typeof read_time === "number" ? read_time : existing.read_time,
    is_published: typeof published === "boolean" ? published : existing.is_published,
    is_featured: typeof is_featured === "boolean" ? is_featured : existing.is_featured,
    updated_at: new Date().toISOString(),
  }
  posts.set(id, updated)
  res.json({ post: updated })
})

// DELETE /api/admin/blogs?id=<id>
router.delete("/admin/blogs", requireAdminAuth, (req: Request, res: Response): void => {
  const id = req.query.id as string
  if (!id || !posts.has(id)) {
    res.status(404).json({ error: "Post not found" })
    return
  }
  posts.delete(id)
  res.json({ success: true })
})

export default router
