"use client";

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0 });
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

interface SentimentChartProps {
  reportId: number | null;
}

const SentimentChart = ({ reportId }: SentimentChartProps) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    const fetchSentimentData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/sentiment-analysis/`);
        if (!res.ok) throw new Error('Gagal mengambil data sentimen');
        const data = await res.json();
        const backgroundColors = data.labels.map((label: string) => {
          if (label === 'Positif') return 'rgba(34, 197, 94, 0.8)'; // Hijau
          if (label === 'Negatif') return 'rgba(239, 68, 68, 0.8)'; // Merah
          if (label === 'Netral') return 'rgba(156, 163, 175, 0.8)'; // Abu-abu
          return 'rgba(54, 162, 235, 0.8)';
        });
        setChartData({
          labels: data.labels,
          datasets: [{
            label: 'Analisis Sentimen',
            data: data.counts,
            backgroundColor: backgroundColors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 4
          }],
        });
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchSentimentData();
  }, [reportId]);

  if (!reportId) return null;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;
  if (!chartData) return <p className="text-center py-10 text-gray-500">Memuat data sentimen...</p>;
  if (chartData.labels.length === 0) return <p className="text-center text-gray-500 py-10">Belum ada data.</p>;

  return (
    <div className="relative h-full min-h-[350px] w-full flex items-center justify-center">
      <Pie
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 20 // Memberi sedikit jarak agar tidak terlalu sesak
          },
          plugins: {
            legend: {
              position: 'bottom', // UPDATE: Label dipaksa ke bawah (center)
              align: 'center',    // UPDATE: Rata tengah
              labels: {
                usePointStyle: true, // Ikon bulat
                boxWidth: 10,
                padding: 20,
                font: {
                    size: 12
                }
              }
            },
            datalabels: {
              formatter: (value, ctx) => {
                const datapoints = ctx.chart.data.datasets[0].data as number[];
                const total = datapoints.reduce((total, datapoint) => total + datapoint, 0);
                const percentage = (value / total * 100);
                return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
              },
              color: '#fff',
              font: {
                weight: 'bold',
                size: isMobile ? 12 : 14,
              },
              anchor: 'center',
              align: 'center',
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                cornerRadius: 4
            }
          }
        }}
      />
    </div>
  );
};

export default SentimentChart;