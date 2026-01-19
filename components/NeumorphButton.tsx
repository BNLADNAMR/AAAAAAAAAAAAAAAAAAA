
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export const NeumorphButton: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', className = '', disabled }) => {
  const baseStyles = "relative px-8 py-4 rounded-[1.8rem] font-bold transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden z-10";
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': 
        return "bg-white dark:bg-[#1e2124] text-blue-600 dark:text-blue-400 neumorph-flat hover:shadow-[0_8px_16px_rgba(37,99,235,0.1)]";
      case 'danger': 
        return "bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100 dark:border-red-900/20";
      case 'secondary': 
        return "bg-white/40 dark:bg-white/5 text-gray-700 dark:text-gray-300 backdrop-blur-md border border-white/10";
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${getVariantStyles()} ${className}`}
    >
      <span className="relative z-20 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
};
