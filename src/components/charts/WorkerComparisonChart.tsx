"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WorkerData {
  id: number;
  email: string;
  total_seconds: number;
  session_count: number;
}

interface WorkerComparisonChartProps {
  workers: WorkerData[];
  title: string;
}

export function WorkerComparisonChart({ workers, title }: WorkerComparisonChartProps) {
  const chartData = {
    labels: workers.map(worker => worker.email.split('@')[0]), // Use username part only
    datasets: [
      {
        label: 'Total Hours',
        data: workers.map(worker => Math.round((worker.total_seconds / 3600) * 10) / 10),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: '8-Hour Target',
        data: new Array(workers.length).fill(8),
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderDash: [5, 5],
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
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
