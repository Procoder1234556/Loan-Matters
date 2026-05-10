import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { IndianRupee, TrendingDown } from "lucide-react"
import { loanProviders } from "@/lib/data"

function calcEMI(principal: number, annualRate: number, months: number): number {
  if (months === 0) return 0
  if (annualRate === 0) return principal / months
  const r = annualRate / 12 / 100
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function formatINR(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${Math.round(n).toLocaleString("en-IN")}`
}

function SliderRow({
  label, value, min, max, step, onChange, display, suffix,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; display: string; suffix?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <input
          type="text"
          readOnly
          value={display}
          className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 w-32 text-center cursor-default"
        />
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute left-0 right-0 h-2 bg-gray-100 rounded-full">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full cursor-pointer z-10"
          style={{
            WebkitAppearance: "none",
            appearance: "none",
            background: "transparent",
            height: "24px",
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 font-medium">
        <span>{min >= 100000 ? formatINR(min) : `${min}${suffix || ""}`}</span>
        <span>{max >= 100000 ? formatINR(max) : `${max}${suffix || ""}`}</span>
      </div>
    </div>
  )
}

export function EmiCalculator() {
  const [amount, setAmount] = useState(3_000_000)
  const [rate, setRate] = useState(10.0)
  const [tenure, setTenure] = useState(10)
  const [activeBank, setActiveBank] = useState<string | null>(null)

  const months = tenure * 12
  const emi = useMemo(() => calcEMI(amount, rate, months), [amount, rate, months])
  const totalPayable = emi * months
  const totalInterest = totalPayable - amount

  const pieData = [
    { name: "Principal", value: Math.round(amount) },
    { name: "Interest", value: Math.round(totalInterest) },
  ]

  // Year-wise breakdown for bar chart
  const yearlyData = useMemo(() => {
    const data = []
    let remaining = amount
    const monthlyRate = rate / 12 / 100
    for (let yr = 1; yr <= tenure; yr++) {
      let principal = 0
      let interest = 0
      for (let m = 0; m < 12 && remaining > 0; m++) {
        const int = remaining * monthlyRate
        const prin = Math.min(emi - int, remaining)
        interest += int
        principal += prin
        remaining -= prin
      }
      data.push({ year: `Y${yr}`, principal: Math.round(principal), interest: Math.round(interest) })
    }
    return data
  }, [amount, rate, emi, tenure])

  // Compare with all banks
  const bankComparison = loanProviders.map((bank) => {
    const bankEmi = calcEMI(amount, bank.interestRate, months)
    const bankTotal = bankEmi * months
    return { ...bank, emi: bankEmi, total: bankTotal, interest: bankTotal - amount }
  }).sort((a, b) => a.emi - b.emi)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Education Loan EMI Calculator</h2>
        <p className="text-gray-500 text-sm mt-1">Calculate your monthly installment and plan your repayment</p>
      </div>

      <div className="grid lg:grid-cols-[1fr,1fr] gap-6">
        {/* Left: Sliders */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-blue-600" />
            Loan Parameters
          </h3>

          <SliderRow
            label="Loan Amount"
            value={amount} min={100_000} max={10_000_000} step={50_000}
            onChange={setAmount}
            display={formatINR(amount)}
          />
          <SliderRow
            label="Rate of Interest (p.a.)"
            value={rate} min={7} max={16} step={0.1}
            onChange={setRate}
            display={`${rate.toFixed(1)}%`}
            suffix="%"
          />
          <SliderRow
            label="Loan Tenure"
            value={tenure} min={1} max={15} step={1}
            onChange={setTenure}
            display={`${tenure} Year${tenure > 1 ? "s" : ""}`}
            suffix=" Yr"
          />

          {/* Key metrics strip */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">Monthly EMI</p>
              <p className="text-lg font-black text-blue-700 leading-tight mt-0.5">{formatINR(Math.round(emi))}</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">Total Interest</p>
              <p className="text-lg font-black text-orange-500 leading-tight mt-0.5">{formatINR(Math.round(totalInterest))}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">Total Amount</p>
              <p className="text-lg font-black text-green-600 leading-tight mt-0.5">{formatINR(Math.round(totalPayable))}</p>
            </div>
          </div>
        </div>

        {/* Right: Pie + Year chart */}
        <div className="space-y-4">
          {/* Pie chart card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Principal vs Interest Split</h3>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                      <Cell fill="#2563eb" />
                      <Cell fill="#fb923c" />
                    </Pie>
                    <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-xs text-gray-500 font-medium">Principal Amount</span>
                  </div>
                  <p className="text-base font-bold text-blue-700 ml-5">{formatINR(amount)}</p>
                  <p className="text-[11px] text-gray-400 ml-5">{((amount / totalPayable) * 100).toFixed(0)}% of total</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <span className="text-xs text-gray-500 font-medium">Total Interest</span>
                  </div>
                  <p className="text-base font-bold text-orange-500 ml-5">{formatINR(Math.round(totalInterest))}</p>
                  <p className="text-[11px] text-gray-400 ml-5">{((totalInterest / totalPayable) * 100).toFixed(0)}% of total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              Year-wise Payment Breakup
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={42} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="principal" name="Principal" fill="#2563eb" radius={[3, 3, 0, 0]} stackId="a" />
                  <Bar dataKey="interest" name="Interest" fill="#fb923c" radius={[3, 3, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />Principal</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" />Interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Compare Lenders at Your Loan Parameters</h3>
          <span className="text-xs text-gray-400">Sorted by lowest EMI</span>
        </div>
        <div className="divide-y divide-gray-50">
          {bankComparison.map((bank, i) => {
            const isActive = activeBank === bank.id
            const isBest = i === 0
            return (
              <div
                key={bank.id}
                onClick={() => setActiveBank(isActive ? null : bank.id)}
                className={`px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <div className="w-14 text-center">
                  <div className={`text-xs font-black px-2 py-1 rounded-lg ${isBest ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {bank.logo}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm truncate">{bank.name}</p>
                    {isBest && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold shrink-0">Best Rate</span>}
                    {bank.recommended && !isBest && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold shrink-0">Recommended</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{bank.interestRate}% p.a. · {bank.repaymentTenure} · {bank.processingFee} processing</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-blue-700 text-base">{formatINR(Math.round(bank.emi))}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Total: {formatINR(Math.round(bank.total))}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <IndianRupee className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          <strong>Pro Tip:</strong> A longer tenure reduces your monthly EMI but increases total interest. 
          Choosing SBI at {loanProviders[0].interestRate}% saves you {formatINR(Math.round(calcEMI(amount, loanProviders[loanProviders.length - 1].interestRate, months) * months - calcEMI(amount, loanProviders[0].interestRate, months) * months))} in total interest vs the highest rate lender.
        </p>
      </div>
    </div>
  )
}
