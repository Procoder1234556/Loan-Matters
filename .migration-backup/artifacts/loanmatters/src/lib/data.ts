// Loan Providers Data
export const loanProviders = [
  {
    id: "sbi",
    name: "SBI Scholar Loan",
    logo: "SBI",
    interestRate: 8.15,
    processingFee: "0.5%",
    processingFeeMin: 10000,
    processingFeeMax: 50000,
    collateralRequired: "Required for loans > ₹7.5L",
    maxAmount: 15000000,
    moratoriumPeriod: "Course + 12 months",
    repaymentTenure: "Up to 15 years",
    features: ["No prepayment penalty", "Tax benefits under Sec 80E", "Lower rates for girls"],
    recommended: true,
  },
  {
    id: "hdfc-credila",
    name: "HDFC Credila",
    logo: "HDFC",
    interestRate: 10.5,
    processingFee: "1-2%",
    processingFeeMin: 15000,
    processingFeeMax: null,
    collateralRequired: "Required for most loans",
    maxAmount: 45000000,
    moratoriumPeriod: "Course + 6 months",
    repaymentTenure: "Up to 10 years",
    features: ["100% finance available", "Quick disbursement", "Wide university coverage"],
    recommended: false,
  },
  {
    id: "axis",
    name: "Axis Bank Education Loan",
    logo: "AXIS",
    interestRate: 13.5,
    processingFee: "1%",
    processingFeeMin: 10000,
    processingFeeMax: null,
    collateralRequired: "Required for loans > ₹4L",
    maxAmount: 75000000,
    moratoriumPeriod: "Course + 6 months",
    repaymentTenure: "Up to 15 years",
    features: ["Doorstep service", "Flexible repayment", "Online tracking"],
    recommended: false,
  },
  {
    id: "avanse",
    name: "Avanse Education Loan",
    logo: "AVANSE",
    interestRate: 11.0,
    processingFee: "1-2%",
    processingFeeMin: 15000,
    processingFeeMax: null,
    collateralRequired: "Case by case basis",
    maxAmount: 100000000,
    moratoriumPeriod: "Course + 6 months",
    repaymentTenure: "Up to 12 years",
    features: ["No upper limit on loan", "Part-time work income considered", "Fast approval"],
    recommended: false,
  },
  {
    id: "icici",
    name: "ICICI Bank Student Loan",
    logo: "ICICI",
    interestRate: 10.75,
    processingFee: "1%",
    processingFeeMin: 10000,
    processingFeeMax: 50000,
    collateralRequired: "Required for loans > ₹20L",
    maxAmount: 100000000,
    moratoriumPeriod: "Course + 6 months",
    repaymentTenure: "Up to 10 years",
    features: ["Digital process", "Scholarship benefits", "Insurance coverage"],
    recommended: false,
  },
]

