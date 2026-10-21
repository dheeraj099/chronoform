import { useFormStore } from '../store/useFormStore'
import type { FieldType } from '../types'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

const FIELD_TYPES: FieldType[] = ['text', 'email', 'number', 'select', 'textarea', 'radio', 'checkbox']

export default function StepEditor() {
  const {
    steps, selectedStepId, selectedFieldId,
    updateStep, addField, removeField, updateField, moveField, selectField,
    addBranch, removeBranch, updateBranch,
  } = useFormStore()

  const step = steps.find((s) => s.id === selectedStepId)

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[11px] text-zinc-700 text-center px-4">
          Select a step in the flowchart to edit it
        </p>
      </div>
    )
  }

  const field = step.fields.find((f) => f.id === selectedFieldId)

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {/* Step config */}
      <div className="space-y-2">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Step</p>
        <input
          value={step.title}
          onChange={(e) => updateStep(step.id, { title: e.target.value })}
          className="w-full bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1.5 text-xs text-[#e4e4f0] outline-none focus:border-violet-500/50"
          placeholder="Step title"
        />
      </div>

      {/* Fields */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Fields</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {FIELD_TYPES.map((t) => (
            <button key={t} onClick={() => addField(step.id, t)}
              className="text-[10px] px-2 py-0.5 rounded border border-[#2a2a38] text-zinc-500 hover:text-violet-300 hover:border-violet-500/40 transition-colors flex items-center gap-0.5">
              <Plus size={9} /> {t}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {step.fields.map((f, idx) => (
            <div key={f.id}
              className={`flex items-center gap-1 p-2 rounded border cursor-pointer transition-colors ${
                selectedFieldId === f.id ? 'border-violet-500/50 bg-violet-500/5' : 'border-[#2a2a38] hover:border-[#3a3a50]'
              }`}
              onClick={() => selectField(selectedFieldId === f.id ? null : f.id)}
            >
              <span className="text-[10px] text-zinc-600 bg-[#2a2a38] px-1 rounded font-mono shrink-0">{f.type}</span>
              <span className="text-xs text-zinc-300 flex-1 truncate">{f.label}</span>
              {f.required && <span className="text-[9px] text-red-400 shrink-0">req</span>}
              <div className="flex gap-0.5 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); moveField(step.id, f.id, 'up') }}
                  disabled={idx === 0}
                  className="text-zinc-700 hover:text-zinc-400 disabled:opacity-30 transition-colors">
                  <ChevronUp size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); moveField(step.id, f.id, 'down') }}
                  disabled={idx === step.fields.length - 1}
                  className="text-zinc-700 hover:text-zinc-400 disabled:opacity-30 transition-colors">
                  <ChevronDown size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeField(step.id, f.id) }}
                  className="text-zinc-700 hover:text-red-400 transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Field detail editor */}
        {field && (
          <div className="bg-[#1c1c26] border border-[#2a2a38] rounded-lg p-3 space-y-2">
            <div>
              <label className="text-[10px] text-zinc-600 block mb-1">Label</label>
              <input value={field.label}
                onChange={(e) => updateField(step.id, field.id, { label: e.target.value })}
                className="w-full bg-[#111118] border border-[#2a2a38] rounded px-2 py-1 text-[11px] text-[#e4e4f0] outline-none focus:border-violet-500/50" />
            </div>
            {!['checkbox', 'radio', 'select'].includes(field.type) && (
              <div>
                <label className="text-[10px] text-zinc-600 block mb-1">Placeholder</label>
                <input value={field.placeholder ?? ''}
                  onChange={(e) => updateField(step.id, field.id, { placeholder: e.target.value })}
                  className="w-full bg-[#111118] border border-[#2a2a38] rounded px-2 py-1 text-[11px] text-[#e4e4f0] outline-none focus:border-violet-500/50" />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={field.required}
                onChange={(e) => updateField(step.id, field.id, { required: e.target.checked })}
                className="accent-violet-500" />
              <span className="text-[11px] text-zinc-400">Required</span>
            </label>
          </div>
        )}
      </div>

      {/* Branching */}
      <div className="space-y-2 pt-2 border-t border-[#1f1f2e]">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Branching Logic</p>
          <button onClick={() => addBranch(step.id)}
            className="text-[10px] text-zinc-600 hover:text-violet-400 flex items-center gap-1 transition-colors">
            <Plus size={10} /> Branch
          </button>
        </div>

        {step.branches.map((branch, i) => (
          <div key={i} className="bg-[#1c1c26] border border-[#2a2a38] rounded p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-600">If</span>
              <select value={branch.condition.fieldId}
                onChange={(e) => updateBranch(step.id, i, { fieldId: e.target.value })}
                className="flex-1 bg-[#111118] border border-[#2a2a38] rounded px-1 py-0.5 text-[10px] text-zinc-300 outline-none">
                {step.fields.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              <button onClick={() => removeBranch(step.id, i)} className="text-zinc-700 hover:text-red-400">
                <Trash2 size={10} />
              </button>
            </div>
            <div className="flex gap-1">
              <select value={branch.condition.operator}
                onChange={(e) => updateBranch(step.id, i, { operator: e.target.value as 'equals' | 'not_equals' | 'contains' | 'not_empty' })}
                className="w-28 bg-[#111118] border border-[#2a2a38] rounded px-1 py-0.5 text-[10px] text-zinc-300 outline-none">
                <option value="equals">equals</option>
                <option value="not_equals">not equals</option>
                <option value="contains">contains</option>
                <option value="not_empty">not empty</option>
              </select>
              {branch.condition.operator !== 'not_empty' && (
                <input value={branch.condition.value}
                  onChange={(e) => updateBranch(step.id, i, { value: e.target.value })}
                  placeholder="value"
                  className="flex-1 bg-[#111118] border border-[#2a2a38] rounded px-1 py-0.5 text-[10px] font-mono text-zinc-300 outline-none min-w-0" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-600">Go to</span>
              <select value={branch.targetStepId}
                onChange={(e) => updateBranch(step.id, i, {}, e.target.value)}
                className="flex-1 bg-[#111118] border border-[#2a2a38] rounded px-1 py-0.5 text-[10px] text-zinc-300 outline-none">
                <option value="">— pick step —</option>
                {steps.filter((s) => s.id !== step.id).map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* Default next */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 shrink-0">Default next:</span>
          <select
            value={step.defaultNextStepId ?? ''}
            onChange={(e) => updateStep(step.id, { defaultNextStepId: e.target.value || null })}
            className="flex-1 bg-[#1c1c26] border border-[#2a2a38] rounded px-2 py-1 text-[10px] text-zinc-300 outline-none">
            <option value="">— End of form —</option>
            {steps.filter((s) => s.id !== step.id).map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
