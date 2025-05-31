import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/context/WalletContext';
import { AlertCircle, ArrowLeft, Clipboard as ClipboardIcon } from 'lucide-react-native';

export default function ImportWalletScreen() {
  const router = useRouter();
  const { importWallet } = useWallet();
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(12).fill(null));

  const handleWordChange = (index: number, word: string) => {
    const newSeedWords = [...seedWords];
    newSeedWords[index] = word.toLowerCase().trim();
    setSeedWords(newSeedWords);
    setError(null);

    // Auto-focus next input when current word is complete
    if (word.trim() && index < 11) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Handle backspace to go to previous input
    if (key === 'Backspace' && !seedWords[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent) {
        const words = clipboardContent.trim().split(/\s+/).filter(word => word.length > 0);
        
        if (words.length === 12 || words.length === 24) {
          // Take only first 12 words for now, can be extended for 24-word support
          const newSeedWords = Array(12).fill('');
          for (let i = 0; i < Math.min(12, words.length); i++) {
            newSeedWords[i] = words[i].toLowerCase();
          }
          setSeedWords(newSeedWords);
          setError(null);
          
          // Focus the last filled input
          const lastIndex = Math.min(11, words.length - 1);
          setTimeout(() => {
            inputRefs.current[lastIndex]?.focus();
          }, 100);
        } else {
          setError(`Invalid seed phrase. Expected 12 or 24 words, got ${words.length} words.`);
        }
      }
    } catch (error) {
      setError('Failed to read from clipboard');
    }
  };

  const clearAll = () => {
    setSeedWords(Array(12).fill(''));
    setError(null);
    inputRefs.current[0]?.focus();
  };

  const handleImportWallet = async () => {
    const filledWords = seedWords.filter(word => word.trim() !== '');
    
    if (filledWords.length !== 12) {
      setError('Please fill in all 12 words');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const seedPhrase = seedWords.join(' ');
      await importWallet(seedPhrase);
      router.push('/set-pin');
    } catch (error) {
      setError('Invalid seed phrase. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderWordInput = (index: number) => (
    <View key={index} style={styles.wordContainer}>
      <Text style={styles.wordNumber}>{index + 1}</Text>
      <TextInput
        ref={(ref) => {
          inputRefs.current[index] = ref;
        }}
        style={styles.wordInput}
        value={seedWords[index]}
        onChangeText={(text) => handleWordChange(index, text)}
        onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
        placeholder={`Word ${index + 1}`}
        placeholderTextColor="#64748B"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        returnKeyType={index === 11 ? 'done' : 'next'}
        onSubmitEditing={() => {
          if (index < 11) {
            inputRefs.current[index + 1]?.focus();
          }
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Import Wallet</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Enter your 12-word seed phrase to restore your wallet.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePaste}>
            <ClipboardIcon size={16} color="#14F195" />
            <Text style={styles.actionButtonText}>Paste</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
            <Text style={styles.actionButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wordsGrid}>
          {Array.from({ length: 12 }, (_, index) => renderWordInput(index))}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#EF4444" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.warningBox}>
          <AlertCircle size={24} color="#F59E0B" style={styles.warningIcon} />
          <Text style={styles.warningText}>
            Never share your seed phrase with anyone. KraftPay will never ask for it outside of this import screen.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.importButton}
          onPress={handleImportWallet}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.importButtonText}>Import Wallet</Text>
          )}
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#14F195',
    marginLeft: 6,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  wordContainer: {
    width: '31%',
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  wordNumber: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748B',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  wordInput: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
    minHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#EF4444',
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
  importButton: {
    backgroundColor: '#14F195',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  importButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
});
// #8bb4f8