import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Contact } from '@/types/Contact';
import { User, AtSign } from 'lucide-react-native';

interface ContactItemProps {
  contact: Contact;
  onPress?: () => void;
}

export default function ContactItem({ contact, onPress }: ContactItemProps) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        {contact.avatar ? (
          <Image source={{ uri: contact.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <User size={20} color="#FFFFFF" />
          </View>
        )}
        {contact.isOnKraftPay && (
          <View style={styles.kraftPayBadge} />
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{contact.name}</Text>
        {contact.username ? (
          <View style={styles.usernameContainer}>
            <AtSign size={12} color="#94A3B8" />
            <Text style={styles.username}>{contact.username.replace('@', '')}</Text>
          </View>
        ) : (
          <Text style={styles.phoneNumber}>{contact.phoneNumber}</Text>
        )}
      </View>

      {contact.isOnKraftPay && (
        <View style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kraftPayBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#14F195',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  details: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 2,
  },
  phoneNumber: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    borderRadius: 16,
  },
  sendButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#14F195',
  },
});