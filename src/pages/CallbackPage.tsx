import { useEffect, useRef } from "react";
import { useTokenExchange } from "@/hooks/auth-hooks";
import { useAuth, type AuthUser, type UserRole } from "@/lib/auth-context";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";

export function CallbackPage() {
    const exchangeToken = useTokenExchange();
    const { setAuthUser } = useAuth();
    const [, setLocation] = useLocation();
    const [match, params] = useRoute("/login/oauth2/code/react-client");
    const processedRef = useRef(false);

    useEffect(() => {
        // Prevent double execution in strict mode
        if (processedRef.current) return;
        processedRef.current = true;

        const handleCallback = async () => {
            try {
                const { tokens, userinfo } = await exchangeToken();
                console.log("User Info from OIDC:", userinfo);

                if (tokens.access_token) {
                    localStorage.setItem("access_token", tokens.access_token);
                }
                if (tokens.id_token) {
                    localStorage.setItem("id_token", tokens.id_token);
                }

                const email = userinfo.email as string;

                // Simple mapping based on email to preserve demo roles if possible
                let role: UserRole = "student";
                let department = "General";

                if (email?.includes("admin")) role = "super_admin";
                else if (email?.includes("staff")) role = "staff";
                else if (email?.includes("dept")) role = "admin";

                // Construct AuthUser object
                const user: AuthUser = {
                    id: userinfo.sub || "unknown",
                    name: (userinfo.name as string) || "User",
                    email: email || "unknown@example.com",
                    role: role,
                    department: department,
                    avatarUrl: (userinfo.picture as string) || undefined,
                    // Add default values for required fields to avoid type errors
                    User_Id: "OIDC_" + (userinfo.sub?.substring(0, 8) || "USER"),
                };

                setAuthUser(user);

                // Redirect to dashboard
                setLocation("/dashboard");
            } catch (error) {
                console.error("Token exchange failed", error);
                // Handle error (maybe redirect back to login with error param)
                setLocation("/login?error=auth_failed");
            }
        };

        handleCallback();
    }, [exchangeToken, setAuthUser, setLocation]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Authenticating...</h2>
            <p className="text-muted-foreground">Please wait while we log you in.</p>
        </div>
    );
}
