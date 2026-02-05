import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useAuthCodeFlow } from "@/hooks/auth-hooks";

export function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const { login } = useAuth(); // Replaced by OIDC flow
  const { toast } = useToast();
  const onLogin = useAuthCodeFlow();

  // Force light mode on login page mount
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    if (hadDark) {
      root.classList.remove("dark");
    }

    // Cleanup: restore dark mode if it was enabled before
    return () => {
      if (hadDark) {
        root.classList.add("dark");
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin();
      // Redirect happens here, so no need for toast usually, but in case:
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: "Sign in failed",
        description: "Could not initiate login flow.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Quick login for demo purposes (kept as requested to preserve files/logic, but modified to warn or maybe should just use the new flow?)
  // For now, I'll leave the quick buttons but map them to the same flow or just disable them/keep them as mock fallbacks if the user wants. 
  // But the request was to port logic. I'll make the main "Sign In" button use the new flow.

  const quickLogin = async (role: string) => {
    // Mock quick login behavior for demo purposes OR mapped to specific OIDC hints if supported.
    // For now, let's just trigger the main flow as that's the "real" logic now.
    handleSubmit({ preventDefault: () => { } } as React.FormEvent);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E3F2FD] p-4">
      {/* The "Big Box" Container */}
      <Card className="overflow-hidden shadow-2xl w-full max-w-5xl grid md:grid-cols-2 border-none ring-1 ring-gray-200">

        {/* Left Side - Image Box */}
        <div className="relative hidden md:flex flex-col items-center justify-center p-8 bg-gray-50 border-r border-gray-100">
          <div className="w-full max-w-sm">
            <img
              src="/login-illustration.png"
              alt="Campus Life"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Right Side - Login Form Box */}
        <div className="flex flex-col justify-center p-8 md:p-12 bg-white">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="mb-2">
                <img
                  src="/logo.png"
                  alt="MetaHorizon College"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 
                  OIDC typically redirects, so username/password might not be needed HERE 
                  if the IdP handles it. However, the design usually expects it. 
                  If this is a "Client-Side" login where we send creds to an API, fields are needed.
                  But auth-client.ts uses 'authorizationCodeGrant' which implies REDIRECT to an IdP.
                  So these inputs are technically redundant for the REAL flow, but I will keep them 
                  visually to not break the design, but maybe disable them or make them optional?
                  Actually, best UX for OIDC is just a "Login with [Provider]" button.
                  But to keep the "look", I'll just keep the fields but they won't inherently DO anything 
                  passed to the hook (unless the hook accepted login_hint).
              */}
              <div className="space-y-2 opacity-50 pointer-events-none" title="Managed by Identity Provider">
                <Label htmlFor="userId" className="sr-only">User ID</Label>
                <Input
                  id="userId"
                  className="h-11 bg-muted/50 border-input"
                  placeholder="User ID or Email (Managed by IdP)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={true}
                />
              </div>

              <div className="space-y-2 opacity-50 pointer-events-none">
                <Label htmlFor="password" className="sr-only">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="h-11 bg-muted/50 border-input"
                  placeholder="Password (Managed by IdP)"
                  value="********"
                  disabled={true}
                  readOnly
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 transition-all shadow-lg shadow-black/5"
                disabled={isLoading}
              >
                {isLoading ? "Redirecting to Login..." : "Sign In with SSO"}
              </Button>
            </form>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wider mb-4">
                Quick Access (Demo)
              </p>
              <div className="flex justify-center gap-3">
                {/* These mock buttons will now just trigger the main SSO flow or could be removed if strict */}
                {/* Keeping them as requested to "keep all files/logic" implies keeping the PAGE structure too */}
                <button onClick={() => quickLogin("super_admin")} className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center justify-center font-bold" title="Super Admin">SA</button>
                <button onClick={() => quickLogin("admin")} className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center font-bold" title="Admin">A</button>
                <button onClick={() => quickLogin("staff")} className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center font-bold" title="Staff">S</button>
                <button onClick={() => quickLogin("student")} className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center font-bold" title="Student">St</button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

