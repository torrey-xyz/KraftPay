export interface Contact {
  id: string;
  name: string;
  username?: string;
  walletAddress?: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
  isOnKraftPay: boolean;
}