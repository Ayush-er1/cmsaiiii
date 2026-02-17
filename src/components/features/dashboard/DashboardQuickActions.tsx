import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, UserCircle } from "lucide-react";

interface DashboardQuickActionsProps {
    user: {
        role: string;
    };
}

export function DashboardQuickActions({ user }: DashboardQuickActionsProps) {
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                    {isAdmin && (
                        <Link href="/users">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-users">
                                <Users className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                Manage Users
                            </Button>
                        </Link>
                    )}
                    <Link href="/profile">
                        <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-profile">
                            <UserCircle className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                            My Profile
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
