import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ApplicationsByStatusChart = ({ statusData = {} }) => {
  const labels = ['Applied', 'Under Review', 'Approved', 'Rejected', 'Waitlisted', 'Allocated'];
  const values = [
    statusData.applied || 0,
    statusData.under_review || 0,
    statusData.approved || 0,
    statusData.rejected || 0,
    statusData.waitlisted || 0,
    statusData.allocated || 0,
  ];

  const total = values.reduce((sum, v) => sum + v, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          '#60a5fa', // blue (applied)
          '#fbbf24', // amber (under_review)
          '#34d399', // emerald (approved)
          '#f87171', // rose (rejected)
          '#c084fc', // purple (waitlisted)
          '#6366f1', // indigo (allocated)
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 14,
          font: {
            size: 11,
            family: 'Inter',
          },
        },
      },
    },
    cutout: '68%',
  };

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
        No application records found to plot status distribution.
      </div>
    );
  }

  return (
    <div className="h-64 relative flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-800">{total}</span>
        <span className="block text-[10px] text-slate-400 uppercase font-medium">Total Apps</span>
      </div>
    </div>
  );
};

export default ApplicationsByStatusChart;
