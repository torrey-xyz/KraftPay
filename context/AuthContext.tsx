import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

interface AuthContextProps {
  isPINSet: boolean;
  isBiometricsEnabled: boolean;
  validatePIN: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
  toggleBiometrics: () => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isPINSet, setIsPINSet] = useState<boolean>(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    checkPINStatus();
    checkBiometricsStatus();
  }, []);

  const checkPINStatus = async () => {
    try {
      const pin = await SecureStore.getItemAsync('kraftpay_pin');
      setIsPINSet(!!pin);
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  const checkBiometricsStatus = async () => {
    try {
      const biometricsEnabled = await SecureStore.getItemAsync('kraftpay_biometrics_enabled');
      setIsBiometricsEnabled(biometricsEnabled === 'true');
    } catch (error) {
      console.error('Error checking biometrics status:', error);
    }
  };

  const setPin = async (pin: string) => {
    try {
      await SecureStore.setItemAsync('kraftpay_pin', pin);
      setIsPINSet(true);
    } catch (error) {
      console.error('Error setting PIN:', error);
      throw error;
    }
  };

  const validatePIN = async (pin: string) => {
    try {
      const storedPIN = await SecureStore.getItemAsync('kraftpay_pin');
      return storedPIN === pin;
    } catch (error) {
      console.error('Error validating PIN:', error);
      return false;
    }
  };

  const enableBiometrics = async () => {
    // On web, biometric authentication is not available
    if (Platform.OS === 'web') {
      return false;
    }
    
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        return false;
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use PIN instead',
      });
      
      if (result.success) {
        await SecureStore.setItemAsync('kraftpay_biometrics_enabled', 'true');
        setIsBiometricsEnabled(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return false;
    }
  };

  const disableBiometrics = async () => {
    try {
      await SecureStore.setItemAsync('kraftpay_biometrics_enabled', 'false');
      setIsBiometricsEnabled(false);
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      throw error;
    }
  };

  const toggleBiometrics = async () => {
    if (isBiometricsEnabled) {
      await disableBiometrics();
      return false;
    } else {
      return await enableBiometrics();
    }
  };

  const authenticateWithBiometrics = async () => {
    // On web, biometric authentication is not available
    if (Platform.OS === 'web') {
      return false;
    }
    
    if (!isBiometricsEnabled) {
      return false;
    }
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your wallet',
        fallbackLabel: 'Use PIN instead',
      });
      
      return result.success;
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isPINSet,
        isBiometricsEnabled,
        validatePIN,
        setPin,
        enableBiometrics,
        disableBiometrics,
        toggleBiometrics,
        authenticateWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};