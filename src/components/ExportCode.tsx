import { useState } from 'react'
import { useFormStore } from '../store/useFormStore'
import { Copy, Check } from 'lucide-react'

export default function ExportCode() {
  const { exportCode } = useFormStore()
  const [copied, setCopied] = useState(false)

  const code = exportCode()

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-3 py-2 border-b border-[#1f1f2e] shrink-0">
        <span className="text-[11px] text-zinc-600 uppercase tracking-wider flex-1">React Component</span>
        <button onClick={() => { void handleCopy() }}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-[#2a2a38] text-zinc-400 hover:text-zinc-200 transition-colors">
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="flex-1 overflow-auto p-3 text-[11px] font-mono text-zinc-300 leading-relaxed bg-[#0c0c10]/40">
        <code>{code}</code>
      </pre>
    </div>
  )
}
