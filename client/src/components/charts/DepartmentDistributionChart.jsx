import React from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DepartmentDistributionChart = ({ departmentData = [] }) => {
  const labels = departmentData.map((d) => d.department || 'Unassigned');
  const counts = departmentData.map((d) => d.postingsCount || d.studentCount || 0);

  const data = {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Count',
        data: counts.length > 0 ? counts : [0],
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          color: '#f1f5f9',
        },
      },
    },
  };

  if (departmentData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        No department data recorded yet.
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

export default DepartmentDistributionChart;
