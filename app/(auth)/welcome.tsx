import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Coins, ShieldCheck, RefreshCw } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>KraftPay</Text>
        </View>

        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Coins size={28} color="#14F195" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Simplified Crypto</Text>
              <Text style={styles.featureDescription}>
                Send SOL to usernames instead of complex addresses
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={28} color="#14F195" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Enhanced Privacy</Text>
              <Text style={styles.featureDescription}>
                Keep your balance hidden until you're ready to view it
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <RefreshCw size={28} color="#14F195" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Real-Time Updates</Text>
              <Text style={styles.featureDescription}>
                Track transactions and receive instant notifications
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create-wallet')}
          >
            <Text style={styles.createButtonText}>Create a new wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => router.push('/import-wallet')}
          >
            <Text style={styles.importButtonText}>Import existing wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  featureContainer: {
    marginBottom: 60,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#14F195',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  importButton: {
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});