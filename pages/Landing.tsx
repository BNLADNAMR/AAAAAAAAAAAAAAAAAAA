
import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../contexts/StoreContext';
import { NeumorphButton } from '../components/NeumorphButton';
import { GlassCard } from '../components/GlassCard';

export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { settings } = useStore();
  const isAr = settings.language === 'ar';

  const features = [
    { title: isAr ? 'شحن فوري' : 'Instant Recharge', desc: isAr ? 'شحن كافة الشبكات والمحافظ في ثوانٍ' : 'Top-up all networks and wallets in seconds', icon: '⚡' },
    { title: isAr ? 'دفع فواتير' : 'Bill Payments', desc: isAr ? 'كهرباء، مياه، غاز، وأقساط فوري' : 'Electricity, Water, Gas & Fawry', icon: '💳' },
    { title: isAr ? 'متجر ذكي' : 'Smart Store', desc: isAr ? 'منتجات متنوعة مع توصيل وتحديد موقع' : 'Diverse products with GPS delivery', icon: '🛒' },
    { title: isAr ? 'أمان تام' : 'Full Security', desc: isAr ? 'بياناتك مشفرة وعملياتك موثقة' : 'Encrypted data & verified transactions', icon: '🔐' },
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative pt-10 lg:pt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: isAr ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-2 rounded-full neumorph-inset bg-transparent">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                 {isAr ? 'مستقبل الخدمات المالية بين يديك' : 'The Future of Financial Services'}
               </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-black dark:text-white leading-[1.1] tracking-tighter">
              {isAr ? 'منصة ' : 'Platform '}
              <span className="text-blue-600">Brand Store</span><br/>
              {isAr ? 'لخدماتك اليومية' : 'For Daily Services'}
            </h1>
            <p className="text-lg font-bold text-gray-500 max-w-lg leading-relaxed">
              {isAr 
                ? 'الحل الأمثل لإدارة مدفوعاتك، شحن رصيدك، والتسوق الإلكتروني في مكان واحد وبأعلى معايير الأمان.' 
                : 'The ultimate solution to manage your payments, top-up balance, and e-shop in one place with the highest security.'}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <NeumorphButton onClick={onStart} className="px-10 py-5 text-lg bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                {isAr ? 'ابدأ الآن مجاناً' : 'Start Free Now'}
              </NeumorphButton>
              <NeumorphButton variant="secondary" className="px-10 py-5 text-lg">
                {isAr ? 'تصفح المتجر' : 'Browse Store'}
              </NeumorphButton>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-full h-[500px] neumorph-flat rounded-[4rem] relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl flex flex-col p-8 items-center justify-center text-center space-y-4 border border-white/20">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl shadow-lg">⚡</div>
                  <h3 className="text-2xl font-black">{isAr ? 'سرعة فائقة' : 'Lightning Fast'}</h3>
                  <p className="text-xs font-bold text-gray-400">{isAr ? 'تم تنفيذ أكثر من 10,000 عملية بنجاح' : 'Over 10,000 successful operations'}</p>
               </div>
               {/* Decorative floating elements */}
               <div className="absolute top-10 right-10 w-20 h-20 neumorph-flat rounded-full animate-bounce"></div>
               <div className="absolute bottom-10 left-10 w-12 h-12 neumorph-inset rounded-xl rotate-12"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: isAr ? 'مستخدم نشط' : 'Active Users', val: '5K+' },
             { label: isAr ? 'عملية شحن' : 'Total Recharges', val: '50K+' },
             { label: isAr ? 'منتج متاح' : 'Products', val: '200+' },
             { label: isAr ? 'محافظ مدعومة' : 'Wallets Supported', val: '12' },
           ].map((s, i) => (
             <GlassCard key={i} className="text-center neumorph-flat !p-8 border-none">
                <p className="text-3xl font-black text-blue-600 mb-2">{s.val}</p>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{s.label}</p>
             </GlassCard>
           ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-blue-600/5 rounded-[5rem] border border-blue-500/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">{isAr ? 'لماذا تختار Brand Store؟' : 'Why Choose Brand Store?'}</h2>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} className="p-8 neumorph-flat rounded-[2.5rem] bg-white dark:bg-gray-800 space-y-4">
               <div className="text-4xl">{f.icon}</div>
               <h4 className="text-xl font-black">{f.title}</h4>
               <p className="text-sm font-bold text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">B</div>
          <span className="font-black text-sm">BRAND STORE © 2024</span>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">
           <a href="#" className="hover:text-blue-600 transition-colors">{isAr ? 'سياسة الخصوصية' : 'Privacy'}</a>
           <a href="#" className="hover:text-blue-600 transition-colors">{isAr ? 'الشروط والأحكام' : 'Terms'}</a>
           <a href="#" className="hover:text-blue-600 transition-colors">{isAr ? 'اتصل بنا' : 'Contact'}</a>
        </div>
      </footer>
    </div>
  );
};
