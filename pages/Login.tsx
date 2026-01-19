
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../contexts/StoreContext';
import { NeumorphButton } from '../components/NeumorphButton';
import { db } from '../db/mockDb';
import { UserRole, User } from '../types';

export const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [hasWhatsApp, setHasWhatsApp] = useState(false);
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { setCurrentUser, settings, updateSettings } = useStore();
  const isAr = settings.language === 'ar';

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr = [];
    for (let i = currentYear; i >= 1900; i--) arr.push(i);
    return arr;
  }, [currentYear]);

  const daysInMonth = useMemo(() => {
    if (!birthMonth || !birthYear) return 31;
    return new Date(Number(birthYear), Number(birthMonth), 0).getDate();
  }, [birthMonth, birthYear]);

  useEffect(() => {
    if (birthDay && Number(birthDay) > daysInMonth) {
      setBirthDay(daysInMonth.toString());
    }
  }, [daysInMonth, birthDay]);

  const handlePhoneChange = (val: string) => {
    const numericValue = val.replace(/\D/g, ''); 
    if (numericValue.length <= 11) {
      setPhone(numericValue);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = db.getUsers();

    if (isRegistering) {
      if (!username || !fullName || !phone || !birthDay || !birthMonth || !birthYear || !password) {
        setError(isAr ? 'يرجى ملء جميع الحقول الإلزامية' : 'Please fill all required fields');
        return;
      }
      if (phone.length !== 11) {
        setError(isAr ? 'يجب أن يكون رقم الهاتف 11 رقماً' : 'Phone number must be 11 digits');
        return;
      }
      if (password !== confirmPassword) {
        setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
        return;
      }
      if (users.some(u => u.username === username)) {
        setError(isAr ? 'اسم المستخدم موجود مسبقاً' : 'Username already exists');
        return;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        username,
        fullName,
        phone,
        hasWhatsApp,
        birthDate: {
          day: parseInt(birthDay),
          month: parseInt(birthMonth)
        },
        password,
        role: UserRole.USER,
        status: 'pending_info'
      };
      
      const updatedUsers = [...users, newUser];
      db.saveUsers(updatedUsers);
      setCurrentUser(newUser);
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        setCurrentUser(user);
      } else {
        setError(isAr ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] dark:bg-[#181a1d] px-4 py-12 transition-colors duration-500 overflow-y-auto">
      <div className={`fixed top-8 ${isAr ? 'right-8' : 'left-8'} z-50 flex gap-4`}>
        <button 
          onClick={() => updateSettings({ ...settings, language: isAr ? 'en' : 'ar' })}
          className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 text-blue-600 font-black text-xs border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {isAr ? 'EN' : 'AR'}
        </button>
        <button 
          onClick={() => updateSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
          className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-yellow-400 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {settings.theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-lg w-full glass-card rounded-[2.5rem] p-10 md:p-14 shadow-sm ${isRegistering ? 'mt-16' : ''}`}
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-blue-600 rounded-[2.2rem] mx-auto flex items-center justify-center shadow-lg mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {isRegistering ? (isAr ? 'تسجيل مستخدم جديد' : 'New Account') : (isAr ? 'دخول براند ستور' : 'Brand Store Login')}
          </h2>
        </div>

        <form onSubmit={handleAuth} className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
          {isRegistering && (
            <div className="space-y-5">
              <input
                type="text"
                placeholder={isAr ? 'الاسم بالكامل' : 'Full Name'}
                className="w-full px-6 py-4 rounded-2xl fluid-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-black uppercase text-gray-500">{isAr ? 'تاريخ الميلاد' : 'Birth Date'}</label>
                <div className="grid grid-cols-3 gap-3">
                  <select className="fluid-input px-2 py-4 rounded-2xl text-center" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
                    <option value="">{isAr ? 'سنة' : 'Year'}</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select className="fluid-input px-2 py-4 rounded-2xl text-center" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
                    <option value="">{isAr ? 'شهر' : 'Month'}</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="fluid-input px-2 py-4 rounded-2xl text-center" value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
                    <option value="">{isAr ? 'يوم' : 'Day'}</option>
                    {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder={isAr ? 'رقم الهاتف (11 رقم)' : 'Phone Number (11 digits)'}
                className="w-full px-6 py-4 rounded-2xl fluid-input"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
            </div>
          )}

          <input
            type="text"
            placeholder={isAr ? 'اسم المستخدم' : 'Username'}
            className="w-full px-6 py-4 rounded-2xl fluid-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
              className="w-full px-6 py-4 rounded-2xl fluid-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isAr ? 'left-6' : 'right-6'}`}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {isRegistering && (
            <input
              type={showPassword ? "text" : "password"}
              placeholder={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              className="w-full px-6 py-4 rounded-2xl fluid-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-[11px] text-center font-black bg-red-50 py-2.5 rounded-xl">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <NeumorphButton className="w-full py-5 text-xl font-black bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            {isRegistering ? (isAr ? 'إنشاء حساب' : 'REGISTER') : (isAr ? 'دخول' : 'LOGIN')}
          </NeumorphButton>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-gray-500 font-black hover:text-blue-600 transition-colors text-sm"
            >
              {isRegistering ? (isAr ? 'لديك حساب؟ دخول' : 'Login') : (isAr ? 'مستخدم جديد؟ سجل الآن' : 'Register')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

