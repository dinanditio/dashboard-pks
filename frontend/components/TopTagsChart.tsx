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

  // Helper untuk memotong teks jika terlalu panjang agar tidak merusak layout kiri
  const truncateLabel = (label: string, maxLength: number = 20) => {
    if (label.length > maxLength) {
      return label.substring(0, maxLength) + '...';
    }
    return label;
  };

  useEffect(() => {
    if (!reportId) return;
    const fetchTopTags = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/tag-frequency/`);
        if (!res.ok) throw new Error('Gagal mengambil data topik');
        
        const data = await res.json();
        
        const extractedLabels = data.map((item: any) => item.name);
        const extractedCounts = data.map((item: any) => item.count);
        
        setChartData({
          labels: extractedLabels,
          datasets: [{
            label: 'Jumlah Isu',
            data: extractedCounts,
            // Mengubah warna batang menjadi Oranye PKS dengan efek hover yang solid
            backgroundColor: 'rgba(234, 88, 12, 0.85)', 
            hoverBackgroundColor: 'rgba(234, 88, 12, 1)', 
            borderRadius: 6,
            
            // Pengaturan ketebalan batang horizontal agar proporsional
            barPercentage: 0.7,      
            categoryPercentage: 0.8, 
            maxBarThickness: 35, 
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
          // PENTING: Mengubah sumbu utama menjadi Y untuk membuat grafik horizontal (Top-Down)
          indexAxis: 'y', 
          responsive: true,
          maintainAspectRatio: false, 
          layout: {
              padding: {
                  top: 10, 
                  left: 10,
                  right: 35, // Ruang ekstra di sisi kanan agar angka datalabel tidak terpotong kontainer
                  bottom: 10
              }
          },
          scales: {
            x: {
              // Sumbu X sekarang menjadi sumbu angka (linear)
              beginAtZero: true,
              border: { display: false },
              grid: {
                color: '#f1f5f9',
              },
              ticks: {
                stepSize: 1,
                font: { size: 11 },
                padding: 5
              }
            },
            y: {
              // Sumbu Y sekarang menjadi sumbu kategori teks (labels)
              border: { display: false },
              grid: {
                display: false, // Bersih dari garis horizontal di dalam grafik
              },
              ticks: {
                font: { 
                  size: 11,
                  weight: 'bold'
                }, 
                color: '#475569',
                autoSkip: false,    
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
              // Menempatkan angka indeks tepat di ujung kanan luar dari setiap batang horizontal
              anchor: 'end',
              align: 'right',
              color: '#1e293b', 
              font: {
                weight: 'bold',
                size: 12
              },
              formatter: (value) => value
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 6,
                displayColors: false,
                callbacks: {
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