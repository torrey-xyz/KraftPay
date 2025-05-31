import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { Lock, Filter } from 'lucide-react-native';
import TransactionItem from '@/components/TransactionItem';
import PINModal from '@/components/PINModal';
import EmptyState from '@/components/EmptyState';
import { ActivityIndicator } from 'react-native';

export default function ActivityScreen() {
  const { transactions, fetchTransactions } = useWallet();
  const { isPINSet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const blurAnim = useState(new Animated.Value(5))[0];
  const opacityAnim = useState(new Animated.Value(0.5))[0];

  useEffect(() => {
    if (!isPINSet || isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      Animated.parallel([
        Animated.timing(blurAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(blurAnim, {
          toValue: 5,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isAuthenticated, blurAnim, opacityAnim]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      await fetchTransactions();
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = () => {
    if (isPINSet && !isAuthenticated) {
      setShowPINModal(true);
    }
  };

  const handlePINSuccess = () => {
    setShowPINModal(false);
    setIsAuthenticated(true);
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Activity</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[styles.filterButton, filterActive && styles.filterButtonActive]}
          onPress={() => setFilterActive(!filterActive)}
        >
          <Filter
            size={20}
            color={filterActive ? '#14F195' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isPINSet && !isAuthenticated) {
      return (
        <View style={styles.lockedContainer}>
          <Lock size={40} color="#64748B" />
          <Text style={styles.lockedTitle}>Activity Hidden</Text>
          <Text style={styles.lockedDescription}>
            Your transaction history is private. Authenticate to view it.
          </Text>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={handleAuthenticate}
          >
            <Text style={styles.unlockButtonText}>Unlock</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14F195" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <EmptyState
          icon={<Text style={styles.emptyIcon}>◎</Text>}
          title="No transactions yet"
          description="Your transaction history will appear here once you start sending and receiving crypto."
          actionLabel="Refresh"
          onAction={handleRefresh}
        />
      );
    }

    return (
      <Animated.View
        style={[
          styles.transactionsContainer,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <FlatList
          data={transactions}
          renderItem={({ item }) => (
            <TransactionItem transaction={item} />
          )}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {renderContent()}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  lockedTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  lockedDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  unlockButton: {
    backgroundColor: '#14F195',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  unlockButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  emptyIcon: {
    fontSize: 40,
    color: '#14F195',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
  },
});