import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "../chat/ChatLayout";
import { Edit2, Save, X } from "lucide-react";

interface UserProfileProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export const UserProfile = ({ profile, onProfileUpdate }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile.full_name
  });
  const { toast } = useToast();

  const handleSave = async () => {
    if (!editData.full_name.trim()) {
      toast({
        title: "Invalid Name",
        description: "Full name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: editData.full_name.trim()
      })
      .eq('user_id', profile.user_id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      onProfileUpdate(data);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    }
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    setEditData({ full_name: profile.full_name });
    setIsEditing(false);
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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow">
            <AvatarFallback className="text-xl font-semibold text-primary-foreground">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          User Profile
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editData.full_name}
                onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={isLoading}
                placeholder="Enter your full name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label>Full Name</Label>
            <p className="text-lg font-medium">{profile.full_name}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};