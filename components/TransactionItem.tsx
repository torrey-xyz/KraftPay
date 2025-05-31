import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/types/Transaction';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'confirmed':
        return <CheckCircle2 size={16} color="#14F195" />;
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      case 'failed':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {transaction.type === 'receive' ? (
          <View style={[styles.iconBackground, styles.receiveBackground]}>
            <ArrowDownLeft size={20} color="#14F195" />
          </View>
        ) : (
          <View style={[styles.iconBackground, styles.sendBackground]}>
            <ArrowUpRight size={20} color="#64748B" />
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>
          {transaction.type === 'receive' 
            ? `Received from ${transaction.sender || 'Unknown'}` 
            : `Sent to ${transaction.recipient || 'Unknown'}`}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(transaction.timestamp)}</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={styles.status}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount,
          transaction.type === 'receive' ? styles.receiveAmount : styles.sendAmount
        ]}>
          {transaction.type === 'receive' ? '+' : '-'} ◎{transaction.amount.toFixed(4)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiveBackground: {
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
  },
  sendBackground: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  details: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  receiveAmount: {
    color: '#14F195',
  },
  sendAmount: {
    color: '#FFFFFF',
  },
});