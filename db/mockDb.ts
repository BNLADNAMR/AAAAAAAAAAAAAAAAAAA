
import { Product, Customer, Sale, Expense, User, UserRole } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  CUSTOMERS: 'pos_customers',
  SALES: 'pos_sales',
  EXPENSES: 'pos_expenses',
  USERS: 'pos_users',
  SETTINGS: 'pos_settings'
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const initialProducts: Product[] = [
  { id: '1', name: 'Standard Widget', price: 25.00, cost: 15.00, stock: 100, category: 'Hardware', barcode: '123456' },
  { id: '2', name: 'Premium Gadget', price: 120.00, cost: 80.00, stock: 50, category: 'Electronics', barcode: '789012' },
];

const initialUsers: User[] = [
  { id: '1', username: 'admin', role: UserRole.ADMIN, password: 'password', status: 'verified' },
  { id: '2', username: 'user1', role: UserRole.USER, password: 'password', status: 'verified' },
  { id: '3', username: 'zooka', role: UserRole.USER, password: 'zooka', status: 'verified' }
];

export const db = {
  getProducts: () => getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts),
  saveProducts: (products: Product[]) => saveToStorage(STORAGE_KEYS.PRODUCTS, products),
  
  getCustomers: () => getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomers: (customers: Customer[]) => saveToStorage(STORAGE_KEYS.CUSTOMERS, customers),
  
  getSales: () => getFromStorage<Sale[]>(STORAGE_KEYS.SALES, []),
  saveSales: (sales: Sale[]) => saveToStorage(STORAGE_KEYS.SALES, sales),
  
  getExpenses: () => getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []),
  saveExpenses: (expenses: Expense[]) => saveToStorage(STORAGE_KEYS.EXPENSES, expenses),

  getUsers: () => getFromStorage<User[]>(STORAGE_KEYS.USERS, initialUsers),
  saveUsers: (users: User[]) => saveToStorage(STORAGE_KEYS.USERS, users)
};
