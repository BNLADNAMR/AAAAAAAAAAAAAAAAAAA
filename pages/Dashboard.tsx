
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../contexts/StoreContext';
import { GlassCard } from '../components/GlassCard';

export const Dashboard: React.FC = () => {
  const { sales, expenses, products, settings } = useStore();
  const isDark = settings.theme === 'dark';
  const isAr = settings.language === 'ar';

  const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString())
                          .reduce((acc, sale) => acc + sale.total, 0);

  const chartData = [
    { name: isAr ? 'إثنين' : 'Mon', sales: 4000 },
    { name: isAr ? 'ثلاثاء' : 'Tue', sales: 3000 },
    { name: isAr ? 'أربعاء' : 'Wed', sales: 2000 },
    { name: isAr ? 'خميس' : 'Thu', sales: 2780 },
    { name: isAr ? 'جمعة' : 'Fri', sales: 1890 },
    { name: isAr ? 'سبت' : 'Sat', sales: 2390 },
    { name: isAr ? 'أحد' : 'Sun', sales: 3490 },
  ];

  const StatBox = ({ title, value, icon, color }: any) => (
    <GlassCard className="flex flex-col gap-4 neumorph-flat !p-6 border-none">
      <div className={`w-12 h-12 rounded-xl neumorph-inset flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
        <p className="text-xl lg:text-3xl font-black text-black dark:text-white">{value} <small className="text-xs opacity-60 font-bold">{settings.currency}</small></p>
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-6 lg:space-y-10 page-transition">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <StatBox title={isAr ? "اليوم" : "Today"} value={todaySales.toFixed(0)} color="text-blue-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <StatBox title={isAr ? "أصناف" : "Items"} value={products.length} color="text-green-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <StatBox title={isAr ? "نواقص" : "Low Stock"} value={products.filter(p => p.stock < 10).length} color="text-red-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <StatBox title={isAr ? "طلبات" : "Orders"} value={sales.length} color="text-purple-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
      </div>

      <GlassCard className="h-[400px] lg:h-[500px] neumorph-flat border-none !p-8">
        <h3 className="text-xl font-black mb-10 text-black dark:text-white">{isAr ? 'إحصائيات الأداء الأسبوعي' : 'Weekly Performance'}</h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: isDark ? '#f8fafc' : '#000000', fontSize: 12, fontWeight: '900'}} 
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '1.5rem', 
                border: 'none', 
                backgroundColor: isDark ? '#141619' : '#ffffff', 
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
                color: isDark ? '#ffffff' : '#000000',
                fontWeight: 'bold'
              }}
              itemStyle={{ color: '#3b82f6', fontWeight: '900' }}
            />
            <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
};
