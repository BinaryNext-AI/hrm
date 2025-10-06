"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TimeChartProps {
  data: Array<{
    work_date: string;
    total_seconds: number;
    work_status?: string;
  }>;
  title: string;
  type?: 'line' | 'bar';
}

export function TimeChart({ data, title, type = 'line' }: TimeChartProps) {
  const chartData = {
    labels: data.map(item => new Date(item.work_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: 'Hours Worked',
        data: data.map(item => Math.round((item.total_seconds / 3600) * 10) / 10),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: '8-Hour Target',
        data: new Array(data.length).fill(8),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  if (type === 'bar') {
    return <Bar data={chartData} options={options} />;
  }

  return <Line data={chartData} options={options} />;
}
