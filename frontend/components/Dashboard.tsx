"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fade } from "react-awesome-reveal";

import TopTagsChart from './TopTagsChart'; // Corrected path (same folder)
import SentimentChart from './SentimentChart'; // Corrected path (same folder)
import CommissionAccordion from './CommissionAccordion'; // <-- CORRECTED IMPORT PATH

// --- Interfaces ---
interface Tag { name: string; }
interface KeyPoint {
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}
interface Stakeholder { name: string; }
interface Issue {
  issue_number: number;
  title: string;
  stakeholders: Stakeholder[];
  key_points: KeyPoint[];
  tags: Tag[];
}
interface ReportInfo {
  id: number;
  title: string;
}
interface ReportDetail extends ReportInfo {
  start_date: string;
  end_date: string;
  issues: Issue[];
}

export default function Dashboard() {
  const [allReports, setAllReports] = useState<ReportInfo[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('Semua Tag');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(true);
    const initializeData = async () => {
      try {
        const reportsListRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/`);
        if (!reportsListRes.ok) throw new Error('Gagal mengambil daftar laporan');
        const reportsListData: ReportInfo[] = await reportsListRes.json();

        if (reportsListData.length > 0) {
          setAllReports(reportsListData);
          const reportIdFromUrl = searchParams.get('report_id');
          let reportToFetch = reportsListData[0];
          let initialIndex = 0;

          if (reportIdFromUrl) {
            const foundReport = reportsListData.find(r => r.id.toString() === reportIdFromUrl);
            if (foundReport) {
              reportToFetch = foundReport;
              initialIndex = reportsListData.findIndex(r => r.id === foundReport.id);
            }
          }

          setCurrentIndex(initialIndex);

          const reportDetailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportToFetch.id}/`);
          if (!reportDetailRes.ok) throw new Error(`Gagal mengambil data laporan ID ${reportToFetch.id}`);
          const reportDetailData: ReportDetail = await reportDetailRes.json();
          setCurrentReport(reportDetailData);
        } else {
          setCurrentReport(null);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [searchParams]);

  const getSentimentColorClass = (sentiment: KeyPoint['sentiment']) => {
    switch (sentiment) {
      case 'POSITIVE': return 'marker:text-green-500';
      case 'NEGATIVE': return 'marker:text-red-500';
      default: return 'marker:text-gray-400';
    }
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < allReports.length) {
      const newReportId = allReports[newIndex].id;
      router.push(`/?report_id=${newReportId}`);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const allTags = currentReport?.issues
    .flatMap(issue => issue.tags.map(t => t.name))
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort() || [];

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
      <div className="max-w-screen-xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <button onClick={() => handleNavigate('prev')} disabled={currentIndex >= allReports.length - 1 || isLoading} className="p-2 text-3xl text-gray-600 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed"> &lt; </button>
            <span className="bg-orange-100 text-orange-800 text-sm font-medium px-4 py-1.5 rounded-full">
              Periode: {formatDate(currentReport?.start_date)} s/d {formatDate(currentReport?.end_date)}
            </span>
            <button onClick={() => handleNavigate('next')} disabled={currentIndex <= 0 || isLoading} className="p-2 text-3xl text-gray-600 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed"> &gt; </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"> Dashboard Isu Mingguan Fraksi PKS DPR RI </h1>
          <p className="text-gray-600 max-w-2xl mx-auto"> Dashboard interaktif untuk memantau isu-isu utama. Klik pada tag di bawah untuk memfilter konten. </p>
          <hr className="mt-8 max-w-lg mx-auto border-gray-300" />
        </header>

        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {!currentReport ? (
            <div className="text-center text-gray-500 py-10">Tidak ada data laporan untuk ditampilkan.</div>
          ) : (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Top 5 Isu Utama</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {currentReport.issues.sort((a, b) => a.issue_number - b.issue_number).map((issue) => (
                    <Fade key={issue.issue_number} direction="up" cascade damping={0.1} triggerOnce>
                      <div className={`bg-white border border-gray-200 rounded-lg p-5 flex flex-col shadow-sm h-full transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg ${selectedTag !== 'Semua Tag' && !issue.tags.some(t => t.name === selectedTag) ? 'opacity-20' : 'opacity-100 hover:border-orange-400'}`}>
                        <h3 className="font-bold text-lg text-gray-900">ISU #{issue.issue_number}</h3>
                        <h4 className="font-semibold text-orange-600 mb-4">{issue.title}</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 flex-grow">
                          {issue.key_points.map((point, index) => (<li key={index} className={`leading-relaxed ${getSentimentColorClass(point.sentiment)}`}>{point.text}</li>))}
                        </ul>
                        <div className="flex flex-wrap gap-2 mt-4 border-t border-gray-200 pt-3">
                          {issue.tags.map(tag => (<span key={tag.name} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{tag.name}</span>))}
                        </div>
                      </div>
                    </Fade>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Filter Berdasarkan Topik</h2>
                <div className="flex flex-wrap gap-3 justify-center">
                    <button onClick={() => setSelectedTag('Semua Tag')} className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${selectedTag === 'Semua Tag' ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-300'}`}> Semua Tag </button>
                    {allTags.map(tag => (<button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? 'Semua Tag' : tag)} className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${selectedTag === tag ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-300'}`}>{tag}</button>))}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Fade direction="up" triggerOnce>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Top 5 Frekuensi Tag</h2>
                    <TopTagsChart reportId={currentReport?.id || null}/>
                  </div>
                </Fade>
                <Fade direction="up" triggerOnce>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Analisis Sentimen Mingguan</h2>
                    <SentimentChart reportId={currentReport?.id || null} />
                  </div>
                </Fade>
              </section>

              {/* --- Section Baru untuk Accordion --- */}
              <section className="mt-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Top 2 Isu Utama per Komisi & AKD</h2>
                <CommissionAccordion reportId={currentReport?.id || null} />
              </section>
            </>
          )}
        </div>

        <footer className="text-center mt-12 text-xs text-gray-500">
          <p>© Ringkasan Isu Mingguan per Minggu dan Komisi di DPR RI. Dashboard ini dirancang untuk menampilkan analisis isu harian per minggu secara dinamis. Disusun oleh: Ifan Islami dan Putra Dinantio. Data Oleh: Rashad.</p>
        </footer>
      </div>
  );
}