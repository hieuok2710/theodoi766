import React, { useState, useCallback } from 'react';
import { INITIAL_YEARLY_DATA } from './constants';
import { Criterion, AnalysisResponse } from './types';
import { ScoreCard } from './components/ScoreCard';
import { DashboardCharts } from './components/DashboardCharts';
import { AIAdvisor } from './components/AIAdvisor';
import { analyzeScores } from './services/geminiService';
import { Save, RotateCcw, FileText, Calendar, CheckCircle2, AlertTriangle, LayoutDashboard, Database, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [yearlyData, setYearlyData] = useState<Record<number, Criterion[]>>(INITIAL_YEARLY_DATA);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const currentData = yearlyData[selectedMonth] || yearlyData[1];

  const handleScoreChange = useCallback((id: string, newScore: number) => {
    setYearlyData(prev => {
      const currentMonthData = prev[selectedMonth];
      const updatedMonthData = currentMonthData.map(item => 
        item.id === id ? { ...item, currentScore: newScore } : item
      );
      return { ...prev, [selectedMonth]: updatedMonthData };
    });
    if (analysis) setAnalysis(null);
  }, [analysis, selectedMonth]);

  const handleReset = () => {
    if (window.confirm(`Bạn có chắc chắn muốn đặt lại dữ liệu tháng ${selectedMonth}?`)) {
      setYearlyData(prev => ({ ...prev, [selectedMonth]: INITIAL_YEARLY_DATA[selectedMonth] }));
      setAnalysis(null);
      showToast(`Đã đặt lại dữ liệu tháng ${selectedMonth}`, "success");
    }
  };

  const handleSave = () => {
    showToast("Đã lưu dữ liệu thành công", "success");
  };

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
      showToast("Vui lòng cấu hình API KEY", "error");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeScores(currentData);
      setAnalysis(result);
    } catch (error) {
      showToast("Lỗi phân tích dữ liệu", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR TẬP TRUNG BÊN TRÁI */}
      <aside className="w-80 lg:w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-xl z-30">
        
        {/* Branding Area */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50">
              <FileText size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">Quyết định 766</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hệ thống quản trị CCHC</p>
            </div>
          </div>
        </div>

        {/* Navigation & Selection Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Menu Section 1: Dashboard Navigation */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <LayoutDashboard size={12} />
               Danh mục chính
            </h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm transition-all shadow-sm">
                 <div className="flex items-center gap-3">
                    <Database size={18} />
                    <span>Nhập liệu chỉ số</span>
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
                 <Settings size={18} />
                 <span>Cấu hình hệ thống</span>
              </button>
            </div>
          </div>

          {/* Menu Section 2: Month Selector */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} />
                Chu kỳ đánh giá (2026)
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Tháng {selectedMonth}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`
                    py-2 rounded-lg text-xs font-black transition-all border
                    ${selectedMonth === month 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
                  `}
                >
                  T{month}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Section 3: Detailed Inputs */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database size={12} />
              Dữ liệu thành phần
            </h3>
            <div className="space-y-4">
              {currentData.map(item => (
                <ScoreCard 
                  key={`${selectedMonth}-${item.id}`}
                  criterion={item} 
                  onChange={handleScoreChange} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleReset}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-black hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all uppercase tracking-tighter"
              >
                <RotateCcw size={14} />
                Đặt lại
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-tighter"
              >
                <Save size={14} />
                Lưu lại
              </button>
           </div>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 relative">
        
        {/* Top Floating Header Area */}
        <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md px-8 py-4 border-b border-slate-100 flex justify-between items-center">
           <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Dashboard Phân tích <ChevronRight size={18} className="text-slate-300" /> Tháng {selectedMonth}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cơ quan: Văn phòng Ủy ban Nhân dân Tỉnh</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden shadow-sm">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="avatar" />
                    </div>
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+5</div>
              </div>
           </div>
        </header>

        {/* Content Body */}
        <div className="max-w-7xl mx-auto p-8 pb-24 space-y-8">
          
          <DashboardCharts 
            data={currentData} 
            yearlyData={yearlyData}
            currentMonth={selectedMonth}
          />

          <AIAdvisor 
            isLoading={isAnalyzing} 
            analysis={analysis} 
            onAnalyze={handleAnalyze} 
          />
        </div>

        {/* Dynamic Toast */}
        {toast && (
          <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl text-white font-black transform transition-all duration-300 animate-slide-up z-[100] flex items-center gap-3 border ${toast.type === 'success' ? 'bg-slate-900 border-slate-800' : 'bg-rose-600 border-rose-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertTriangle size={20}/> }
            <span className="text-sm tracking-tight">{toast.message}</span>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;