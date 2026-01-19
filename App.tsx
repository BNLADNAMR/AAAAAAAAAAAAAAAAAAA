
import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './contexts/StoreContext';
import { Login } from './pages/Login';
import { ProductManager } from './pages/ProductManager';
import { Shop } from './pages/Shop';
import { UserPayment } from './pages/UserPayment';
import { UserVerification } from './pages/UserVerification';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Customers } from './pages/Customers';
import { Expenses } from './pages/Expenses';
import { UserRole, User } from './types';
import { db } from './db/mockDb';
import { motion } from 'framer-motion';
// Fixed: Added missing import for NeumorphButton
import { NeumorphButton } from './components/NeumorphButton';

const MainApp: React.FC = () => {
  const { currentUser, setCurrentUser, settings } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const isAr = settings.language === 'ar';

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('products'); 
      }
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Login />;
  }

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Gatekeeping for non-admin users based on verification status
  if (!isAdmin) {
    if (currentUser.status === 'pending_info') {
      return (
        <UserVerification 
          onComplete={(data) => {
            const updatedUser: User = { ...currentUser, ...data, status: 'pending_review' };
            setCurrentUser(updatedUser);
            const allUsers = db.getUsers();
            db.saveUsers(allUsers.map(u => u.id === currentUser.id ? updatedUser : u));
          }} 
        />
      );
    }

    if (currentUser.status === 'pending_review') {
      return (
        <div className="min-h-screen bg-[#f4f7fa] dark:bg-[#0f1113] flex flex-col items-center justify-center p-8 text-center" dir={isAr ? 'rtl' : 'ltr'}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 rounded-[3rem] neumorph-flat max-w-lg">
              <div className="text-6xl mb-8 animate-pulse">⏳</div>
              <h2 className="text-3xl font-black mb-4">{isAr ? 'طلبك قيد المراجعة' : 'Account Under Review'}</h2>
              <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                {isAr ? 'شكراً لتقديم بياناتك. يقوم فريق الإدارة حالياً بمراجعة مستنداتك لتفعيل حسابك. ستتمكن من الدخول فور الموافقة.' : 'Thank you for submitting your data. Our admin team is reviewing your documents. You will gain access once approved.'}
              </p>
              <NeumorphButton onClick={() => setCurrentUser(null)} variant="secondary" className="w-full">
                {isAr ? 'تسجيل الخروج' : 'Logout'}
              </NeumorphButton>
           </motion.div>
        </div>
      );
    }

    if (currentUser.status === 'rejected') {
      return (
        <div className="min-h-screen bg-red-50 dark:bg-[#1a0000] flex flex-col items-center justify-center p-8 text-center" dir={isAr ? 'rtl' : 'ltr'}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 rounded-[3rem] neumorph-flat max-w-lg border-2 border-red-500/20">
              <div className="text-6xl mb-8">🚫</div>
              <h2 className="text-3xl font-black mb-4 text-red-600">{isAr ? 'تم رفض الحساب' : 'Account Rejected'}</h2>
              <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                {isAr ? 'عذراً، لم نتمكن من قبول حسابك بناءً على البيانات المقدمة. يرجى التواصل مع الدعم الفني لمزيد من التفاصيل.' : 'Sorry, we could not approve your account based on the provided data. Please contact support for more details.'}
              </p>
              <NeumorphButton onClick={() => setCurrentUser(null)} variant="danger" className="w-full">
                {isAr ? 'العودة للرئيسية' : 'Back to Home'}
              </NeumorphButton>
           </motion.div>
        </div>
      );
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return isAdmin ? <ProductManager /> : <Shop />;
      case 'orders': 
        return isAdmin ? <Orders /> : <UserPayment isEmbedded={true} onConfirm={() => setActiveTab('my-activity')} />;
      case 'my-activity': return <Orders />;
      case 'customers': return <Customers />;
      case 'expenses': return <Expenses />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return isAdmin ? <ProductManager /> : <Shop />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => (
  <StoreProvider>
    <MainApp />
  </StoreProvider>
);

export default App;

