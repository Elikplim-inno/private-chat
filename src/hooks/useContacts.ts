import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PhoneContact {
  name: string;
  phoneNumber: string;
}

export const useContacts = (userId?: string) => {
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();

  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Native Feature",
        description: "Contact access is only available on mobile devices",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Contacts.requestPermissions();
      const granted = permission.contacts === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        toast({
          title: "Permission Required",
          description: "Please allow contact access to find friends",
          variant: "destructive"
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      toast({
        title: "Error",
        description: "Failed to request contacts permission",
        variant: "destructive"
      });
      return false;
    }
  };

  const fetchContacts = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const hasAccess = hasPermission || await requestPermission();
      if (!hasAccess) return;

      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true
        }
      });

      const formattedContacts: PhoneContact[] = [];
      
      result.contacts.forEach((contact: any) => {
        if (contact.phones && contact.phones.length > 0) {
          contact.phones.forEach(phone => {
            if (phone.number) {
              // Normalize phone number (remove spaces, dashes, etc.)
              const normalizedPhone = phone.number.replace(/[\s\-\(\)]/g, '');
              formattedContacts.push({
                name: contact.name?.display || 'Unknown',
                phoneNumber: normalizedPhone
              });
            }
          });
        }
      });

      setContacts(formattedContacts);
      
      // Sync contacts to database
      await syncContactsToDatabase(formattedContacts);
      
      toast({
        title: "Contacts Synced",
        description: `Found ${formattedContacts.length} contacts`
      });
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncContactsToDatabase = async (contactList: PhoneContact[]) => {
    if (!userId) return;

    try {
      // Clear existing contacts
      await supabase
        .from('user_contacts')
        .delete()
        .eq('user_id', userId);

      // Insert new contacts
      const contactsToInsert = contactList.map(contact => ({
        user_id: userId,
        contact_phone: contact.phoneNumber,
        contact_name: contact.name
      }));

      if (contactsToInsert.length > 0) {
        const { error } = await supabase
          .from('user_contacts')
          .insert(contactsToInsert);

        if (error) {
          console.error('Error syncing contacts:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing contacts to database:', error);
    }
  };

  const getMatchedUsers = async () => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase.rpc('get_contact_matched_users', {
        requesting_user_id: userId
      });

      if (error) {
        console.error('Error fetching matched users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting matched users:', error);
      return [];
    }
  };

  return {
    contacts,
    isLoading,
    hasPermission,
    requestPermission,
    fetchContacts,
    getMatchedUsers
  };
};