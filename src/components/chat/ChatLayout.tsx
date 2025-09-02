import { useState, useEffect } from "react";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "../auth/AuthForm";
import { UserList } from "./UserList";
import { ChatWindow } from "./ChatWindow";
import { ProfileModal } from "../profile/ProfileModal";
import { ContactSync } from "./ContactSync";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import chatBackground from "@/assets/chat-background.jpg";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const ChatLayout = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showContactSync, setShowContactSync] = useState(false);
  const [contactMatchedUsers, setContactMatchedUsers] = useState<User[]>([]);
  const { getMatchedUsers } = useContacts(user?.id);
  const { 
    messages, 
    sendMessage: sendMessageToDb, 
    getChatMessages, 
    getUnreadCount, 
    getLastMessage,
    markAsRead 
  } = useMessages(user?.id);

  // Only show contact-matched users (no demo users)
  const users: User[] = contactMatchedUsers;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadContactMatches = async () => {
    if (!user?.id) return;
    
    try {
      const matched = await getMatchedUsers();
      const contactUsers = matched.map((match: any) => ({
        id: match.user_id,
        name: match.full_name,
        avatar: match.avatar_url,
        isOnline: true, // We can enhance this later with real presence
      }));
      setContactMatchedUsers(contactUsers);
    } catch (error) {
      console.error('Error loading contact matches:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadContactMatches();
    }
  }, [user?.id]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !selectedChat) return;

    await sendMessageToDb(selectedChat.id, content);
    // Close mobile menu after sending message
    setIsMobileMenuOpen(false);
  };

  const handleUserSelect = async (selectedUser: User) => {
    if (!user) return;
    
    setSelectedChat(selectedUser);
    setIsMobileMenuOpen(false);
    
    // Mark messages from this user as read
    const chatMessages = getChatMessages(selectedUser.id);
    const unreadMessages = chatMessages.filter(msg => 
      msg.sender_id === selectedUser.id && 
      msg.receiver_id === user.id && 
      !msg.is_read
    );
    
    for (const msg of unreadMessages) {
      await markAsRead(msg.id);
    }
  };

  if (!user || !profile) {
    return <AuthForm />;
  }

  const currentUser: User = {
    id: user.id,
    name: profile.full_name,
    avatar: profile.avatar_url,
    isOnline: true,
  };

  return (
    <div 
      className="flex h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: `url(${chatBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-semibold text-foreground">
            {selectedChat ? selectedChat.name : "QuickChat"}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-black/50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* User List - Desktop: always visible, Mobile: slide-in overlay */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
        absolute md:relative z-30 md:z-10
        h-full md:h-auto
        ${isMobileMenuOpen ? 'pt-16' : 'md:pt-0'}
      `}>
        <UserList
          users={users}
          selectedUser={selectedChat}
          onUserSelect={handleUserSelect}
          currentUser={currentUser}
          getChatMessages={getChatMessages}
          getUnreadCount={getUnreadCount}
          getLastMessage={getLastMessage}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onContactSyncClick={() => setShowContactSync(true)}
        />
      </div>
      
      {/* Chat Window - Full width on mobile, flex-1 on desktop */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0">
        <ChatWindow
          selectedUser={selectedChat}
          messages={selectedChat ? getChatMessages(selectedChat.id) : []}
          currentUser={currentUser}
          onSendMessage={sendMessage}
        />
      </div>
      
      {profile && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
          onProfileUpdate={setProfile}
        />
      )}
      
      {showContactSync && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Find Friends</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactSync(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <ContactSync 
                userId={user.id} 
                onContactsSync={() => {
                  loadContactMatches();
                  setShowContactSync(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};