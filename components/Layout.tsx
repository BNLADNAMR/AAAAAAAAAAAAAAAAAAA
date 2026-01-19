
import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { NeumorphButton } from './NeumorphButton';
import { SupportBot } from './SupportBot';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, setCurrentUser, settings, updateSettings } = useStore();
  const isAr = settings.language === 'ar';
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const navItems = [
    { id: 'dashboard', label: isAr ? 'لوحة التحكم' : 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { 
      id: 'products', 
      label: isAdmin ? (isAr ? 'إدارة المخزن' : 'Inventory') : (isAr ? 'المتجر' : 'Shop'), 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> 
    },
    { id: 'orders', label: isAr ? 'الخدمات المالية' : 'Financial Services', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { id: 'my-activity', label: isAr ? 'السجلات' : 'History Logs', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'reports', label: isAr ? 'التقارير' : 'Reports', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> },
    { id: 'expenses', label: isAr ? 'المصاريف' : 'Expenses', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'settings', label: isAr ? 'الإعدادات' : 'Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  const filteredItems = currentUser?.role === UserRole.USER 
    ? navItems.filter(item => ['products', 'orders', 'my-activity', 'settings'].includes(item.id))
    : navItems;

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-500 ${isAr ? 'lg:flex-row-reverse text-right' : ''}`}>
      
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col w-72 bg-[var(--sidebar-bg)] border-white/10 p-6 fixed h-full z-40 transition-all ${isAr ? 'right-0 border-l' : 'left-0 border-r'}`}>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
             <span className="font-black text-xs">B</span>
          </div>
          <h1 className="font-black text-lg tracking-tight dark:text-white">BRAND STORE</h1>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
          <button 
            onClick={() => updateSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })} 
            className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl neumorph-flat text-sm font-bold dark:text-white"
          >
            {settings.theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <NeumorphButton onClick={() => setCurrentUser(null)} variant="danger" className="w-full py-3.5 !rounded-2xl text-xs">
            {isAr ? 'خروج' : 'Logout'}
          </NeumorphButton>
        </div>
      </aside>

      {/* Main Area */}
      <main className={`flex-1 transition-all min-h-screen pb-24 lg:pb-10 ${isAr ? 'lg:mr-72' : 'lg:ml-72'}`}>
        <header className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-10 bg-[var(--bg-color)]/80 backdrop-blur-md sticky top-0 z-30 border-b border-white/10">
          <h2 className="text-lg lg:text-xl font-black capitalize dark:text-white">
            {navItems.find(i => i.id === activeTab)?.label || activeTab}
          </h2>
          
          <div className="flex items-center gap-3">
             <button onClick={() => updateSettings({ ...settings, language: isAr ? 'en' : 'ar' })} className="w-10 h-10 rounded-xl neumorph-flat flex items-center justify-center font-black text-[10px] dark:text-white">{isAr ? 'EN' : 'AR'}</button>
             <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-4">
                <div className="hidden md:block text-right">
                    <p className="text-xs font-black dark:text-white">{currentUser?.username}</p>
                    <p className="text-[9px] text-gray-500 uppercase">{currentUser?.role}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-black text-blue-600 border border-blue-200/20">
                    {currentUser?.username[0].toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
          {children}
        </div>
      </main>

      <SupportBot />

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 glass-card rounded-[2rem] flex items-center justify-around px-4 z-50 shadow-2xl border border-white/20">
        {filteredItems.slice(0, 5).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === item.id ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            {item.icon}
            <span className="text-[9px] font-black uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
