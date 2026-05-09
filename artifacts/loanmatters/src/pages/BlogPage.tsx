import { useState, useEffect } from "react"
import { Link } from "wouter"
import { ArrowLeft, Calendar, Clock, Tag, BookOpen, ArrowRight, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IMAGES } from "@/lib/images"
import type { Blog } from "@/lib/types"
import { BLOG_CATEGORIES } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      const supabase = createClient()
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data } = await supabase.from("blogs").select("*").eq("is_published", true).order("created_at", { ascending: false })
      const { data: featured } = await supabase.from("blogs").select("*").eq("is_published", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(3)
      setBlogs(data || [])
      setFeaturedBlogs(featured || [])
      setLoading(false)
    }
    fetchBlogs()
  }, [])

  const filteredBlogs = selectedCategory ? blogs.filter(b => b.category === selectedCategory) : blogs

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
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button className="rounded-full px-6">Dashboard <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Education Loan Insights
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">LoanMatters Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Expert insights on education loans, study abroad tips, and career planning for STEM students.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setSelectedCategory(null)}>All</Button>
          {BLOG_CATEGORIES.map(cat => (
            <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border animate-pulse">
                <div className="h-48 bg-secondary rounded-t-2xl" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No articles yet</h3>
            <p className="text-muted-foreground">Check back soon for expert insights on education loans and study abroad.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
                  <div className="h-48 bg-secondary overflow-hidden">
                    <img
                      src={blog.cover_image || IMAGES.blog}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{blog.category}</Badge>
                      {blog.is_featured && <Badge className="text-xs bg-primary">Featured</Badge>}
                    </div>
                    <h2 className="font-bold text-foreground line-clamp-2 text-lg">{blog.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(blog.created_at)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.read_time} min</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
