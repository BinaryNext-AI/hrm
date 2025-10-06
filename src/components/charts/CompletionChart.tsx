"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CompletionChartProps {
  completedDays: number;
  partialDays: number;
  insufficientDays: number;
  title: string;
}

export function CompletionChart({ completedDays, partialDays, insufficientDays, title }: CompletionChartProps) {
  const totalDays = completedDays + partialDays + insufficientDays;
  
  const chartData = {
    labels: ['Completed (8h+)', 'Partial (6-8h)', 'Insufficient (<6h)'],
    datasets: [
      {
        data: [completedDays, partialDays, insufficientDays],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = totalDays > 0 ? Math.round((value / totalDays) * 100) : 0;
            return `${label}: ${value} days (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
