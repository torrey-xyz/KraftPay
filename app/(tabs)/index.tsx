import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, QrCode, Send, Wallet, CreditCard, Smartphone, Zap, Car, Building2, ChevronRight } from 'lucide-react-native';

const QUICK_ACTIONS = [
  { icon: <QrCode size={24} color="#14F195" />, label: 'Scan QR', id: 'scan' },
  { icon: <Send size={24} color="#14F195" />, label: 'Pay contacts', id: 'pay' },
  { icon: <Smartphone size={24} color="#14F195" />, label: 'Mobile recharge', id: 'recharge' },
  { icon: <CreditCard size={24} color="#14F195" />, label: 'Pay bills', id: 'bills' },
  { icon: <Wallet size={24} color="#14F195" />, label: 'Bank transfer', id: 'bank' },
  { icon: <Building2 size={24} color="#14F195" />, label: 'Pay businesses', id: 'business' },
  { icon: <Zap size={24} color="#14F195" />, label: 'Electricity', id: 'electricity' },
  { icon: <Car size={24} color="#14F195" />, label: 'FASTag recharge', id: 'fastag' },
];

const PEOPLE = [
  { id: '1', name: 'Sarah', initial: 'S', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
  { id: '2', name: 'Mike', initial: 'M', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
  { id: '3', name: 'Jessica', initial: 'J', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' },
  { id: '4', name: 'Alex', initial: 'A', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
];

const BUSINESSES = [
  { id: '1', name: 'Coffee Shop', initial: 'C' },
  { id: '2', name: 'Grocery Store', initial: 'G' },
  { id: '3', name: 'Pharmacy', initial: 'P' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const renderQuickActions = () => {
    return (
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity key={action.id} style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              {action.icon}
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPeopleSection = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>People</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.peopleScroll}>
          {PEOPLE.map((person) => (
            <TouchableOpacity key={person.id} style={styles.personItem}>
              {person.image ? (
                <Image source={{ uri: person.image }} style={styles.personImage} />
              ) : (
                <View style={styles.personInitial}>
                  <Text style={styles.initialText}>{person.initial}</Text>
                </View>
              )}
              <Text style={styles.personName}>{person.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBusinessSection = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Businesses</Text>
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreText}>Explore</Text>
            <ChevronRight size={16} color="#14F195" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.businessScroll}>
          {BUSINESSES.map((business) => (
            <TouchableOpacity key={business.id} style={styles.businessItem}>
              <View style={styles.businessInitial}>
                <Text style={styles.initialText}>{business.initial}</Text>
              </View>
              <Text style={styles.businessName}>{business.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPromoBanner = () => {
    return (
      <View style={styles.promoBanner}>
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>Get ₹100 Cashback</Text>
          <Text style={styles.promoDescription}>On your first UPI transaction</Text>
          <TouchableOpacity style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Claim Now</Text>
          </TouchableOpacity>
        </View>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg' }}
          style={styles.promoImage}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pay by name or phone number"
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPromoBanner()}
        {renderQuickActions()}
        {renderPeopleSection()}
        {renderBusinessSection()}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  promoBanner: {
    margin: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 140,
  },
  promoContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  promoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promoDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: '#14F195',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  promoImage: {
    width: 120,
    height: '100%',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  quickActionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 16,
    marginBottom: 16,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#14F195',
    marginRight: 4,
  },
  peopleScroll: {
    paddingLeft: 16,
  },
  personItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  personImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  personInitial: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14F195',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  initialText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#0F172A',
  },
  personName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  businessScroll: {
    paddingLeft: 16,
  },
  businessItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  businessInitial: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    width: 80,
  },
});