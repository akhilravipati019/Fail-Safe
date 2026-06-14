import { useEffect, useState } from 'react'
import api from '../api/client'
import type { MetaOptionsResponse, SingleResultResponse } from '../types'
import StudentDetailModal from './StudentDetailModal'

const DEFAULT_NUMERIC_FALLBACK = 0

export default function StudentForm() {
  const [meta, setMeta] = useState<MetaOptionsResponse | null>(null)
  const [values, setValues] = useState<Record<string, string | number>>({})
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SingleResultResponse | null>(null)

  useEffect(() => {
    api
      .get<MetaOptionsResponse>('/meta/options')
      .then((res) => {
        setMeta(res.data)
        const initial: Record<string, string | number> = {}
        for (const [field, def] of Object.entries(res.data.categorical_fields)) {
          initial[field] = def.options[0]
        }
        for (const [field, def] of Object.entries(res.data.numeric_fields)) {
          initial[field] = Math.round((def.min + def.max) / 2) || DEFAULT_NUMERIC_FALLBACK
        }
        setValues(initial)
      })
      .catch(() => setError('Failed to load form options.'))
      .finally(() => setLoadingMeta(false))
  }, [])

  const handleChange = (field: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.post<SingleResultResponse>('/predict/single', values)
      setResult(response.data)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to get a prediction.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingMeta) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#86868b]">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0071e3]/25 border-t-[#0071e3]" />
        Loading form…
      </div>
    )
  }

  if (!meta) {
    return (
      <p className="rounded-lg bg-[#ff3b30]/10 px-3 py-2 text-sm text-[#d70015]">
        {error ?? 'Could not load form.'}
      </p>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.entries(meta.groups).map(([groupName, fields]) => (
          <fieldset key={groupName} className="rounded-2xl border border-[#e5e5e7] bg-white p-5">
            <legend className="mb-1 px-1 text-sm font-semibold text-[#1d1d1f]">{groupName}</legend>
            <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => {
                const catMeta = meta.categorical_fields[field]
                const numMeta = meta.numeric_fields[field]

                if (catMeta) {
                  return (
                    <label key={field} className="block text-sm">
                      <span className="mb-1.5 block font-medium text-[#1d1d1f]">{catMeta.label}</span>
                      <select
                        value={values[field] ?? ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full rounded-lg border border-[#d2d2d7] bg-[#fbfbfd] px-3 py-2 text-[#1d1d1f] transition-colors focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/15"
                      >
                        {catMeta.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <span className="mt-1.5 block text-xs text-[#86868b]">{catMeta.description}</span>
                    </label>
                  )
                }

                if (numMeta) {
                  return (
                    <label key={field} className="block text-sm">
                      <span className="mb-1.5 flex items-center justify-between font-medium text-[#1d1d1f]">
                        {numMeta.label}
                        <span className="rounded-full bg-[#f5f5f7] px-2 py-0.5 text-xs text-[#1d1d1f]">
                          {values[field]}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={numMeta.min}
                        max={numMeta.max}
                        step={numMeta.step}
                        value={values[field] ?? numMeta.min}
                        onChange={(e) => handleChange(field, Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="mt-1.5 block text-xs text-[#86868b]">{numMeta.description}</span>
                    </label>
                  )
                }

                return null
              })}
            </div>
          </fieldset>
        ))}

        {error && (
          <p className="rounded-lg bg-[#ff3b30]/10 px-3 py-2 text-sm text-[#d70015]">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#0071e3] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Analyzing…' : 'Run risk analysis'}
        </button>
      </form>

      {result && (
        <StudentDetailModal
          result={result}
          narrative={result.narrative}
          llmGenerated={result.llm_generated}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
