import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "./ChatLayout";

interface AuthScreenProps {
  onAuth: (user: User) => void;
}

export const AuthScreen = ({ onAuth }: AuthScreenProps) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!name.trim()) return;
    
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      const user: User = {
        id: "user1",
        name: name.trim(),
        isOnline: true,
      };
      onAuth(user);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary-foreground"
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
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Welcome to QuickChat
          </CardTitle>
          <CardDescription>
            Enter your name to start chatting with friends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleAuth}
            disabled={!name.trim() || isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-elevated transition-all duration-200"
          >
            {isLoading ? "Joining..." : "Start Chatting"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};