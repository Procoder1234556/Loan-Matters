import { Router } from "express"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"

const router = Router()

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  createdAt: string
  tags: string[]
}

const posts: Map<string, BlogPost> = new Map()

// GET /api/admin/blogs
router.get("/admin/blogs", (_req: Request, res: Response) => {
  const all = Array.from(posts.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  res.json({ posts: all })
})

// POST /api/admin/blogs
router.post("/admin/blogs", (req: Request, res: Response): void => {
  const { title, slug, excerpt, content, tags, published } = req.body
  if (!title || !slug) {
    res.status(400).json({ error: "title and slug are required" })
    return
  }
  const post: BlogPost = {
    id: randomUUID(),
    title,
    slug,
    excerpt: excerpt || "",
    content: content || "",
    tags: Array.isArray(tags) ? tags : [],
    published: Boolean(published),
    createdAt: new Date().toISOString(),
  }
  posts.set(post.id, post)
  res.status(201).json({ post })
})

// PUT /api/admin/blogs
router.put("/admin/blogs", (req: Request, res: Response): void => {
  const { id, title, slug, excerpt, content, tags, published } = req.body
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
    tags: Array.isArray(tags) ? tags : existing.tags,
    published: typeof published === "boolean" ? published : existing.published,
  }
  posts.set(id, updated)
  res.json({ post: updated })
})

// DELETE /api/admin/blogs?id=<id>
router.delete("/admin/blogs", (req: Request, res: Response): void => {
  const id = req.query.id as string
  if (!id || !posts.has(id)) {
    res.status(404).json({ error: "Post not found" })
    return
  }
  posts.delete(id)
  res.json({ success: true })
})

export default router
