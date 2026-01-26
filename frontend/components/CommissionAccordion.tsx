"use client";

import { useState, useEffect } from 'react';
import { Fade } from "react-awesome-reveal";

interface CommissionSummary {
  commission_name: string;
  issue_1_title: string | null;
  issue_2_title: string | null;
}

interface CommissionAccordionProps {
  reportId: number | null;
}

const CommissionAccordion = ({ reportId }: CommissionAccordionProps) => {
  const [summaries, setSummaries] = useState<CommissionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setSummaries([]);
    setOpenIndex(null);

    if (!reportId) {
      setIsLoading(false);
      return;
    }

    const fetchSummaries = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/commission-summary/`);
        if (!res.ok) throw new Error('Gagal mengambil data');
        const data: CommissionSummary[] = await res.json();
        setSummaries(data);
      } catch (err: any) {
        setError(err.message);
        setSummaries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, [reportId]);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (isLoading) return <div className="p-8 text-center"><div className="animate-pulse bg-slate-200 h-4 w-1/3 mx-auto rounded"></div></div>;
  if (error) return <p className="text-center text-red-500 py-4 text-sm">Gagal memuat data: {error}</p>;
  if (summaries.length === 0) return <p className="text-center text-slate-400 py-8 text-sm italic">Belum ada data ringkasan komisi.</p>;

  return (
    <div className="space-y-1">
      {summaries.map((summary, index) => (
        <div key={summary.commission_name} className="border-b border-gray-100 last:border-0">
          <button
            onClick={() => handleToggle(index)}
            className={`w-full text-left px-6 py-4 flex justify-between items-center transition-colors duration-200 ${openIndex === index ? 'bg-orange-50 text-orange-800' : 'bg-white hover:bg-gray-50 text-slate-700'}`}
          >
            <span className="font-bold text-sm md:text-base">{summary.commission_name}</span>
            <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-orange-600' : 'text-slate-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-6 py-4 bg-white text-sm text-slate-600 space-y-3 border-t border-orange-100/50">
              <div className="flex gap-3 items-start">
                 <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">1</span>
                 <p>{summary.issue_1_title || <span className="text-slate-400 italic">Tidak ada isu signifikan.</span>}</p>
              </div>
              <div className="flex gap-3 items-start">
                 <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">2</span>
                 <p>{summary.issue_2_title || <span className="text-slate-400 italic">Tidak ada isu signifikan.</span>}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommissionAccordion;