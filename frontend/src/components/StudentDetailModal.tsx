import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../api/client'
import type { ExplainResponse, PredictionResult } from '../types'
import RiskBadge from './RiskBadge'

interface Props {
  result: PredictionResult
  narrative?: string
  llmGenerated?: boolean
  onClose: () => void
}

export default function StudentDetailModal({ result, narrative, llmGenerated, onClose }: Props) {
  const [aiNarrative, setAiNarrative] = useState<string | undefined>(narrative)
  const [aiGenerated, setAiGenerated] = useState<boolean | undefined>(llmGenerated)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (narrative !== undefined) return

    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .post<ExplainResponse>('/predict/explain', {
        risk_percent: result.risk_percent,
        risk_level: result.risk_level,
        top_factors: result.top_factors,
        interventions: result.interventions,
      })
      .then((res) => {
        if (cancelled) return
        setAiNarrative(res.data.narrative)
        setAiGenerated(res.data.llm_generated)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load AI insights right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.row_index])

  const chartData = result.top_factors
    .slice()
    .reverse()
    .map((f) => ({
      name: f.label,
      impact: f.shap_impact,
      direction: f.direction,
    }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#e5e5e7] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Student #{result.row_index + 1}</h2>
            <div className="mt-2">
              <RiskBadge level={result.risk_level} percent={result.risk_percent} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[#d2d2d7] px-4 py-1.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            Close
          </button>
        </div>

        <section className="mb-6 rounded-xl border border-[#e5e5e7] bg-[#fbfbfd] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#1d1d1f]">Top factors driving this prediction</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e7" />
                <XAxis type="number" stroke="#86868b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={160} stroke="#86868b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e5e5e7', borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => Number(value ?? 0).toFixed(3)}
                />
                <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.direction === 'increases' ? '#ff3b30' : '#34c759'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-[#86868b]">
            <span className="text-[#d70015]">Red</span> bars push risk up,{' '}
            <span className="text-[#1a7f37]">green</span> bars push risk down.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-[#1d1d1f]">Suggested interventions</h3>
          <ul className="space-y-2">
            {result.interventions.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-[#e5e5e7] bg-[#fbfbfd] px-4 py-3 text-sm text-[#1d1d1f]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f]">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
            AI Insights
            {aiGenerated !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                  aiGenerated ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-[#f5f5f7] text-[#86868b]'
                }`}
              >
                {aiGenerated ? 'Gemini' : 'Rule-based'}
              </span>
            )}
          </h3>
          {loading && (
            <p className="flex items-center gap-2 text-sm text-[#86868b]">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0071e3]/25 border-t-[#0071e3]" />
              Generating explanation…
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-[#ff3b30]/10 px-3 py-2 text-sm text-[#d70015]">{error}</p>
          )}
          {aiNarrative && (
            <div className="whitespace-pre-wrap rounded-xl border border-[#e5e5e7] bg-[#fbfbfd] p-4 font-sans text-sm leading-relaxed text-[#1d1d1f]">
              {aiNarrative}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
