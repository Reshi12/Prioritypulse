import { useState, useMemo } from 'react'
import { BarChart3, Clock, Info } from 'lucide-react'

const severityColors = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
}

const patientColors = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
  '#3b82f6', '#a855f7', '#0ea5e9', '#22c55e', '#e11d48',
]

export default function GanttChart({ ganttData = [], patients = [], numDoctors = 1 }) {
  const [hoveredBlock, setHoveredBlock] = useState(null)

  // Build patient lookup and color map
  const patientMap = useMemo(() => {
    const map = {}
    patients.forEach((p) => { map[p.patient_id] = p })
    return map
  }, [patients])

  const colorMap = useMemo(() => {
    const map = {}
    const uniqueIds = [...new Set(ganttData.map((g) => g.patient_id))]
    uniqueIds.forEach((id, i) => {
      const patient = patientMap[id]
      map[id] = patient ? (severityColors[patient.severity] || patientColors[i % patientColors.length]) : patientColors[i % patientColors.length]
    })
    return map
  }, [ganttData, patientMap])

  // Group by doctor
  const doctorLanes = useMemo(() => {
    const lanes = {}
    for (let d = 1; d <= numDoctors; d++) {
      lanes[d] = ganttData.filter((g) => g.doctor_id === d)
    }
    return lanes
  }, [ganttData, numDoctors])

  // Find the max time
  const maxTime = useMemo(() => {
    if (ganttData.length === 0) return 30
    return Math.max(...ganttData.map((g) => g.end))
  }, [ganttData])

  // Time markers
  const timeMarkers = useMemo(() => {
    const markers = []
    const step = maxTime <= 30 ? 5 : maxTime <= 60 ? 10 : 15
    for (let t = 0; t <= maxTime; t += step) markers.push(t)
    return markers
  }, [maxTime])

  if (ganttData.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="section-header">
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(245,158,11,0.2)'
          }}>
            <BarChart3 size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h3 className="section-title">Gantt Chart</h3>
            <p className="section-subtitle">Treatment timeline visualization</p>
          </div>
        </div>
        <div className="empty-state" style={{ padding: '40px' }}>
          <BarChart3 size={40} />
          <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>Start the simulation to see the Gantt chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div className="section-header">
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(245,158,11,0.2)'
        }}>
          <BarChart3 size={18} style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <h3 className="section-title">Gantt Chart</h3>
          <p className="section-subtitle">Per-doctor treatment timeline · {ganttData.length} blocks</p>
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ minWidth: `${Math.max(600, maxTime * 18)}px` }}>
          {/* Time axis header */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', marginLeft: '100px',
            borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px',
            marginBottom: '4px',
          }}>
            {timeMarkers.map((t) => (
              <div
                key={t}
                style={{
                  position: 'absolute',
                  left: `${100 + (t / maxTime) * (100)}%`,
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  fontWeight: '600',
                }}
              />
            ))}
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              {timeMarkers.map((t) => (
                <span key={t} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                  {t}m
                </span>
              ))}
            </div>
          </div>

          {/* Doctor lanes */}
          {Object.entries(doctorLanes).map(([doctorId, blocks]) => (
            <div key={doctorId} className="gantt-row">
              <div style={{
                width: '90px', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '6px',
                paddingRight: '12px',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-indigo-light)',
                }}>
                  D{doctorId}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  Doctor
                </span>
              </div>

              <div style={{
                flex: 1, display: 'flex', position: 'relative',
                height: '40px', alignItems: 'center',
                background: 'rgba(255,255,255,0.01)', borderRadius: '6px',
              }}>
                {blocks.map((block, idx) => {
                  const widthPercent = ((block.end - block.start) / maxTime) * 100
                  const leftPercent = (block.start / maxTime) * 100
                  const patient = patientMap[block.patient_id]
                  const color = colorMap[block.patient_id]
                  const isHovered = hoveredBlock === `${doctorId}-${idx}`

                  return (
                    <div
                      key={idx}
                      className="gantt-block"
                      style={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        opacity: isHovered ? 1 : 0.85,
                        transform: isHovered ? 'scaleY(1.2)' : 'scaleY(1)',
                        zIndex: isHovered ? 10 : 1,
                      }}
                      onMouseEnter={() => setHoveredBlock(`${doctorId}-${idx}`)}
                      onMouseLeave={() => setHoveredBlock(null)}
                      title={`${block.patient_id}${patient ? ` - ${patient.name}` : ''} | ${block.start}-${block.end}m`}
                    >
                      {widthPercent > 4 ? block.patient_id.replace('P0', '').replace('P', '') : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Timeline */}
          <div style={{
            display: 'flex', alignItems: 'center', marginLeft: '100px',
            marginTop: '8px', paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <Clock size={12} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Time (minutes) — Total: {maxTime}m
            </span>
          </div>
        </div>
      </div>

      {/* Hover info panel */}
      {hoveredBlock && (() => {
        const [dId, bIdx] = hoveredBlock.split('-')
        const block = doctorLanes[dId]?.[parseInt(bIdx)]
        const patient = block ? patientMap[block.patient_id] : null
        if (!block) return null

        return (
          <div style={{
            marginTop: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', gap: '16px',
            fontSize: '0.8rem', animation: 'fadeIn 0.15s ease',
          }}>
            <Info size={14} style={{ color: 'var(--accent-indigo-light)', flexShrink: 0 }} />
            <span><strong>{block.patient_id}</strong> {patient?.name || ''}</span>
            <span style={{ color: 'var(--text-muted)' }}>Doctor {dId}</span>
            <span style={{ color: 'var(--text-muted)' }}>{block.start}m → {block.end}m ({block.end - block.start}m)</span>
            {patient && <span className={`badge badge-${patient.severity?.toLowerCase()}`}>{patient.severity}</span>}
          </div>
        )
      })()}

      {/* Legend */}
      <div style={{
        marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px',
        padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginRight: '4px' }}>
          Severity:
        </span>
        {Object.entries(severityColors).map(([sev, color]) => (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{sev}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