// University Cost Data (estimates in INR)
export const universityCosts: Record<string, Record<string, {
  tuition: number
  living: number
  visa: number
  travel: number
  misc: number
  scholarshipAvg: number
}>> = {
  USA: {
    "Computer Science": { tuition: 4500000, living: 1500000, visa: 15000, travel: 120000, misc: 200000, scholarshipAvg: 1000000 },
    "Data Science": { tuition: 4200000, living: 1500000, visa: 15000, travel: 120000, misc: 200000, scholarshipAvg: 800000 },
    "Mechanical Engineering": { tuition: 4000000, living: 1500000, visa: 15000, travel: 120000, misc: 200000, scholarshipAvg: 600000 },
    "Civil Engineering": { tuition: 3800000, living: 1500000, visa: 15000, travel: 120000, misc: 200000, scholarshipAvg: 500000 },
    "Biotechnology": { tuition: 4000000, living: 1500000, visa: 15000, travel: 120000, misc: 200000, scholarshipAvg: 700000 },
    "Electrical Engineering": { tuition: 4200000, living: 1500000, visa: 15000, travel: 120000, misc: 200000, scholarshipAvg: 750000 },
  },
  UK: {
    "Computer Science": { tuition: 3200000, living: 1200000, visa: 25000, travel: 80000, misc: 150000, scholarshipAvg: 500000 },
    "Data Science": { tuition: 3000000, living: 1200000, visa: 25000, travel: 80000, misc: 150000, scholarshipAvg: 400000 },
    "Mechanical Engineering": { tuition: 2800000, living: 1200000, visa: 25000, travel: 80000, misc: 150000, scholarshipAvg: 350000 },
    "Civil Engineering": { tuition: 2600000, living: 1200000, visa: 25000, travel: 80000, misc: 150000, scholarshipAvg: 300000 },
    "Biotechnology": { tuition: 2900000, living: 1200000, visa: 25000, travel: 80000, misc: 150000, scholarshipAvg: 400000 },
    "Electrical Engineering": { tuition: 3000000, living: 1200000, visa: 25000, travel: 80000, misc: 150000, scholarshipAvg: 450000 },
  },
  Canada: {
    "Computer Science": { tuition: 2800000, living: 1100000, visa: 15000, travel: 100000, misc: 150000, scholarshipAvg: 400000 },
    "Data Science": { tuition: 2600000, living: 1100000, visa: 15000, travel: 100000, misc: 150000, scholarshipAvg: 350000 },
    "Mechanical Engineering": { tuition: 2400000, living: 1100000, visa: 15000, travel: 100000, misc: 150000, scholarshipAvg: 300000 },
    "Civil Engineering": { tuition: 2300000, living: 1100000, visa: 15000, travel: 100000, misc: 150000, scholarshipAvg: 250000 },
    "Biotechnology": { tuition: 2500000, living: 1100000, visa: 15000, travel: 100000, misc: 150000, scholarshipAvg: 350000 },
    "Electrical Engineering": { tuition: 2600000, living: 1100000, visa: 15000, travel: 100000, misc: 150000, scholarshipAvg: 350000 },
  },
  Germany: {
    "Computer Science": { tuition: 150000, living: 900000, visa: 20000, travel: 70000, misc: 120000, scholarshipAvg: 200000 },
    "Data Science": { tuition: 150000, living: 900000, visa: 20000, travel: 70000, misc: 120000, scholarshipAvg: 180000 },
    "Mechanical Engineering": { tuition: 100000, living: 900000, visa: 20000, travel: 70000, misc: 120000, scholarshipAvg: 150000 },
    "Civil Engineering": { tuition: 100000, living: 900000, visa: 20000, travel: 70000, misc: 120000, scholarshipAvg: 120000 },
    "Biotechnology": { tuition: 150000, living: 900000, visa: 20000, travel: 70000, misc: 120000, scholarshipAvg: 180000 },
    "Electrical Engineering": { tuition: 120000, living: 900000, visa: 20000, travel: 70000, misc: 120000, scholarshipAvg: 160000 },
  },
  Australia: {
    "Computer Science": { tuition: 3500000, living: 1300000, visa: 35000, travel: 90000, misc: 180000, scholarshipAvg: 600000 },
    "Data Science": { tuition: 3300000, living: 1300000, visa: 35000, travel: 90000, misc: 180000, scholarshipAvg: 500000 },
    "Mechanical Engineering": { tuition: 3100000, living: 1300000, visa: 35000, travel: 90000, misc: 180000, scholarshipAvg: 400000 },
    "Civil Engineering": { tuition: 2900000, living: 1300000, visa: 35000, travel: 90000, misc: 180000, scholarshipAvg: 350000 },
    "Biotechnology": { tuition: 3200000, living: 1300000, visa: 35000, travel: 90000, misc: 180000, scholarshipAvg: 450000 },
    "Electrical Engineering": { tuition: 3300000, living: 1300000, visa: 35000, travel: 90000, misc: 180000, scholarshipAvg: 500000 },
  },
}

