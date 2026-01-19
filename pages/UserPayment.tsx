
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeumorphButton } from '../components/NeumorphButton';
import { GlassCard } from '../components/GlassCard';
import { useStore } from '../contexts/StoreContext';
import { Sale } from '../types';

type ServiceType = 'installments' | 'bill' | 'wallet' | 'instapay' | 'deposit' | 'recharge';

interface ServiceProvider {
  id: string;
  name: string;
  type: ServiceType;
  icon: string;
  color: string;
  placeholder: string;
  logo?: string;
  prefix?: string;
  isWallet?: boolean;
}

interface RechargeOption {
  id: string;
  name: string;
  logo: string;
  prompt: string;
  services: { id: string; name: string; packages?: string[]; prompt?: string }[];
}

export const UserPayment: React.FC<{ onConfirm?: (data: any) => void; isEmbedded?: boolean }> = ({ onConfirm, isEmbedded = false }) => {
  const { currentUser, settings, addSale } = useStore();
  const [step, setStep] = useState<'menu' | 'recharge_company' | 'recharge_service' | 'recharge_package' | 'input' | 'confirm' | 'success'>('menu');
  const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<RechargeOption | null>(null);
  const [selectedSubService, setSelectedSubService] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState(''); 
  const [amount, setAmount] = useState('');
  const [userNote, setUserNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState<Sale | null>(null);
  
  const isAr = settings.language === 'ar';
  const receiptAreaRef = useRef<HTMLDivElement>(null);

  const rechargeData: RechargeOption[] = [
    {
      id: 'vodafone',
      name: 'فودافون Vodafone',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Vodafone_icon.svg/1024px-Vodafone_icon.svg.png',
      prompt: isAr ? 'خدمات فودافون المتاحة:' : 'Available Vodafone services:',
      services: [
        { id: 'credit', name: isAr ? 'شحن رصيد' : 'Top-up' },
        { 
          id: 'flex', 
          name: isAr ? 'باقات فليكس' : 'Flex Bundles', 
          prompt: isAr ? 'اختر باقة فليكس:' : 'Select Flex bundle:',
          packages: ['فليكس 30', 'فليكس 45', 'فليكس 70', 'فليكس 100'] 
        },
        { id: 'bill', name: isAr ? 'دفع فاتورة' : 'Pay Bill' }
      ]
    },
    {
      id: 'orange',
      name: 'أورنج Orange',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1024px-Orange_logo.svg.png',
      prompt: isAr ? 'خدمات أورنج المتاحة:' : 'Available Orange services:',
      services: [
        { id: 'credit', name: isAr ? 'شحن رصيد' : 'Top-up' },
        { 
          id: 'bundles', 
          name: isAr ? 'باقات' : 'Bundles', 
          prompt: isAr ? 'اختر الباقة:' : 'Select bundle:',
          packages: ['كنترول', 'دولفين', 'دولفين 25', 'دولفين 40', 'دولفين 70'] 
        },
        { id: 'bill', name: isAr ? 'دفع فاتورة' : 'Pay Bill' }
      ]
    },
    {
      id: 'etisalat',
      name: 'اتصالات Etisalat',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Etisalat_by_e%26_logo.svg/1200px-Etisalat_by_e%26_logo.svg.png',
      prompt: isAr ? 'خدمات اتصالات المتاحة:' : 'Available Etisalat services:',
      services: [
        { id: 'credit', name: isAr ? 'شحن رصيد' : 'Top-up' },
        { 
          id: 'bundles', 
          name: isAr ? 'باقات' : 'Bundles', 
          prompt: isAr ? 'اختر الباقة:' : 'Select bundle:',
          packages: ['حكاية', 'حكاية 25', 'حكاية 40', 'حكاية 75'] 
        },
        { id: 'bill', name: isAr ? 'دفع فاتورة' : 'Pay Bill' }
      ]
    },
    {
      id: 'we',
      name: 'وي WE',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/WE_Logo.png/800px-WE_Logo.png',
      prompt: isAr ? 'خدمات وي المتاحة:' : 'Available WE services:',
      services: [
        { id: 'credit', name: isAr ? 'شحن رصيد' : 'Top-up' },
        { 
          id: 'bundles', 
          name: isAr ? 'باقات' : 'Bundles', 
          prompt: isAr ? 'اختر الباقة:' : 'Select bundle:',
          packages: ['كنترول', 'سوبر', 'ميكس'] 
        },
        { id: 'bill', name: isAr ? 'دفع فاتورة' : 'Pay Bill' }
      ]
    }
  ];

  const services: ServiceProvider[] = [
    { id: 'deposit', type: 'deposit', name: isAr ? 'إيداع طلبات (Order Deposit)' : 'Order Deposit', icon: '📦', color: 'blue', placeholder: isAr ? 'معرف الطلب (أرقام فقط)' : 'Order ID (Digits only)' },
    { id: 'vodafone', type: 'wallet', isWallet: true, name: isAr ? 'فودافون كاش' : 'Vodafone Cash', icon: '📱', color: 'red', placeholder: isAr ? 'رقم المحفظة (11 رقم)' : 'Wallet Number (11 digits)', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Vodafone_icon.svg/1024px-Vodafone_icon.svg.png', prefix: '010' },
    { id: 'etisalat', type: 'wallet', isWallet: true, name: isAr ? 'اتصالات كاش' : 'Etisalat Cash', icon: '📱', color: 'green', placeholder: isAr ? 'رقم المحفظة (11 رقم)' : 'Wallet Number (11 digits)', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Etisalat_by_e%26_logo.svg/1200px-Etisalat_by_e%26_logo.svg.png', prefix: '011' },
    { id: 'instapay', type: 'instapay', name: isAr ? 'إنستا باي' : 'InstaPay', icon: '💸', color: 'teal', placeholder: isAr ? 'IPA أو رقم الهاتف' : 'IPA or Phone', logo: 'https://instapay.eg/static/media/logo.8091176b.svg' },
    { id: 'we', type: 'wallet', isWallet: true, name: isAr ? 'وي باي' : 'WE Pay', icon: '📱', color: 'purple', placeholder: isAr ? 'رقم المحفظة (11 رقم)' : 'WE Wallet (11 digits)', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/WE_Logo.png/800px-WE_Logo.png', prefix: '015' },
    { id: 'orange', type: 'wallet', isWallet: true, name: isAr ? 'أورنج كاش' : 'Orange Cash', icon: '📱', color: 'orange', placeholder: isAr ? 'رقم المحفظة (11 رقم)' : 'Wallet Number (11 digits)', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1024px-Orange_logo.svg.png', prefix: '012' },
    { id: 'installments', type: 'installments', name: isAr ? 'دفع أقساط (فوري)' : 'Installments (Fawry)', icon: '📅', color: 'blue', placeholder: isAr ? 'رقم الحساب أو القسط' : 'Account/Loan No.' },
    { id: 'water', type: 'bill', name: isAr ? 'فاتورة مياه (فوري)' : 'Water Bill (Fawry)', icon: '💧', color: 'cyan', placeholder: isAr ? 'رقم المشترك (أرقام)' : 'Subscriber ID (Digits)' },
    { id: 'electricity', type: 'bill', name: isAr ? 'فاتورة كهرباء (فوري)' : 'Electricity Bill (Fawry)', icon: '💡', color: 'yellow', placeholder: isAr ? 'رقم المشترك (أرقام)' : 'Subscriber ID (Digits)' },
    { id: 'recharge', type: 'recharge', name: isAr ? 'شحن رصيد' : 'Recharge Balance', icon: '⚡', color: 'yellow', placeholder: isAr ? 'رقم الهاتف (11 رقم)' : 'Phone Number (11 digits)' },
  ];

  const handleIdentifierChange = (val: string) => {
    // إذا كانت الخدمة هي شحن أو محفظة، نقيد المدخلات بالأرقام وبحد أقصى 11 رقم
    if (selectedService?.id === 'recharge' || selectedService?.isWallet) {
      const numericValue = val.replace(/\D/g, ''); // حذف كل ما ليس رقماً
      if (numericValue.length <= 11) {
        setIdentifier(numericValue);
      }
    } 
    // إذا كانت الخدمة إيداع أو فواتير، نقيدها بالأرقام فقط ولكن بدون حد الـ 11 (قد تكون أطول)
    else if (selectedService?.type === 'deposit' || selectedService?.type === 'bill') {
      const numericValue = val.replace(/\D/g, '');
      setIdentifier(numericValue);
    }
    // الخدمات الأخرى (مثل إنستاباي قد تحتوي حروف)
    else {
      setIdentifier(val);
    }
  };

  const handleAmountChange = (val: string) => {
    // تقييد المبلغ بالأرقام فقط (مع دعم النقطة العشرية)
    const numericValue = val.replace(/[^0-9.]/g, '');
    setAmount(numericValue);
  };

  const validateInput = () => {
    setError('');
    if (!identifier) {
      setError(isAr ? 'يرجى إدخال البيانات المطلوبة' : 'Please enter required data');
      return false;
    }
    
    if (selectedService?.id === 'recharge' || selectedService?.isWallet) {
       if (identifier.length !== 11) {
         setError(isAr ? 'رقم الهاتف يجب أن يكون 11 رقماً' : 'Phone must be 11 digits');
         return false;
       }
    }

    if (!amount || Number(amount) <= 0) {
      setError(isAr ? 'أدخل مبلغاً صالحاً' : 'Enter valid amount');
      return false;
    }
    return true;
  };

  // ... (نفس منطق handleServiceSelect و handleNext و handleFinalSubmit من الملف الأصلي)
  const handleServiceSelect = (service: ServiceProvider) => {
    setSelectedService(service);
    if (service.id === 'recharge') {
      setStep('recharge_company');
    } else {
      setIdentifier('');
      setAmount('');
      setUserNote('');
      setError('');
      setStep('input');
    }
  };

  const handleNext = () => {
    if (validateInput()) setStep('confirm');
  };

  const handleFinalSubmit = () => {
    setIsLoading(true);
    const payAmount = Number(amount);
    
    const profitConfig = (settings.serviceProfits as any)[selectedService?.id || 'deposit'] || { percentage: 0, fixed: 0 };
    const calculatedProfit = ((payAmount * profitConfig.percentage) / 100) + profitConfig.fixed;

    let idLabel = "الرقم";
    if (selectedService?.id === 'recharge' || selectedService?.isWallet) idLabel = "رقم الهاتف";
    else if (selectedService?.type === 'bill') idLabel = "رقم الاشتراك";
    else if (selectedService?.id === 'deposit') idLabel = "رقم المعرف ID";

    const autoNote = selectedService?.id === 'recharge' 
      ? `شحن رصيد | ${selectedCompany?.name} | ${selectedSubService?.name} ${selectedPackage ? `(${selectedPackage})` : ''} | ${idLabel}: ${identifier}`
      : `${selectedService?.name} | ${idLabel}: ${identifier}`;
    
    const finalNote = userNote ? `${autoNote} | ملاحظات: ${userNote}` : autoNote;

    const newSale: Sale = {
      id: "PAY-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      items: [{
        productId: selectedService?.id || 'service',
        name: selectedService?.id === 'recharge' ? `شحن ${selectedCompany?.id}` : selectedService?.name || 'Service',
        price: payAmount,
        quantity: 1
      }],
      subtotal: payAmount,
      tax: 0,
      discount: 0,
      total: payAmount,
      profit: calculatedProfit,
      paymentMethod: (selectedService?.id === 'deposit' ? 'deposit' : (selectedService?.id === 'recharge' ? 'recharge' : 'cash')) as any,
      status: 'pending',
      note: finalNote
    };

    setTimeout(() => {
      addSale(newSale);
      setReceiptData(newSale);
      setIsLoading(false);
      setStep('success');
      if (onConfirm) onConfirm(newSale);
    }, 1500);
  };

  const reset = () => {
    setStep('menu');
    setSelectedService(null);
    setSelectedCompany(null);
    setSelectedSubService(null);
    setSelectedPackage(null);
    setIdentifier('');
    setAmount('');
    setUserNote('');
    setError('');
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${!isEmbedded ? 'py-12 px-4' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      <GlassCard className="p-8 md:p-10 neumorph-flat rounded-[3rem] border-none overflow-hidden min-h-[650px] flex flex-col">
        
        <AnimatePresence mode="wait">
          {step === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-2 tracking-tighter text-black dark:text-white">{isAr ? 'خدمات Brand Store' : 'Brand Store Services'}</h2>
                <p className="text-black dark:text-gray-500 font-bold text-sm opacity-60">{isAr ? 'شحن رصيد، إيداع طلبات، ومحافظ إلكترونية' : 'Recharge, Deposits, and Wallets'}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className={`flex flex-col items-center p-6 rounded-[2.2rem] bg-white/60 dark:bg-black/20 neumorph-flat hover:scale-[1.02] transition-all group border-2 border-transparent hover:border-blue-500/30 ${
                      s.id === 'deposit' ? 'col-span-2 sm:col-span-3 py-10' : ''
                    }`}
                  >
                    <div className={`rounded-2xl flex items-center justify-center neumorph-inset bg-transparent ${
                      s.id === 'deposit' ? 'w-24 h-24 text-5xl mb-6' : 'w-16 h-16 text-3xl mb-4'
                    }`}>
                      {s.logo ? <img src={s.logo} className="w-12 h-12 object-contain" /> : <span className={s.id === 'recharge' ? 'text-yellow-500' : ''}>{s.icon}</span>}
                    </div>
                    <span className={`font-black uppercase tracking-wider text-black dark:text-gray-300 group-hover:text-blue-600 text-center ${
                      s.id === 'deposit' ? 'text-lg sm:text-xl' : 'text-[10px]'
                    }`}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ... (recharge_company, recharge_service, recharge_package remain same as original) */}
          {step === 'recharge_company' && (
            <motion.div key="recharge_company" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="flex items-center gap-4">
                <button onClick={reset} className="w-10 h-10 rounded-full neumorph-flat flex items-center justify-center text-black">
                  {isAr ? '→' : '←'}
                </button>
                <h3 className="text-xl font-black text-black dark:text-white">{isAr ? 'اختر شركة الشحن' : 'Select Provider'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {rechargeData.map(company => (
                  <button
                    key={company.id}
                    onClick={() => { setSelectedCompany(company); setStep('recharge_service'); }}
                    className="flex flex-col items-center p-8 rounded-[2.5rem] bg-white/40 dark:bg-black/20 neumorph-flat hover:scale-[1.03] transition-all group"
                  >
                    <div className="w-20 h-20 rounded-2xl neumorph-inset flex items-center justify-center mb-4 bg-transparent p-2">
                       <img src={company.logo} className="w-full h-full object-contain" />
                    </div>
                    <span className="font-black text-xs text-black dark:text-white group-hover:text-blue-600">{company.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'recharge_service' && selectedCompany && (
            <motion.div key="recharge_service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('recharge_company')} className="w-10 h-10 rounded-full neumorph-flat flex items-center justify-center text-black">
                  {isAr ? '→' : '←'}
                </button>
                <div className="flex items-center gap-3">
                  <img src={selectedCompany.logo} className="w-8 h-8 object-contain" />
                  <h3 className="text-xl font-black text-black dark:text-white">{selectedCompany.name}</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {selectedCompany.services.map(srv => (
                  <button
                    key={srv.id}
                    onClick={() => { 
                      setSelectedSubService(srv); 
                      if (srv.packages) setStep('recharge_package');
                      else setStep('input');
                    }}
                    className="flex justify-between items-center p-6 rounded-[2rem] bg-white/40 dark:bg-black/20 neumorph-flat hover:scale-[1.01] transition-all group px-8"
                  >
                    <span className="font-black text-lg text-black dark:text-white group-hover:text-blue-600">{srv.name}</span>
                    <span className="text-2xl text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'recharge_package' && selectedSubService && (
            <motion.div key="recharge_package" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('recharge_service')} className="w-10 h-10 rounded-full neumorph-flat flex items-center justify-center text-black">
                  {isAr ? '→' : '←'}
                </button>
                <h3 className="text-xl font-black text-black dark:text-white">{isAr ? 'اختر الباقة' : 'Select Package'}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedSubService.packages?.map((pkg: string) => (
                  <button
                    key={pkg}
                    onClick={() => { setSelectedPackage(pkg); setStep('input'); }}
                    className="p-6 rounded-[2rem] bg-white/40 dark:bg-black/20 neumorph-flat hover:scale-[1.03] transition-all group text-center"
                  >
                    <span className="font-black text-black dark:text-white group-hover:text-blue-600">{pkg}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'input' && selectedService && (
            <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => {
                    if (selectedService.id === 'recharge') {
                      selectedSubService?.packages ? setStep('recharge_package') : setStep('recharge_service');
                    } else {
                      reset();
                    }
                  }} 
                  className="w-12 h-12 rounded-full neumorph-flat flex items-center justify-center text-black"
                >
                  {isAr ? '→' : '←'}
                </button>
                <div>
                  <h3 className="text-xl font-black flex items-center gap-2 text-black dark:text-white">
                    {selectedService.id === 'recharge' ? (
                      <>
                        <img src={selectedCompany?.logo} className="w-6 h-6 object-contain" />
                        {selectedSubService?.name} {selectedPackage && `(${selectedPackage})`}
                      </>
                    ) : (
                      <>
                        {selectedService.logo && <img src={selectedService.logo} className="w-6 h-6 object-contain" />}
                        {selectedService.name}
                      </>
                    )}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black dark:text-gray-400 px-4 uppercase tracking-widest">
                    {selectedService.placeholder}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={selectedService.placeholder}
                    value={identifier}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    className="w-full px-8 py-6 rounded-2xl fluid-input text-2xl font-black text-center tracking-widest text-black dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black dark:text-gray-400 px-4 uppercase tracking-widest">{isAr ? 'المبلغ (أرقام فقط)' : 'Amount (Digits only)'}</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-full px-8 py-6 rounded-2xl fluid-input text-4xl font-black text-center text-blue-600"
                    />
                    <span className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-8' : 'right-8'} font-black text-black dark:text-gray-400 text-xs`}>EGP</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black dark:text-gray-400 px-4 uppercase tracking-widest">{isAr ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}</label>
                  <textarea
                    placeholder={isAr ? "اكتب أي ملاحظات هنا..." : "Type any notes here..."}
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl fluid-input min-h-[100px] resize-none text-sm font-bold"
                  />
                </div>
              </div>

              <NeumorphButton onClick={handleNext} className="w-full py-6 text-xl bg-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
                {isAr ? 'استمرار' : 'Continue'}
              </NeumorphButton>

              {error && <p className="text-center text-red-600 font-black text-xs bg-red-50 py-4 rounded-xl">{error}</p>}
            </motion.div>
          )}

          {/* ... (confirm, success remain same as original) */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-black text-blue-600 mb-2 px-6">
                  {isAr ? 'مراجعة بيانات العملية:' : 'Review Transaction Data:'}
                </h3>
              </div>

              <div className="neumorph-inset p-8 rounded-[2.5rem] bg-white/40 dark:bg-black/20 space-y-6">
                <div className="flex justify-between border-b border-black/5 pb-4">
                  <span className="text-black dark:text-gray-400 font-black text-xs uppercase opacity-60">
                    {selectedService?.placeholder}:
                  </span>
                  <span className="font-black text-xl text-black dark:text-white tracking-wider">{identifier}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-4">
                  <span className="text-black dark:text-gray-400 font-black text-xs uppercase opacity-60">{isAr ? 'الخدمة:' : 'Service:'}</span>
                  <div className="text-right">
                    <p className="font-black text-sm text-black dark:text-white">
                      {selectedService?.id === 'recharge' ? selectedCompany?.name : selectedService?.name}
                    </p>
                    <p className="text-[10px] font-bold text-blue-600">{selectedSubService?.name}</p>
                  </div>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-4">
                  <span className="text-black dark:text-gray-400 font-black text-xs uppercase opacity-60">{isAr ? 'المبلغ المطلوب:' : 'Total Amount:'}</span>
                  <span className="font-black text-3xl text-blue-600">{amount} <small className="text-sm font-bold">EGP</small></span>
                </div>
                {userNote && (
                  <div className="flex flex-col gap-2 pb-4">
                    <span className="text-black dark:text-gray-400 font-black text-xs uppercase opacity-60">{isAr ? 'ملاحظاتك:' : 'Your Notes:'}</span>
                    <p className="text-sm font-bold text-black dark:text-white bg-white/30 dark:bg-black/20 p-4 rounded-2xl italic">"{userNote}"</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <NeumorphButton onClick={handleFinalSubmit} disabled={isLoading} className="py-6 bg-blue-600 text-white font-black text-lg border-none shadow-xl shadow-blue-500/20">
                  {isLoading ? '...' : (isAr ? 'تأكيد العملية' : 'Confirm')}
                </NeumorphButton>
                <NeumorphButton variant="secondary" onClick={() => setStep('input')} className="py-6 font-black text-lg text-black dark:text-white">
                  {isAr ? 'تعديل' : 'Edit'}
                </NeumorphButton>
              </div>
            </motion.div>
          )}

          {step === 'success' && receiptData && (
            <motion.div key="success" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="text-center flex-1 flex flex-col justify-center">
              <div className="w-24 h-24 bg-green-500 rounded-3xl mx-auto flex items-center justify-center mb-8 text-white text-4xl shadow-2xl shadow-green-500/30">
                ✓
              </div>
              <h2 className="text-4xl font-black mb-2 text-black dark:text-white">{isAr ? 'تم إرسال الطلب' : 'Request Sent'}</h2>
              <p className="text-black dark:text-gray-500 font-black text-sm mb-10 opacity-60">{isAr ? 'طلبك قيد التنفيذ المباشر' : 'Your request is being processed'}</p>

              <div ref={receiptAreaRef} className="neumorph-inset p-8 rounded-[3rem] bg-white/60 dark:bg-black/40 text-right space-y-6 mb-10 border-r-[12px] border-blue-600">
                <div className="flex justify-between items-center mb-6">
                   <div className="text-2xl font-black text-blue-600 italic tracking-tighter uppercase">Transaction Info</div>
                   <div className="text-[10px] font-black text-black dark:text-gray-400 opacity-60">{receiptData.id}</div>
                </div>
                <div className="text-sm font-black text-black dark:text-white border-b border-black/5 pb-4 leading-relaxed">
                  {receiptData.note}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-black dark:text-gray-400 font-black text-xs uppercase opacity-60">{isAr ? 'الإجمالي:' : 'Total:'}</span>
                  <span className="font-black text-3xl text-blue-600">{amount} <small className="text-sm font-bold">EGP</small></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <NeumorphButton onClick={reset} className="py-5 font-black text-base bg-blue-600 text-white border-none">{isAr ? 'عملية جديدة' : 'New Transaction'}</NeumorphButton>
                <NeumorphButton 
                  onClick={() => window.location.reload()} 
                  variant="secondary" 
                  className="py-5 font-black text-base text-black dark:text-white"
                >
                  {isAr ? 'الرئيسية' : 'Home'}
                </NeumorphButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};
