export type RiskLevel = 'low' | 'medium' | 'high'

export interface TopFactor {
  feature: string
  label: string
  value: unknown
  shap_impact: number
  direction: 'increases' | 'decreases'
}

export interface PredictionResult {
  row_index: number
  risk_probability: number
  risk_percent: number
  risk_level: RiskLevel
  top_factors: TopFactor[]
  interventions: string[]
}

export interface SingleResultResponse extends PredictionResult {
  narrative: string
  llm_generated: boolean
}

export interface CsvResultsResponse {
  results: PredictionResult[]
}

export interface CategoricalFieldMeta {
  type: 'select'
  label: string
  description: string
  options: string[]
}

export interface NumericFieldMeta {
  type: 'number'
  label: string
  description: string
  min: number
  max: number
  step: number
}

export interface MetaOptionsResponse {
  feature_cols: string[]
  categorical_fields: Record<string, CategoricalFieldMeta>
  numeric_fields: Record<string, NumericFieldMeta>
  groups: Record<string, string[]>
}

export interface ExplainResponse {
  narrative: string
  llm_generated: boolean
}

export interface TeacherOut {
  id: number
  username: string
  full_name: string
}
