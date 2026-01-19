
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeumorphButton } from '../components/NeumorphButton';
import { GlassCard } from '../components/GlassCard';
import { useStore } from '../contexts/StoreContext';

interface UserVerificationProps {
  onComplete: (data: { idFront: string, idBack: string, selfie: string }) => void;
}

export const UserVerification: React.FC<UserVerificationProps> = ({ onComplete }) => {
  const { settings, updateSettings, setCurrentUser } = useStore();
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = settings.language === 'ar';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      setError(isAr ? 'تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الإذن.' : 'Camera access denied. Please check permissions.');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        setSelfie(data);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  const handleFinish = () => {
    if (!idFront || !idBack || !selfie) {
      setError(isAr ? 'يرجى إكمال جميع متطلبات التوثيق (البطاقة والوجه)' : 'Please complete all verification requirements (ID & Selfie)');
      return;
    }
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      onComplete({ idFront, idBack, selfie });
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] dark:bg-[#0f1113] flex items-center justify-center p-6 py-20 overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className={`fixed top-8 ${isAr ? 'left-8 flex-row' : 'right-8 flex-row-reverse'} flex items-center gap-4 z-50`}>
        <button 
          onClick={() => setCurrentUser(null)}
          className="px-6 py-3 rounded-2xl neumorph-flat bg-red-50 dark:bg-red-900/10 text-red-600 font-black text-xs transition-all active:scale-90"
        >
          {isAr ? 'خروج' : 'Logout'}
        </button>
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

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl">
        <GlassCard className="p-10 md:p-14 rounded-[3.5rem] neumorph-flat">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-black dark:text-white mb-3 tracking-tighter">
              {isAr ? 'التحقق من الهوية قبل البدء' : 'Identity Verification Before Starting'}
            </h2>
            <p className="text-gray-500 font-bold max-w-md mx-auto">
              {isAr ? 'لأمانك المالي، نحتاج لتأكيد هويتك قبل الوصول للوحة التحكم' : 'For your security, we need to verify your identity before dashboard access'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                {isAr ? 'البطاقة (أمام)' : 'ID Card (Front)'}
              </label>
              <div className="relative h-48 rounded-[2.5rem] bg-[#121212] flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => handleFileUpload(e, setIdFront)} />
                {idFront ? (
                  <img src={idFront} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="text-center text-gray-500 group-hover:text-blue-500 transition-colors">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] font-black">{isAr ? 'ارفاق صورة' : 'Upload'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                {isAr ? 'البطاقة (خلف)' : 'ID Card (Back)'}
              </label>
              <div className="relative h-48 rounded-[2.5rem] bg-[#121212] flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => handleFileUpload(e, setIdBack)} />
                {idBack ? (
                  <img src={idBack} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="text-center text-gray-500 group-hover:text-blue-500 transition-colors">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] font-black">{isAr ? 'ارفاق صورة' : 'Upload'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                {isAr ? 'صورة الوجه (سيلفي)' : 'Face Recognition'}
              </label>
              <div className="relative h-48 rounded-[2.5rem] bg-[#121212] flex items-center justify-center overflow-hidden border-2 border-blue-600/30 group">
                {selfie ? (
                  <>
                    <img src={selfie} className="w-full h-full object-cover" />
                    <button onClick={() => setSelfie(null)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-30 transition-transform active:scale-90">✕</button>
                  </>
                ) : isCameraOpen ? (
                  <div className="relative w-full h-full">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute inset-0 border-[12px] border-black/40 rounded-[2.2rem] pointer-events-none"></div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                      <button onClick={takePhoto} className="w-12 h-12 bg-white rounded-full border-4 border-blue-600 shadow-xl active:scale-90 transition-transform flex items-center justify-center">
                         <div className="w-8 h-8 rounded-full border-2 border-gray-200"></div>
                      </button>
                      <button onClick={stopCamera} className="w-12 h-12 bg-red-500 rounded-full shadow-xl active:scale-90 transition-transform flex items-center justify-center text-white">
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full gap-4">
                    <button onClick={startCamera} className="flex flex-col items-center text-blue-500 hover:text-blue-400 transition-colors">
                      <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[10px] font-black">{isAr ? 'افتح الكاميرا' : 'Open Camera'}</span>
                    </button>
                    <div className="w-2/3 h-[1px] bg-gray-700/50"></div>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-black">{isAr ? 'اختر من المعرض' : 'Pick from Gallery'}</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setSelfie)} />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center font-black mb-6 bg-red-50 py-3 rounded-2xl border border-red-100 text-xs">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <NeumorphButton onClick={handleFinish} disabled={isUploading} className="w-full py-6 text-xl font-black bg-blue-600 text-white !shadow-blue-600/20">
            {isUploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'تأكيد وإرسال للمراجعة' : 'Confirm & Send for Review')}
          </NeumorphButton>

          <p className="mt-8 text-center text-gray-400 text-[10px] font-bold px-4">
            {isAr ? 'جميع بياناتك مشفرة ومحمية وفق معايير الخصوصية الدولية. لن يتم مشاركة هذه البيانات مع أي طرف ثالث.' : 'Your data is encrypted and protected by international privacy standards. This data will not be shared with any third party.'}
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};
