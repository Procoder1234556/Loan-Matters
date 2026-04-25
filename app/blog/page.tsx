import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Tag, Search, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Blog } from "@/lib/types"
import { BLOG_CATEGORIES } from "@/lib/types"
import { IMAGES } from "@/lib/images"

export const revalidate = 60

async function getBlogs(): Promise<Blog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching blogs:", error)
    return []
  }

  return data || []
}

async function getFeaturedBlogs(): Promise<Blog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error fetching featured blogs:", error)
    return []
  }

  return data || []
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPage() {
  const [blogs, featuredBlogs] = await Promise.all([getBlogs(), getFeaturedBlogs()])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-foreground">LoanMatters</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src={IMAGES.ai}
            alt="Blog illustration"
            fill
            className="object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 opacity-0 animate-fade-slide-up">
            LoanMatters <span className="text-primary">Blog</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 opacity-0 animate-fade-slide-up animation-delay-100">
            Insights, guides, and tips for STEM students planning their education abroad
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto opacity-0 animate-fade-slide-up animation-delay-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-12 py-6 text-lg rounded-2xl bg-card border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide opacity-0 animate-fade-slide-up animation-delay-300">
            <Badge variant="default" className="whitespace-nowrap cursor-pointer">All Posts</Badge>
            {BLOG_CATEGORIES.map((category) => (
              <Badge key={category} variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-secondary">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredBlogs.length > 0 && (
        <section className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 opacity-0 animate-fade-slide-up">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredBlogs.map((blog, i) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="relative h-48 bg-secondary">
                      {blog.cover_image ? (
                        <Image
                          src={blog.cover_image}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={IMAGES.success}
                            alt="Blog placeholder"
                            fill
                            className="object-cover opacity-30"
                          />
                        </div>
                      )}
                      <Badge className="absolute top-4 left-4 bg-primary">{blog.category}</Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{blog.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {blog.read_time} min read
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 opacity-0 animate-fade-slide-up">All Articles</h2>
          
          {blogs.length === 0 ? (
            <Card className="opacity-0 animate-fade-slide-up">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative w-32 h-32 mb-6">
                  <Image
                    src={IMAGES.ai}
                    alt="No blogs"
                    fill
                    className="object-cover opacity-50"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No articles yet</h3>
                <p className="text-muted-foreground">Check back soon for new content!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, i) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="relative h-40 bg-secondary">
                      {blog.cover_image ? (
                        <Image
                          src={blog.cover_image}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={IMAGES.calculator}
                            alt="Blog placeholder"
                            fill
                            className="object-cover opacity-20"
                          />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{blog.category}</Badge>
                        {blog.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs text-muted-foreground flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{blog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {blog.read_time} min
                        </span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          Read more <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LoanMatters. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
