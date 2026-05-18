import {
  Heart, Droplets, Wind, Thermometer, Clock, Activity, AlertTriangle, Trash2
} from 'lucide-react'

const severityConfig = {
  CRITICAL: { class: 'badge-critical', icon: AlertTriangle },
  HIGH: { class: 'badge-high', icon: AlertTriangle },
  MEDIUM: { class: 'badge-medium', icon: Activity },
  LOW: { class: 'badge-low', icon: Activity },
}

const statusLabels = {
  waiting: 'Waiting',
  in_treatment: 'In Treatment',
  done: 'Completed',
}

export default function PatientCard({ patient, isAged = false, compact = false, onDelete }) {
  const { vitals } = patient
  const sevConfig = severityConfig[patient.severity] || severityConfig.LOW
  const SevIcon = sevConfig.icon

  if (compact) {
    return (
      <div
        className={`card fade-in ${isAged ? 'aged-pulse' : ''}`}
        style={{ padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${patient.severity === 'CRITICAL' ? '#ef4444' : patient.severity === 'HIGH' ? '#f97316' : patient.severity === 'MEDIUM' ? '#eab308' : '#22c55e'}20, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)',
              border: `1px solid ${patient.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : patient.severity === 'HIGH' ? 'rgba(249,115,22,0.2)' : patient.severity === 'MEDIUM' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)'}`,
              flexShrink: 0,
            }}>
              {patient.patient_id.replace('P0', '').replace('P', '')}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {patient.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Age {patient.age} · Score {patient.priority_score}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {isAged && (
              <span style={{
                fontSize: '0.6rem', padding: '2px 6px', borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.25)', fontWeight: '600'
              }}>
                AGED
              </span>
            )}
            <span className={`badge ${sevConfig.class}`}>
              {patient.severity}
            </span>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px', borderRadius: '6px', transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                title="Remove Patient"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`card fade-in ${isAged ? 'aged-pulse' : ''}`}
      style={{ padding: '20px', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${patient.severity === 'CRITICAL' ? '#ef4444' : patient.severity === 'HIGH' ? '#f97316' : patient.severity === 'MEDIUM' ? '#eab308' : '#22c55e'}25, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)',
            border: `1px solid ${patient.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : patient.severity === 'HIGH' ? 'rgba(249,115,22,0.2)' : patient.severity === 'MEDIUM' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)'}`,
          }}>
            {patient.patient_id.replace('P00', '').replace('P0', '').replace('P', '')}
          </div>
          <div>
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>
              {patient.name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Age {patient.age} · PID {patient.pid || patient.patient_id}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span className={`badge ${sevConfig.class}`}>
              <SevIcon size={10} />
              {patient.severity}
            </span>
            <span className={`badge status-${patient.status}`}>
              {statusLabels[patient.status]}
            </span>
          </div>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '6px', borderRadius: '8px', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
              title="Remove Patient"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Priority Score Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Priority Score
          </span>
          <span style={{
            fontSize: '0.85rem', fontWeight: '800',
            color: patient.priority_score >= 85 ? 'var(--severity-critical)' :
              patient.priority_score >= 65 ? 'var(--severity-high)' :
                patient.priority_score >= 40 ? 'var(--severity-medium)' : 'var(--severity-low)'
          }}>
            {patient.priority_score}
          </span>
        </div>
        <div style={{
          width: '100%', height: '6px', borderRadius: '3px',
          background: 'var(--bg-secondary)', overflow: 'hidden'
        }}>
          <div style={{
            width: `${patient.priority_score}%`, height: '100%', borderRadius: '3px',
            background: patient.priority_score >= 85
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : patient.priority_score >= 65
                ? 'linear-gradient(90deg, #f97316, #eab308)'
                : patient.priority_score >= 40
                  ? 'linear-gradient(90deg, #eab308, #22c55e)'
                  : 'linear-gradient(90deg, #22c55e, #10b981)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Vitals Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px', marginBottom: '14px'
      }}>
        <VitalItem icon={Heart} label="Heart Rate" value={`${vitals.heart_rate} bpm`}
          alert={vitals.heart_rate < 50 || vitals.heart_rate > 120} />
        <VitalItem icon={Droplets} label="BP" value={`${vitals.systolic_bp}/${vitals.diastolic_bp}`}
          alert={vitals.systolic_bp > 160 || vitals.systolic_bp < 90} />
        <VitalItem icon={Wind} label="SpO₂" value={`${vitals.oxygen_saturation}%`}
          alert={vitals.oxygen_saturation < 92} />
        <VitalItem icon={Thermometer} label="Temp" value={`${vitals.temperature}°C`}
          alert={vitals.temperature > 38.5 || vitals.temperature < 35.5} />
      </div>

      {/* Footer: Symptoms + Times */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
        {vitals.symptoms.map((s) => (
          <span key={s} style={{
            fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px',
            background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo-light)',
            border: '1px solid rgba(99, 102, 241, 0.15)', fontWeight: '500',
            textTransform: 'capitalize',
          }}>
            {s.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      <div style={{
        display: 'flex', gap: '16px', paddingTop: '10px',
        borderTop: '1px solid var(--border-subtle)', fontSize: '0.7rem', color: 'var(--text-muted)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> Arrival: {patient.arrival_time} min
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} /> Burst: {patient.burst_time} min
        </span>
        {patient.waiting_time > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Wait: {patient.waiting_time} min
          </span>
        )}
      </div>

      {isAged && (
        <div style={{
          marginTop: '10px', padding: '6px 10px', borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)',
          fontSize: '0.7rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <AlertTriangle size={12} />
          Priority boosted by aging mechanism
        </div>
      )}
    </div>
  )
}

function VitalItem({ icon: Icon, label, value, alert }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 10px', borderRadius: '8px',
      background: alert ? 'rgba(239, 68, 68, 0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${alert ? 'rgba(239, 68, 68, 0.12)' : 'transparent'}`,
    }}>
      <Icon size={14} style={{ color: alert ? 'var(--severity-critical)' : 'var(--text-muted)', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: alert ? 'var(--severity-critical)' : 'var(--text-primary)' }}>
          {value}
        </div>
      </div>
    </div>
  )
}
