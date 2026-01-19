
import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { GlassCard } from '../components/GlassCard';
import { NeumorphButton } from '../components/NeumorphButton';

export const Customers: React.FC = () => {
  const { customers, updateCustomers, settings } = useStore();
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const isAr = settings.language === 'ar';

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    updateCustomers([...customers, { ...newCustomer, id: Date.now().toString(), email: '', totalSpent: 0 }]);
    setNewCustomer({ name: '', phone: '' });
  };

  const exportCSV = () => {
    const XLSX = (window as any).XLSX;
    const ws = XLSX.utils.json_to_sheet(customers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "Customers.xlsx");
  };

  return (
    <div className="p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold dark:text-white">{isAr ? 'قاعدة بيانات العملاء' : 'Customers'}</h2>
        <NeumorphButton variant="secondary" onClick={exportCSV}>{isAr ? 'تصدير Excel' : 'Export Excel'}</NeumorphButton>
      </div>

      <GlassCard className="mb-8">
        <div className="flex gap-4">
          <input type="text" placeholder={isAr ? "اسم العميل" : "Name"} className="flex-1 px-4 py-2 rounded-xl neumorph-inset bg-transparent dark:text-white" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
          <input type="text" placeholder={isAr ? "رقم الهاتف" : "Phone"} className="flex-1 px-4 py-2 rounded-xl neumorph-inset bg-transparent dark:text-white" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
          <NeumorphButton onClick={addCustomer}>{isAr ? 'إضافة عميل' : 'Add'}</NeumorphButton>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-black/20 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">{isAr ? 'الاسم' : 'Name'}</th>
              <th className="px-6 py-4">{isAr ? 'الهاتف' : 'Phone'}</th>
              <th className="px-6 py-4">{isAr ? 'إجمالي المشتريات' : 'Spent'}</th>
              <th className="px-6 py-4">{isAr ? 'إجراء' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20 dark:text-white">
            {customers.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 font-bold">{c.name}</td>
                <td className="px-6 py-4">{c.phone}</td>
                <td className="px-6 py-4 text-blue-600 font-bold">{c.totalSpent} {settings.currency}</td>
                <td className="px-6 py-4">
                  <button onClick={() => updateCustomers(customers.filter(i => i.id !== c.id))} className="text-red-500">{isAr ? 'حذف' : 'Delete'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
