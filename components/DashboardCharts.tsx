import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Text,
  LabelList
} from 'recharts';
import { Criterion } from '../types';
import { TrendingUp, TrendingDown, Minus, Info, Target, Zap } from 'lucide-react';

interface DashboardChartsProps {
  data: Criterion[];
  yearlyData: Record<number, Criterion[]>;
  currentMonth: number;
}

const ANIMATION_DURATION = 1200;
const ANIMATION_EASING = "ease-in-out";

// Helper to render score difference with improved UI
const ScoreDiffBadge = ({ current, prev }: { current: number; prev: number | undefined }) => {
  if (prev === undefined) return <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded">N/A</span>;
  
  const diff = current - prev;
  const absDiff = Math.abs(diff);
  
  if (absDiff < 0.05) return <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded"><Minus size={10}/> 0.0</span>;
  
  const isPositive = diff > 0;
  return (
    <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
      {isPositive ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
      {absDiff.toFixed(1)}
    </span>
  );
};

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { fullData, prevScore, A, B } = data;
    const percentage = (A / B) * 100;
    
    let colorClass = 'bg-rose-500';
    let textClass = 'text-rose-600';
    if (percentage >= 85) { colorClass = 'bg-emerald-500'; textClass = 'text-emerald-600'; }
    else if (percentage >= 70) { colorClass = 'bg-blue-500'; textClass = 'text-blue-600'; }
    else if (percentage >= 50) { colorClass = 'bg-amber-500'; textClass = 'text-amber-600'; }

    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 max-w-[320px] animate-in fade-in zoom-in-95 duration-300 z-[100]">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiêu chí chi tiết</p>
          </div>
          <ScoreDiffBadge current={A} prev={prevScore} />
        </div>
        
        <p className="font-bold text-slate-800 text-base mb-1.5 leading-tight">{data.fullTitle}</p>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
          {fullData.description}
        </p>
        
        <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Hiện tại</span>
            <span className={`text-2xl font-black ${textClass}`}>{A}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Mục tiêu</span>
            <span className="text-2xl font-black text-slate-400">{B}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
             <span>TIẾN ĐỘ</span>
             <span>{percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200/50 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${colorClass} shadow-sm`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTrendTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const diff = data.prevScore !== undefined ? data.score - data.prevScore : 0;
    const percentChange = data.prevScore ? (diff / data.prevScore) * 100 : 0;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-800 text-white min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex justify-between items-center mb-2">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tháng {data.month}</p>
          {data.prevScore !== undefined && (
             <div className={`flex items-center text-[10px] font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diff >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
             </div>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-black">{data.score.toFixed(1)}</p>
          <p className="text-xs text-slate-400 font-bold">ĐIỂM</p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-bold">THÁNG TRƯỚC</span>
          <span className="text-xs font-bold text-slate-300">{data.prevScore?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, criteriaMeta }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalScore = payload.reduce((sum: number, entry: any) => sum + (typeof entry.value === 'number' ? entry.value : 0), 0);
    
    return (
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-100 min-w-[260px] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-2">
             <div className="p-1.5 bg-blue-50 rounded-lg">
                <Zap size={14} className="text-blue-600" />
             </div>
             <span className="font-black text-slate-800 text-sm">Tháng {data.month}</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-slate-400 leading-none">TỔNG ĐIỂM</span>
             <span className="font-black text-blue-600 text-xl leading-tight">{totalScore.toFixed(1)}</span>
           </div>
        </div>
        
        <div className="space-y-2.5">
          {criteriaMeta.map((meta: any) => {
            const val = data[meta.id];
            const max = 22; // Approximation for scaling, ideally from data
            return (
              <div key={meta.id} className="group flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }}></div>
                    <span className="text-slate-600 font-bold truncate max-w-[160px] uppercase tracking-tighter" title={meta.title}>{meta.title}</span>
                  </div>
                  <span className="font-black text-slate-900">{val}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ backgroundColor: meta.color, width: `${(val/max)*100}%` }}
                   />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
           Dữ liệu Quyết định 766
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, yearlyData, currentMonth }) => {
  
  const prevMonthKey = currentMonth - 1;
  const prevMonthData = yearlyData[prevMonthKey];
  
  const radarData = data.map(item => {
    const prevItem = prevMonthData?.find(p => p.id === item.id);
    return {
      subject: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
      fullTitle: item.title,
      A: item.currentScore,
      B: item.maxScore,
      fullData: item,
      prevScore: prevItem ? prevItem.currentScore : undefined
    };
  });

  const totalScore = data.reduce((acc, item) => acc + item.currentScore, 0);
  const totalMax = data.reduce((acc, item) => acc + item.maxScore, 0);
  const totalPercentage = (totalScore / totalMax) * 100;

  const trendData = Object.keys(yearlyData).map((monthKey) => {
    const m = parseInt(monthKey);
    const monthScores = yearlyData[m];
    const total = monthScores.reduce((acc, item) => acc + item.currentScore, 0);
    const prevM = m - 1;
    let prevTotal = undefined;
    if (yearlyData[prevM]) {
        prevTotal = yearlyData[prevM].reduce((acc, item) => acc + item.currentScore, 0);
    }

    return {
      name: `T${m}`,
      month: m,
      score: total,
      prevScore: prevTotal,
      isCurrent: m === currentMonth
    };
  });

  const stackedData = Object.keys(yearlyData).map(monthKey => {
    const m = parseInt(monthKey);
    const monthScores = yearlyData[m];
    const entry: any = { name: `T${m}`, month: m };
    monthScores.forEach(c => {
      entry[c.id] = c.currentScore;
    });
    return entry;
  });

  const criteriaMeta = data.map(c => ({ id: c.id, title: c.title, color: c.color }));

  // Custom Tick Component for Radar Chart
  const CustomPolarTick = ({ payload, x, y, cx, cy, textAnchor, ...rest }: any) => {
    const dataPoint = radarData[payload.index];
    return (
       <g transform={`translate(${x},${y})`}>
          <text 
             x={0} 
             y={0} 
             textAnchor={textAnchor}
             dominantBaseline="middle"
             {...rest}
          >
             <tspan x="0" dy="-0.6em" fill="#64748b" fontWeight="700" fontSize="10px">{dataPoint.subject}</tspan>
             <tspan x="0" dy="1.4em" fill={dataPoint.fullData.color} fontWeight="900" fontSize="14px">
                {dataPoint.A}
                <tspan fill="#cbd5e1" fontSize="10px" fontWeight="500"> / {dataPoint.B}</tspan>
             </tspan>
          </text>
       </g>
    );
 };

  return (
    <div className="space-y-8 mb-8">
      {/* KPI & Radar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Animated Score Gauge */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col items-center justify-center relative group">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-t-3xl"></div>
           
           <div className="flex justify-between w-full items-start mb-4">
             <div className="flex flex-col">
               <h3 className="text-xl font-black text-slate-800">Hiệu quả tháng {currentMonth}</h3>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  <Target size={12} className="text-blue-500" />
                  Mục tiêu cải cách 2026
               </div>
             </div>
             <div className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100 uppercase">Live Data</div>
           </div>
           
           <div className="relative flex items-center justify-center w-64 h-64 my-4 drop-shadow-2xl">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="105"
                  stroke="currentColor"
                  strokeWidth="22"
                  fill="transparent"
                  className="text-slate-50"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="105"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="22"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 105}
                  strokeDashoffset={2 * Math.PI * 105 * (1 - totalPercentage / 100)}
                  className="transition-all duration-[1500ms] ease-in-out"
                  strokeLinecap="round"
                />
                <defs>
                   <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#7c3aed" />
                   </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-1">
                   <span className="text-6xl font-black text-slate-800 tracking-tighter">{totalScore.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">TRÊN 100 ĐIỂM</span>
                </div>
              </div>
           </div>
           
           <div className="mt-4 w-full flex flex-col items-center">
              <span className={`px-8 py-2.5 rounded-2xl text-white text-sm font-black uppercase tracking-widest shadow-lg transform transition-transform group-hover:scale-105 duration-300 ${
                  totalPercentage >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200' : 
                  totalPercentage >= 80 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200' : 
                  totalPercentage >= 65 ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-200' : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-200'
              }`}>
                {totalPercentage >= 90 ? 'Xuất sắc' : 
                 totalPercentage >= 80 ? 'Tốt' : 
                 totalPercentage >= 65 ? 'Khá' : 
                 totalPercentage >= 50 ? 'Trung bình' : 'Yếu'}
              </span>
              <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xếp loại dựa trên thang điểm chuẩn</p>
           </div>
        </div>

        {/* Enhanced Radar Chart */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col group">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-800">Biểu đồ năng lực</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Phân tích đa chiều các chỉ số</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors duration-300">
              <Info size={18} className="text-slate-400 group-hover:text-blue-500" />
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={(props) => <CustomPolarTick {...props} />}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 25]} 
                  tick={false} 
                  axisLine={false} 
                />
                <Radar
                  name={`Tháng ${currentMonth}`}
                  dataKey="A"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  isAnimationActive={true}
                  animationDuration={ANIMATION_DURATION}
                  animationEasing={ANIMATION_EASING}
                  activeDot={{ r: 8, fill: '#fff', stroke: '#2563eb', strokeWidth: 4 }}
                />
                 <Radar
                  name="Điểm tối đa"
                  dataKey="B"
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  strokeDasharray="10 10"
                  fill="transparent"
                  isAnimationActive={false}
                />
                <Tooltip content={<CustomRadarTooltip />} />
                <Legend 
                  iconType="circle" 
                  formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{value}</span>}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Stacked Bar Chart with Interactivity */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Cấu trúc điểm theo tháng</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter mt-1">So sánh sự biến động giữa các nhóm tiêu chí</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
             <div className="w-3 h-3 rounded-full bg-blue-600"></div>
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2">Năm 2026</span>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stackedData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }}
                   domain={[0, 100]}
                />
                <Tooltip 
                   content={<CustomBarTooltip criteriaMeta={criteriaMeta} />}
                   cursor={{ fill: '#f8fafc', radius: 10 }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '30px' }}
                  formatter={(value) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">{value}</span>}
                />
                {criteriaMeta.map((c, index) => (
                  <Bar 
                    key={c.id} 
                    dataKey={c.id} 
                    name={c.title} 
                    stackId="a" 
                    fill={c.color} 
                    radius={index === criteriaMeta.length - 1 ? [10, 10, 0, 0] : [0, 0, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={ANIMATION_DURATION}
                    animationEasing={ANIMATION_EASING}
                  >
                     {stackedData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fillOpacity={entry.month === currentMonth ? 1 : 0.6} />
                     ))}
                     <LabelList 
                        dataKey={c.id} 
                        position="center" 
                        fill="white"
                        fontSize={10} 
                        fontWeight={800}
                        formatter={(val: number) => val >= 4 ? val.toFixed(1) : ''}
                     />
                  </Bar>
                ))}
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: High-Resolution Trend Chart */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Xu hướng tổng thể</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter mt-1">Biểu đồ tăng trưởng chỉ số cải cách</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl">
             <TrendingUp size={24} />
          </div>
        </div>
        
        <div className="h-[280px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 35, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  hide={true} 
                />
                <Tooltip 
                  content={<CustomTrendTooltip />} 
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '6 6' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  name="Tổng điểm"
                  activeDot={{ r: 10, fill: '#fff', stroke: '#6366f1', strokeWidth: 5 }}
                  isAnimationActive={true}
                  animationDuration={ANIMATION_DURATION}
                  animationEasing={ANIMATION_EASING}
                >
                  <LabelList 
                    dataKey="score" 
                    position="top" 
                    offset={15}
                    fill="#6366f1" 
                    fontSize={12} 
                    fontWeight={800}
                    formatter={(val: number) => val.toFixed(1)}
                  />
                </Area>
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Section 4: Detailed Breakdown Grid (New) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {radarData.map((item, index) => {
            const percentage = (item.A / item.B) * 100;
            const diff = item.prevScore !== undefined ? item.A - item.prevScore : 0;
            const isPositive = diff > 0;
            const isNeutral = Math.abs(diff) < 0.05;
            
            return (
               <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div 
                           className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm"
                           style={{ backgroundColor: `${item.fullData.color}15`, color: item.fullData.color }}
                        >
                           {index + 1}
                        </div>
                        <div className="flex flex-col">
                           <h4 className="font-bold text-slate-700 text-sm line-clamp-1" title={item.fullTitle}>{item.fullTitle}</h4>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max: {item.B} điểm</span>
                        </div>
                     </div>
                     
                     <div className={`
                        flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border
                        ${isNeutral 
                           ? 'bg-slate-50 text-slate-400 border-slate-100' 
                           : isPositive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border-rose-100'}
                     `}>
                        {isNeutral ? <Minus size={12} /> : isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isNeutral ? '0.0' : Math.abs(diff).toFixed(1)}
                     </div>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                     <span className="text-3xl font-black text-slate-800 tracking-tight">{item.A.toFixed(1)}</span>
                     <span className="text-xs font-bold text-slate-400">{percentage.toFixed(0)}%</span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div 
                        className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out group-hover:brightness-110"
                        style={{ width: `${percentage}%`, backgroundColor: item.fullData.color }}
                     >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full"></div>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );
};