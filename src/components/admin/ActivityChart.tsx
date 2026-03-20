"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', applications: 400, users: 240 },
  { name: 'Tue', applications: 300, users: 139 },
  { name: 'Wed', applications: 200, users: 980 },
  { name: 'Thu', applications: 278, users: 390 },
  { name: 'Fri', applications: 189, users: 480 },
  { name: 'Sat', applications: 239, users: 380 },
  { name: 'Sun', applications: 349, users: 430 },
];

export function ActivityChart() {
  return (
    <div className="w-full h-[400px] glass-card border-none rounded-3xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black tracking-tight uppercase tracking-widest text-primary/80">Platform Activity</h3>
          <p className="text-xs text-muted-foreground font-medium opacity-60">Daily trends for new users and applications</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Applications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span>New Users</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 900, opacity: 0.5 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 900, opacity: 0.5 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255,255,255,0.8)', 
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 900
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="applications" 
            stroke="var(--primary)" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorApps)" 
            animationDuration={2000}
          />
          <Area 
            type="monotone" 
            dataKey="users" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent"
            animationDuration={2500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
