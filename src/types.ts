export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  title: string;
  date: any;
  createdAt: any;
}
