
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../contexts/StoreContext';
import { GlassCard } from '../components/GlassCard';
import { NeumorphButton } from '../components/NeumorphButton';
import { Product, UserRole } from '../types';

export const ProductManager: React.FC = () => {
  const { products, updateProducts, currentUser, settings } = useStore();
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAr = settings.language === 'ar';

  const exportProducts = () => {
    const XLSX = (window as any).XLSX;
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Inventory_Export.xlsx");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => prev ? { ...prev, imageUrl: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!editingProduct?.name || !editingProduct?.price) return;
    
    const finalBarcode = editingProduct.barcode && editingProduct.barcode.trim() !== "" 
      ? editingProduct.barcode 
      : Math.floor(100000 + Math.random() * 900000).toString();

    if (editingProduct.id) {
      updateProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct as Product, barcode: finalBarcode } : p));
    } else {
      const newProd = { 
        ...editingProduct, 
        id: "PRD-" + Date.now(), 
        stock: Number(editingProduct.stock) || 0,
        cost: Number(editingProduct.cost) || 0,
        price: Number(editingProduct.price) || 0,
        category: editingProduct.category || 'General',
        barcode: finalBarcode,
        description: editingProduct.description || '',
        imageUrl: editingProduct.imageUrl || ''
      } as Product;
      updateProducts([newProd, ...products]);
    }
    setEditingProduct(null);
  };

  return (
    <div className="p-8 page-transition" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-black dark:text-white mb-2">{isAr ? 'إدارة المستودع والمخزن' : 'Warehouse Management'}</h2>
          <p className="text-gray-500 dark:text-gray-400 font-bold">{isAr ? 'تحكم كامل في المنتجات والباركود والكميات' : 'Full control over products, barcodes and stock'}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <NeumorphButton variant="secondary" onClick={exportProducts}>
            {isAr ? 'تصدير إكسل 📊' : 'Export Excel'}
          </NeumorphButton>
          <NeumorphButton onClick={() => setEditingProduct({ name: '', price: 0, cost: 0, stock: 0, barcode: '', category: 'General', description: '', imageUrl: '' })}>
            {isAr ? 'إضافة منتج +' : 'Add Product +'}
          </NeumorphButton>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden neumorph-flat border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/30 dark:bg-black/20 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-black dark:text-white uppercase text-[10px] font-black">
                <th className="px-8 py-6">{isAr ? 'الصورة' : 'Img'}</th>
                <th className="px-8 py-6">{isAr ? 'المنتج' : 'Product'}</th>
                <th className="px-8 py-6">{isAr ? 'الباركود' : 'Barcode'}</th>
                <th className="px-8 py-6">{isAr ? 'المخزون' : 'Stock'}</th>
                <th className="px-8 py-6">{isAr ? 'السعر' : 'Price'}</th>
                <th className="px-8 py-6">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-black dark:text-white">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-8 py-5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden neumorph-inset bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-sm">{p.name}</p>
                    <p className="text-[9px] text-gray-500 truncate max-w-[150px]">{p.category}</p>
                  </td>
                  <td className="px-8 py-5 font-mono text-xs opacity-60">{p.barcode}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1 rounded-xl text-[10px] font-black ${p.stock < 10 ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'}`}>
                      {p.stock} {isAr ? 'متوفر' : 'Available'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-blue-600">{p.price} <small>{settings.currency}</small></td>
                  <td className="px-8 py-5 flex gap-4">
                    <button onClick={() => setEditingProduct(p)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => updateProducts(products.filter(i => i.id !== p.id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-2xl p-10 neumorph-flat my-auto">
              <h3 className="text-2xl font-black text-black dark:text-white mb-8">{isAr ? 'بيانات الصنف' : 'Product Details'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload Area */}
                <div className="md:col-span-2 flex flex-col items-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-48 h-48 rounded-[2.5rem] neumorph-inset bg-gray-50 dark:bg-black/20 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 transition-all group"
                  >
                    {editingProduct.imageUrl ? (
                      <img src={editingProduct.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-3xl block mb-2 opacity-50 group-hover:scale-110 transition-transform">🖼️</span>
                        <span className="text-[10px] font-black uppercase text-gray-400">{isAr ? 'اضغط لرفع صورة' : 'Click to Upload Image'}</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">{isAr ? 'اسم المنتج' : 'Product Name'}</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl fluid-input font-bold" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">{isAr ? 'وصف المنتج' : 'Product Description'}</label>
                  <textarea 
                    className="w-full px-6 py-4 rounded-2xl fluid-input font-bold min-h-[120px] resize-none" 
                    placeholder={isAr ? "اكتب مواصفات المنتج هنا..." : "Write product specifications here..."}
                    value={editingProduct.description} 
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">{isAr ? 'سعر البيع' : 'Sale Price'}</label>
                  <input type="number" className="w-full px-6 py-4 rounded-2xl fluid-input" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">{isAr ? 'الكمية الحالية' : 'Current Stock'}</label>
                  <input type="number" className="w-full px-6 py-4 rounded-2xl fluid-input" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">{isAr ? 'تكلفة المنتج' : 'Product Cost'}</label>
                  <input type="number" className="w-full px-6 py-4 rounded-2xl fluid-input" value={editingProduct.cost} onChange={e => setEditingProduct({...editingProduct, cost: Number(e.target.value)})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">{isAr ? 'باركود المنتج' : 'Product Barcode'}</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl fluid-input font-mono" placeholder={isAr ? "سيتم التوليد تلقائياً إذا تركت فارغاً" : "Auto-generated if empty"} value={editingProduct.barcode} onChange={e => setEditingProduct({...editingProduct, barcode: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-6 mt-10">
                <NeumorphButton className="flex-1 py-5 !bg-blue-600 !text-white" onClick={handleSave}>{isAr ? 'حفظ البيانات' : 'Save Changes'}</NeumorphButton>
                <NeumorphButton className="flex-1 py-5" variant="secondary" onClick={() => setEditingProduct(null)}>{isAr ? 'إلغاء' : 'Cancel'}</NeumorphButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
