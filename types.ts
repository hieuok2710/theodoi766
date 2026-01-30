export interface Criterion {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  currentScore: number;
  color: string;
}

export interface AnalysisResponse {
  summary: string;
  recommendations: Array<{
    title: string;
    advice: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
}

export interface SystemConfig {
  agencyName: string;
  year: number;
}