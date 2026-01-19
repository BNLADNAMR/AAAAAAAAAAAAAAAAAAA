
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Sale, Expense, Settings, User, UserStatus } from '../types';
import { db } from '../db/mockDb';

interface StoreContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  settings: Settings;
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  updateUserProfile: (userId: string, data: Partial<User>) => void;
  updateProducts: (p: Product[]) => void;
  updateCustomers: (c: Customer[]) => void;
  addSale: (s: Sale) => void;
  updateSaleStatus: (saleId: string, status: 'success' | 'rejected') => void;
  addExpense: (e: Expense) => void;
  updateSettings: (s: Settings) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialSettings: Settings = {
  language: 'ar',
  currency: 'EGP',
  taxRate: 0.14,
  printFormat: 'thermal',
  theme: 'light',
  notificationsEnabled: true,
  serviceProfits: {
    installments: { percentage: 5, fixed: 0 },
    electricity: { percentage: 0, fixed: 10 },
    water: { percentage: 0, fixed: 5 },
    gas: { percentage: 0, fixed: 5 },
    deposit: { percentage: 0, fixed: 0 },
    recharge: { percentage: 0, fixed: 0 },
    bill: { percentage: 0, fixed: 5 },
    wallet: { percentage: 0, fixed: 5 },
    instapay: { percentage: 0, fixed: 0 }
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>(initialSettings);

  useEffect(() => {
    setProducts(db.getProducts());
    setCustomers(db.getCustomers());
    setSales(db.getSales());
    setExpenses(db.getExpenses());
    setUsers(db.getUsers());
    
    const savedSettings = localStorage.getItem('pos_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          serviceProfits: { ...prev.serviceProfits, ...(parsed.serviceProfits || {}) }
        }));
        if (parsed.theme === 'dark') document.documentElement.classList.add('dark');
      } catch (e) {
        console.error("Settings load error", e);
      }
    }
  }, []);

  const updateSettings = (s: Settings) => {
    setSettings(s);
    if (s.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('pos_settings', JSON.stringify(s));
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...data } : u);
    setUsers(updatedUsers);
    db.saveUsers(updatedUsers);
    
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status } : u);
    setUsers(updatedUsers);
    db.saveUsers(updatedUsers);
    
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, status });
    }
  };

  const updateProducts = (p: Product[]) => {
    setProducts(p);
    db.saveProducts(p);
  };

  const updateCustomers = (c: Customer[]) => {
    setCustomers(c);
    db.saveCustomers(c);
  };

  const addSale = (s: Sale) => {
    const saleWithStatus = { ...s, status: s.status || 'pending' };
    const newSales = [saleWithStatus, ...sales];
    setSales(newSales);
    db.saveSales(newSales);
    
    const updatedProducts = products.map(p => {
      const soldItem = s.items.find(si => si.productId === p.id);
      if (soldItem) return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      return p;
    });
    updateProducts(updatedProducts);
  };

  const updateSaleStatus = (saleId: string, status: 'success' | 'rejected') => {
    const targetSale = sales.find(s => s.id === saleId);
    if (!targetSale) return;

    if (status === 'rejected' && targetSale.status !== 'rejected') {
      const updatedProducts = products.map(p => {
        const itemInSale = targetSale.items.find(si => si.productId === p.id);
        if (itemInSale) return { ...p, stock: p.stock + itemInSale.quantity };
        return p;
      });
      updateProducts(updatedProducts);
    }

    const updatedSales = sales.map(s => s.id === saleId ? { ...s, status } : s);
    setSales(updatedSales);
    db.saveSales(updatedSales);
  };

  const addExpense = (e: Expense) => {
    const newExpenses = [e, ...expenses];
    setExpenses(newExpenses);
    db.saveExpenses(newExpenses);
  };

  return (
    <StoreContext.Provider value={{
      products, customers, sales, expenses, settings, users, currentUser, 
      setCurrentUser, updateUserStatus, updateUserProfile, updateProducts, updateCustomers, addSale, updateSaleStatus, addExpense, updateSettings
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
