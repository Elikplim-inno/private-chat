import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "../chat/ChatLayout";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export const UserProfile = ({ profile, onProfileUpdate }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [phoneNumber, setPhoneNumber] = useState((profile as any).phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone_number: phoneNumber || null
        })
        .eq('user_id', profile.user_id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${profile.user_id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', profile.user_id)
        .select()
        .single();

      if (updateError) throw updateError;

      onProfileUpdate(data);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', profile.user_id)
        .select()
        .single();
      
      if (error) throw error;
      onProfileUpdate(data);
      
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove avatar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className="h-24 w-24">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-2xl">
                {profile.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-white hover:text-white hover:bg-transparent"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
          {profile.avatar_url && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAvatarRemove}
              className="absolute -top-2 -right-2 h-6 w-6 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{profile.full_name}</h3>
          <p className="text-sm text-muted-foreground">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          {isEditing ? (
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          ) : (
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="text-foreground">{profile.full_name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          {isEditing ? (
            <div className="space-y-1">
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
              <p className="text-xs text-muted-foreground">
                This helps friends find you when they sync their contacts
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="text-foreground">
                {(profile as any).phone_number || 'Not set'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !fullName.trim()}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFullName(profile.full_name);
                setPhoneNumber((profile as any).phone_number || '');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};