import {
  Play, Pause, SkipForward, RotateCcw, Clock, Wifi, WifiOff,
  Stethoscope, Settings2, Zap
} from 'lucide-react'

export default function SimControls({
  simState, isConnected, isLoading,
  onStart, onPause, onStep, onReset,
  numDoctors, setNumDoctors,
  scheduler, setScheduler,
}) {
  const isRunning = simState?.status === 'running'
  const isPaused = simState?.status === 'paused'
  const clock = simState?.clock ?? 0

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="section-header">
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(6,182,212,0.2)'
        }}>
          <Settings2 size={18} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <div>
          <h3 className="section-title">Simulation Control</h3>
          <p className="section-subtitle">Manage the triage simulation</p>
        </div>
      </div>

      {/* Clock + Status */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={20} style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Simulation Clock
            </div>
            <div style={{
              fontSize: '1.6rem', fontWeight: '900',
              background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {String(Math.floor(clock / 60)).padStart(2, '0')}:{String(clock % 60).padStart(2, '0')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            background: isRunning ? 'rgba(16,185,129,0.1)' : isPaused ? 'rgba(234,179,8,0.1)' : 'rgba(100,116,139,0.1)',
            border: `1px solid ${isRunning ? 'rgba(16,185,129,0.2)' : isPaused ? 'rgba(234,179,8,0.2)' : 'rgba(100,116,139,0.2)'}`,
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: isRunning ? '#10b981' : isPaused ? '#eab308' : '#64748b',
              boxShadow: isRunning ? '0 0 8px rgba(16,185,129,0.5)' : 'none',
              animation: isRunning ? 'pulse-glow 2s infinite' : 'none',
            }} />
            <span style={{
              fontSize: '0.7rem', fontWeight: '600',
              color: isRunning ? '#10b981' : isPaused ? '#eab308' : '#64748b',
              textTransform: 'uppercase'
            }}>
              {simState?.status || 'Idle'}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.65rem', color: isConnected ? '#10b981' : '#64748b'
          }}>
            {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isConnected ? 'Connected' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {!isRunning ? (
          <button
            className="btn btn-success"
            onClick={() => onStart({ num_doctors: numDoctors, scheduler })}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            <Play size={16} />
            {isPaused ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            className="btn btn-warning"
            onClick={onPause}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            <Pause size={16} />
            Pause
          </button>
        )}

        <button
          className="btn btn-ghost"
          onClick={onStep}
          disabled={isLoading || isRunning}
          style={{ flex: 1 }}
        >
          <SkipForward size={16} />
          Step
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={onReset}
          disabled={isLoading}
          title="Reset simulation"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Scheduler Selection */}
        <div>
          <label className="input-label">
            <Zap size={10} style={{ display: 'inline', marginRight: '4px' }} />
            Scheduling Algorithm
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'priority', label: 'Priority' },
              { key: 'round_robin', label: 'Round Robin' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setScheduler(opt.key)}
                className={scheduler === opt.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                style={{ flex: '1 1 120px', fontSize: '0.75rem' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Count */}
        <div>
          <label className="input-label">
            <Stethoscope size={10} style={{ display: 'inline', marginRight: '4px' }} />
            Number of Doctors: {numDoctors}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="range"
              min="1"
              max="5"
              value={numDoctors}
              onChange={(e) => setNumDoctors(Number(e.target.value))}
              style={{
                flex: 1, height: '4px',
                accentColor: 'var(--accent-indigo)',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer',
                    background: n <= numDoctors ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: n <= numDoctors ? 'var(--accent-indigo-light)' : 'var(--text-muted)',
                    border: `1px solid ${n <= numDoctors ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                    transition: 'all var(--transition-fast)',
                  }}
                  onClick={() => setNumDoctors(n)}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
