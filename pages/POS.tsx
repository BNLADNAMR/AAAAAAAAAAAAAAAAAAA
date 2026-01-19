
import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { NeumorphButton } from '../components/NeumorphButton';
import { GlassCard } from '../components/GlassCard';
import { SaleItem, Sale, Product, UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const POS: React.FC = () => {
  const { products, updateProducts, addSale, settings, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('cash');
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const isAr = settings.language === 'ar';
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.barcode.includes(searchTerm)
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + (subtotal * settings.taxRate);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newSale: Sale = {
      id: "INV-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      items: cart,
      subtotal,
      tax: subtotal * settings.taxRate,
      discount: 0,
      total,
      profit: 0,
      paymentMethod
    };
    addSale(newSale);
    setCart([]);
    setShowCartMobile(false);
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.name || editingProduct.price === undefined) return;
    
    if (editingProduct.id) {
      // Update existing
      updateProducts(products.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
    } else {
      // Add new
      const newProd: Product = {
        ...editingProduct,
        id: "PRD-" + Date.now(),
        barcode: editingProduct.barcode || Math.floor(Math.random() * 1000000).toString(),
        category: editingProduct.category || 'General',
        cost: editingProduct.cost || 0,
        stock: editingProduct.stock || 0,
      } as Product;
      updateProducts([newProd, ...products]);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Delete this product?')) {
      updateProducts(products.filter(p => p.id !== id));
    }
  };

  const paymentOptions = [
    { id: 'cash', label: isAr ? 'نقدي' : 'Cash', icon: '💵' },
    { id: 'recharge', label: isAr ? 'شحن رصيد' : 'Recharge', icon: '⚡' },
    { id: 'vodafone', label: 'Vodafone', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Vodafone_icon.svg/1024px-Vodafone_icon.svg.png' },
    { id: 'instapay', label: 'InstaPay', logo: 'https://instapay.eg/static/media/logo.8091176b.svg' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 page-transition p-2 lg:p-0" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Products Section */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative glass-card rounded-2xl p-2 flex-1 w-full">
            <input
              type="text"
              placeholder={isAr ? "ابحث عن منتج أو باركود..." : "Search product or barcode..."}
              className="w-full py-4 px-6 rounded-xl bg-transparent outline-none font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <NeumorphButton 
              onClick={() => setEditingProduct({ name: '', price: 0, stock: 0, category: 'General' })}
              className="w-full md:w-auto py-4 whitespace-nowrap"
            >
              {isAr ? 'صنف جديد +' : 'New Item +'}
            </NeumorphButton>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto no-scrollbar max-h-[75vh] pb-20">
          {filteredProducts.map(p => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-[2rem] p-5 cursor-pointer neumorph-flat group relative overflow-hidden flex flex-col border border-transparent hover:border-blue-500/30"
              onClick={() => addToCart(p)}
            >
              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProduct(e, p.id)}
                    className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}

              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                 <span className="text-blue-600 font-black text-xl">{p.name[0]}</span>
              </div>
              <h4 className="font-black text-sm truncate mb-1 text-black dark:text-white">{p.name}</h4>
              <p className="text-[10px] text-gray-500 font-bold mb-4">{p.category}</p>
              
              <div className="mt-auto flex justify-between items-end">
                <div>
                  <p className="text-blue-600 font-black text-lg leading-none">{p.price} <small className="text-[9px]">{settings.currency}</small></p>
                </div>
                <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {p.stock} pcs
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="hidden lg:flex w-96 flex-col">
        <GlassCard className="flex flex-col h-full !p-8 neumorph-flat border-none">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
             <span className="p-2 bg-blue-600/10 rounded-xl">🛒</span>
             {isAr ? 'سلة المشتريات' : 'Current Order'}
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                 <div className="text-5xl mb-4">🛍️</div>
                 <p className="font-bold text-sm">{isAr ? 'السلة فارغة حالياً' : 'Cart is empty'}</p>
              </div>
            ) : cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center p-4 rounded-2xl neumorph-inset bg-transparent group">
                 <div className="flex-1 min-w-0">
                    <p className="font-black text-xs truncate text-black dark:text-white">{item.name}</p>
                    <p className="text-blue-600 font-bold text-[10px]">{item.price} x {item.quantity}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 rounded-xl neumorph-flat text-xs font-black transition-transform active:scale-90">-</button>
                    <span className="w-4 text-center text-xs font-black">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 rounded-xl neumorph-flat text-xs font-black transition-transform active:scale-90">+</button>
                 </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-6">
             <div className="flex justify-between items-center font-black">
                <span className="text-gray-500 text-xs uppercase tracking-widest">{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
                <span className="text-2xl text-blue-600">{total.toFixed(2)} {settings.currency}</span>
             </div>
             
             <div className="grid grid-cols-4 gap-2">
                {paymentOptions.map(opt => (
                  <button 
                    key={opt.id} 
                    onClick={() => setPaymentMethod(opt.id as any)} 
                    className={`p-2 rounded-2xl text-[8px] font-black transition-all flex flex-col items-center justify-center border-2 ${paymentMethod === opt.id ? 'bg-blue-600 text-white border-blue-600' : 'neumorph-flat text-gray-400 border-transparent'}`}
                  >
                    {opt.logo ? (
                      <img src={opt.logo} className={`w-5 h-5 mb-1 object-contain ${paymentMethod === opt.id ? 'brightness-200' : ''}`} />
                    ) : (
                      <span className="text-lg mb-1">{opt.icon}</span>
                    )}
                    <span className="scale-90">{opt.label}</span>
                  </button>
                ))}
             </div>

             <NeumorphButton onClick={handleCheckout} className="w-full py-5 text-sm font-black bg-blue-600 text-white border-none shadow-xl shadow-blue-500/20" disabled={cart.length === 0}>
                {isAr ? 'إتمام البيع الآن' : 'COMPLETE TRANSACTION'}
             </NeumorphButton>
          </div>
        </GlassCard>
      </div>

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="glass-card w-full max-w-lg p-10 neumorph-flat relative"
            >
              <h3 className="text-2xl font-black text-black dark:text-white mb-8">
                {editingProduct.id ? (isAr ? 'تعديل بيانات المنتج' : 'Edit Product') : (isAr ? 'إضافة صنف جديد' : 'New Product')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">{isAr ? 'اسم المنتج' : 'Product Name'}</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl fluid-input font-bold" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">{isAr ? 'السعر' : 'Price'}</label>
                  <input type="number" className="w-full px-6 py-4 rounded-2xl fluid-input font-bold" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">{isAr ? 'المخزون' : 'Stock'}</label>
                  <input type="number" className="w-full px-6 py-4 rounded-2xl fluid-input font-bold" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">{isAr ? 'التكلفة' : 'Cost'}</label>
                  <input type="number" className="w-full px-6 py-4 rounded-2xl fluid-input font-bold" value={editingProduct.cost} onChange={e => setEditingProduct({...editingProduct, cost: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-2">{isAr ? 'القسم' : 'Category'}</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl fluid-input font-bold" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <NeumorphButton className="flex-1 py-4 bg-blue-600 text-white border-none" onClick={handleSaveProduct}>{isAr ? 'حفظ' : 'Save'}</NeumorphButton>
                <NeumorphButton className="flex-1 py-4" variant="secondary" onClick={() => setEditingProduct(null)}>{isAr ? 'إلغاء' : 'Cancel'}</NeumorphButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Cart Toggle */}
      <div className="lg:hidden fixed bottom-24 right-6 z-40">
        <button 
          onClick={() => setShowCartMobile(true)} 
          className="w-16 h-16 bg-blue-600 text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center relative active:scale-90 transition-transform"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-4 border-[var(--bg-color)]">
            {cart.length}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showCartMobile && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            className="lg:hidden fixed inset-0 z-[110] glass-card !rounded-t-[3.5rem] p-8 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black">{isAr ? 'مراجعة الطلب' : 'Cart Review'}</h3>
               <button onClick={() => setShowCartMobile(false)} className="w-10 h-10 rounded-full neumorph-flat flex items-center justify-center text-lg">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center p-5 rounded-[2rem] neumorph-inset bg-transparent">
                  <div className="flex-1">
                    <p className="font-black text-sm text-black dark:text-white">{item.name}</p>
                    <p className="text-blue-600 font-bold text-xs">{item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex gap-4 items-center">
                     <button onClick={() => updateQuantity(item.productId, -1)} className="w-10 h-10 rounded-xl neumorph-flat font-black text-lg">-</button>
                     <button onClick={() => updateQuantity(item.productId, 1)} className="w-10 h-10 rounded-xl neumorph-flat font-black text-lg">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 mt-4 border-t border-black/5 dark:border-white/5 space-y-6">
               <div className="flex justify-between items-center font-black text-2xl">
                  <span className="text-gray-500 text-sm uppercase">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-blue-600">{total.toFixed(2)} EGP</span>
               </div>
               <NeumorphButton onClick={handleCheckout} className="w-full py-6 text-xl font-black bg-blue-600 text-white border-none shadow-xl shadow-blue-500/20" disabled={cart.length === 0}>
                  {isAr ? 'تأكيد ودفع' : 'CONFIRM ORDER'}
               </NeumorphButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
