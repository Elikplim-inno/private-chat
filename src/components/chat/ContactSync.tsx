import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contact, RefreshCw, Users } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

interface ContactSyncProps {
  userId: string;
  onContactsSync?: () => void;
}

export const ContactSync = ({ userId, onContactsSync }: ContactSyncProps) => {
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const { fetchContacts, getMatchedUsers, isLoading, hasPermission } = useContacts(userId);

  const handleSyncContacts = async () => {
    await fetchContacts();
    const matched = await getMatchedUsers();
    setMatchedUsers(matched);
    onContactsSync?.();
  };

  const handleFindMatches = async () => {
    const matched = await getMatchedUsers();
    setMatchedUsers(matched);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contact className="w-5 h-5" />
          Find Friends
        </CardTitle>
        <CardDescription>
          Sync your contacts to find friends who are already using the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSyncContacts}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Contact className="w-4 h-4 mr-2" />
            )}
            {hasPermission ? 'Sync Contacts' : 'Enable Contact Access'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleFindMatches}
            disabled={isLoading}
          >
            <Users className="w-4 h-4 mr-2" />
            Find Matches
          </Button>
        </div>

        {matchedUsers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Friends Found ({matchedUsers.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {matchedUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {user.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.contact_name} • {user.phone_number}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    In Contacts
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>We'll only show you friends who have also shared their phone number</p>
        </div>
      </CardContent>
    </Card>
  );
};