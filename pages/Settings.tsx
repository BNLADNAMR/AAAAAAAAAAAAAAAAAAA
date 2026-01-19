
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { GlassCard } from '../components/GlassCard';
import { NeumorphButton } from '../components/NeumorphButton';
import { User, UserRole, UserStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Settings: React.FC = () => {
  const { settings, updateSettings, currentUser, updateUserProfile, users, updateUserStatus } = useStore();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempUserData, setTempUserData] = useState<Partial<User>>({});
  const [selectedUserReview, setSelectedUserReview] = useState<User | null>(null);
  
  const isAr = settings.language === 'ar';
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (currentUser) {
      setTempUserData({
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        username: currentUser.username,
        password: currentUser.password
      });
    }
  }, [currentUser]);

  const handleSaveProfile = () => {
    if (!currentUser) return;
    updateUserProfile(currentUser.id, tempUserData);
    setEditingSection(null);
  };

  const updateProfitRate = (service: string, field: 'percentage' | 'fixed', value: string) => {
    const numValue = parseFloat(value) || 0;
    updateSettings({
      ...settings,
      serviceProfits: {
        ...settings.serviceProfits,
        [service]: {
          ...(settings.serviceProfits as any)[service],
          [field]: numValue
        }
      }
    });
  };

  const pendingUsers = useMemo(() => users.filter(u => u.status === 'pending_review'), [users]);

  // User Settings Dashboard
  const UserSettings = () => {
    const sections = [
      {
        id: 'account',
        title: isAr ? 'معلومات الحساب' : 'Account Information',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        isEditable: true,
        fields: [
          { key: 'username', label: isAr ? 'اسم المستخدم' : 'Username', value: currentUser?.username, editable: false },
          { key: 'fullName', label: isAr ? 'الاسم بالكامل' : 'Full Name', value: currentUser?.fullName || (isAr ? 'لم يحدد' : 'Not Set'), editable: true },
          { key: 'phone', label: isAr ? 'رقم الهاتف' : 'Phone Number', value: currentUser?.phone, editable: true }
        ]
      },
      {
        id: 'security',
        title: isAr ? 'الأمان والخصوصية' : 'Security & Privacy',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
        isEditable: true,
        fields: [
          { key: 'password', label: isAr ? 'كلمة المرور' : 'Password', value: '********', editable: true, type: 'password' }
        ]
      },
      {
        id: 'preferences',
        title: isAr ? 'تفضيلات النظام' : 'System Preferences',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
        isEditable: false,
        customRender: (
          <div className="space-y-4 pt-2">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">{isAr ? 'لغة التطبيق' : 'Language'}</span>
                <select 
                  className="bg-transparent font-black text-blue-600 text-xs outline-none cursor-pointer"
                  value={settings.language}
                  onChange={e => updateSettings({...settings, language: e.target.value as any})}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">{isAr ? 'الوضع الليلي' : 'Dark Mode'}</span>
                <button 
                  onClick={() => updateSettings({...settings, theme: settings.theme === 'light' ? 'dark' : 'light'})}
                  className="w-10 h-5 bg-blue-600/20 rounded-full relative transition-colors"
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${settings.theme === 'dark' ? (isAr ? 'left-1' : 'right-1') + ' bg-blue-600' : (isAr ? 'right-1' : 'left-1') + ' bg-gray-400'}`}></div>
                </button>
             </div>
          </div>
        )
      },
      {
        id: 'notifications',
        title: isAr ? 'الإشعارات' : 'Notifications',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
        isEditable: false,
        customRender: (
          <div className="flex justify-between items-center py-2">
            <span className="text-xs font-bold text-gray-500">{isAr ? 'تفعيل كافة الإشعارات' : 'Enable All'}</span>
            <button 
              onClick={() => updateSettings({...settings, notificationsEnabled: !settings.notificationsEnabled})}
              className={`w-10 h-5 rounded-full relative transition-colors ${settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.notificationsEnabled ? (isAr ? 'left-1' : 'right-1') : (isAr ? 'right-1' : 'left-1')}`}></div>
            </button>
          </div>
        )
      },
      {
        id: 'kyc',
        title: isAr ? 'التحقق والامتثال (KYC)' : 'KYC & Compliance',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
        status: currentUser?.status === 'verified' ? (isAr ? 'موثق' : 'Verified') : (isAr ? 'قيد المراجعة' : 'Pending')
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <GlassCard key={section.id} delay={idx * 0.05} className="neumorph-flat border-none !p-6 flex flex-col h-full relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl neumorph-inset flex items-center justify-center text-blue-600 bg-transparent">
                  {section.icon}
                </div>
                <h3 className="font-black text-xs text-black dark:text-white uppercase tracking-tight">{section.title}</h3>
              </div>
              {section.isEditable && (
                <button 
                  onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {editingSection === section.id ? (isAr ? 'إلغاء' : 'Cancel') : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  )}
                </button>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <AnimatePresence mode="wait">
                {editingSection === section.id ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {section.fields?.map(f => f.editable && (
                      <div key={f.key} className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase">{f.label}</label>
                        <input 
                          type={f.type || 'text'}
                          className="w-full px-4 py-2 rounded-xl neumorph-inset bg-transparent text-xs font-black outline-none border-none text-blue-600"
                          value={(tempUserData as any)[f.key] || ''}
                          onChange={(e) => setTempUserData({...tempUserData, [f.key]: e.target.value})}
                        />
                      </div>
                    ))}
                    <NeumorphButton onClick={handleSaveProfile} className="w-full py-3 text-[10px] font-black mt-2">
                       {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                    </NeumorphButton>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {section.fields?.map(f => (
                      <div key={f.label} className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">{f.label}</span>
                        <span className="font-black text-black dark:text-gray-200">
                          {f.key === 'password' ? '********' : f.value}
                        </span>
                      </div>
                    ))}
                    {section.customRender}
                    {section.status && (
                      <div className="flex items-center justify-center py-4">
                         <span className={`px-4 py-2 rounded-xl text-[10px] font-black ${currentUser?.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {section.status}
                         </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-7xl mx-auto page-transition text-black dark:text-white" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black mb-2 tracking-tighter">{isAr ? 'إعدادات الحساب' : 'Account Settings'}</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{isAr ? 'تخصيص وإدارة حسابك الشخصي' : 'Customize and manage your personal account'}</p>
          </div>
        </div>
        <UserSettings />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto page-transition text-black dark:text-white space-y-12" dir={isAr ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl font-black mb-10">{isAr ? 'لوحة تحكم المسؤول' : 'Admin Dashboard Settings'}</h2>
      
      {/* Verification Requests Area */}
      {pendingUsers.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-black text-blue-600 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            {isAr ? 'طلبات توثيق جديدة بانتظار المراجعة' : 'New Identity Verification Requests'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map(u => (
              <GlassCard key={u.id} className="neumorph-flat !p-6 flex flex-col gap-4 border-2 border-blue-500/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-sm">{u.fullName || u.username}</p>
                    <p className="text-[10px] text-gray-500">{u.phone}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black rounded-full uppercase">Review</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden neumorph-inset">
                    {u.idFront && <img src={u.idFront} className="w-full h-full object-cover" />}
                  </div>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden neumorph-inset">
                    {u.idBack && <img src={u.idBack} className="w-full h-full object-cover" />}
                  </div>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden neumorph-inset">
                    {u.selfie && <img src={u.selfie} className="w-full h-full object-cover" />}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setSelectedUserReview(u)} className="flex-1 py-3 text-[10px] font-black neumorph-flat bg-white dark:bg-gray-800">
                    {isAr ? 'تفاصيل' : 'Details'}
                  </button>
                  <button onClick={() => updateUserStatus(u.id, 'verified')} className="flex-1 py-3 text-[10px] font-black bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/20">
                    {isAr ? 'قبول' : 'Approve'}
                  </button>
                  <button onClick={() => updateUserStatus(u.id, 'rejected')} className="px-4 py-3 text-[10px] font-black bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/20">
                    ✕
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* User Review Full Modal */}
      <AnimatePresence>
        {selectedUserReview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[300] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto !p-10 neumorph-flat">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black">{isAr ? 'مراجعة بيانات المستخدم' : 'Review User Data'}</h3>
                <button onClick={() => setSelectedUserReview(null)} className="text-2xl">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="p-6 neumorph-inset rounded-3xl space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isAr ? 'المعلومات الشخصية' : 'Personal Info'}</h4>
                    <div className="space-y-2">
                      <p className="text-sm font-black">{isAr ? 'الاسم:' : 'Name:'} <span className="text-blue-600">{selectedUserReview.fullName}</span></p>
                      <p className="text-sm font-black">{isAr ? 'اسم المستخدم:' : 'Username:'} <span className="text-blue-600">{selectedUserReview.username}</span></p>
                      <p className="text-sm font-black">{isAr ? 'رقم الهاتف:' : 'Phone:'} <span className="text-blue-600">{selectedUserReview.phone}</span></p>
                      <p className="text-sm font-black">{isAr ? 'تاريخ الميلاد:' : 'Birth:'} <span className="text-blue-600">{selectedUserReview.birthDate?.day}/{selectedUserReview.birthDate?.month}</span></p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isAr ? 'صورة السيلفي' : 'Selfie Verification'}</h4>
                    <div className="w-full aspect-video rounded-3xl overflow-hidden neumorph-inset">
                      <img src={selectedUserReview.selfie} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isAr ? 'البطاقة الشخصية (أمام)' : 'ID Front'}</h4>
                    <div className="w-full aspect-video rounded-3xl overflow-hidden neumorph-inset">
                      <img src={selectedUserReview.idFront} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isAr ? 'البطاقة الشخصية (خلف)' : 'ID Back'}</h4>
                    <div className="w-full aspect-video rounded-3xl overflow-hidden neumorph-inset">
                      <img src={selectedUserReview.idBack} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-12 border-t border-white/10 pt-10">
                <NeumorphButton onClick={() => { updateUserStatus(selectedUserReview.id, 'verified'); setSelectedUserReview(null); }} className="flex-1 py-6 text-xl bg-green-600 text-white">
                  {isAr ? 'قبول التوثيق' : 'Verify & Approve'}
                </NeumorphButton>
                <NeumorphButton onClick={() => { updateUserStatus(selectedUserReview.id, 'rejected'); setSelectedUserReview(null); }} variant="danger" className="flex-1 py-6 text-xl">
                  {isAr ? 'رفض الحساب' : 'Reject Account'}
                </NeumorphButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <GlassCard className="neumorph-flat border-blue-500/20">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {isAr ? 'إدارة عمولات الخدمات' : 'Service Commission Management'}
            </h3>
            <div className="space-y-6">
              {[
                { id: 'recharge', label: isAr ? 'شحن رصيد' : 'Recharge', icon: '⚡' },
                { id: 'deposit', label: isAr ? 'إيداع طلبات' : 'Order Deposit', icon: '📦' },
                { id: 'installments', label: isAr ? 'دفع الأقساط' : 'Installments', icon: '📅' },
                { id: 'electricity', label: isAr ? 'فاتورة كهرباء' : 'Electricity', icon: '💡' },
                { id: 'water', label: isAr ? 'فاتورة المياه' : 'Water', icon: '💧' },
                { id: 'gas', label: isAr ? 'فاتورة الغاز' : 'Gas', icon: '🔥' }
              ].map(service => (
                <div key={service.id} className="p-6 neumorph-inset rounded-3xl space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon}</span>
                      <span className="font-black text-lg">{service.label}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase">{isAr ? 'نسبة مئوية %' : 'Percentage %'}</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 rounded-xl fluid-input text-lg font-black text-blue-600"
                        value={(settings.serviceProfits as any)[service.id]?.percentage || 0}
                        onChange={(e) => updateProfitRate(service.id, 'percentage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Fee (EGP)'}</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 rounded-xl fluid-input text-lg font-black text-green-600"
                        value={(settings.serviceProfits as any)[service.id]?.fixed || 0}
                        onChange={(e) => updateProfitRate(service.id, 'fixed', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-10">
          <GlassCard className="neumorph-flat">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
              {isAr ? 'إحصائيات وقائمة المستخدمين' : 'User Base & Statistics'}
            </h3>
            <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-5 neumorph-flat rounded-2xl group relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-black text-blue-600">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-black dark:text-white">{u.username}</p>
                      <p className="text-[10px] uppercase text-gray-500 font-bold">
                        {u.status === 'verified' ? (isAr ? 'نشط' : 'Active') : (u.status === 'pending_review' ? (isAr ? 'بانتظار المراجعة' : 'Pending Review') : (isAr ? 'معلق' : 'Suspended'))}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => setSelectedUserReview(u)} className="p-2 text-blue-600 hover:scale-110 transition-transform">
                       🔍
                     </button>
                     {u.id !== currentUser?.id && (
                        <button onClick={() => updateUserStatus(u.id, u.status === 'verified' ? 'rejected' : 'verified')} className={`px-4 py-1.5 rounded-xl text-[8px] font-black ${u.status === 'verified' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                           {u.status === 'verified' ? (isAr ? 'تجميد' : 'Freeze') : (isAr ? 'تفعيل' : 'Activate')}
                        </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
