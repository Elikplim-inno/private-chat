import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserProfile } from "./UserProfile";
import { Profile } from "../chat/ChatLayout";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export const ProfileModal = ({ isOpen, onClose, profile, onProfileUpdate }: ProfileModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>
        <UserProfile profile={profile} onProfileUpdate={onProfileUpdate} />
      </DialogContent>
    </Dialog>
  );
};