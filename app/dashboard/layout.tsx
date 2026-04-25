import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | LoanMatters - AI-Powered Education Loan Clarity',
  description: 'Access powerful tools to estimate costs, calculate ROI, compare loans, and get AI-powered insights for your education financing decisions.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
