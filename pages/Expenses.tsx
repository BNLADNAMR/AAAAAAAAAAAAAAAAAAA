
import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { GlassCard } from '../components/GlassCard';
import { NeumorphButton } from '../components/NeumorphButton';

export const Expenses: React.FC = () => {
  const { expenses, addExpense, settings } = useStore();
  const [entry, setEntry] = useState({ title: '', amount: 0, category: 'General' });
  const isAr = settings.language === 'ar';

  const categories = [
    { id: 'General', label: isAr ? 'مصروف عام' : 'General', icon: '📝' },
    { id: 'Electricity', label: isAr ? 'فاتورة كهرباء' : 'Electricity Bill', icon: '💡' },
    { id: 'Water', label: isAr ? 'فاتورة مياه' : 'Water Bill', icon: '💧' },
    { id: 'Gas', label: isAr ? 'فاتورة غاز' : 'Gas Bill', icon: '🔥' },
  ];

  const handleAdd = () => {
    if (entry.amount <= 0) return;
    
    // إذا كان المصروف فاتورة، نستخدم اسم الفئة كعنوان إذا لم يتم إدخال عنوان
    const finalTitle = entry.title || categories.find(c => c.id === entry.category)?.label || 'Expense';
    
    addExpense({ 
      ...entry, 
      title: finalTitle,
      id: Date.now().toString(), 
      date: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US'), 
      category: entry.category 
    });
    setEntry({ title: '', amount: 0, category: 'General' });
  };

  const getCategoryIcon = (catId: string) => {
    return categories.find(c => c.id === catId)?.icon || '💰';
  };

  return (
    <div className="p-8 page-transition" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-10">
        <h2 className="text-3xl font-black dark:text-white mb-2">{isAr ? 'إدارة المصروفات والفواتير' : 'Expenses & Utilities'}</h2>
        <p className="text-gray-500 font-bold">{isAr ? 'سجل فواتير الكهرباء والمياه والغاز والمصروفات اليومية' : 'Record electricity, water, gas bills and daily expenses'}</p>
      </div>
      
      <GlassCard className="mb-10 neumorph-flat border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 mr-2">{isAr ? 'نوع المصروف / الفاتورة' : 'Category'}</label>
            <select 
              className="w-full px-6 py-4 rounded-2xl fluid-input outline-none appearance-none cursor-pointer"
              value={entry.category}
              onChange={e => setEntry({...entry, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 mr-2">{isAr ? 'وصف إضافي (اختياري)' : 'Description (Optional)'}</label>
            <input 
              type="text" 
              placeholder={isAr ? "مثلاً: شهر أكتوبر" : "e.g. October bill"} 
              className="w-full px-6 py-4 rounded-2xl fluid-input" 
              value={entry.title} 
              onChange={e => setEntry({...entry, title: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 mr-2">{isAr ? 'المبلغ' : 'Amount'}</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full px-6 py-4 rounded-2xl fluid-input text-xl font-black text-center" 
                value={entry.amount || ''} 
                onChange={e => setEntry({...entry, amount: Number(e.target.value)})} 
              />
              <span className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 font-black text-blue-600`}>{settings.currency}</span>
            </div>
          </div>

          <div className="flex items-end">
            <NeumorphButton onClick={handleAdd} className="w-full py-4 text-lg">
              {isAr ? 'تسجيل الآن' : 'Record Now'}
            </NeumorphButton>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {expenses.map(e => (
          <GlassCard key={e.id} className="relative overflow-hidden group neumorph-flat border-none p-8">
            <div className={`absolute top-0 ${isAr ? 'left-0' : 'right-0'} p-4 text-[10px] text-gray-400 font-black opacity-60`}>
              {e.date}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#e6eef4] dark:bg-black/30 neumorph-inset flex items-center justify-center text-3xl">
                {getCategoryIcon(e.category || 'General')}
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                  {categories.find(c => c.id === e.category)?.label || (isAr ? 'مصروف' : 'Expense')}
                </p>
                <p className="font-black text-black dark:text-white text-xl truncate max-w-[150px]">{e.title}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
              <div>
                 <span className="text-gray-400 text-xs font-bold">{isAr ? 'القيمة المسجلة:' : 'Recorded Value:'}</span>
                 <p className="text-red-600 text-3xl font-black">{e.amount} <small className="text-sm">{settings.currency}</small></p>
              </div>
              <button className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
