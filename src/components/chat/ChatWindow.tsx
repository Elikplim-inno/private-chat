import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Message } from "./ChatLayout";
import { formatDistanceToNow } from "date-fns";
import { Send, MoreVertical, X } from "lucide-react";

interface ChatWindowProps {
  selectedUser: User | null;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

export const ChatWindow = ({
  selectedUser,
  messages,
  currentUser,
  onSendMessage,
  onDeleteMessage,
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  // Simulate typing indicator
  useEffect(() => {
    if (newMessage) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [newMessage]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
            <svg
              className="w-12 h-12 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Welcome to QuickChat
          </h3>
          <p className="text-muted-foreground">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                  selectedUser.isOnline ? "bg-chat-online-status" : "bg-muted"
                }`}
              ></div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{selectedUser.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedUser.isOnline ? (
                  isTyping ? (
                    <span className="text-chat-typing-indicator">typing...</span>
                  ) : (
                    "Online"
                  )
                ) : (
                  `Last seen ${formatDistanceToNow(selectedUser.lastSeen || new Date())} ago`
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.senderId === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex items-end space-x-2 group ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="relative">
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-message ${
                      isOwn
                        ? "bg-chat-message-sent text-chat-message-sent-text rounded-br-md"
                        : "bg-chat-message-received text-chat-message-received-text rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? "text-chat-message-sent-text/70" : "text-chat-message-received-text/70"
                    }`}>
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  {isOwn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteMessage(message.id)}
                      className={`absolute -top-2 -left-8 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            size="icon"
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-elevated transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};