// Salary Estimates (Annual in INR, post-graduation in respective countries)
export const salaryEstimates: Record<string, Record<string, { min: number; max: number; median: number }>> = {
  USA: {
    "Computer Science": { min: 7500000, max: 15000000, median: 10000000 },
    "Data Science": { min: 7000000, max: 14000000, median: 9500000 },
    "Mechanical Engineering": { min: 5500000, max: 10000000, median: 7000000 },
    "Civil Engineering": { min: 5000000, max: 9000000, median: 6500000 },
    "Biotechnology": { min: 5500000, max: 11000000, median: 7500000 },
    "Electrical Engineering": { min: 6000000, max: 12000000, median: 8500000 },
  },
  UK: {
    "Computer Science": { min: 4500000, max: 9000000, median: 6000000 },
    "Data Science": { min: 4200000, max: 8500000, median: 5800000 },
    "Mechanical Engineering": { min: 3500000, max: 7000000, median: 4800000 },
    "Civil Engineering": { min: 3200000, max: 6500000, median: 4500000 },
    "Biotechnology": { min: 3500000, max: 7500000, median: 5000000 },
    "Electrical Engineering": { min: 3800000, max: 7800000, median: 5200000 },
  },
  Canada: {
    "Computer Science": { min: 5000000, max: 10000000, median: 7000000 },
    "Data Science": { min: 4800000, max: 9500000, median: 6800000 },
    "Mechanical Engineering": { min: 4000000, max: 7500000, median: 5500000 },
    "Civil Engineering": { min: 3800000, max: 7000000, median: 5200000 },
    "Biotechnology": { min: 4000000, max: 8000000, median: 5800000 },
    "Electrical Engineering": { min: 4200000, max: 8500000, median: 6000000 },
  },
  Germany: {
    "Computer Science": { min: 4000000, max: 8000000, median: 5500000 },
    "Data Science": { min: 3800000, max: 7500000, median: 5200000 },
    "Mechanical Engineering": { min: 3500000, max: 7000000, median: 5000000 },
    "Civil Engineering": { min: 3200000, max: 6000000, median: 4500000 },
    "Biotechnology": { min: 3500000, max: 7000000, median: 5000000 },
    "Electrical Engineering": { min: 3600000, max: 7200000, median: 5200000 },
  },
  Australia: {
    "Computer Science": { min: 5500000, max: 11000000, median: 7500000 },
    "Data Science": { min: 5200000, max: 10500000, median: 7200000 },
    "Mechanical Engineering": { min: 4500000, max: 8500000, median: 6000000 },
    "Civil Engineering": { min: 4200000, max: 8000000, median: 5800000 },
    "Biotechnology": { min: 4500000, max: 9000000, median: 6200000 },
    "Electrical Engineering": { min: 4800000, max: 9500000, median: 6500000 },
  },
}

// ROI Heatmap Data
export type ROILevel = "high" | "medium" | "low"

export const roiHeatmap: Record<string, Record<string, { score: number; level: ROILevel }>> = {
  USA: {
    "CS/AI": { score: 92, level: "high" },
    "Data Science": { score: 88, level: "high" },
    "Mechanical": { score: 65, level: "medium" },
    "Civil": { score: 55, level: "medium" },
    "Biotech": { score: 70, level: "medium" },
    "EE": { score: 78, level: "high" },
  },
  UK: {
    "CS/AI": { score: 75, level: "high" },
    "Data Science": { score: 72, level: "medium" },
    "Mechanical": { score: 55, level: "medium" },
    "Civil": { score: 48, level: "low" },
    "Biotech": { score: 60, level: "medium" },
    "EE": { score: 65, level: "medium" },
  },
  Canada: {
    "CS/AI": { score: 82, level: "high" },
    "Data Science": { score: 78, level: "high" },
    "Mechanical": { score: 60, level: "medium" },
    "Civil": { score: 55, level: "medium" },
    "Biotech": { score: 65, level: "medium" },
    "EE": { score: 70, level: "medium" },
  },
  Germany: {
    "CS/AI": { score: 88, level: "high" },
    "Data Science": { score: 85, level: "high" },
    "Mechanical": { score: 80, level: "high" },
    "Civil": { score: 72, level: "medium" },
    "Biotech": { score: 75, level: "high" },
    "EE": { score: 82, level: "high" },
  },
  Australia: {
    "CS/AI": { score: 78, level: "high" },
    "Data Science": { score: 75, level: "high" },
    "Mechanical": { score: 58, level: "medium" },
    "Civil": { score: 52, level: "medium" },
    "Biotech": { score: 62, level: "medium" },
    "EE": { score: 68, level: "medium" },
  },
}

export const countries = ["USA", "UK", "Canada", "Germany", "Australia"]
export const fields = ["Computer Science", "Data Science", "Mechanical Engineering", "Civil Engineering", "Biotechnology", "Electrical Engineering"]
export const heatmapFields = ["CS/AI", "Data Science", "Mechanical", "Civil", "Biotech", "EE"]

// Helper functions
export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`
  } else {
    return `₹${amount.toLocaleString("en-IN")}`
  }
}

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  return Math.round(emi)
}

export function calculateBreakeven(totalRepayment: number, annualSalary: number): number {
  const monthlySalary = annualSalary / 12
  const savingsRate = 0.4 // Assume 40% can be saved towards loan repayment
  const monthlySavings = monthlySalary * savingsRate
  return Math.ceil(totalRepayment / monthlySavings)
}
