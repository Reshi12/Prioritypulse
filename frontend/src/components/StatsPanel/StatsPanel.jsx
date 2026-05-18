import { Clock, Activity, Zap, Users, TrendingUp, Heart } from 'lucide-react'

export default function StatsPanel({ simState, patients }) {
  const stats = simState?.stats || {}
  const queue = simState?.queue || { waiting: [], in_treatment: [], done: [] }

  const severityCounts = patients.reduce(
    (acc, p) => {
      acc[p.severity] = (acc[p.severity] || 0) + 1
      return acc
    },
    { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  )

  const statsCards = [
    {
      icon: Clock,
      label: 'Avg Wait Time',
      value: stats.avg_waiting_time != null ? `${stats.avg_waiting_time}m` : '—',
      color: '#06b6d4',
      description: 'Average time in queue',
    },
    {
      icon: Activity,
      label: 'Avg Turnaround',
      value: stats.avg_turnaround_time != null ? `${stats.avg_turnaround_time}m` : '—',
      color: '#8b5cf6',
      description: 'Arrival to completion',
    },
    {
      icon: Zap,
      label: 'Throughput',
      value: stats.throughput != null ? stats.throughput : '—',
      color: '#10b981',
      description: 'Patients completed',
    },
    {
      icon: Users,
      label: 'In Queue',
      value: queue.waiting?.length ?? 0,
      color: '#f59e0b',
      description: 'Currently waiting',
    },
  ]

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div className="section-header">
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <TrendingUp size={18} style={{ color: 'var(--accent-indigo-light)' }} />
        </div>
        <div>
          <h3 className="section-title">Scheduling Statistics</h3>
          <p className="section-subtitle">Real-time OS scheduling metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px', marginBottom: '20px',
      }}>
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} style={{
              padding: '16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
              transition: 'all var(--transition-fast)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
              }}>
                <Icon size={14} style={{ color: card.color }} />
                <span style={{
                  fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {card.label}
                </span>
              </div>
              <div style={{
                fontSize: '1.4rem', fontWeight: '900',
                background: `linear-gradient(135deg, ${card.color}, ${card.color}aa)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {card.description}
              </div>
            </div>
          )
        })}
      </div>

      {/* Severity Distribution */}
      <div>
        <h4 style={{
          fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px',
        }}>
          Severity Distribution
        </h4>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'CRITICAL', color: 'var(--severity-critical)', bg: 'var(--severity-critical-bg)' },
            { key: 'HIGH', color: 'var(--severity-high)', bg: 'var(--severity-high-bg)' },
            { key: 'MEDIUM', color: 'var(--severity-medium)', bg: 'var(--severity-medium-bg)' },
            { key: 'LOW', color: 'var(--severity-low)', bg: 'var(--severity-low-bg)' },
          ].map((sev) => (
            <div key={sev.key} style={{
              flex: Math.max(severityCounts[sev.key], 1),
              padding: '10px', borderRadius: '8px',
              background: sev.bg, textAlign: 'center',
              transition: 'flex 0.5s ease',
              minWidth: '50px',
            }}>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: sev.color }}>
                {severityCounts[sev.key]}
              </div>
              <div style={{ fontSize: '0.55rem', fontWeight: '600', color: sev.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {sev.key}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden',
          marginTop: '8px', background: 'var(--bg-secondary)',
        }}>
          {patients.length > 0 && [
            { key: 'CRITICAL', color: 'var(--severity-critical)' },
            { key: 'HIGH', color: 'var(--severity-high)' },
            { key: 'MEDIUM', color: 'var(--severity-medium)' },
            { key: 'LOW', color: 'var(--severity-low)' },
          ].map((sev) => (
            <div key={sev.key} style={{
              width: `${(severityCounts[sev.key] / patients.length) * 100}%`,
              background: sev.color,
              transition: 'width 0.5s ease',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
