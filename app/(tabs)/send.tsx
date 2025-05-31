import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/context/WalletContext';
import { Search, User, AtSign, ChevronRight, SendHorizonal } from 'lucide-react-native';
import ContactItem from '@/components/ContactItem';
import { Contact } from '@/types/Contact';
import { mockedContacts } from '@/utils/mockData';
import PINModal from '@/components/PINModal';

export default function SendScreen() {
  const { balance, sendTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'recipient' | 'amount' | 'confirm'>('recipient');
  const [showPINModal, setShowPINModal] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch contacts and recent recipients from a database
    // For now, we'll use mocked data
    setContacts(mockedContacts);
    setRecentContacts(mockedContacts.slice(0, 3));
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(
        contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.username && contact.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (contact.walletAddress && contact.walletAddress.includes(searchQuery))
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts([]);
    }
  }, [searchQuery, contacts]);

  const handleContactSelect = (contact: Contact) => {
    if (contact.username) {
      setRecipient(contact.username);
    } else if (contact.walletAddress) {
      setRecipient(contact.walletAddress);
    }
    setStep('amount');
  };

  const handleNextStep = () => {
    if (step === 'recipient' && recipient) {
      setStep('amount');
    } else if (step === 'amount' && amount) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
        return;
      }
      if (parsedAmount > balance) {
        Alert.alert('Insufficient Funds', 'You do not have enough SOL for this transaction.');
        return;
      }
      setStep('confirm');
    } else if (step === 'confirm') {
      setShowPINModal(true);
    }
  };

  const handlePrevStep = () => {
    if (step === 'amount') {
      setStep('recipient');
    } else if (step === 'confirm') {
      setStep('amount');
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      await sendTransaction(recipient, parseFloat(amount));
      Alert.alert('Success', 'Transaction sent successfully!');
      setRecipient('');
      setAmount('');
      setStep('recipient');
    } catch (error) {
      Alert.alert('Error', 'Failed to send transaction. Please try again.');
    } finally {
      setIsLoading(false);
      setShowPINModal(false);
    }
  };

  const handlePINSuccess = () => {
    handleSend();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'recipient':
        return (
          <>
            <Text style={styles.stepTitle}>Send to</Text>
            <View style={styles.searchContainer}>
              <Search size={20} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Username, address or phone"
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>

            {recipient ? (
              <View style={styles.recipientContainer}>
                <View style={styles.recipientIcon}>
                  {recipient.startsWith('@') ? (
                    <AtSign size={20} color="#14F195" />
                  ) : (
                    <User size={20} color="#14F195" />
                  )}
                </View>
                <Text style={styles.recipientText}>{recipient}</Text>
              </View>
            ) : null}

            {searchQuery && filteredContacts.length > 0 ? (
              <View style={styles.contactsContainer}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {filteredContacts.map((contact, index) => (
                  <ContactItem
                    key={index}
                    contact={contact}
                    onPress={() => handleContactSelect(contact)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.contactsContainer}>
                <Text style={styles.sectionTitle}>Recent</Text>
                {recentContacts.map((contact, index) => (
                  <ContactItem
                    key={index}
                    contact={contact}
                    onPress={() => handleContactSelect(contact)}
                  />
                ))}
              </View>
            )}
          </>
        );

      case 'amount':
        return (
          <>
            <Text style={styles.stepTitle}>Enter Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountPrefix}>◎</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#64748B"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <Text style={styles.balanceText}>Balance: ◎ {balance.toFixed(4)}</Text>
            
            <View style={styles.recipientSummary}>
              <Text style={styles.recipientSummaryLabel}>Sending to:</Text>
              <View style={styles.recipientSummaryContent}>
                <View style={styles.recipientIcon}>
                  {recipient.startsWith('@') ? (
                    <AtSign size={16} color="#14F195" />
                  ) : (
                    <User size={16} color="#14F195" />
                  )}
                </View>
                <Text style={styles.recipientSummaryText}>{recipient}</Text>
              </View>
            </View>
          </>
        );

      case 'confirm':
        return (
          <View style={styles.confirmContainer}>
            <Text style={styles.stepTitle}>Confirm Transaction</Text>
            
            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Amount</Text>
                <Text style={styles.confirmValue}>
                  <Text style={styles.solSymbol}>◎</Text> {amount}
                </Text>
              </View>
              
              <View style={styles.confirmDivider} />
              
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Recipient</Text>
                <View style={styles.confirmRecipient}>
                  <View style={styles.smallRecipientIcon}>
                    {recipient.startsWith('@') ? (
                      <AtSign size={14} color="#14F195" />
                    ) : (
                      <User size={14} color="#14F195" />
                    )}
                  </View>
                  <Text style={styles.confirmValue}>{recipient}</Text>
                </View>
              </View>
              
              <View style={styles.confirmDivider} />
              
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Fee</Text>
                <Text style={styles.confirmValue}>
                  <Text style={styles.solSymbol}>◎</Text> 0.000005
                </Text>
              </View>
              
              <View style={styles.confirmDivider} />
              
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Total</Text>
                <Text style={styles.confirmTotalValue}>
                  <Text style={styles.solSymbol}>◎</Text> {(parseFloat(amount) + 0.000005).toFixed(6)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.confirmNote}>
              Confirm to proceed with this transaction. Once sent, transactions cannot be reversed.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          {step !== 'recipient' && (
            <TouchableOpacity style={styles.backButton} onPress={handlePrevStep}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!recipient && step === 'recipient') || (!amount && step === 'amount')
                ? styles.nextButtonDisabled
                : {},
            ]}
            onPress={handleNextStep}
            disabled={
              (!recipient && step === 'recipient') ||
              (!amount && step === 'amount') ||
              isLoading
            }
          >
            {isLoading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {step === 'confirm' ? 'Send' : 'Continue'}
                </Text>
                {step === 'confirm' ? (
                  <SendHorizonal size={18} color="#0F172A" style={styles.nextButtonIcon} />
                ) : (
                  <ChevronRight size={18} color="#0F172A" style={styles.nextButtonIcon} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <PINModal
        isVisible={showPINModal}
        onClose={() => setShowPINModal(false)}
        onSuccess={handlePINSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  recipientIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  contactsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amountPrefix: {
    fontFamily: 'Inter-Bold',
    fontSize: 40,
    color: '#14F195',
    marginRight: 8,
  },
  amountInput: {
    fontFamily: 'Inter-Bold',
    fontSize: 40,
    color: '#FFFFFF',
    minWidth: 150,
    textAlign: 'center',
  },
  balanceText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  recipientSummary: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  recipientSummaryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  recipientSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientSummaryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  confirmContainer: {
    flex: 1,
  },
  confirmCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  confirmLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#94A3B8',
  },
  confirmValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  confirmTotalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  solSymbol: {
    color: '#14F195',
  },
  confirmDivider: {
    height: 1,
    backgroundColor: '#334155',
  },
  confirmRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallRecipientIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  confirmNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  backButton: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 12,
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#14F195',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(20, 241, 149, 0.5)',
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
});