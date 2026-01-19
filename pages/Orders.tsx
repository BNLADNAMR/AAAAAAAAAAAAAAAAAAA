
import React, { useMemo, useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { GlassCard } from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';

export const Orders: React.FC = () => {
  const { sales, settings, currentUser, updateSaleStatus } = useStore();
  const [searchId, setSearchId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const isAr = settings.language === 'ar';
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const transactionList = useMemo(() => {
    let filteredSales = isAdmin ? sales : sales.filter(s => s.userId === currentUser?.id);

    if (searchId.trim()) {
      filteredSales = filteredSales.filter(s => 
        String(s.id).toLowerCase().includes(searchId.toLowerCase()) ||
        (s.note && String(s.note).toLowerCase().includes(searchId.toLowerCase()))
      );
    }

    return filteredSales;
  }, [sales, isAr, isAdmin, currentUser, searchId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-4 py-1.5 bg-green-500/10 text-green-600 text-[10px] font-black rounded-xl border border-green-500/20">{isAr ? 'مقبول' : 'Success'}</span>;
      case 'rejected':
        return <span className="px-4 py-1.5 bg-red-500/10 text-red-600 text-[10px] font-black rounded-xl border border-red-500/20">{isAr ? 'مرفوض' : 'Rejected'}</span>;
      default:
        return <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-600 text-[10px] font-black rounded-xl border border-yellow-500/20 animate-pulse">{isAr ? 'انتظار' : 'Pending'}</span>;
    }
  };

  const getOrderTitle = (s: any) => {
    if (s.note && s.note.includes('|')) {
      return s.note.split('|')[0].trim();
    }
    return s.items.length > 1 ? (isAr ? `طلب (${s.items.length} منتجات)` : `Order (${s.items.length} items)`) : s.items[0]?.name;
  };

  return (
    <div className="space-y-8 page-transition" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-black dark:text-white mb-2">
            {isAdmin ? (isAr ? 'إدارة العمليات والطلبات' : 'Operations Management') : (isAr ? 'سجل طلباتي' : 'My Order History')}
          </h2>
          <p className="text-gray-500 font-bold text-xs">{isAr ? 'تتبع حالة طلباتك وعمليات الشحن المباشرة' : 'Track your orders and direct payment status'}</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={isAr ? "ابحث برقم الطلب أو النوع..." : "Search by ID or type..."}
            className="w-full py-4 px-6 rounded-2xl neumorph-inset bg-transparent font-black text-xs"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden neumorph-flat border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/30 dark:bg-black/20 border-b border-black/5">
              <tr className="text-black dark:text-white uppercase text-[10px] font-black">
                <th className="px-8 py-6">{isAr ? 'العملية' : 'Operation'}</th>
                <th className="px-8 py-6">{isAr ? 'التوقيت' : 'Time'}</th>
                <th className="px-8 py-6">{isAr ? 'المبلغ' : 'Amount'}</th>
                <th className="px-8 py-6 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-8 py-6 text-center">{isAr ? 'التفاصيل' : 'Details'}</th>
                {isAdmin && <th className="px-8 py-6 text-center">{isAr ? 'الإجراء' : 'Action'}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {transactionList.map((s) => (
                <tr key={s.id} className="hover:bg-blue-600/5 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-sm text-black dark:text-white group-hover:text-blue-600 transition-colors">{getOrderTitle(s)}</p>
                    <p className="text-[9px] text-gray-400 font-mono">{s.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-black text-gray-500">{new Date(s.timestamp).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
                    <p className="text-[9px] font-bold text-gray-400">{new Date(s.timestamp).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-lg text-black dark:text-white">{s.total.toFixed(2)}</span>
                    <small className="text-[9px] text-gray-500 mr-1 uppercase">{settings.currency}</small>
                  </td>
                  <td className="px-8 py-6 text-center">{getStatusBadge(s.status)}</td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => setSelectedOrder(s)}
                      className="text-blue-600 hover:scale-110 transition-transform"
                    >
                      <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-6 text-center">
                      {s.status === 'pending' ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => updateSaleStatus(s.id, 'success')} className="w-10 h-10 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center font-black">✓</button>
                          <button onClick={() => updateSaleStatus(s.id, 'rejected')} className="w-10 h-10 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center font-black">✕</button>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-gray-300 uppercase">{isAr ? 'مكتمل' : 'Finalized'}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {transactionList.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-black italic">
              {isAr ? 'لا توجد عمليات مسجلة حالياً' : 'No transactions recorded yet'}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-lg p-10 neumorph-flat relative">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-xl">✕</button>
              <h3 className="text-2xl font-black mb-6 text-black dark:text-white border-b border-black/5 pb-4">{isAr ? 'تفاصيل الطلب' : 'Order Details'}</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>{isAr ? 'معرف العملية:' : 'Order ID:'}</span>
                  <span className="font-mono text-black dark:text-white">{selectedOrder.id}</span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isAr ? 'المنتجات / الخدمة' : 'Items / Service'}</p>
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 neumorph-inset rounded-2xl">
                      <div>
                        <p className="text-sm font-black dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-blue-600 font-bold">{item.price} x {item.quantity}</p>
                      </div>
                      <span className="font-black text-black dark:text-white">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 neumorph-inset rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isAr ? 'ملاحظات وتفاصيل إضافية' : 'Notes & Details'}</p>
                  <p className="text-sm font-bold text-black dark:text-white leading-relaxed">{selectedOrder.note || (isAr ? 'لا توجد ملاحظات' : 'No notes')}</p>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-black/5">
                  <span className="text-lg font-black text-black dark:text-white">{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
                  <span className="text-3xl font-black text-blue-600">{selectedOrder.total.toFixed(2)} <small className="text-sm">EGP</small></span>
                </div>

                {isAdmin && selectedOrder.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <button onClick={() => { updateSaleStatus(selectedOrder.id, 'success'); setSelectedOrder(null); }} className="py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg">{isAr ? 'قبول الطلب' : 'Accept'}</button>
                    <button onClick={() => { updateSaleStatus(selectedOrder.id, 'rejected'); setSelectedOrder(null); }} className="py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg">{isAr ? 'رفض الطلب' : 'Reject'}</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
