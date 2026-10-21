import { useFormStore } from '../store/useFormStore'

const CARD_W = 160
const CARD_H = 60
const H_GAP = 80
const V_GAP = 80

function getLayout(steps: ReturnType<typeof useFormStore.getState>['steps']) {
  const positions = new Map<string, { x: number; y: number }>()
  const visited = new Set<string>()

  function place(id: string, col: number, row: number) {
    if (visited.has(id) || !steps.find((s) => s.id === id)) return
    visited.add(id)
    if (!positions.has(id)) positions.set(id, { x: col * (CARD_W + H_GAP), y: row * (CARD_H + V_GAP) })
    const step = steps.find((s) => s.id === id)!
    step.branches.forEach((b, i) => {
      place(b.targetStepId, col + 1, row + i)
    })
    if (step.defaultNextStepId) {
      place(step.defaultNextStepId, col + 1, row + step.branches.length)
    }
  }

  const roots = steps.filter((s) => !steps.some((other) =>
    other.branches.some((b) => b.targetStepId === s.id) || other.defaultNextStepId === s.id
  ))
  roots.forEach((s, i) => place(s.id, 0, i))
  // Place remaining
  steps.forEach((s, i) => { if (!visited.has(s.id)) positions.set(s.id, { x: 0, y: (i + roots.length) * (CARD_H + V_GAP) }) })

  return positions
}

export default function FlowChart() {
  const { steps, selectedStepId, selectStep } = useFormStore()
  const positions = getLayout(steps)

  const maxX = Math.max(...[...positions.values()].map((p) => p.x)) + CARD_W + 40
  const maxY = Math.max(...[...positions.values()].map((p) => p.y)) + CARD_H + 40

  function getCenter(id: string, side: 'left' | 'right') {
    const p = positions.get(id) ?? { x: 0, y: 0 }
    return {
      x: side === 'right' ? p.x + CARD_W : p.x,
      y: p.y + CARD_H / 2,
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0a0f] p-4">
      <svg width={Math.max(maxX, 400)} height={Math.max(maxY, 300)} className="overflow-visible">
        <defs>
          <marker id="fcarrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#3a3a50" />
          </marker>
          <marker id="fcarrow-branch" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#7c3aed" />
          </marker>
        </defs>

        {/* Draw edges */}
        {steps.map((step) => {
          const edges = []

          // Branch edges
          step.branches.forEach((branch, i) => {
            if (!branch.targetStepId || !positions.has(branch.targetStepId)) return
            const from = getCenter(step.id, 'right')
            const to = getCenter(branch.targetStepId, 'left')
            const mx = from.x + (to.x - from.x) / 2
            edges.push(
              <g key={`branch-${step.id}-${i}`}>
                <path
                  d={`M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}`}
                  fill="none" stroke="#7c3aed" strokeWidth={1.5} strokeOpacity={0.7}
                  markerEnd="url(#fcarrow-branch)"
                  strokeDasharray="4,2"
                />
                <text x={(from.x + to.x) / 2} y={Math.min(from.y, to.y) - 4}
                  textAnchor="middle" fontSize={9} fill="#7c3aed" fillOpacity={0.7}>
                  {branch.condition.operator} "{branch.condition.value}"
                </text>
              </g>
            )
          })

          // Default next edge
          if (step.defaultNextStepId && positions.has(step.defaultNextStepId)) {
            const from = getCenter(step.id, 'right')
            const to = getCenter(step.defaultNextStepId, 'left')
            const mx = from.x + (to.x - from.x) / 2
            edges.push(
              <path key={`default-${step.id}`}
                d={`M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}`}
                fill="none" stroke="#3a3a50" strokeWidth={1.5}
                markerEnd="url(#fcarrow)"
              />
            )
          }

          return edges
        })}

        {/* Draw step cards */}
        {steps.map((step) => {
          const pos = positions.get(step.id) ?? { x: 0, y: 0 }
          const isSel = selectedStepId === step.id
          const isEnd = !step.defaultNextStepId && step.branches.length === 0

          return (
            <g key={step.id} transform={`translate(${pos.x},${pos.y})`}
              onClick={() => selectStep(isSel ? null : step.id)}
              style={{ cursor: 'pointer' }}>
              <rect
                width={CARD_W} height={CARD_H} rx={8}
                fill="#1c1c26"
                stroke={isSel ? '#7c3aed' : isEnd ? '#16a34a' : '#2a2a38'}
                strokeWidth={isSel ? 2 : 1}
              />
              {isSel && <rect width={CARD_W} height={CARD_H} rx={8} fill="#7c3aed" fillOpacity={0.05} />}
              <text x={CARD_W / 2} y={22} textAnchor="middle" fontSize={12} fontWeight={600} fill="#e4e4f0">
                {step.title.length > 18 ? step.title.slice(0, 16) + '…' : step.title}
              </text>
              <text x={CARD_W / 2} y={38} textAnchor="middle" fontSize={10} fill="#52525b">
                {step.fields.length} field{step.fields.length !== 1 ? 's' : ''}
                {isEnd ? ' · End' : ''}
                {step.branches.length > 0 ? ` · ${step.branches.length} branch${step.branches.length !== 1 ? 'es' : ''}` : ''}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
