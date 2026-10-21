import { useState } from 'react'
import { useFormStore } from '../store/useFormStore'
import type { FormField } from '../types'
import { ChevronRight, Check } from 'lucide-react'

type FormData = Record<string, string | boolean>

function FieldRenderer({ field, value, onChange }: {
  field: FormField
  value: string | boolean | undefined
  onChange: (v: string | boolean) => void
}) {
  const inputCls = "w-full bg-[#1c1c26] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-[#e4e4f0] outline-none focus:border-violet-500/50 transition-colors"

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={inputCls + ' resize-none'}
        />
      )
    case 'select':
      return (
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}
          className={inputCls}>
          <option value="">Select...</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    case 'radio':
      return (
        <div className="space-y-1.5">
          {field.options?.map((o) => (
            <label key={o.value} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                value === o.value ? 'border-violet-500 bg-violet-500' : 'border-[#3a3a50] group-hover:border-violet-500/50'
              }`}
                onClick={() => onChange(o.value)}>
                {value === o.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-zinc-300">{o.label}</span>
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            value ? 'border-violet-500 bg-violet-500' : 'border-[#3a3a50]'
          }`}
            onClick={() => onChange(!value)}>
            {value && <Check size={10} className="text-white" />}
          </div>
          <span className="text-sm text-zinc-300">{field.label}</span>
        </label>
      )
    default:
      return (
        <input
          type={field.type}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      )
  }
}

export default function FormPreview() {
  const { steps } = useFormStore()
  const [stepId, setStepId] = useState(steps[0]?.id ?? '')
  const [formData, setFormData] = useState<FormData>({})
  const [submitted, setSubmitted] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const step = steps.find((s) => s.id === stepId)

  function handleNext() {
    if (!step) return
    const branch = step.branches.find((b) => {
      const val = String(formData[b.condition.fieldId] ?? '')
      switch (b.condition.operator) {
        case 'equals': return val === b.condition.value
        case 'not_equals': return val !== b.condition.value
        case 'contains': return val.includes(b.condition.value)
        case 'not_empty': return val.length > 0
      }
    })
    const nextId = branch?.targetStepId || step.defaultNextStepId
    if (!nextId) { setSubmitted(true); return }
    setHistory((h) => [...h, stepId])
    setStepId(nextId)
  }

  function handleBack() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setStepId(prev)
  }

  function handleReset() {
    setStepId(steps[0]?.id ?? '')
    setFormData({})
    setSubmitted(false)
    setHistory([])
  }

  const progress = steps.length > 0
    ? Math.round(((history.length) / steps.length) * 100)
    : 0

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <Check size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#e4e4f0]">Form Submitted!</h3>
          <div className="bg-[#1c1c26] border border-[#2a2a38] rounded-lg p-3 text-left max-w-xs">
            {Object.entries(formData).map(([k, v]) => {
              const field = steps.flatMap((s) => s.fields).find((f) => f.id === k)
              return (
                <div key={k} className="flex justify-between text-xs py-0.5">
                  <span className="text-zinc-600">{field?.label ?? k}</span>
                  <span className="font-mono text-zinc-300">{String(v)}</span>
                </div>
              )
            })}
          </div>
          <button onClick={handleReset}
            className="text-xs px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white transition-colors">
            Start Over
          </button>
        </div>
      </div>
    )
  }

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-zinc-600">No steps defined. Add steps to see the preview.</p>
      </div>
    )
  }

  const stepIndex = steps.findIndex((s) => s.id === stepId)

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-lg mx-auto w-full">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-zinc-600 mb-1">
          <span>Step {stepIndex + 1} of ~{steps.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 bg-[#2a2a38] rounded">
          <div className="h-1 bg-violet-500 rounded transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-[#e4e4f0] mb-5">{step.title}</h2>

      <div className="space-y-5">
        {step.fields.map((field) => (
          <div key={field.id}>
            {field.type !== 'checkbox' && (
              <label className="block text-sm text-zinc-400 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
            )}
            <FieldRenderer
              field={field}
              value={formData[field.id]}
              onChange={(v) => setFormData((d) => ({ ...d, [field.id]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-8">
        {history.length > 0 && (
          <button onClick={handleBack}
            className="px-4 py-2 text-sm rounded-lg border border-[#2a2a38] text-zinc-400 hover:text-zinc-200 transition-colors">
            Back
          </button>
        )}
        <button onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors">
          {step.defaultNextStepId || step.branches.length > 0 ? 'Continue' : 'Submit'}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
