import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Message } from "./ChatLayout";
import { formatDistanceToNow } from "date-fns";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  currentUser: User;
  messages: Message[];
}

export const UserList = ({
  users,
  selectedUser,
  onUserSelect,
  currentUser,
  messages,
}: UserListProps) => {
  const { toast } = useToast();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };
  const getLastMessage = (userId: string) => {
    const userMessages = messages.filter(
      msg =>
        (msg.senderId === currentUser.id && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === currentUser.id)
    );
    return userMessages[userMessages.length - 1];
  };

  const getUnreadCount = (userId: string) => {
    return messages.filter(
      msg =>
        msg.senderId === userId &&
        msg.receiverId === currentUser.id &&
        !msg.isRead
    ).length;
  };

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              {currentUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{currentUser.name}</h2>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-chat-online-status rounded-full"></div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {users.map((user) => {
            const lastMessage = getLastMessage(user.id);
            const unreadCount = getUnreadCount(user.id);
            const isSelected = selectedUser?.id === user.id;

            return (
              <div
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-1 ${
                  isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                        user.isOnline ? "bg-chat-online-status" : "bg-muted"
                      }`}
                    ></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">
                        {user.name}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(lastMessage.timestamp, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.senderId === currentUser.id ? "You: " : ""}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {user.isOnline ? "Online" : `Last seen ${formatDistanceToNow(user.lastSeen || new Date())}`}
                        </p>
                      )}
                      
                      {unreadCount > 0 && (
                        <div className="bg-accent text-accent-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};