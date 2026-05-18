import { useState } from 'react'
import { Users, Clock, Stethoscope, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import PatientCard from '../PatientCard'

const columnConfig = {
  waiting: {
    title: 'Waiting',
    icon: Clock,
    gradient: 'linear-gradient(135deg, #eab308, #f59e0b)',
    dotColor: '#eab308',
    emptyText: 'No patients waiting',
  },
  in_treatment: {
    title: 'In Treatment',
    icon: Stethoscope,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    dotColor: '#6366f1',
    emptyText: 'No patients being treated',
  },
  done: {
    title: 'Completed',
    icon: CheckCircle2,
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    dotColor: '#10b981',
    emptyText: 'No patients completed yet',
  },
}

export default function QueuePanel({ patients, agedPatients = [], simState }) {
  const [expandedColumn, setExpandedColumn] = useState(null)

  const patientMap = patients.reduce((acc, p) => {
    acc[p.patient_id] = p
    return acc
  }, {})

  const waiting = (simState?.queue?.waiting || [])
    .map(id => patientMap[id])
    .filter(Boolean)
    .sort((a, b) => b.priority_score - a.priority_score)
    
  const treating = (simState?.queue?.in_treatment || [])
    .map(id => patientMap[id])
    .filter(Boolean)
    
  const done = (simState?.queue?.done || [])
    .map(id => patientMap[id])
    .filter(Boolean)

  const columns = [
    { key: 'waiting', patients: waiting },
    { key: 'in_treatment', patients: treating },
    { key: 'done', patients: done },
  ]

  return (
    <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
      {/* Header */}
      <div className="section-header">
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(99,102,241,0.2)'
        }}>
          <Users size={18} style={{ color: 'var(--accent-indigo-light)' }} />
        </div>
        <div>
          <h3 className="section-title">Patient Queue</h3>
          <p className="section-subtitle">{patients.length} total patients</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap'
      }}>
        {columns.map(({ key, patients: list }) => {
          const cfg = columnConfig[key]
          return (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '10px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              flex: '1', minWidth: '120px'
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: cfg.dotColor,
                boxShadow: `0 0 8px ${cfg.dotColor}60`,
              }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {cfg.title}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {list.length}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Queue Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {columns.map(({ key, patients: list }) => {
          const cfg = columnConfig[key]
          const Icon = cfg.icon
          const isExpanded = expandedColumn === key
          const displayList = isExpanded ? list : list.slice(0, 4)
          const hasMore = list.length > 4

          return (
            <div key={key} style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)', overflow: 'hidden',
            }}>
              {/* Column header */}
              <div style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                background: `${cfg.dotColor}08`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} style={{ color: cfg.dotColor }} />
                  <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{cfg.title}</span>
                  <span style={{
                    padding: '1px 8px', borderRadius: '999px',
                    background: `${cfg.dotColor}15`, color: cfg.dotColor,
                    fontSize: '0.7rem', fontWeight: '700',
                  }}>
                    {list.length}
                  </span>
                </div>
              </div>

              {/* Patient list */}
              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {displayList.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 12px' }}>
                    <Icon size={28} style={{ opacity: 0.2, color: cfg.dotColor }} />
                    <span style={{ fontSize: '0.8rem', marginTop: '8px' }}>{cfg.emptyText}</span>
                  </div>
                ) : (
                  displayList.map((patient, idx) => (
                    <div key={patient.patient_id} className="slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                      <PatientCard
                        patient={patient}
                        compact
                        isAged={agedPatients.includes(patient.patient_id)}
                      />
                    </div>
                  ))
                )}

                {hasMore && (
                  <button
                    onClick={() => setExpandedColumn(isExpanded ? null : key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '4px', padding: '8px', borderRadius: '8px',
                      background: 'transparent', border: '1px dashed var(--border-subtle)',
                      color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600',
                      cursor: 'pointer', transition: 'all var(--transition-fast)',
                    }}
                    onMouseOver={(e) => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.color = 'var(--text-secondary)' }}
                    onMouseOut={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.color = 'var(--text-muted)' }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? 'Show less' : `Show ${list.length - 4} more`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
