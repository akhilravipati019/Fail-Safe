import { useRef, useState } from 'react'
import api from '../api/client'
import type { CsvResultsResponse, PredictionResult } from '../types'
import ResultsTable from './ResultsTable'
import StudentDetailModal from './StudentDetailModal'

export default function CsvUploadPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<PredictionResult[] | null>(null)
  const [selected, setSelected] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setLoading(true)
    setError(null)
    setResults(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post<CsvResultsResponse>('/predict/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResults(response.data.results)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to process CSV file.')
    } finally {
      setLoading(false)
    }
  }

  const summary = results
    ? {
        total: results.length,
        high: results.filter((r) => r.risk_level === 'high').length,
        medium: results.filter((r) => r.risk_level === 'medium').length,
        low: results.filter((r) => r.risk_level === 'low').length,
      }
    : null

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-[#e5e5e7] bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-[#1d1d1f]">Upload class CSV</h2>
        <p className="mb-4 text-sm text-[#86868b]">
          Upload a CSV with the student attendance, demographics, and academic columns (same format as the UCI
          Student Performance dataset). Each row is run through the FAILSAFE model.
        </p>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#d2d2d7] bg-[#fbfbfd] px-6 py-10 text-center transition-colors hover:border-[#0071e3]/40 hover:bg-[#f5f5f7]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#0071e3]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
            </svg>
          </span>
          <span className="text-sm font-medium text-[#1d1d1f]">
            {fileName ? 'Choose a different file' : 'Click to choose a CSV file'}
          </span>
          <span className="text-xs text-[#86868b]">.csv or .txt, comma or semicolon separated</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {fileName && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-1 text-xs text-[#1d1d1f]">
            Selected: {fileName}
          </p>
        )}
        {loading && (
          <p className="mt-3 flex items-center gap-2 text-sm text-[#0071e3]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0071e3]/25 border-t-[#0071e3]" />
            Analyzing students…
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-lg bg-[#ff3b30]/10 px-3 py-2 text-sm text-[#d70015]">{error}</p>
        )}
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e5e5e7] bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-[#1d1d1f]">{summary.total}</div>
            <div className="mt-1 text-xs text-[#86868b]">Students</div>
          </div>
          <div className="rounded-2xl border border-[#e5e5e7] bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-[#d70015]">{summary.high}</div>
            <div className="mt-1 text-xs text-[#86868b]">High risk</div>
          </div>
          <div className="rounded-2xl border border-[#e5e5e7] bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-[#b25900]">{summary.medium}</div>
            <div className="mt-1 text-xs text-[#86868b]">Medium risk</div>
          </div>
          <div className="rounded-2xl border border-[#e5e5e7] bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-[#1a7f37]">{summary.low}</div>
            <div className="mt-1 text-xs text-[#86868b]">Low risk</div>
          </div>
        </div>
      )}

      {results && <ResultsTable results={results} onSelect={setSelected} />}

      {selected && <StudentDetailModal result={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
