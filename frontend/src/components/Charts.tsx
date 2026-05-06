import React from 'react'

interface ChartProps {
  data: { label: string; value: number }[]
  title?: string
}

export function BarChart({ data, title }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="chart-container">
      {title && <h3>{title}</h3>}
      <div className="chart">
        {data.map((item, index) => (
          <div key={index} className="bar-chart-item">
            <span className="bar-label">{item.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="bar-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ data, title }: ChartProps) {
  if (data.length < 2) return null

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (d.value / maxValue) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="chart-container">
      {title && <h3>{title}</h3>}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
        <polyline
          points={points}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = 100 - (d.value / maxValue) * 80
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#f59e0b" />
        })}
      </svg>
    </div>
  )
}

export function PieChart({ data, title }: ChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const colors = ['#f59e0b', '#34d399', '#ef4444', '#60a5fa', '#a78bfa']

  let cumulativePercent = 0
  const slices = data.map((d, i) => {
    const percent = d.value / total
    const startAngle = cumulativePercent * 360
    cumulativePercent += percent

    return {
      ...d,
      percent: (percent * 100).toFixed(1),
      color: colors[i % colors.length],
    }
  })

  return (
    <div className="chart-container">
      {title && <h3>{title}</h3>}
      <div className="pie-chart">
        {slices.map((slice, i) => (
          <div key={i} className="pie-item">
            <span className="pie-color" style={{ backgroundColor: slice.color }} />
            <span>{slice.label}</span>
            <span className="pie-value">{slice.value} ({slice.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
