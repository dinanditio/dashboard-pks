"use client";
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface ChartProps {
  reportId: number | null;
}
interface TagData {
  name: string;
  count: number;
}

const TopTagsChart = ({ reportId }: ChartProps) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!reportId) return;

    // --- PERUBAHAN DI SINI ---
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/tag-frequency/`)
      .then(res => res.ok ? res.json() : [])
      .then((data: TagData[]) => {
        if (data.length === 0) {
          setChartData(null);
          return;
        }
        setChartData({
          labels: data.map(d => d.name),
          datasets: [{
            label: 'Frekuensi Tag',
            data: data.map(d => d.count),
            backgroundColor: 'rgba(249, 115, 22, 0.6)',
            borderColor: 'rgba(249, 115, 22, 1)',
            borderWidth: 1,
          }],
        });
      })
      .catch(() => setChartData(null));
  }, [reportId]);

  if (!chartData) return <p className="text-center text-gray-500">Memuat data atau data tidak tersedia.</p>;

  return (
    <div className="relative h-80 w-auto">
      <Bar 
        data={chartData} 
        options={{ 
          indexAxis: 'y', 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            datalabels: {
              display: false,
            }
          }, 
          scales: { 
            x: { 
              grid: { display: false },
              ticks: { precision: 0, stepSize: 1 },
              beginAtZero: true
            }, 
            y: { 
              grid: { display: false } 
            } 
          } 
        }} 
      />
    </div>
  );
};

export default TopTagsChart;