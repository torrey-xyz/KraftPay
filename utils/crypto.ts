// Simple crypto utilities for the app
// In a production environment, this would be more robust

import * as Random from 'expo-crypto';

/**
 * Generate a BIP39 mnemonic phrase
 * This is a simplified implementation
 * In production, use a proper BIP39 library
 */
export function generateMnemonic(): string {
  // For demo purposes, generating a fixed phrase
  // In a real app, this would use a proper BIP39 implementation
  const wordList = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
    'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
    'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
    'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
    'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
    'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
    'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
    'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
    'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest'
  ];

  const selectedWords = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    selectedWords.push(wordList[randomIndex]);
  }

  return selectedWords.join(' ');
}

/**
 * Convert a mnemonic phrase to a seed
 * In a real app, this would use a proper BIP39 library
 */
export async function mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
  // For demo purposes, using a simple hash function
  // In a real app, this would use proper BIP39 derivation
  const encoder = new TextEncoder();
  const data = encoder.encode(mnemonic);
  const hashBuffer = await Random.digestStringAsync(
    Random.CryptoDigestAlgorithm.SHA256,
    mnemonic
  );
  
  // Convert hex string to Uint8Array
  const hashArray = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    hashArray[i] = parseInt(hashBuffer.substr(i * 2, 2), 16);
  }
  
  return hashArray;
}

/**
 * Validate a Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  // Simple validation - Solana addresses are base58 encoded and 44 characters long
  // In a real app, use proper validation from the Solana SDK
  return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(address);
}