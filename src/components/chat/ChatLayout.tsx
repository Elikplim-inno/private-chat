import { useState, useEffect } from "react";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "../auth/AuthForm";
import { UserList } from "./UserList";
import { ChatWindow } from "./ChatWindow";
import { ProfileModal } from "../profile/ProfileModal";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import chartingBg from "@/assets/charting-bg.jpg";

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
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export const ChatLayout = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "user2",
      receiverId: "user1",
      content: "Hey! How are you doing?",
      timestamp: new Date(Date.now() - 300000),
      isRead: true,
    },
    {
      id: "2",
      senderId: "user1",
      receiverId: "user2",
      content: "I'm doing great! Working on the new chat app project.",
      timestamp: new Date(Date.now() - 240000),
      isRead: true,
    },
    {
      id: "3",
      senderId: "user2",
      receiverId: "user1",
      content: "That sounds exciting! Can't wait to see it.",
      timestamp: new Date(Date.now() - 180000),
      isRead: true,
    },
  ]);

  const users: User[] = [
    {
      id: "user2",
      name: "Sarah Wilson",
      isOnline: true,
    },
    {
      id: "user3",
      name: "Mike Johnson",
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000),
    },
    {
      id: "user4",
      name: "Emma Davis",
      isOnline: true,
    },
  ];

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

  const sendMessage = (content: string) => {
    if (!user || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: selectedChat.id,
      content,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    // Close mobile menu after sending message
    setIsMobileMenuOpen(false);
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getChatMessages = (userId: string) => {
    if (!user) return [];
    return messages.filter(
      msg =>
        (msg.senderId === user.id && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === user.id)
    );
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
      className="flex h-screen bg-chat-bg relative overflow-hidden"
      style={{
        backgroundImage: `url(${chartingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: 'var(--gradient-overlay-light)'
        }}
      />
      
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
          onUserSelect={(user) => {
            setSelectedChat(user);
            setIsMobileMenuOpen(false); // Close mobile menu when selecting user
          }}
          currentUser={currentUser}
          messages={messages}
          onProfileClick={() => setIsProfileModalOpen(true)}
        />
      </div>
      
      {/* Chat Window - Full width on mobile, flex-1 on desktop */}
      <div className="flex-1 flex flex-col pt-16 md:pt-0">
        <ChatWindow
          selectedUser={selectedChat}
          messages={selectedChat ? getChatMessages(selectedChat.id) : []}
          currentUser={currentUser}
          onSendMessage={sendMessage}
          onDeleteMessage={deleteMessage}
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
    </div>
  );
};