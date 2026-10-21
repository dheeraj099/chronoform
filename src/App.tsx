import { useState } from 'react'
import { useFormStore } from './store/useFormStore'
import FlowChart from './components/FlowChart'
import StepEditor from './components/StepEditor'
import FormPreview from './components/FormPreview'
import ExportCode from './components/ExportCode'
import { GitBranch, Eye, Code2, Plus } from 'lucide-react'

type View = 'builder' | 'preview' | 'export'

export default function App() {
  const [view, setView] = useState<View>('builder')
  const { steps, addStep, formName, setFormName } = useFormStore()

  return (
    <div className="h-screen bg-[#0c0c10] text-[#e4e4f0] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 h-12 bg-[#111118] border-b border-[#1f1f2e] shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-violet-400" />
          <span className="font-semibold text-sm">chronoform</span>
        </div>
        <input
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="text-xs bg-transparent border-b border-[#2a2a38] text-zinc-300 outline-none focus:border-violet-500/50 pb-0.5 w-36"
          placeholder="Form name..."
        />
        <div className="flex-1" />

        {/* View tabs */}
        <div className="flex rounded border border-[#2a2a38] overflow-hidden">
          {([
            { id: 'builder', icon: <GitBranch size={12} />, label: 'Builder' },
            { id: 'preview', icon: <Eye size={12} />, label: 'Preview' },
            { id: 'export',  icon: <Code2 size={12} />, label: 'Export' },
          ] as { id: View; icon: React.ReactNode; label: string }[]).map((tab) => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors ${
                view === tab.id ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {view === 'builder' && (
          <button onClick={addStep}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#2a2a38] text-zinc-400 hover:text-violet-300 hover:border-violet-500/40 transition-colors">
            <Plus size={12} /> Add Step
          </button>
        )}
      </header>

      {/* Content */}
      {view === 'builder' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Flowchart */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#1f1f2e] bg-[#111118]">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                Flow — {steps.length} step{steps.length !== 1 ? 's' : ''}
              </span>
            </div>
            <FlowChart />
          </main>

          {/* Step editor */}
          <aside className="w-72 shrink-0 bg-[#111118] border-l border-[#1f1f2e] flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-[#1f1f2e] shrink-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Step Editor</span>
            </div>
            <StepEditor />
          </aside>
        </div>
      ) : view === 'preview' ? (
        <div className="flex-1 flex overflow-hidden bg-[#0a0a0f]">
          <FormPreview />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <ExportCode />
        </div>
      )}
    </div>
  )
}
