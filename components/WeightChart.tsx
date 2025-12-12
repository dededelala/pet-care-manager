'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface WeightChartProps {
  records: Array<{
    id: string
    date: Date
    weight: number
    unit: string
  }>
  petName: string
}

export default function WeightChart({ records, petName }: WeightChartProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-pink-100 p-8 text-center">
        <p className="text-gray-600">还没有体重记录</p>
      </div>
    )
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const data = {
    labels: sortedRecords.map((record) =>
      format(new Date(record.date), 'MM/dd', { locale: zhCN })
    ),
    datasets: [
      {
        label: `体重 (${sortedRecords[0].unit})`,
        data: sortedRecords.map((record) => Number(record.weight.toFixed(2))),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${petName} 的体重变化趋势`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const record = sortedRecords[context.dataIndex]
            return `${Number(record.weight.toFixed(2))}${record.unit} (${format(
              new Date(record.date),
              'yyyy年MM月dd日',
              { locale: zhCN }
            )})`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: any) {
            return Number(value.toFixed(2)) + sortedRecords[0].unit
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-pink-100 p-6">
      <div style={{ height: '400px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
