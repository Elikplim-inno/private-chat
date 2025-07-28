import { useState } from "react";
import { UserList } from "./UserList";
import { ChatWindow } from "./ChatWindow";
import { AuthScreen } from "./AuthScreen";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
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

  const sendMessage = (content: string) => {
    if (!currentUser || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedChat.id,
      content,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const getChatMessages = (userId: string) => {
    if (!currentUser) return [];
    return messages.filter(
      msg =>
        (msg.senderId === currentUser.id && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === currentUser.id)
    );
  };

  if (!currentUser) {
    return <AuthScreen onAuth={setCurrentUser} />;
  }

  return (
    <div className="flex h-screen bg-chat-bg">
      <UserList
        users={users}
        selectedUser={selectedChat}
        onUserSelect={setSelectedChat}
        currentUser={currentUser}
        messages={messages}
      />
      <ChatWindow
        selectedUser={selectedChat}
        messages={selectedChat ? getChatMessages(selectedChat.id) : []}
        currentUser={currentUser}
        onSendMessage={sendMessage}
      />
    </div>
  );
};