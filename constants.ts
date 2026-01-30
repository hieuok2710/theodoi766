import { Criterion } from './types';

const BASE_DATA: Criterion[] = [
  {
    id: 'c1',
    title: 'Công khai, minh bạch',
    description: 'Tỷ lệ hồ sơ đồng bộ lên Cổng DVCQG; Công khai TTHC đúng hạn; Công khai tiến độ giải quyết.',
    maxScore: 18,
    currentScore: 15.5,
    color: '#3b82f6', // blue-500
  },
  {
    id: 'c2',
    title: 'Tiến độ, kết quả giải quyết',
    description: 'Tỷ lệ xử lý đúng hạn/trước hạn; Thời gian giải quyết trung bình; Tỷ lệ hồ sơ trả lại/xin lỗi.',
    maxScore: 20,
    currentScore: 14,
    color: '#10b981', // emerald-500
  },
  {
    id: 'c3',
    title: 'Cung cấp dịch vụ trực tuyến',
    description: 'Tỷ lệ hồ sơ nộp trực tuyến; Tỷ lệ thanh toán trực tuyến; Tỷ lệ DVC trực tuyến toàn trình.',
    maxScore: 22,
    currentScore: 12.5,
    color: '#f59e0b', // amber-500
  },
  {
    id: 'c4',
    title: 'Số hóa hồ sơ',
    description: 'Tỷ lệ cấp kết quả bản điện tử; Tỷ lệ số hóa hồ sơ đầu vào; Tỷ lệ tái sử dụng dữ liệu số hóa.',
    maxScore: 22,
    currentScore: 10,
    color: '#ef4444', // red-500
  },
  {
    id: 'c5',
    title: 'Mức độ hài lòng',
    description: 'Mức độ hài lòng của người dân, doanh nghiệp; Tỷ lệ phản ánh, kiến nghị được xử lý đúng hạn.',
    maxScore: 18,
    currentScore: 16.5,
    color: '#8b5cf6', // violet-500
  },
];

// Helper to generate slightly random data for demo purposes
const generateMonthData = (baseData: Criterion[], variance: number): Criterion[] => {
  return baseData.map(item => {
    // Random fluctuation between -variance and +variance
    const fluctuation = (Math.random() * variance * 2) - variance;
    let newScore = item.currentScore + fluctuation;
    
    // Ensure score is within bounds
    newScore = Math.max(0, Math.min(item.maxScore, newScore));
    
    return {
      ...item,
      currentScore: parseFloat(newScore.toFixed(1))
    };
  });
};

// Generate data for 12 months of 2026
export const INITIAL_YEARLY_DATA: Record<number, Criterion[]> = {};

for (let i = 1; i <= 12; i++) {
  // Simulate improvement over the year
  const improvementFactor = (i - 1) * 0.2; 
  const monthBase = BASE_DATA.map(c => ({...c, currentScore: Math.min(c.maxScore, c.currentScore + improvementFactor)}));
  INITIAL_YEARLY_DATA[i] = generateMonthData(monthBase, 1.5);
}

export const INITIAL_DATA = INITIAL_YEARLY_DATA[1]; // Fallback for single view if needed