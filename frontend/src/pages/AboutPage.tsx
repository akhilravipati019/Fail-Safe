import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'

const HOW_IT_WORKS = [
  {
    title: 'Predict',
    body:
      'An XGBoost classifier, trained on the UCI Student Performance dataset, scores each student’s ' +
      'probability of failing using attendance, academic history, demographics, and lifestyle factors.',
  },
  {
    title: 'Explain',
    body:
      'SHAP (SHapley Additive exPlanations) breaks down each prediction into the individual factors that ' +
      'pushed a student’s risk up or down, so a teacher can see exactly why a student was flagged.',
  },
  {
    title: 'Act',
    body:
      'Rule-based and AI-generated (Gemini) suggestions translate those risk factors into a short, ' +
      'plain-language explanation and a prioritized action plan for the teacher.',
  },
]

const FEATURES = [
  'Secure teacher login with JWT sessions and lockout after repeated failed attempts',
  'Bulk class CSV upload or a single-student form for quick what-if checks',
  'Per-student risk score (low / medium / high) with a SHAP factor breakdown',
  'Automatically generated, teacher-friendly intervention suggestions',
  'Optional Gemini-powered narrative explanations, with a rule-based fallback',
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">About FAILSAFE</h2>
          <p className="mt-3 text-base text-[#86868b]">
            FAILSAFE is an early-warning system that helps faculty spot students at risk of failing before it’s too
            late — turning attendance, grades, and behavioral data into clear, explainable insights and concrete
            next steps.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-[#e5e5e7] bg-white p-6">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#0071e3]/10 text-sm font-semibold text-[#0071e3]">
                {i + 1}
              </div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#86868b]">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-[#e5e5e7] bg-white p-8">
          <h3 className="text-base font-semibold text-[#1d1d1f]">Key features</h3>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#1d1d1f]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0071e3]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-[#e5e5e7] bg-white p-8">
          <h3 className="text-base font-semibold text-[#1d1d1f]">Under the hood</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#86868b]">
            The risk model is an XGBoost classifier tuned with grid search on the UCI Student Performance dataset
            (final grade below 10/20 marks a student "at risk"), explained per-prediction with SHAP. The backend is
            built with FastAPI, SQLite, and JWT authentication; the frontend is a Vite + React + TypeScript app
            styled with Tailwind CSS. Narrative explanations are generated with Google Gemini, falling back to
            rule-based summaries when no API key is configured.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <Link to="/team" className="text-sm font-medium text-[#0071e3] hover:underline">
            Meet the team that built FAILSAFE →
          </Link>
        </div>
      </main>
    </div>
  )
}
