// Unsplash images for the application
// Using direct Unsplash URLs for high-quality, free images

export const IMAGES = {
  // Hero and success illustrations
  hero: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Graduation celebration
  success: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80", // Team success

  // Calculator and finance
  calculator: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80", // Calculator with papers
  chart: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", // Analytics chart
  money: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80", // Money growth

  // Global and comparison
  globe: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", // World globe
  compare: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80", // Decision making

  // AI and technology
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", // AI concept

  // Education
  education: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80", // Students
  university: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80", // University campus

  // Blog and content
  blog: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80", // Writing desk

  // Profile and user
  profile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", // Professional

  // Loan and banking
  loan: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80", // Banking
  bank: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&q=80", // Bank building
}

// Map old image names to new Unsplash URLs
export const IMAGE_MAP: Record<string, string> = {
  "/stick-hero.jpg": IMAGES.hero,
  "/stick-success.jpg": IMAGES.success,
  "/stick-calculator.jpg": IMAGES.calculator,
  "/stick-chart.jpg": IMAGES.chart,
  "/stick-money.jpg": IMAGES.money,
  "/stick-globe.jpg": IMAGES.globe,
  "/stick-compare.jpg": IMAGES.compare,
  "/stick-ai.jpg": IMAGES.ai,
  "/hero-illustration.jpg": IMAGES.hero,
}
