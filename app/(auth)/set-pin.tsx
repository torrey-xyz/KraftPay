import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';
import { Fingerprint, KeyRound } from 'lucide-react-native';

const PIN_LENGTH = 6;

export default function SetPinScreen() {
  const router = useRouter();
  const { setPin, enableBiometrics } = useAuth();
  const [pin, setEnteredPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dotScale = useRef(new Animated.Value(1)).current;

  const checkBiometrics = async () => {
    if (Platform.OS === 'web') {
      return;
    }
    
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricsAvailable(isAvailable && isEnrolled);
    } catch (error) {
      console.log('Biometrics check error:', error);
    }
  };

  useState(() => {
    checkBiometrics();
  });

  const handlePinDigit = (digit: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (step === 'create' && pin.length < PIN_LENGTH) {
      animateDot();
      const newPin = pin + digit;
      setEnteredPin(newPin);
      
      if (newPin.length === PIN_LENGTH) {
        // Move to confirmation step after a brief delay
        setTimeout(() => {
          setStep('confirm');
        }, 300);
      }
    } else if (step === 'confirm' && confirmPin.length < PIN_LENGTH) {
      animateDot();
      const newConfirmPin = confirmPin + digit;
      setConfirmPin(newConfirmPin);
      
      if (newConfirmPin.length === PIN_LENGTH) {
        // Check if PINs match after a brief delay
        setTimeout(() => {
          if (pin === newConfirmPin) {
            handlePinSuccess(pin);
          } else {
            setError('PINs do not match. Please try again.');
            setEnteredPin('');
            setConfirmPin('');
            setStep('create');
          }
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (step === 'create' && pin.length > 0) {
      setEnteredPin(pin.slice(0, -1));
    } else if (step === 'confirm' && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const animateDot = () => {
    Animated.sequence([
      Animated.timing(dotScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePinSuccess = async (finalPin: string) => {
    try {
      await setPin(finalPin);
      
      if (biometricsAvailable) {
        Alert.alert(
          'Enable Biometric Authentication',
          'Would you like to use fingerprint or face recognition to unlock your wallet?',
          [
            {
              text: 'Skip',
              style: 'cancel',
              onPress: () => router.replace('/(tabs)'),
            },
            {
              text: 'Enable',
              onPress: async () => {
                const success = await enableBiometrics();
                if (success) {
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }
                router.replace('/(tabs)');
              },
            },
          ]
        );
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setError('Failed to set PIN. Please try again.');
      setEnteredPin('');
      setConfirmPin('');
      setStep('create');
    }
  };

  const renderPinDots = () => {
    const currentPin = step === 'create' ? pin : confirmPin;
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              index < currentPin.length ? styles.dotFilled : {},
              index === currentPin.length - 1 ? { transform: [{ scale: dotScale }] } : {},
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <KeyRound size={40} color="#14F195" style={styles.icon} />
          <Text style={styles.title}>
            {step === 'create' ? 'Create PIN' : 'Confirm PIN'}
          </Text>
          <Text style={styles.description}>
            {step === 'create'
              ? `Set a ${PIN_LENGTH}-digit PIN to secure your wallet`
              : 'Enter the same PIN again to confirm'}
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {renderPinDots()}

        <View style={styles.keypadContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.keypadButton}
              onPress={() => handlePinDigit(num.toString())}
            >
              <Text style={styles.keypadButtonText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.keypadButton} />
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={() => handlePinDigit('0')}
          >
            <Text style={styles.keypadButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={handleBackspace}
          >
            <Text style={styles.keypadButtonText}>⌫</Text>
          </TouchableOpacity>
        </View>

        {biometricsAvailable && (
          <View style={styles.biometricsHint}>
            <Fingerprint size={20} color="#14F195" style={styles.biometricsIcon} />
            <Text style={styles.biometricsText}>
              You'll have the option to enable biometric authentication after setting your PIN
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 48,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    marginHorizontal: 8,
  },
  dotFilled: {
    backgroundColor: '#14F195',
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  keypadButton: {
    width: '30%',
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  keypadButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  biometricsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  biometricsIcon: {
    marginRight: 8,
  },
  biometricsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    flex: 1,
  },
});