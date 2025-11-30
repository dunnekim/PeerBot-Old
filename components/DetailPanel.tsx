import React, { useState, useEffect } from 'react';
import { CompanyData, AnalysisResult } from '../types';
import { X, Bot, TrendingUp, AlertTriangle, FileText, Activity, Key } from 'lucide-react';
import { analyzeBusiness } from '../services/geminiService';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

interface DetailPanelProps {
  company: CompanyData | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ company, onClose }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Reset analysis when company changes
    setAnalysis(null);
    setError(null);
  }, [company]);

  if (!company) return null;

  const handleAnalyze = async () => {
    if (!apiKey) {
      setError("Google Gemini API 키를 입력해주세요.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await analyzeBusiness(company.biz_description_raw, apiKey);
      setAnalysis(result);
    } catch (err) {
      setError("분석에 실패했습니다. 올바른 API Key인지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: '매출', value: company.sales },
    { name: '자산', value: company.assets },
    { name: '자본', value: company.equity },
  ];

  const opMargin = company.sales > 0 ? ((company.op_profit / company.sales) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur z-10 border-b border-slate-800 p-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-white">{company.corp_name}</h2>
             <span className="text-sm font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
               {company.stock_code}
             </span>
          </div>
          <p className="text-emerald-400 font-medium mt-1">{company.sector} | {company.market}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Financial Highlights Chart */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
          <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 재무 현황 (단위: 억원)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
               <div className="text-xs text-slate-500">영업이익률</div>
               <div className="text-lg font-mono text-white">{opMargin}%</div>
            </div>
            <div>
               <div className="text-xs text-slate-500">PER</div>
               <div className="text-lg font-mono text-white">{company.per?.toFixed(1) ?? '-'}x</div>
            </div>
            <div>
               <div className="text-xs text-slate-500">ROE</div>
               <div className="text-lg font-mono text-white">{company.roe?.toFixed(1) ?? '-'}%</div>
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div>
          <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> 사업 내용 (원문)
          </h3>
          <div className="bg-slate-800/50 p-4 rounded-xl text-slate-300 text-sm leading-relaxed border border-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
            {company.biz_description_raw}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
          
          <div className="flex flex-col gap-4 mb-4">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  Gemini 기업 분석
                </h3>
                {/* Analyze Button */}
                {!analysis && !loading && (
                   <button 
                    onClick={handleAnalyze}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                   >
                     분석 시작
                   </button>
                 )}
             </div>

             {/* API Key Input for Static Site (GitHub Pages) */}
             {!analysis && !loading && (
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Key className="w-4 h-4 text-slate-500" />
                 </div>
                 <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Gemini API Key를 입력하세요 (저장되지 않음)"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                 />
                 <p className="text-[10px] text-slate-500 mt-1 pl-1">
                   * GitHub Pages와 같은 정적 환경에서는 보안을 위해 API Key를 직접 입력해야 합니다.
                 </p>
               </div>
             )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 animate-pulse">
              <Bot className="w-8 h-8 mb-3 opacity-50" />
              <p>기업 데이터를 분석중입니다...</p>
            </div>
          )}

          {error && (
            <div className="text-rose-400 bg-rose-950/30 p-4 rounded-lg text-sm border border-rose-900">
              {error}
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-fade-in mt-4">
              <div className="text-slate-300 italic text-sm border-l-2 border-emerald-500 pl-4 py-1">
                "{analysis.summary}"
              </div>
              
              <div>
                <h4 className="text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 주요 강점
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-rose-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> 리스크 요인
                </h4>
                <ul className="space-y-2">
                  {analysis.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-500 shrink-0"></span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DetailPanel;