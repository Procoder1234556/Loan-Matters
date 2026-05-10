import { useState, useMemo } from "react"
import { Link } from "wouter"
import { ArrowRight, IndianRupee } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

function calcEMI(principal: number, annualRate: number, months: number): number {
  if (months === 0 || annualRate === 0) return principal / (months || 1)
  const r = annualRate / 12 / 100
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function formatINR(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${n.toLocaleString("en-IN")}`
}

function SliderRow({
  label, value, min, max, step, onChange, display,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; display: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
          {display}
        </span>
      </div>
      <div className="relative py-1">
        <div className="h-1.5 bg-gray-200 rounded-full">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ WebkitAppearance: "none" }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow -translate-y-1/2 pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{min >= 100000 ? formatINR(min) : min}{label.includes("Rate") ? "%" : label.includes("Tenure") ? " Yr" : ""}</span>
        <span>{max >= 100000 ? formatINR(max) : max}{label.includes("Rate") ? "%" : label.includes("Tenure") ? " Yr" : ""}</span>
      </div>
    </div>
  )
}

export function HeroEmiCalculator() {
  const [amount, setAmount] = useState(2_000_000)
  const [rate, setRate] = useState(10)
  const [tenure, setTenure] = useState(10)

  const months = tenure * 12
  const emi = useMemo(() => calcEMI(amount, rate, months), [amount, rate, months])
  const totalPayable = emi * months
  const totalInterest = totalPayable - amount

  const pieData = [
    { name: "Principal", value: amount },
    { name: "Interest", value: Math.round(totalInterest) },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-4">
        <h3 className="text-white font-bold text-lg">Education Loan EMI Calculator</h3>
        <p className="text-blue-100 text-sm mt-0.5">Instant results — no signup needed</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Sliders */}
        <SliderRow
          label="Loan Amount"
          value={amount} min={100_000} max={7_500_000} step={50_000}
          onChange={setAmount}
          display={formatINR(amount)}
        />
        <SliderRow
          label="Interest Rate"
          value={rate} min={7} max={16} step={0.1}
          onChange={setRate}
          display={`${rate.toFixed(1)}%`}
        />
        <SliderRow
          label="Loan Tenure"
          value={tenure} min={1} max={15} step={1}
          onChange={setTenure}
          display={`${tenure} Yr`}
        />

        {/* EMI Result + Pie */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Monthly EMI</p>
              <p className="text-3xl font-black text-blue-700 leading-tight">{formatINR(Math.round(emi))}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide">Total Interest</p>
                <p className="text-sm font-bold text-orange-700 mt-0.5">{formatINR(Math.round(totalInterest))}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wide">Total Payable</p>
                <p className="text-sm font-bold text-green-700 mt-0.5">{formatINR(Math.round(totalPayable))}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />Principal</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />Interest</span>
            </div>
          </div>

          {/* Pie chart */}
          <div className="w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={52} dataKey="value" strokeWidth={0}>
                  <Cell fill="#2563eb" />
                  <Cell fill="#fb923c" />
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA */}
        <Link href="/dashboard">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            Compare Lenders & Apply
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  )
}
