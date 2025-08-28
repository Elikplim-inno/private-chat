import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User as UserIcon, UserPlus } from "lucide-react";
import { User, Message } from "./ChatLayout";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  currentUser: User;
  getChatMessages: (userId: string) => Message[];
  getUnreadCount: (userId: string) => number;
  getLastMessage: (userId: string) => Message | null;
  onProfileClick: () => void;
  onContactSyncClick?: () => void;
}

export const UserList = ({
  users,
  selectedUser,
  onUserSelect,
  currentUser,
  getChatMessages,
  getUnreadCount,
  getLastMessage,
  onProfileClick,
  onContactSyncClick,
}: UserListProps) => {
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  // These functions are now passed as props from ChatLayout

  return (
    <div className="w-80 md:w-80 bg-card/95 backdrop-blur-sm border-r border-border flex flex-col relative z-10 h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="relative">
          <Avatar className="h-12 w-12">
            {currentUser.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-card-foreground">
            {currentUser.name}
          </h2>
          <Badge variant="secondary" className="text-xs bg-[hsl(var(--online-status)/0.1)] text-[hsl(var(--online-status))] border-[hsl(var(--online-status)/0.2)]">
            Online
          </Badge>
        </div>
        <div className="flex gap-1">
          {onContactSyncClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onContactSyncClick}
              className="text-muted-foreground hover:text-primary"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfileClick}
            className="text-muted-foreground hover:text-primary"
          >
            <UserIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Find Friends</h3>
                <p className="text-sm text-muted-foreground">
                  Sync your contacts to find friends who are already using the app
                </p>
              </div>
              {onContactSyncClick && (
                <Button onClick={onContactSyncClick} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sync Contacts
                </Button>
              )}
            </div>
          ) : (
            users.map((user) => {
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
                        user.isOnline ? "bg-[hsl(var(--online-status))]" : "bg-muted"
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
                          {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.sender_id === currentUser.id ? "You: " : ""}
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
          }))
          }
        </div>
      </ScrollArea>
    </div>
  );
};