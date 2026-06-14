import type { RiskLevel } from '../types'

const STYLES: Record<RiskLevel, string> = {
  low: 'bg-[#34c759]/10 text-[#1a7f37]',
  medium: 'bg-[#ff9500]/10 text-[#b25900]',
  high: 'bg-[#ff3b30]/10 text-[#d70015]',
}

export default function RiskBadge({ level, percent }: { level: RiskLevel; percent: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${STYLES[level]}`}
    >
      {level} · {percent.toFixed(1)}%
    </span>
  )
}
