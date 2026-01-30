import React from 'react';
import { AnalysisResponse } from '../types';
import { Sparkles, AlertTriangle, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';

interface AIAdvisorProps {
  isLoading: boolean;
  analysis: AnalysisResponse | null;
  onAnalyze: () => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ isLoading, analysis, onAnalyze }) => {
  return (
    <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-indigo-900">Trợ lý ảo 766</h2>
               <p className="text-indigo-600 text-sm">Phân tích dữ liệu & Khuyến nghị cải cách</p>
            </div>
          </div>
          
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold shadow-md transition-all
              ${isLoading 
                ? 'bg-white text-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-95'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Phân tích ngay
              </>
            )}
          </button>
        </div>

        {analysis && (
          <div className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-indigo-50 shadow-sm">
              <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Tổng quan
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2 ml-1">
                <CheckCircle className="w-5 h-5 text-indigo-500" />
                Khuyến nghị cải thiện
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`
                      bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow
                      ${rec.priority === 'High' ? 'border-red-100 border-l-4 border-l-red-500' : 
                        rec.priority === 'Medium' ? 'border-yellow-100 border-l-4 border-l-yellow-500' : 
                        'border-green-100 border-l-4 border-l-green-500'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 text-sm">{rec.title}</h4>
                      <span className={`
                        text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
                        ${rec.priority === 'High' ? 'bg-red-50 text-red-600' : 
                          rec.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 
                          'bg-green-50 text-green-600'}
                      `}>
                        {rec.priority === 'High' ? 'Ưu tiên cao' : rec.priority === 'Medium' ? 'Ưu tiên TB' : 'Ưu tiên thấp'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {rec.advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!analysis && !isLoading && (
           <div className="text-center py-8 text-indigo-300">
              <p>Nhấn nút "Phân tích ngay" để nhận đánh giá chi tiết từ AI dựa trên dữ liệu hiện tại.</p>
           </div>
        )}
      </div>
    </div>
  );
};