import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { 
  ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { History, Calendar } from 'lucide-react';

export const HealthRiskHistoryChart = ({ history = [], onRangeChange, selectedDays = 90 }) => {
  const timeRanges = [
    { label: '7 Ngày', days: 7 },
    { label: '30 Ngày', days: 30 },
    { label: '90 Ngày', days: 90 },
    { label: '1 Năm', days: 365 },
  ];

  const formattedData = (history || []).map((item) => {
    const d = new Date(item.snapshot_date);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      rawDate: item.snapshot_date,
      healthScore: Number(item.health_score),
      riskScore: Number(item.risk_score),
      incidents: Number(item.incident_count || 0),
    };
  });

  return (
    <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl">
      {/* Header with Timeframe Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Diễn Biến Sức Khỏe & Nguy Cơ Theo Thời Gian
            </h3>
            <p className="text-xs text-slate-500">
              Xu hướng biến động điểm Health Score và Failure Risk qua các chu kỳ
            </p>
          </div>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {timeRanges.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => onRangeChange && onRangeChange(range.days)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedDays === range.days
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4">
        {formattedData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
            <Calendar className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-semibold">Chưa có đủ bản ghi snapshot lịch sử trong khoảng thời gian này.</p>
            <span className="text-[11px] text-slate-400 mt-1">Dữ liệu sẽ tự động tích lũy khi hệ thống chạy đánh giá định kỳ.</span>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  formatter={(value, name) => [
                    `${value} ${name === 'Điểm Sức Khỏe' ? '/ 100' : '%'}`,
                    name
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `Ngày: ${item.rawDate}` : label;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="healthScore" 
                  name="Điểm Sức Khỏe" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#healthGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="riskScore" 
                  name="Xác Suất Rủi Ro" 
                  stroke="#f43f5e" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#riskGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};
