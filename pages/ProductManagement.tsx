
import React, { useState, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { NeumorphButton } from '../components/NeumorphButton';
import { GlassCard } from '../components/GlassCard';
import { Product, SaleItem, Sale, UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductManagement: React.FC = () => {
  const { products, updateProducts, addSale, settings, currentUser } = useStore();
  const [viewMode, setViewMode] = useState<'sell' | 'manage'>('sell');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('cash');
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
    if (product.stock <= 0) {
      alert(isAr ? 'نفاذ الكمية!' : 'Out of stock!');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const total = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return sub + (sub * (settings.taxRate || 0));
  }, [cart, settings.taxRate]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newSale: Sale = {
      id: "INV-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      items: cart,
      subtotal: total / (1 + (settings.taxRate || 0)),
      tax: total - (total / (1 + (settings.taxRate || 0))),
      discount: 0,
      total,
      profit: 0,
      paymentMethod,
      status: 'success'
    };
    addSale(newSale);
    setCart([]);
    alert(isAr ? 'تمت العملية بنجاح' : 'Sale completed successfully');
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.name || editingProduct.price === undefined) return;
    if (editingProduct.id) {
      updateProducts(products.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
    } else {
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

  return (
    <div className="flex flex-col h-full gap-6 page-transition p-2 lg:p-0" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 p-1 neumorph-inset rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setViewMode('sell')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-xs transition-all ${viewMode === 'sell' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}
          >
            {isAr ? 'البيع' : 'POS'}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setViewMode('manage')}
              className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-xs transition-all ${viewMode === 'manage' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}
            >
              {isAr ? 'المخزن' : 'Inventory'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder={isAr ? "بحث..." : "Search..."} 
            className="w-full md:w-64 px-6 py-3 rounded-xl neumorph-inset bg-transparent dark:text-white font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <motion.div 
                key={p.id} 
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(p)} 
                className="glass-card rounded-[2.5rem] p-6 cursor-pointer neumorph-flat hover:border-blue-500/50 transition-all border border-transparent"
              >
                <h4 className="font-black text-sm dark:text-white truncate">{p.name}</h4>
                <p className="text-blue-600 font-black text-xl mt-3">{p.price} <small className="text-xs">{settings.currency}</small></p>
                <p className="text-[10px] text-gray-500 mt-2 font-bold">{isAr ? 'الكمية:' : 'Stock:'} {p.stock}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {viewMode === 'sell' && cart.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-96 flex flex-col gap-4"
          >
            <GlassCard className="flex flex-col neumorph-flat h-full !p-8 border-none">
              <h3 className="text-xl font-black mb-6 dark:text-white">{isAr ? 'السلة' : 'Cart'}</h3>
              <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center p-4 rounded-2xl neumorph-inset bg-white dark:bg-gray-800/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs dark:text-white truncate">{item.name}</p>
                      <p className="text-blue-600 font-black text-[10px]">{item.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQuantity(item.productId, -1)} className="w-8 h-8 neumorph-flat rounded-lg dark:text-white font-black">-</button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, 1)} className="w-8 h-8 neumorph-flat rounded-lg dark:text-white font-black">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 mt-6 border-t dark:border-white/10">
                <div className="flex justify-between font-black text-2xl text-blue-600 mb-6">
                  <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
                  <span>{total.toFixed(2)}</span>
                </div>
                <NeumorphButton onClick={handleCheckout} className="w-full !bg-blue-600 !text-white !py-5">
                  {isAr ? 'تأكيد البيع' : 'Confirm Sale'}
                </NeumorphButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card w-full max-w-md p-10 neumorph-flat">
              <h3 className="text-2xl font-black mb-8 dark:text-white">{isAr ? 'بيانات المنتج' : 'Product Details'}</h3>
              <div className="space-y-6">
                <input type="text" placeholder="الاسم" className="w-full p-4 rounded-xl neumorph-inset" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                <input type="number" placeholder="السعر" className="w-full p-4 rounded-xl neumorph-inset" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                <input type="number" placeholder="المخزون" className="w-full p-4 rounded-xl neumorph-inset" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 mt-10">
                <NeumorphButton onClick={handleSaveProduct} className="flex-1 !bg-blue-600 !text-white">{isAr ? 'حفظ' : 'Save'}</NeumorphButton>
                <NeumorphButton onClick={() => setEditingProduct(null)} className="flex-1" variant="secondary">{isAr ? 'إلغاء' : 'Cancel'}</NeumorphButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
