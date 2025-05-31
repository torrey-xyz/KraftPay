import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';
import { KeyRound, X } from 'lucide-react-native';

interface PINModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PIN_LENGTH = 6;

export default function PINModal({ isVisible, onClose, onSuccess }: PINModalProps) {
  const { validatePIN, authenticateWithBiometrics, isBiometricsEnabled } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shakeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      setPin('');
      setError(null);
      
      // Try biometric authentication if enabled
      if (isBiometricsEnabled && Platform.OS !== 'web') {
        handleBiometricAuth();
      }
    }
  }, [isVisible, isBiometricsEnabled]);

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onSuccess();
    }
  };

  const handlePinDigit = (digit: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === PIN_LENGTH) {
        handlePinSubmit(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  const handlePinSubmit = async (submittedPin: string) => {
    try {
      const isValid = await validatePIN(submittedPin);
      
      if (isValid) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onSuccess();
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        setError('Incorrect PIN. Please try again.');
        setPin('');
        shakeAnimation();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setPin('');
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const renderPinDots = () => {
    return (
      <Animated.View 
        style={[
          styles.dotsContainer,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < pin.length ? styles.dotFilled : {},
            ]}
          />
        ))}
      </Animated.View>
    );
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContainer}>
            <KeyRound size={36} color="#14F195" style={styles.icon} />
            <Text style={styles.title}>Enter PIN</Text>
            <Text style={styles.description}>
              Enter your 6-digit PIN to continue
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

          {isBiometricsEnabled && Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.biometricsButton}
              onPress={handleBiometricAuth}
            >
              <Text style={styles.biometricsButtonText}>
                Use Biometrics
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 350,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#334155',
    marginHorizontal: 6,
  },
  dotFilled: {
    backgroundColor: '#14F195',
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  keypadButton: {
    width: '30%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  keypadButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  biometricsButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  biometricsButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#14F195',
  },
});