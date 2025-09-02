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

  return (
    <div className="w-full md:w-80 bg-card/95 backdrop-blur-sm border-r border-border flex flex-col relative z-10 h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border min-h-[72px]">
        <div className="relative">
          <Avatar className="h-12 w-12 md:h-12 md:w-12">
            {currentUser.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-base">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-card-foreground text-base truncate">
            {currentUser.name}
          </h2>
          <Badge variant="secondary" className="text-xs bg-[hsl(var(--online-status)/0.1)] text-[hsl(var(--online-status))] border-[hsl(var(--online-status)/0.2)] mt-1">
            Online
          </Badge>
        </div>
        <div className="flex gap-1">
          {onContactSyncClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onContactSyncClick}
              className="text-muted-foreground hover:text-primary h-11 w-11 rounded-full"
            >
              <UserPlus className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onProfileClick}
            className="text-muted-foreground hover:text-primary h-11 w-11 rounded-full"
          >
            <UserIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive h-11 w-11 rounded-full"
          >
            <LogOut className="w-5 h-5" />
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
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 min-h-[72px] active:scale-[0.98] ${
                  isSelected
                    ? "bg-primary/10 border border-primary/20 shadow-mobile"
                    : "hover:bg-muted/50 active:bg-muted/70"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${
                        user.isOnline ? "bg-[hsl(var(--online-status))]" : "bg-muted"
                      }`}
                    ></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate text-base">
                        {user.name}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate pr-2">
                          {lastMessage.sender_id === currentUser.id ? "You: " : ""}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {user.isOnline ? "Online" : `Last seen ${formatDistanceToNow(user.lastSeen || new Date())}`}
                        </p>
                      )}
                      
                      {unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full px-2.5 py-1 min-w-[24px] h-6 text-center flex items-center justify-center font-medium">
                          {unreadCount > 99 ? '99+' : unreadCount}
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