import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { User, ChevronRight, Copy, Fingerprint, Bell, Shield, LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function ProfileScreen() {
  const { publicKey, logout } = useWallet();
  const { isBiometricsEnabled, toggleBiometrics } = useAuth();
  const router = useRouter();
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [username, setUsername] = useState('@kraftuser');

  useEffect(() => {
    checkBiometrics();
  }, []);

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

  const formatPublicKey = (key: string) => {
    if (!key) return '';
    return `${key.substring(0, 6)}...${key.substring(key.length - 6)}`;
  };

  const handleCopyAddress = async () => {
    if (publicKey) {
      await Clipboard.setStringAsync(publicKey);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Copied', 'Wallet address copied to clipboard');
    }
  };

  const handleToggleBiometrics = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    await toggleBiometrics();
  };

  const handleToggleNotifications = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out? You will need your seed phrase to log back in.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#14F195" />
            </View>
          </View>
          <Text style={styles.username}>{username}</Text>
          <TouchableOpacity style={styles.addressContainer} onPress={handleCopyAddress}>
            <Text style={styles.addressText}>{formatPublicKey(publicKey)}</Text>
            <Copy size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIconContainer}>
              <User size={20} color="#14F195" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color="#64748B" />
          </TouchableOpacity>
          
          {biometricsAvailable && (
            <View style={styles.menuItem}>
              <View style={styles.menuItemIconContainer}>
                <Fingerprint size={20} color="#14F195" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Biometric Authentication</Text>
              </View>
              <Switch
                trackColor={{ false: '#1E293B', true: 'rgba(20, 241, 149, 0.3)' }}
                thumbColor={isBiometricsEnabled ? '#14F195' : '#64748B'}
                ios_backgroundColor="#1E293B"
                onValueChange={handleToggleBiometrics}
                value={isBiometricsEnabled}
              />
            </View>
          )}
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemIconContainer}>
              <Bell size={20} color="#14F195" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#1E293B', true: 'rgba(20, 241, 149, 0.3)' }}
              thumbColor={isNotificationsEnabled ? '#14F195' : '#64748B'}
              ios_backgroundColor="#1E293B"
              onValueChange={handleToggleNotifications}
              value={isNotificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIconContainer}>
              <Shield size={20} color="#14F195" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Change PIN</Text>
            </View>
            <ChevronRight size={20} color="#64748B" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIconContainer}>
              <Shield size={20} color="#14F195" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Backup Recovery Phrase</Text>
            </View>
            <ChevronRight size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>KraftPay v1.0.0</Text>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  menuItemDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
    paddingVertical: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#EF4444',
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
});