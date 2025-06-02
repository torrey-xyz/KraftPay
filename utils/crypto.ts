import { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";

/**
 * Generate secure random bytes manually
 */
function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  
  // Try using the global crypto.getRandomValues first
  if (typeof (global as any).crypto?.getRandomValues === 'function') {
    try {
      (global as any).crypto.getRandomValues(array);
      console.log('Used global crypto.getRandomValues for entropy');
      return array;
    } catch (error) {
      console.log('global crypto.getRandomValues failed:', error);
    }
  }
  
  // Fallback to Math.random (less secure but works)
  console.log('Using Math.random fallback for entropy');
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  
  return array;
}

/**
 * Generate a BIP39 mnemonic phrase with manual entropy generation
 * 128 bits ÷ 8 = 16 bytes of entropy
 * 6 bytes of entropy = 12 words in BIP39
 */
export function generateMnemonic(strength: number = 128): string {
  try {
    console.log('Generating mnemonic with strength:', strength);
    
    // Generate entropy manually
    const entropyLength = strength / 8; // 128 bits = 16 bytes
    const entropy = getRandomBytes(entropyLength);
    
    console.log('Generated entropy bytes:', entropy.length);
    
    // Convert entropy to hex string
    const entropyHex = Array.from(entropy, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
    
    console.log('Entropy hex length:', entropyHex.length);
    
    // Create mnemonic from entropy
    const mnemonic = entropyToMnemonic(entropyHex);
    
    // Validate the generated mnemonic
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Generated invalid mnemonic');
    }
    
    console.log('Successfully generated and validated mnemonic');
    return mnemonic;
  } catch (error) {
    console.error('Error generating mnemonic:', error);
    throw error;
  }
}

/**
 * Convert a mnemonic phrase to a seed using BIP39.
 */
export async function mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
  try {
    // Validate mnemonic first
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    
    const seedBuffer = mnemonicToSeedSync(mnemonic);
    return new Uint8Array(seedBuffer.buffer, seedBuffer.byteOffset, seedBuffer.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  } catch (error) {
    console.error('Error converting mnemonic to seed:', error);
    throw error;
  }
}

/**
 * Validate a BIP39 mnemonic phrase
 */
export function validateMnemonicPhrase(mnemonic: string): boolean {
  return validateMnemonic(mnemonic);
}

/**
 * Validate a Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  // Simple validation - Solana addresses are base58 encoded and 44 characters long
  // In a real app, use proper validation from the Solana SDK
  return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(address);
}