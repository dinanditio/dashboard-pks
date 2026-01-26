"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fade } from "react-awesome-reveal";

import TopTagsChart from './TopTagsChart';
import SentimentChart from './SentimentChart';
import CommissionAccordion from './CommissionAccordion';

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
  start_date: string;
  end_date: string;
}
interface ReportDetail extends ReportInfo {
  issues: Issue[];
}

export default function Dashboard() {
  const [allReports, setAllReports] = useState<ReportInfo[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('Semua Tag');
  const [showTopBtn, setShowTopBtn] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper Formatter
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  useEffect(() => {
    setIsLoading(true);
    const initializeData = async () => {
      try {
        const reportsListRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/`);
        if (!reportsListRes.ok) throw new Error('Gagal mengambil daftar laporan.');
        const reportsListData: ReportInfo[] = await reportsListRes.json();

        if (reportsListData.length > 0) {
          setAllReports(reportsListData);
          const reportIdFromUrl = searchParams.get('report_id');
          let reportToFetch = reportsListData[0];
          if (reportIdFromUrl) {
            const found = reportsListData.find(r => r.id.toString() === reportIdFromUrl);
            if (found) reportToFetch = found;
          }
          const reportDetailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportToFetch.id}/`);
          if (!reportDetailRes.ok) throw new Error(`Gagal mengambil data.`);
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

    const handleScroll = () => {
      if (window.scrollY > 300) setShowTopBtn(true);
      else setShowTopBtn(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchParams]);

  const handleReportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/?report_id=${e.target.value}`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allTags = currentReport?.issues
    .flatMap(issue => issue.tags.map(t => t.name))
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort() || [];

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
      <p className="text-slate-600 mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-orange-600 text-white rounded-full">Muat Ulang</button>
    </div>
  );

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
         <div className="relative flex items-center justify-center h-24 w-24 mb-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-200 opacity-75"></span>
            <div className="relative inline-flex rounded-full h-16 w-16 bg-orange-500 items-center justify-center shadow-lg z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
         </div>
         <h2 className="text-xl font-bold text-slate-800 mb-2">Menyiapkan Data</h2>
         <p className="text-slate-500 text-sm">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      
      {/* --- HEADER (Optimized for Mobile) --- */}
      <header className="bg-white sticky top-0 z-30 shadow-sm">
        {/* Menambahkan 'items-center' pada parent agar di mobile rata tengah secara vertikal */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex flex-col md:flex-row items-center md:justify-between gap-3">
          {/* Judul - Sudah rata tengah di mobile */}
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-2xl font-bold text-slate-800 leading-tight">
              Dashboard Isu Fraksi PKS
            </h1>
          </div>

          {/* Dropdown Periode - PERBAIKAN: Ditambahkan 'justify-center' untuk mobile */}
          <div className="w-full md:w-auto bg-slate-50 p-1 rounded-lg border border-gray-200 flex items-center justify-center md:justify-start">
             <div className="relative w-full md:w-auto max-w-xs"> {/* max-w-xs agar tidak terlalu lebar di HP */}
                <select 
                  value={currentReport?.id || ''} 
                  onChange={handleReportChange}
                  className="w-full md:min-w-[220px] appearance-none bg-transparent text-slate-700 text-sm font-semibold py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-center md:text-left"
                >
                  {allReports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {formatDateShort(report.start_date)} - {formatDateShort(report.end_date)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>
          </div>
        </div>
      
        {/* --- FILTER BAR --- */}
        <div className="bg-white pb-2">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-start border-t border-gray-100 pt-2">
              <span className="text-xs font-bold text-slate-400 mr-2 py-1.5 flex-shrink-0 select-none">
                FILTER:
              </span>
              <div className="flex-1 overflow-x-auto whitespace-nowrap pb-1 min-w-0 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center gap-2 pr-4">
                  <button onClick={() => setSelectedTag('Semua Tag')} className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all border ${selectedTag === 'Semua Tag' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'}`}>
                    Semua
                  </button>
                  {allTags.map(tag => (
                    <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? 'Semua Tag' : tag)} className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all border ${selectedTag === tag ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {!currentReport ? (
          <div className="text-center text-slate-500 py-20">Data tidak ditemukan.</div>
        ) : (
          <>
            {/* ISU PRIORITAS */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 text-center">Isu Prioritas</h2>
              <div className="flex flex-col gap-4">
                {currentReport.issues.sort((a, b) => a.issue_number - b.issue_number).map((issue) => {
                  const isFiltered = selectedTag !== 'Semua Tag' && !issue.tags.some(t => t.name === selectedTag);
                  if (isFiltered) return null;

                  return (
                    <Fade key={issue.issue_number} direction="up" triggerOnce>
                      <article className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                             <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                Isu #{issue.issue_number}
                             </span>
                          </div>
                          
                          <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug">
                            {issue.title}
                          </h3>

                          <ul className="space-y-2 mb-4">
                            {issue.key_points.map((point, idx) => (
                              <li key={idx} className={`text-sm text-slate-600 leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 ${point.sentiment === 'POSITIVE' ? 'before:text-green-500' : point.sentiment === 'NEGATIVE' ? 'before:text-red-500' : 'before:text-gray-400'}`}>
                                {point.text}
                              </li>
                            ))}
                          </ul>

                          {/* FOOTER KARTU: Tags */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                            {issue.tags.map(tag => (
                              <span key={tag.name} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-medium">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    </Fade>
                  );
                })}
              </div>
            </section>

            {/* CHARTS - PERBAIKAN OVERFLOW */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                  Tren Topik
                </h3>
                {/* PERBAIKAN: Gunakan w-full h-72 relative agar tidak tembus */}
                <div className="w-full h-72 relative">
                   <TopTagsChart reportId={currentReport?.id || null}/>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Sentimen
                </h3>
                 {/* PERBAIKAN: Gunakan w-full h-72 relative agar tidak tembus */}
                <div className="w-full h-72 relative">
                  <SentimentChart reportId={currentReport?.id || null} />
                </div>
              </div>
            </section>

            {/* ACCORDION */}
            <section>
               <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 text-center">Detail per Komisi</h2>
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <CommissionAccordion reportId={currentReport?.id || null} />
               </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white mt-8 border-t border-gray-200 py-6">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-700">Dashboard Isu Mingguan</p>
          <p className="text-[10px] text-slate-400 mt-2">
            © {new Date().getFullYear()} Tim Media Monitoring.
          </p>
        </div>
      </footer>

      {/* BACK TO TOP */}
      <div className={`fixed bottom-6 right-6 transition-all duration-300 z-40 ${showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <button onClick={scrollToTop} className="bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-700">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

    </div>
  );
}