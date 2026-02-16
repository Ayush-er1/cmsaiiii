import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GraduationCap, Users, ClipboardCheck, FileText, BookOpen, Calendar, TrendingUp, CreditCard } from "lucide-react";

interface DashboardQuickActionsProps {
    user: {
        role: string;
    };
}

export function DashboardQuickActions({ user }: DashboardQuickActionsProps) {
    const isSuperAdmin = user.role === "super_admin";
    const isAdmin = user.role === "admin" || user.role === "super_admin";
    const isStaff = user.role === "staff" || user.role === "teacher";

    // Admin Quick Actions
    if (isAdmin) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                        <Link href="/programs">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-programs">
                                <GraduationCap className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                Manage Programs
                            </Button>
                        </Link>
                        <Link href="/users">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-users">
                                <Users className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                Manage Users
                            </Button>
                        </Link>
                        <Link href="/attendance">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-attendance">
                                <ClipboardCheck className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                View Attendance
                            </Button>
                        </Link>
                        <Link href="/results">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-results">
                                <FileText className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                View Results
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Staff Quick Actions
    if (isStaff) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                        <Link href="/courses">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-courses">
                                <BookOpen className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                My Courses
                            </Button>
                        </Link>
                        <Link href="/attendance">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-attendance">
                                <ClipboardCheck className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                Mark Attendance
                            </Button>
                        </Link>
                        <Link href="/results">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-results">
                                <FileText className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                Enter Grades
                            </Button>
                        </Link>
                        <Link href="/calendar">
                            <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-calendar">
                                <Calendar className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                                Academic Calendar
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Student Quick Actions (Default fallback)
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                    <Link href="/class-routine">
                        <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-routine">
                            <BookOpen className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                            Class Routine
                        </Button>
                    </Link>
                    <Link href="/student-attendance">
                        <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-attendance">
                            <ClipboardCheck className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                            My Attendance
                        </Button>
                    </Link>
                    <Link href="/my-reports">
                        <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-reports">
                            <TrendingUp className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                            My Progress
                        </Button>
                    </Link>
                    <Link href="/calendar">
                        <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-calendar">
                            <Calendar className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                            Academic Calendar
                        </Button>
                    </Link>
                    <Link href="/fees">
                        <Button className="bg-[#F4F5F6] hover:bg-[#E2E4E8] text-[#1A2E56] dark:bg-secondary dark:text-white dark:hover:bg-secondary/80 w-full justify-start gap-1.5 px-2.5 h-9 text-xs sm:text-sm sm:h-10 sm:gap-2 sm:px-4" data-testid="button-quick-fees">
                            <CreditCard className="h-3.5 w-3.5 ml-[5px] sm:ml-0 sm:h-4 sm:w-4" />
                            My Fees
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
