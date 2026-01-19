
import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { NeumorphButton } from '../components/NeumorphButton';
import { Product, Sale, SaleItem } from '../types';

export const Shop: React.FC = () => {
  const { products, settings, currentUser, addSale } = useStore();
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('cash');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isAr = settings.language === 'ar';

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['All', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [products, category, searchTerm]);

  const addToCart = (p: Product, openCheckout = false) => {
    if (p.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        return prev.map(item => item.productId === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: p.id, name: p.name, price: p.price, quantity: 1 }];
    });

    if (openCheckout) {
      setShowCheckout(true);
    }
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0 || !currentUser) return;
    setIsSubmitting(true);

    const newSale: Sale = {
      id: "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      items: cart,
      subtotal: cartTotal,
      tax: 0,
      discount: 0,
      total: cartTotal,
      profit: 0, // Admin handles profit calculation
      paymentMethod,
      status: 'pending',
      note: `${isAr ? 'طلب منتجات من المتجر' : 'Product Order from Shop'} | ${orderNote}`
    };

    // Simulate network delay
    setTimeout(() => {
      addSale(newSale);
      setCart([]);
      setShowCheckout(false);
      setIsSubmitting(false);
      alert(isAr ? 'تم إرسال طلبك بنجاح! يمكنك متابعته من سجل العمليات.' : 'Order placed successfully! Track it in your history.');
    }, 1000);
  };

  const paymentOptions = [
    { id: 'cash', label: isAr ? 'نقدي (عند الاستلام)' : 'Cash on Delivery', icon: '💵' },
    { id: 'vodafone', label: 'Vodafone Cash', icon: '📱' },
    { id: 'instapay', label: 'InstaPay', icon: '💸' },
  ];

  return (
    <div className="space-y-8 pb-32 page-transition" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter text-black dark:text-white">{isAr ? 'المتجر الإلكتروني' : 'Electronic Shop'}</h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{isAr ? 'تصفح واطلب منتجاتك المفضلة' : 'Browse and order your favorite products'}</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={isAr ? "ابحث في المتجر..." : "Search in shop..."}
            className="w-full py-4 px-6 rounded-2xl neumorph-inset bg-transparent font-black text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-8 py-3 rounded-2xl font-black text-[10px] transition-all whitespace-nowrap uppercase tracking-widest ${
              category === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'neumorph-flat text-gray-500'
            }`}
          >
            {cat === 'All' ? (isAr ? 'الكل' : 'All') : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <GlassCard 
                className="h-full flex flex-col neumorph-flat border-none !p-6 group relative overflow-hidden"
              >
                <div 
                  className="w-full aspect-square rounded-[2rem] neumorph-inset mb-6 flex items-center justify-center overflow-hidden bg-white/20 dark:bg-black/20 cursor-pointer"
                  onClick={() => setSelectedProduct(p)}
                >
                   {p.imageUrl ? (
                     <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <span className="text-6xl group-hover:scale-110 transition-transform duration-500">📦</span>
                   )}
                   
                   {p.stock < 5 && p.stock > 0 && (
                     <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-white text-[8px] font-black rounded-full uppercase shadow-lg z-20">
                       {isAr ? 'أوشك على النفاذ' : 'Low Stock'}
                     </div>
                   )}
                   {p.stock <= 0 && (
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="text-white font-black text-sm uppercase rotate-[-15deg] border-4 border-white px-4 py-2">{isAr ? 'غير متوفر' : 'Sold Out'}</span>
                     </div>
                   )}
                </div>
                
                <div className="flex-1 space-y-2" onClick={() => setSelectedProduct(p)}>
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.category}</p>
                    <p className="text-[9px] font-bold text-gray-400">#{p.barcode}</p>
                  </div>
                  <h4 className="text-sm font-black text-black dark:text-white truncate cursor-pointer">{p.name}</h4>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-2xl font-black text-black dark:text-white">{p.price}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase">{settings.currency}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <NeumorphButton 
                    disabled={p.stock <= 0}
                    onClick={() => addToCart(p, true)}
                    className="flex-1 py-4 text-[9px] font-black !rounded-xl bg-blue-600 text-white border-none shadow-lg shadow-blue-600/10"
                  >
                    {isAr ? 'شراء' : 'Buy'}
                  </NeumorphButton>
                  <NeumorphButton 
                    onClick={() => setSelectedProduct(p)}
                    className="p-4 text-[9px] font-black !rounded-xl"
                    variant="secondary"
                  >
                    🔍
                  </NeumorphButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="fixed bottom-28 right-8 lg:right-12 z-[150]"
        >
          <button 
            onClick={() => setShowCheckout(true)}
            className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] shadow-2xl flex items-center justify-center relative hover:scale-110 active:scale-95 transition-all"
          >
            <span className="text-2xl">🛒</span>
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
              {cart.length}
            </span>
          </button>
        </motion.div>
      )}

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[200] p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="glass-card w-full max-w-5xl h-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden !p-0 neumorph-flat border-white/10"
            >
              <div className="w-full md:w-1/2 h-64 md:h-full relative bg-gray-100 dark:bg-black/20">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
                )}
                <button 
                  onClick={() => setSelectedProduct(null)} 
                  className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition-colors z-50 md:hidden"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 p-8 md:p-14 overflow-y-auto no-scrollbar flex flex-col relative">
                <button 
                  onClick={() => setSelectedProduct(null)} 
                  className={`absolute ${isAr ? 'left-10' : 'right-10'} top-10 w-12 h-12 rounded-full neumorph-flat hidden md:flex items-center justify-center text-black dark:text-white transition-transform active:scale-90`}
                >
                  ✕
                </button>

                <div className="mt-4 md:mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                      {selectedProduct.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{selectedProduct.barcode}</span>
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-black text-black dark:text-white mb-6 leading-tight tracking-tighter">
                    {selectedProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-10">
                    <span className="text-4xl font-black text-blue-600">{selectedProduct.price}</span>
                    <span className="text-sm font-black text-gray-500 uppercase">{settings.currency}</span>
                  </div>

                  <div className="space-y-6 mb-12">
                    <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{isAr ? 'وصف المنتج' : 'About this product'}</h5>
                    <p className="text-gray-600 dark:text-gray-300 font-bold leading-relaxed text-sm md:text-base whitespace-pre-line">
                      {selectedProduct.description || (isAr ? 'لا يوجد وصف متاح لهذا المنتج حالياً.' : 'No description available for this product.')}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex gap-4">
                  <NeumorphButton 
                    disabled={selectedProduct.stock <= 0}
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                    className="flex-1 py-6 text-xl font-black bg-blue-600 text-white border-none !rounded-[2rem] shadow-2xl shadow-blue-500/20"
                  >
                    {isAr ? 'أضف للسلة 🛒' : 'Add to Cart 🛒'}
                  </NeumorphButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[300] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg p-8 md:p-12 neumorph-flat overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-black dark:text-white">{isAr ? 'إتمام الطلب' : 'Checkout'}</h3>
                <button onClick={() => setShowCheckout(false)} className="text-2xl opacity-50 hover:opacity-100 transition-opacity">✕</button>
              </div>

              {/* Cart Summary */}
              <div className="space-y-4 mb-10">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isAr ? 'ملخص السلة' : 'Cart Summary'}</h5>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-center p-4 neumorph-inset rounded-2xl">
                      <div className="flex-1">
                        <p className="text-xs font-black dark:text-white">{item.name}</p>
                        <p className="text-[10px] text-blue-600 font-bold">{item.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateCartQuantity(item.productId, -1)} className="w-8 h-8 rounded-lg neumorph-flat flex items-center justify-center font-black">-</button>
                        <span className="text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.productId, 1)} className="w-8 h-8 rounded-lg neumorph-flat flex items-center justify-center font-black">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-6 px-4">
                  <span className="font-black text-gray-500 uppercase text-xs">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-3xl font-black text-blue-600">{cartTotal} {settings.currency}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4 mb-10">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isAr ? 'وسيلة الدفع' : 'Payment Method'}</h5>
                <div className="grid grid-cols-1 gap-3">
                  {paymentOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id as any)}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                        paymentMethod === opt.id ? 'border-blue-600 bg-blue-600/5' : 'border-transparent neumorph-flat'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-sm font-black dark:text-white">{opt.label}</span>
                      </div>
                      {paymentMethod === opt.id && <span className="text-blue-600 text-xl">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 mb-10">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isAr ? 'ملاحظات الطلب (مثل العنوان)' : 'Order Notes (e.g. Address)'}</label>
                <textarea 
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full p-4 rounded-2xl neumorph-inset font-bold text-xs min-h-[100px] resize-none"
                  placeholder={isAr ? "اكتب عنوانك أو أي ملاحظات هنا..." : "Type your address or any notes here..."}
                />
              </div>

              <NeumorphButton 
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-6 text-xl font-black bg-blue-600 text-white !rounded-[2rem] shadow-2xl shadow-blue-500/20"
              >
                {isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'تأكيد الطلب الآن 🛍️' : 'Confirm Order 🛍️')}
              </NeumorphButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
