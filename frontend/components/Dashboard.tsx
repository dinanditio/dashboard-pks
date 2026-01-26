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
  
  // State untuk Back To Top Button
  const [showTopBtn, setShowTopBtn] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper: Format tanggal
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' });
  };
  const formatDateLong = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    setIsLoading(true);
    const initializeData = async () => {
      try {
        const reportsListRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/`);
        if (!reportsListRes.ok) throw new Error('Gagal mengambil daftar laporan. Server mungkin sedang sibuk.');
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

    // Logic scroll listener untuk Back To Top
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);

  }, [searchParams]);

  const handleReportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    router.push(`/?report_id=${newId}`);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const allTags = currentReport?.issues
    .flatMap(issue => issue.tags.map(t => t.name))
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort() || [];

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
      <p className="text-slate-600 max-w-md">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors">
        Coba Muat Ulang
      </button>
    </div>
  );

  // --- TAMPILAN LOADING (FULL SCREEN) ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
         <div className="relative flex items-center justify-center h-32 w-32 mb-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-200 opacity-75"></span>
            <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-orange-300 opacity-50"></span>
            <div className="relative inline-flex rounded-full h-20 w-20 bg-orange-500 items-center justify-center shadow-lg shadow-orange-500/30 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
         </div>
         <h2 className="text-2xl font-bold text-slate-800 mb-3">Menghubungkan ke Server</h2>
         <p className="text-slate-600 max-w-lg leading-relaxed mb-6 text-sm md:text-base">
           Sistem sedang mengambil dan menganalisis data isu mingguan terbaru.
         </p>
         <div className="flex items-center gap-2 text-orange-600 font-semibold bg-orange-50 px-6 py-2 rounded-full animate-pulse border border-orange-100">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Mohon tunggu sebentar...</span>
         </div>
      </div>
    );
  }

  // --- TAMPILAN UTAMA (DASHBOARD) ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* --- HEADER --- */}
      {/* UPDATE: Hapus border-b dari elemen header utama agar tidak full width */}
      <header className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
              Dashboard Isu Fraksi PKS
            </h1>
            <p className="text-xs text-slate-500 mt-1 hidden md:block">
              Pantau isu strategis mingguan secara dinamis
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-gray-200">
             <span className="text-xs font-semibold text-slate-500 uppercase px-2">Periode:</span>
             <div className="relative">
                <select 
                  value={currentReport?.id || ''} 
                  onChange={handleReportChange}
                  className="appearance-none bg-white hover:bg-gray-50 border border-gray-300 text-slate-700 text-sm font-medium py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer min-w-[240px]"
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
      
        {/* --- FILTER TAGS --- */}
        {/* UPDATE: Menghapus border-t dari div wrapper ini */}
        <div className="bg-white py-2">
            {/* UPDATE: Menambahkan border-t (atas) dan border-b (bawah) di sini agar panjangnya mengikuti konten */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-start border-t border-gray-100 pt-2">
              <span className="text-xs font-bold text-slate-400 mr-2 py-1.5 flex-shrink-0 select-none">
                FILTER:
              </span>
              <div className="flex-1 overflow-x-auto whitespace-nowrap pb-3 min-w-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-orange-400">
                <div className="flex items-center gap-2 pr-4">
                  <button onClick={() => setSelectedTag('Semua Tag')} className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all border ${selectedTag === 'Semua Tag' ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:bg-orange-50'}`}>
                    Semua Topik
                  </button>
                  {allTags.map(tag => (
                    <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? 'Semua Tag' : tag)} className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all border ${selectedTag === tag ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:bg-orange-50'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 transition-opacity duration-300">
        {!currentReport ? (
          <div className="text-center text-slate-500 py-20 bg-white rounded-xl border border-dashed border-gray-300">
            Tidak ada data laporan ditemukan.
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Isu Prioritas</h2>
              <div className="flex flex-col gap-6">
                {currentReport.issues.sort((a, b) => a.issue_number - b.issue_number).map((issue) => {
                  const isFiltered = selectedTag !== 'Semua Tag' && !issue.tags.some(t => t.name === selectedTag);
                  if (isFiltered) return null;
                  return (
                    <Fade key={issue.issue_number} direction="up" triggerOnce>
                      <article className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                Isu #{issue.issue_number}
                             </span>
                             <div className="flex flex-wrap gap-1.5">
                                {issue.tags.map(tag => (
                                  <span key={tag.name} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                    {tag.name}
                                  </span>
                                ))}
                             </div>
                          </div>
                          <h3 className="font-bold text-lg md:text-xl text-slate-800 mb-4 group-hover:text-orange-600 transition-colors">
                            {issue.title}
                          </h3>
                          <ul className="space-y-2">
                            {issue.key_points.map((point, idx) => (
                              <li key={idx} className={`text-sm md:text-base text-slate-600 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 ${point.sentiment === 'POSITIVE' ? 'before:text-green-500' : point.sentiment === 'NEGATIVE' ? 'before:text-red-500' : 'before:text-gray-400'}`}>
                                {point.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    </Fade>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 items-stretch">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                  Tren Topik Pembahasan
                </h3>
                <div className="flex-grow">
                   <TopTagsChart reportId={currentReport?.id || null}/>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Proporsi Sentimen
                </h3>
                <div className="flex-grow flex items-center justify-center">
                  <SentimentChart reportId={currentReport?.id || null} />
                </div>
              </div>
            </section>

            <section>
               <h2 className="text-xl font-bold text-slate-800 mb-5 text-center">Detail Isu per Komisi & AKD</h2>
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                  <CommissionAccordion reportId={currentReport?.id || null} />
               </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      {/* UPDATE: Hapus border-t dari elemen footer utama */}
      <footer className="bg-white mt-6">
        {/* UPDATE: Tambahkan border-t di dalam wrapper ini agar sejajar dengan konten utama */}
        <div className="max-w-screen-2xl mx-auto px-4 text-center border-t border-gray-200 py-6">
          <p className="text-sm font-semibold text-slate-700">Dashboard Isu Mingguan</p>
          <p className="text-xs text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
            Data diproses dari sumber berita internal dan eksternal untuk mendukung pengambilan keputusan strategis.
          </p>
          <p className="text-[10px] text-slate-400 mt-4">
            © {new Date().getFullYear()} Tim Media Monitoring.
          </p>
        </div>
      </footer>

      {/* --- BACK TO TOP BUTTON (ERGONOMIS) --- */}
      <div className={`fixed bottom-6 right-6 transition-all duration-300 z-50 ${showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <button 
          onClick={scrollToTop}
          className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          aria-label="Kembali ke atas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

    </div>
  );
}