export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  timestamp: string;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'confirmed' | 'failed';
}