import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Info } from 'lucide-react'

export default function ComplexityPanel() {
  // Pre-computed complexity data
  const data = useMemo(() => [
    { n: 5, 'Selection Sort (n²)': 25, 'Merge Sort (n log n)': Math.round(5 * Math.log2(5) * 10) / 10 },
    { n: 10, 'Selection Sort (n²)': 100, 'Merge Sort (n log n)': Math.round(10 * Math.log2(10) * 10) / 10 },
    { n: 15, 'Selection Sort (n²)': 225, 'Merge Sort (n log n)': Math.round(15 * Math.log2(15) * 10) / 10 },
    { n: 20, 'Selection Sort (n²)': 400, 'Merge Sort (n log n)': Math.round(20 * Math.log2(20) * 10) / 10 },
    { n: 25, 'Selection Sort (n²)': 625, 'Merge Sort (n log n)': Math.round(25 * Math.log2(25) * 10) / 10 },
    { n: 50, 'Selection Sort (n²)': 2500, 'Merge Sort (n log n)': Math.round(50 * Math.log2(50) * 10) / 10 },
    { n: 100, 'Selection Sort (n²)': 10000, 'Merge Sort (n log n)': Math.round(100 * Math.log2(100) * 10) / 10 },
  ], [])

  const tableData = useMemo(() => [
    { n: 5, sel: 25, merge: '11.6' },
    { n: 10, sel: 100, merge: '33.2' },
    { n: 15, sel: 225, merge: '58.6' },
    { n: 20, sel: 400, merge: '86.4' },
    { n: 25, sel: 625, merge: '116.1' },
    { n: 50, sel: 2500, merge: '282.2' },
    { n: 100, sel: 10000, merge: '664.4' },
  ], [])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px',
        boxShadow: 'var(--glow-indigo)',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
          Input Size: n = {label}
        </p>
        {payload.map((entry, i) => (
          <p key={i} style={{ fontSize: '0.72rem', color: entry.color, marginBottom: '2px' }}>
            {entry.name}: <strong>{entry.value.toLocaleString()}</strong> ops
          </p>
        ))}
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
          Ratio: {payload[0] && payload[1] ? `${(payload[0].value / payload[1].value).toFixed(1)}x` : '-'}
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="section-header">
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(16,185,129,0.2)'
        }}>
          <TrendingUp size={18} style={{ color: '#10b981' }} />
        </div>
        <div>
          <h3 className="section-title">Complexity Analysis</h3>
          <p className="section-subtitle">Big-O comparison · Operations vs Input Size</p>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        width: '100%', height: '300px',
        padding: '8px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
        marginBottom: '20px',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="n"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              label={{ value: 'Operations', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
            <Legend
              wrapperStyle={{ fontSize: '0.72rem', paddingTop: '8px' }}
              iconType="roundRect"
            />
            <Bar
              dataKey="Selection Sort (n²)"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="Merge Sort (n log n)"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr>
              <th style={thStyle}>n</th>
              <th style={{ ...thStyle, color: '#f59e0b' }}>n² (Selection)</th>
              <th style={{ ...thStyle, color: '#8b5cf6' }}>n log₂n (Merge)</th>
              <th style={thStyle}>Ratio</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.n}>
                <td style={{ ...tdStyle, fontWeight: '700' }}>{row.n}</td>
                <td style={tdStyle}>
                  <span style={{
                    fontFamily: 'monospace', padding: '2px 6px',
                    borderRadius: '4px', background: 'rgba(245,158,11,0.08)', color: '#f59e0b',
                    fontWeight: '600',
                  }}>
                    {row.sel.toLocaleString()}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    fontFamily: 'monospace', padding: '2px 6px',
                    borderRadius: '4px', background: 'rgba(139,92,246,0.08)', color: '#a78bfa',
                    fontWeight: '600',
                  }}>
                    {row.merge}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600',
                  }}>
                    {(row.sel / parseFloat(row.merge)).toFixed(1)}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insight */}
      <div style={{
        marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
        background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)',
        display: 'flex', alignItems: 'flex-start', gap: '10px',
      }}>
        <Info size={14} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          At <strong>n = 100</strong>, Selection Sort performs <strong>{(10000 / 664.4).toFixed(0)}x more operations</strong> than Merge Sort.
          For a busy ER with many patients, Merge Sort's O(n log n) efficiency is critical for real-time queue management.
        </span>
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
