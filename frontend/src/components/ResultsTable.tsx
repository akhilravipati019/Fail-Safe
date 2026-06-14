import { useMemo, useState } from 'react'
import type { PredictionResult } from '../types'
import RiskBadge from './RiskBadge'

interface Props {
  results: PredictionResult[]
  onSelect: (result: PredictionResult) => void
}

type SortKey = 'row_index' | 'risk_percent'

export default function ResultsTable({ results, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('risk_percent')
  const [descending, setDescending] = useState(true)

  const sorted = useMemo(() => {
    const copy = [...results]
    copy.sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return descending ? -diff : diff
    })
    return copy
  }, [results, sortKey, descending])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDescending((d) => !d)
    } else {
      setSortKey(key)
      setDescending(true)
    }
  }

  const sortIndicator = (key: SortKey) => (sortKey === key ? (descending ? '↓' : '↑') : '')

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5e5e7] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e5e5e7] text-[#86868b]">
            <tr>
              <th
                className="cursor-pointer select-none px-4 py-3 text-xs font-medium uppercase tracking-wide"
                onClick={() => toggleSort('row_index')}
              >
                Student # {sortIndicator('row_index')}
              </th>
              <th
                className="cursor-pointer select-none px-4 py-3 text-xs font-medium uppercase tracking-wide"
                onClick={() => toggleSort('risk_percent')}
              >
                Risk {sortIndicator('risk_percent')}
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Top factor</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Suggested first step</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f2]">
            {sorted.map((r) => (
              <tr key={r.row_index} className="transition-colors hover:bg-[#fbfbfd]">
                <td className="px-4 py-3 font-medium text-[#1d1d1f]">{r.row_index + 1}</td>
                <td className="px-4 py-3">
                  <RiskBadge level={r.risk_level} percent={r.risk_percent} />
                </td>
                <td className="px-4 py-3 text-[#1d1d1f]">{r.top_factors[0]?.label ?? '-'}</td>
                <td className="max-w-xs truncate px-4 py-3 text-[#86868b]">{r.interventions[0] ?? '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSelect(r)}
                    className="rounded-full border border-[#d2d2d7] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
                  >
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
