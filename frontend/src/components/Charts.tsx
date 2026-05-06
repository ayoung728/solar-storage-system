import React from 'react'

interface ChartProps {
  data: { label: string; value: number }[]
  title?: string
}

export function BarChart({ data, title }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="chart-container">
      {title && <h3>📊 {title}</h3>}
      <div className="chart">
        {data.map((item, index) => (
          <div key={index} className="bar-chart-item">
            <span className="bar-value">{item.value}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ data, title }: ChartProps) {
  if (data.length < 2) {
    return (
      <div className="chart-container">
        {title && <h3>📈 {title}</h3>}
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>
          資料不足，無法繪製圖表
        </p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const padding = 10
  const width = 100
  const height = 100
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth
    const y = padding + chartHeight - (d.value / maxValue) * chartHeight
    return `${x},${y}`
  }).join(' ')

  // Area fill (closed path)
  const areaPoints = `${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}`

  return (
    <div className="chart-container">
      {title && <h3>📈 {title}</h3>}
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="line-chart">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={areaPoints}
          fill="url(#lineGrad)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * chartWidth
          const y = padding + chartHeight - (d.value / maxValue) * chartHeight
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="2.5" fill="#0c0f1a" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="5" fill="rgba(245,158,11,0.12)" stroke="none" />
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginTop: 8 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export function PieChart({ data, title }: ChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const colors = ['#f59e0b', '#06b6d4', '#10b981', '#f43f5e', '#8b5cf6', '#f97316']

  const slices = data.map((d, i) => {
    const percent = d.value / total
    return {
      ...d,
      percent: (percent * 100).toFixed(1),
      color: colors[i % colors.length],
    }
  })

  return (
    <div className="chart-container">
      {title && <h3>🥧 {title}</h3>}
      <div className="pie-chart">
        {slices.map((slice, i) => (
          <div key={i} className="pie-item">
            <span className="pie-color" style={{ backgroundColor: slice.color }} />
            <span className="pie-label">{slice.label}</span>
            <span className="pie-value">{slice.value} ({slice.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
