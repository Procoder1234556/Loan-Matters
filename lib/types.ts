export interface Blog {
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

export interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  tags: string[]
  author_name: string
  author_avatar: string
  read_time: number
  is_published: boolean
  is_featured: boolean
}

export const BLOG_CATEGORIES = [
  "Education Loans",
  "Study Abroad",
  "Financial Planning",
  "Scholarships",
  "Career Guidance",
  "University Reviews",
  "Visa & Immigration",
  "Student Life",
] as const

export const DEFAULT_BLOG_FORM: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "Education Loans",
  tags: [],
  author_name: "LoanMatters Team",
  author_avatar: "",
  read_time: 5,
  is_published: false,
  is_featured: false,
}
