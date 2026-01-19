
import React, { useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { GlassCard } from '../components/GlassCard';
import { NeumorphButton } from '../components/NeumorphButton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const Reports: React.FC = () => {
  const { sales, expenses, settings, products } = useStore();
  const isAr = settings.language === 'ar';
  const isDark = settings.theme === 'dark';

  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    // إجمالي الأرباح من الخدمات (التي سجلها النظام في UserPayment)
    const serviceProfit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);
    
    // الربح من مبيعات المنتجات (السعر - التكلفة)
    const productProfit = sales.reduce((acc, sale) => {
      return acc + sale.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const profitPerItem = product.price - product.cost;
          return itemAcc + (profitPerItem * item.quantity);
        }
        return itemAcc;
      }, 0);
    }, 0);

    const netProfit = (serviceProfit + productProfit) - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return { totalSales, totalExpenses, netProfit, profitMargin, serviceProfit, productProfit };
  }, [sales, expenses, products]);

  const recentTransactions = useMemo(() => {
    const saleLogs = sales.map(s => ({
      id: s.id,
      date: s.timestamp,
      type: 'sale',
      title: s.items[0]?.name || (isAr ? 'بيع منتجات' : 'Products Sale'),
      amount: s.total,
      profit: s.profit || 0
    }));
    
    const expenseLogs = expenses.map(e => ({
      id: e.id,
      date: e.date,
      type: 'expense',
      title: e.title,
      amount: e.amount,
      profit: 0
    }));

    return [...saleLogs, ...expenseLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);
  }, [sales, expenses, isAr]);

  return (
    <div className="p-8 page-transition space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-black dark:text-white mb-2">{isAr ? 'مركز تحليل الأرباح' : 'Profit Analysis Center'}</h2>
          <p className="text-gray-500 font-bold">{isAr ? 'تتبع أرباح الخدمات والمبيعات والمصروفات' : 'Track service profits, sales, and expenses'}</p>
        </div>
        <div className="flex gap-4">
          <NeumorphButton variant="secondary" onClick={() => window.print()}>{isAr ? 'طباعة التقرير 🖨️' : 'Print Report'}</NeumorphButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="neumorph-flat border-blue-100 dark:border-blue-900/30">
          <p className="text-[10px] uppercase font-black text-blue-600 mb-2">{isAr ? 'إجمالي التحصيل' : 'Total Collection'}</p>
          <p className="text-3xl font-black text-black dark:text-white">{stats.totalSales.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="neumorph-flat border-green-100 dark:border-green-900/30">
          <p className="text-[10px] uppercase font-black text-green-600 mb-2">{isAr ? 'أرباح الخدمات' : 'Service Earnings'}</p>
          <p className="text-3xl font-black text-green-600">{stats.serviceProfit.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">{isAr ? 'من الأقساط والفواتير' : 'From installments & bills'}</p>
        </GlassCard>

        <GlassCard className="neumorph-flat border-red-100 dark:border-red-900/30">
          <p className="text-[10px] uppercase font-black text-red-600 mb-2">{isAr ? 'إجمالي المصروفات' : 'Total Expenses'}</p>
          <p className="text-3xl font-black text-red-500">{stats.totalExpenses.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="neumorph-flat border-purple-100 dark:border-purple-900/30 shadow-xl shadow-purple-500/10">
          <p className="text-[10px] uppercase font-black text-purple-600 mb-2">{isAr ? 'الربح الصافي النهائي' : 'Final Net Profit'}</p>
          <p className="text-3xl font-black text-black dark:text-white">{stats.netProfit.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">{isAr ? 'بعد خصم المصروفات' : 'After expenses deduction'}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="h-[400px] neumorph-flat">
          <h3 className="text-xl font-black text-black dark:text-white mb-6">{isAr ? 'توزيع مصادر الدخل' : 'Income Source Distribution'}</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={[
                  { name: isAr ? 'أرباح خدمات' : 'Service Profit', value: stats.serviceProfit },
                  { name: isAr ? 'أرباح منتجات' : 'Product Profit', value: stats.productProfit },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#3b82f6" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden neumorph-flat">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-black text-black dark:text-white">{isAr ? 'سجل الربحية الأخير' : 'Recent Profitability Log'}</h3>
          </div>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-black/20 text-xs">
                <tr className="text-left font-black uppercase text-gray-500">
                  <th className="px-6 py-4">{isAr ? 'الخدمة' : 'Service'}</th>
                  <th className="px-6 py-4">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="px-6 py-4 text-green-600">{isAr ? 'ربحك' : 'Your Profit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
                {recentTransactions.filter(t => t.type === 'sale').map((op, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold truncate max-w-[150px]">{op.title}</td>
                    <td className="px-6 py-4 font-black">{op.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 font-black text-green-600">+{op.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
