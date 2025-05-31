import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, RefreshCw } from 'lucide-react-native';
import ContactItem from '@/components/ContactItem';
import { Contact } from '@/types/Contact';
import { mockedContacts } from '@/utils/mockData';
import EmptyState from '@/components/EmptyState';

type Section = {
  title: string;
  data: Contact[];
};

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (contacts.length > 0) {
      organizeSections();
    }
  }, [contacts, searchQuery]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch contacts from an API or local storage
      // For now, we'll use mocked data with a timeout to simulate fetching
      setTimeout(() => {
        setContacts(mockedContacts);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setIsLoading(false);
    }
  };

  const organizeSections = () => {
    const filteredContacts = searchQuery
      ? contacts.filter(
          contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (contact.username && contact.username.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : contacts;

    // Group contacts by first letter of name
    const grouped: Record<string, Contact[]> = {};
    const specialSection: Contact[] = [];

    filteredContacts.forEach(contact => {
      if (contact.isOnKraftPay) {
        // Add to special section for KraftPay users
        specialSection.push(contact);
      } else {
        // Group by first letter
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!grouped[firstLetter]) {
          grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(contact);
      }
    });

    // Create sections array sorted alphabetically
    const alphabeticalSections = Object.keys(grouped)
      .sort()
      .map(key => ({
        title: key,
        data: grouped[key],
      }));

    // Add special section at the top if it has items
    const newSections: Section[] = [];
    if (specialSection.length > 0) {
      newSections.push({
        title: 'On KraftPay',
        data: specialSection,
      });
    }

    // Add alphabetical sections
    newSections.push(...alphabeticalSections);

    setSections(newSections);
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const handleRefresh = () => {
    fetchContacts();
  };

  const handleContactPress = (contact: Contact) => {
    // In a real app, we would navigate to the contact details or start a transaction
    console.log('Contact pressed:', contact);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <RefreshCw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {contacts.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Plus size={40} color="#14F195" />}
          title="No contacts yet"
          description="Add your first contact to start sending crypto easily"
          actionLabel="Add Contact"
          onAction={() => console.log('Add contact')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <ContactItem
              contact={item}
              onPress={() => handleContactPress(item)}
            />
          )}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          style={styles.contactsList}
          contentContainerStyle={styles.contactsListContent}
        />
      )}

      <TouchableOpacity style={styles.addButton}>
        <Plus size={24} color="#0F172A" />
      </TouchableOpacity>
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
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginVertical: 16,
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
  contactsList: {
    flex: 1,
  },
  contactsListContent: {
    paddingBottom: 80,
  },
  sectionHeader: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sectionHeaderText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#94A3B8',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14F195',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14F195',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});