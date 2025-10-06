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

interface ActivityChartProps {
  data: Array<{
    work_date: string;
    total_keystrokes: number;
    total_mouse_clicks: number;
    total_mouse_moves: number;
  }>;
  title: string;
}

export function ActivityChart({ data, title }: ActivityChartProps) {
  const chartData = {
    labels: data.map(item => new Date(item.work_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: 'Keystrokes',
        data: data.map(item => item.total_keystrokes || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Mouse Clicks',
        data: data.map(item => item.total_mouse_clicks || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Mouse Moves',
        data: data.map(item => item.total_mouse_moves || 0),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
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
          text: 'Activity Count',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
