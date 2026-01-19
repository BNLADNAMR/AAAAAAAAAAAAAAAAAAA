
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export type UserStatus = 'pending_info' | 'pending_review' | 'verified' | 'rejected';

export interface User {
  id: string;
  username: string;
  fullName?: string;
  birthDate?: {
    day: number;
    month: number;
  };
  phone?: string;
  hasWhatsApp?: boolean;
  role: UserRole;
  password?: string;
  idFront?: string; 
  idBack?: string;  
  selfie?: string;   
  isVerified?: boolean; // Legacy
  status?: UserStatus;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  barcode: string;
  maxLimit?: number;
  imageUrl?: string; 
  description?: string; 
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: string;
  userId: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  profit: number; 
  paymentMethod: 'cash' | 'card' | 'mixed' | 'vodafone' | 'instapay' | 'orange' | 'etisalat' | 'deposit' | 'recharge';
  note?: string;
  status?: 'pending' | 'success' | 'rejected'; 
}

export interface ServiceProfitConfig {
  percentage: number;
  fixed: number;
}

export interface Settings {
  language: 'ar' | 'en';
  currency: string;
  taxRate: number;
  logoUrl?: string;
  printFormat: 'A4' | 'thermal';
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  serviceProfits: {
    installments: ServiceProfitConfig;
    electricity: ServiceProfitConfig;
    water: ServiceProfitConfig;
    gas: ServiceProfitConfig;
    deposit: ServiceProfitConfig;
    recharge: ServiceProfitConfig;
    bill: ServiceProfitConfig;
    wallet: ServiceProfitConfig;
    instapay: ServiceProfitConfig;
  };
}
