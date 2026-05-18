import { useState, useEffect } from 'react'
import { GitCompareArrows, Trophy, Timer, Layers, ArrowRight, Zap, Hash } from 'lucide-react'
import { compareAlgo } from '../../api/endpoints'

export default function AlgoComparison({ patients = [] }) {
  const [comparison, setComparison] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSteps, setShowSteps] = useState(null)

  useEffect(() => {
    if (patients.length === 0) return
    runComparison()
  }, [patients.length])

  const runComparison = async () => {
    setIsLoading(true)
    try {
      const ids = patients.map((p) => p.patient_id)
      const data = await compareAlgo(ids)
      setComparison(data)
    } catch (err) {
      console.error('Algorithm comparison failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Static comparison table data
  const comparisonTable = [
    { property: 'Time (Best)', selection: 'O(n²)', merge: 'O(n log n)' },
    { property: 'Time (Worst)', selection: 'O(n²)', merge: 'O(n log n)' },
    { property: 'Time (Average)', selection: 'O(n²)', merge: 'O(n log n)' },
    { property: 'Space', selection: 'O(1)', merge: 'O(n)' },
    { property: 'Stable', selection: 'No', merge: 'Yes' },
    { property: 'In-place', selection: 'Yes', merge: 'No' },
    { property: 'Use Case', selection: 'n ≤ 10', merge: 'n > 10' },
  ]

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="section-header">
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(139,92,246,0.2)'
        }}>
          <GitCompareArrows size={18} style={{ color: '#a78bfa' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="section-title">Algorithm Comparison</h3>
          <p className="section-subtitle">Selection Sort vs Merge Sort — side by side</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={runComparison} disabled={isLoading || patients.length === 0}>
          <Zap size={14} />
          Run
        </button>
      </div>

      {/* Side-by-Side Cards */}
      {comparison && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px', marginBottom: '20px'
          }}>
            {/* Selection Sort */}
            <AlgoCard
              name="Selection Sort"
              data={comparison.selection_sort}
              isWinner={comparison.winner === 'selection_sort'}
              color="#f59e0b"
              onShowSteps={() => setShowSteps(showSteps === 'selection' ? null : 'selection')}
              showSteps={showSteps === 'selection'}
            />
            {/* Merge Sort */}
            <AlgoCard
              name="Merge Sort"
              data={comparison.merge_sort}
              isWinner={comparison.winner === 'merge_sort'}
              color="#8b5cf6"
              onShowSteps={() => setShowSteps(showSteps === 'merge' ? null : 'merge')}
              showSteps={showSteps === 'merge'}
            />
          </div>

          {/* Note */}
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            marginBottom: '20px',
          }}>
            <Zap size={14} style={{ color: 'var(--accent-indigo-light)', marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Input size: {comparison.input_size} patients</strong> — {comparison.note}
            </span>
          </div>
        </>
      )}

      {/* Comparison Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr>
              <th style={thStyle}>Property</th>
              <th style={{ ...thStyle, color: '#f59e0b' }}>Selection Sort</th>
              <th style={{ ...thStyle, color: '#8b5cf6' }}>Merge Sort</th>
            </tr>
          </thead>
          <tbody>
            {comparisonTable.map((row, i) => (
              <tr key={i}>
                <td style={{ ...tdStyle, fontWeight: '600', color: 'var(--text-secondary)' }}>{row.property}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '6px',
                    background: 'rgba(245,158,11,0.08)', color: '#f59e0b',
                    fontSize: '0.78rem', fontWeight: '600',
                    fontFamily: row.selection.startsWith('O') ? 'monospace' : 'inherit',
                  }}>
                    {row.selection}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '6px',
                    background: 'rgba(139,92,246,0.08)', color: '#a78bfa',
                    fontSize: '0.78rem', fontWeight: '600',
                    fontFamily: row.merge.startsWith('O') ? 'monospace' : 'inherit',
                  }}>
                    {row.merge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AlgoCard({ name, data, isWinner, color, onShowSteps, showSteps }) {
  return (
    <div style={{
      padding: '18px', borderRadius: 'var(--radius-md)',
      background: 'var(--bg-secondary)',
      border: `1px solid ${isWinner ? `${color}40` : 'var(--border-subtle)'}`,
      position: 'relative', overflow: 'hidden',
    }}>
      {isWinner && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '999px',
          background: `${color}15`, border: `1px solid ${color}30`,
          fontSize: '0.6rem', fontWeight: '700', color,
          textTransform: 'uppercase',
        }}>
          <Trophy size={10} /> Winner
        </div>
      )}

      <h4 style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '14px', color }}>
        {name}
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <StatBox icon={Timer} label="Runtime" value={`${data.time_ms} ms`} color={color} />
        <StatBox icon={Hash} label="Comparisons" value={data.comparisons} color={color} />
        <StatBox icon={Layers} label="Time" value={data.time_complexity} color={color} mono />
        <StatBox icon={Layers} label="Space" value={data.space_complexity} color={color} mono />
      </div>

      <div style={{
        fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px',
        padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)',
      }}>
        <ArrowRight size={10} style={{ display: 'inline', marginRight: '4px' }} />
        {data.best_for}
      </div>

      {data.steps && data.steps.length > 0 && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={onShowSteps}
          style={{ width: '100%', fontSize: '0.7rem' }}
        >
          {showSteps ? 'Hide' : 'Show'} Step Trace ({data.steps.length} steps)
        </button>
      )}

      {showSteps && data.steps && (
        <div style={{
          marginTop: '10px', maxHeight: '200px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {data.steps.map((step, i) => (
            <div key={i} style={{
              padding: '6px 10px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.02)',
              fontSize: '0.68rem', color: 'var(--text-muted)',
              fontFamily: 'monospace',
              borderLeft: `2px solid ${color}40`,
            }}>
              <span style={{ color, fontWeight: '600' }}>Step {i + 1}:</span>{' '}
              {step.swapped
                ? `Swapped ${step.swapped[0]} ↔ ${step.swapped[1] || 'none'}`
                : `Merged [${step.merged_ids?.join(', ')}]`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color, mono }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: '8px',
      background: `${color}08`, border: `1px solid ${color}15`,
    }}>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Icon size={10} /> {label}
      </div>
      <div style={{
        fontSize: '0.85rem', fontWeight: '800', color,
        fontFamily: mono ? 'monospace' : 'inherit',
      }}>
        {value}
      </div>
    </div>
  )
}

const thStyle = {
  padding: '10px 14px', textAlign: 'left',
  fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border-subtle)',
}

const tdStyle = {
  padding: '10px 14px', fontSize: '0.8rem',
  borderBottom: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
}
