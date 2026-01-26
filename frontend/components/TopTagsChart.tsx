"use client";

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface TopTagsChartProps {
  reportId: number | null;
}

const TopTagsChart = ({ reportId }: TopTagsChartProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper untuk memotong teks panjang agar rapi di HP
  const truncateLabel = (label: string, maxLength: number = 15) => {
    if (label.length > maxLength) {
      return label.substring(0, maxLength) + '...';
    }
    return label;
  };

  useEffect(() => {
    if (!reportId) return;
    const fetchTopTags = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/top-tags/?limit=10`);
        if (!res.ok) throw new Error('Gagal mengambil data topik');
        const data = await res.json();
        
        setChartData({
          labels: data.labels,
          datasets: [{
            label: 'Jumlah Isu',
            data: data.counts,
            backgroundColor: 'rgba(71, 85, 105, 0.8)', // Slate-600
            hoverBackgroundColor: 'rgba(234, 88, 12, 0.9)', // Orange PKS
            borderRadius: 4,
            
            // --- SETTING KEPADATAN CHART (Mobile Friendly) ---
            // Angka mendekati 1.0 berarti semakin gemuk/rapat
            barPercentage: 0.9,      
            categoryPercentage: 0.8, 
            maxBarThickness: 50, // Batas maksimal di desktop agar tidak "raksasa"
          }],
        });
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchTopTags();
  }, [reportId]);

  if (!reportId) return null;
  if (error) return <p className="text-red-500 text-center py-10 text-sm">{error}</p>;
  if (!chartData) return <p className="text-center text-gray-500 py-10 text-sm">Memuat data...</p>;
  if (chartData.labels.length === 0) return <p className="text-center text-gray-500 py-10 text-sm">Belum ada data topik.</p>;

  return (
    <div className="h-full w-full">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false, // Wajib false agar mengikuti tinggi container
          layout: {
              padding: {
                  top: 25, // Ruang untuk angka di atas batang
                  left: 0,
                  right: 0,
                  bottom: 0
              }
          },
          scales: {
            y: {
              beginAtZero: true,
              border: { display: false },
              grid: {
                color: '#f1f5f9',
              },
              ticks: {
                stepSize: 1,
                font: { size: 10 },
                padding: 5
              }
            },
            x: {
              border: { display: false },
              grid: {
                display: false, // Bersih tanpa garis vertikal
              },
              ticks: {
                font: { size: 10 }, // Font kecil agar muat di HP
                maxRotation: 45,    // Miringkan label
                minRotation: 0,
                autoSkip: false,    // Jangan sembunyikan label
                // FITUR KHUSUS HP: Memotong label panjang
                callback: function(value) {
                  const label = this.getLabelForValue(value as number);
                  return truncateLabel(label); 
                }
              }
            }
          },
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#64748b',
              font: {
                weight: 'bold',
                size: 11
              },
              formatter: (value) => value
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 10,
                cornerRadius: 4,
                displayColors: false,
                callbacks: {
                  // Tampilkan judul lengkap saat ditekan lama (tooltip)
                  title: (tooltipItems) => {
                    return tooltipItems[0].label; 
                  }
                }
            }
          }
        }}
      />
    </div>
  );
};

export default TopTagsChart;