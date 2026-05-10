import { useState, useEffect } from "react"
import { Link, useParams } from "wouter"
import { ArrowLeft, Calendar, Clock, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IMAGES } from "@/lib/images"
import type { Blog } from "@/lib/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}`)
        if (res.ok) {
          const data = await res.json() as { post: Blog }
          setBlog(data.post)
        }
      } catch {
        // API unavailable — blog stays null
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Article not found</h1>
        <Link href="/blog"><Button>Back to Blog</Button></Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">LoanMatters</span>
          </Link>
          <Link href="/blog">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-12">
        {blog.cover_image && (
          <div className="h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="secondary">{blog.category}</Badge>
          {blog.tags?.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{blog.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{blog.excerpt}</p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground pb-6 border-b border-border mb-8">
          <div className="flex items-center gap-2">
            {blog.author_avatar ? (
              <img src={blog.author_avatar} alt={blog.author_name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {blog.author_name[0]}
              </div>
            )}
            <span>{blog.author_name}</span>
          </div>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(blog.created_at)}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{blog.read_time} min read</span>
        </div>

        <div
          className="prose prose-lg max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
        />
      </article>
    </div>
  )
}
