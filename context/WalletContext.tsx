import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as solanaWeb3 from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import { generateMnemonic, mnemonicToSeed } from '../utils/crypto';
import { Transaction } from '../types/Transaction';
import { mockTransactions } from '../utils/mockData';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

interface WalletContextProps {
  publicKey: string;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  seedPhrase: string | null;
  createWallet: () => Promise<void>;
  importWallet: (mnemonic: string) => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  sendTransaction: (recipient: string, amount: number) => Promise<void>;
  logout: () => Promise<void>;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [publicKey, setPublicKey] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<Uint8Array | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connection, setConnection] = useState<solanaWeb3.Connection | null>(null);

  // Initialize Solana connection
  useEffect(() => {
    const conn = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl('devnet'),
      'confirmed'
    );
    setConnection(conn);
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const storedPublicKey = await SecureStore.getItemAsync('kraftpay_public_key');
      const storedPrivateKey = await SecureStore.getItemAsync('kraftpay_private_key');
      
      if (storedPublicKey && storedPrivateKey) {
        setPublicKey(storedPublicKey);
        setPrivateKey(bs58.decode(storedPrivateKey));
        await fetchBalance();
        await fetchTransactions();
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const createWallet = async () => {
    setIsLoading(true);
    try {
      // Generate a new mnemonic (seed phrase)
      const mnemonic = generateMnemonic();
      setSeedPhrase(mnemonic);

      // Create a keypair from the seed
      const seed = await mnemonicToSeed(mnemonic);
      const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
      
      // Store keys securely
      const newPublicKey = bs58.encode(keypair.publicKey);
      const newPrivateKey = bs58.encode(keypair.secretKey);
      
      await SecureStore.setItemAsync('kraftpay_public_key', newPublicKey);
      await SecureStore.setItemAsync('kraftpay_private_key', newPrivateKey);
      
      setPublicKey(newPublicKey);
      console.log('Key====>', keypair.secretKey);
      setPrivateKey(keypair.secretKey);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const importWallet = async (mnemonic: string) => {
    setIsLoading(true);
    try {
      // Validate mnemonic
      if (!mnemonic) {
        throw new Error('Invalid mnemonic');
      }

      // Create a keypair from the seed
      const seed = await mnemonicToSeed(mnemonic);
      const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
      
      // Store keys securely
      const newPublicKey = bs58.encode(keypair.publicKey);
      const newPrivateKey = bs58.encode(keypair.secretKey);
      
      await SecureStore.setItemAsync('kraftpay_public_key', newPublicKey);
      await SecureStore.setItemAsync('kraftpay_private_key', newPrivateKey);
      
      setPublicKey(newPublicKey);
      setPrivateKey(keypair.secretKey);
      setSeedPhrase(mnemonic);
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!connection || !publicKey) return;
    
    try {
      // In a real app, we would fetch the actual balance from the blockchain
      // For now, we'll simulate it with a random balance
      const simulatedBalance = Math.random() * 10;
      setBalance(simulatedBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!connection || !publicKey) return;
    
    try {
      // In a real app, we would fetch the actual transactions from the blockchain
      // For now, we'll use mock data
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const sendTransaction = async (recipient: string, amount: number) => {
    if (!connection || !privateKey || !publicKey) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, we would send a real transaction to the blockchain
      // For now, we'll simulate it and add it to our mock transactions
      const timestamp = new Date().toISOString();
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'send',
        amount,
        recipient: recipient,
        timestamp,
        status: 'confirmed',
      };
      
      // Add the new transaction to the list
      setTransactions([newTransaction, ...transactions]);
      
      // Update the balance
      setBalance(prevBalance => prevBalance - amount);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('kraftpay_public_key');
      await SecureStore.deleteItemAsync('kraftpay_private_key');
      
      setPublicKey('');
      setPrivateKey(null);
      setBalance(0);
      setTransactions([]);
      setSeedPhrase(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        balance,
        transactions,
        isLoading,
        seedPhrase,
        createWallet,
        importWallet,
        fetchBalance,
        fetchTransactions,
        sendTransaction,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};