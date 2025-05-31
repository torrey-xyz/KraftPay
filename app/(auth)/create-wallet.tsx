import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/context/WalletContext';
import { Copy, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function CreateWalletScreen() {
  const router = useRouter();
  const { createWallet, seedPhrase } = useWallet();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      await createWallet();
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (seedPhrase) {
      await Clipboard.setStringAsync(seedPhrase);
      setCopied(true);
      
      // Provide haptic feedback on non-web platforms
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleContinue = () => {
    if (confirmed) {
      router.push('/onboarding');
    } else {
      Alert.alert(
        'Confirmation Required', 
        'Please confirm that you have saved your seed phrase before continuing.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Wallet</Text>
      </View>

      <View style={styles.content}>
        {!seedPhrase ? (
          <>
            <Text style={styles.description}>
              We'll generate a secure wallet for you to store and manage your Solana assets.
            </Text>
            <View style={styles.warningBox}>
              <AlertCircle size={24} color="#F59E0B" style={styles.warningIcon} />
              <Text style={styles.warningText}>
                You'll receive a seed phrase that is the ONLY way to recover your wallet. Keep it safe and never share it.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateWallet}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.createButtonText}>Generate Wallet</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Here is your seed phrase. Write it down and store it in a secure location.
            </Text>
            <View style={styles.seedPhraseContainer}>
              <Text style={styles.seedPhrase}>{seedPhrase}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyToClipboard}>
                {copied ? (
                  <CheckCircle2 size={20} color="#14F195" />
                ) : (
                  <Copy size={20} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.warningBox}>
              <AlertCircle size={24} color="#F59E0B" style={styles.warningIcon} />
              <Text style={styles.warningText}>
                If you lose this seed phrase, you will permanently lose access to your funds.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setConfirmed(!confirmed)}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                {confirmed && <CheckCircle2 size={20} color="#14F195" />}
              </View>
              <Text style={styles.checkboxText}>
                I confirm I've securely saved my seed phrase
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.continueButton, !confirmed && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!confirmed}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </>
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 24,
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#F59E0B',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#14F195',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  seedPhraseContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    position: 'relative',
  },
  seedPhrase: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  copyButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#64748B',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    borderColor: '#14F195',
  },
  checkboxText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#14F195',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(20, 241, 149, 0.5)',
  },
  continueButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
});