import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Blog } from "@/lib/types"
import type { Metadata } from "next"
import { IMAGES } from "@/lib/images"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getBlog(slug: string): Promise<Blog | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error || !data) {
    return null
  }

  // Increment view count (fire and forget)
  supabase
    .from("blogs")
    .update({ views: data.views + 1 })
    .eq("id", data.id)
    .then(() => {})

  return data
}

async function getRelatedBlogs(currentBlog: Blog): Promise<Blog[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .eq("category", currentBlog.category)
    .neq("id", currentBlog.id)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    return {
      title: "Blog Not Found | LoanMatters",
    }
  }

  return {
    title: `${blog.title} | LoanMatters Blog`,
    description: blog.excerpt,
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    notFound()
  }

  const relatedBlogs = await getRelatedBlogs(blog)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Blog</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 opacity-0 animate-fade-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Badge>{blog.category}</Badge>
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {blog.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">{blog.excerpt}</p>

          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {blog.author_avatar ? (
                  <Image
                    src={blog.author_avatar}
                    alt={blog.author_name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{blog.author_name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(blog.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {blog.read_time} min read
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{blog.views.toLocaleString()} views</div>
          </div>
        </header>

        {/* Cover Image */}
        {blog.cover_image && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 opacity-0 animate-fade-slide-up animation-delay-100">
            <Image src={blog.cover_image} alt={blog.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none opacity-0 animate-fade-slide-up animation-delay-200
            prose-headings:text-foreground prose-headings:font-semibold
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground
            prose-code:bg-secondary prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-secondary prose-pre:text-foreground"
          dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, "<br />") }}
        />

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-border opacity-0 animate-fade-slide-up animation-delay-300">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Author Card */}
        <Card className="mt-12 opacity-0 animate-fade-slide-up animation-delay-400">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {blog.author_avatar ? (
                  <Image
                    src={blog.author_avatar}
                    alt={blog.author_name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Written by {blog.author_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Expert insights on education loans, study abroad, and financial planning for STEM
                  students.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </article>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedBlogs.map((relatedBlog, i) => (
              <Link key={relatedBlog.id} href={`/blog/${relatedBlog.slug}`}>
                <Card
                  className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative h-40 bg-secondary">
                    {relatedBlog.cover_image ? (
                      <Image
                        src={relatedBlog.cover_image}
                        alt={relatedBlog.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src={IMAGES.globe}
                          alt="Blog placeholder"
                          fill
                          className="object-cover opacity-20"
                        />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="outline" className="text-xs mb-2">
                      {relatedBlog.category}
                    </Badge>
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedBlog.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Articles</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Go to Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LoanMatters. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
