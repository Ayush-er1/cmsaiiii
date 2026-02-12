import { useState, useEffect } from "react";
import { Users, GraduationCap, BookOpen, ClipboardCheck, TrendingUp, Calendar, FileText, Bell, Plus, Edit, Trash2, ArrowRight, Building, Layers, Check, X, CreditCard } from "lucide-react";
import axios from "axios";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { buildApiUrl } from "@/lib/env";

// Initial stats with empty values
// Initial stats with empty values
const initialStats = {
  admin: [
    { title: "Total Students", value: "0", icon: Users },
    { title: "Active Programs", value: "0", icon: GraduationCap },
    { title: "Courses", value: "0", icon: BookOpen },
    { title: "Staff Members", value: "0", icon: Users },
  ],
  super_admin: [
    { title: "Total Students", value: "0", icon: Users },
    { title: "Active Programs", value: "0", icon: GraduationCap },
    { title: "Courses", value: "0", icon: BookOpen },
    { title: "Staff Members", value: "0", icon: Users },
  ],
  staff: [
    { title: "My Students", value: "0", icon: Users },
    { title: "Courses Teaching", value: "0", icon: BookOpen },
    { title: "Avg. Attendance", value: "0%", icon: ClipboardCheck },
    { title: "Pending Grades", value: "0", icon: FileText },
  ],
  student: [
    { title: "Enrolled Courses", value: "0", icon: BookOpen },
    { title: "Attendance Rate", value: "0%", icon: ClipboardCheck },
    { title: "Current GPA", value: "0.0", icon: TrendingUp },
    { title: "Pending Fees", value: "Rs. 0", icon: CreditCard },
  ],
  teacher: [
    { title: "My Students", value: "0", icon: Users },
    { title: "Courses Teaching", value: "0", icon: BookOpen },
    { title: "Avg. Attendance", value: "0%", icon: ClipboardCheck },
    { title: "Pending Grades", value: "0", icon: FileText },
  ],
};

const availableRoles = [
  { id: "all", label: "All Roles" },
  { id: "student", label: "Students" },
  { id: "staff", label: "Staff Member" },
  { id: "teacher", label: "Teachers" },
  { id: "admin", label: "Department Admins" },
];

const availableDepartments = [
  { id: "all", label: "All Departments" },
  { id: "Computer Science", label: "Computer Science" },
  { id: "Business Administration", label: "Business Administration" },
  { id: "Mechanical Engineering", label: "Mechanical Engineering" },
  { id: "Physics", label: "Physics" },
];

const availablePrograms = [
  { id: "Bachelor of Computer Science", label: "Bachelor of Computer Science", dept: "Computer Science" },
  { id: "Bachelor of Information Technology", label: "Bachelor of Information Technology", dept: "Computer Science" },
  { id: "Master of Business Administration", label: "Master of Business Administration", dept: "Business Administration" },
  { id: "Bachelor of Mechanical Engineering", label: "Bachelor of Mechanical Engineering", dept: "Mechanical Engineering" },
  { id: "Doctor of Philosophy in Physics", label: "Doctor of Philosophy in Physics", dept: "Physics" },
];

const departmentPrograms: Record<string, string[]> = {
  "Computer Science": ["Bachelor of Computer Science", "Bachelor of Information Technology"],
  "Business Administration": ["Master of Business Administration"],
  "Mechanical Engineering": ["Bachelor of Mechanical Engineering"],
  "Physics": ["Doctor of Philosophy in Physics"]
};

const availableGroups = [
  { id: "all", label: "All Groups" },
  { id: "Section A", label: "Section A" },
  { id: "Section B", label: "Section B" },
  { id: "Morning Batch", label: "Morning Batch" },
  { id: "Evening Batch", label: "Evening Batch" },
];



interface Announcement {
  id: number;
  title: string;
  date: string;
  content?: string;
  targetRoles: string[];
  targetDepartments: string[];
  targetPrograms: string[];
  targetGroups: string[];
}

export function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dashboardStats, setDashboardStats] = useState(initialStats);
  const [recentActivity, setRecentActivity] = useState<{ id: number; message: string; time: string }[]>([]);


  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    isEveryone: true,
    targetRoles: ["all"],
    targetDepartments: ["all"],
    targetPrograms: ["all"],
    targetGroups: ["all"],
  });

  // Fetch dashboard stats for super_admin
  useEffect(() => {
    if (user?.role === "super_admin") {
      const token = localStorage.getItem("access_token");

      axios
        .get(buildApiUrl("/admin/dashboard"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const { studentCount, courseCount } = response.data;
          setDashboardStats((prev) => ({
            ...prev,
            super_admin: prev.super_admin.map((stat) => {
              if (stat.title === "Total Students") {
                return { ...stat, value: String(studentCount) };
              }
              if (stat.title === "Courses") {
                return { ...stat, value: String(courseCount) };
              }
              return stat;
            }),
          }));
        })
        .catch((error) => {
          console.error("Failed to fetch dashboard stats", error);
        });
    }
  }, [user]);

  if (!user) return null;

  const stats = dashboardStats[user.role as keyof typeof dashboardStats] || dashboardStats.admin;
  const isSuperAdmin = user.role === "super_admin";
  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const isStaff = user.role === "staff" || user.role === "teacher";
  const cleanName = user.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').split(" ")[0];
  const primaryStat = stats[0];
  const ctaLabel = user.role === 'student' ? 'Check Attendance' : (isStaff ? 'Mark Attendance' : 'Manage Users');
  const ctaLink = user.role === 'student' ? '/attendance' : (isStaff ? '/attendance' : '/users');

  const handleOpenCreateDialog = () => {
    setEditingAnnouncementId(null);
    setAnnouncementForm({
      title: "",
      content: "",
      isEveryone: true,
      targetRoles: ["all"],
      targetDepartments: ["all"],
      targetPrograms: ["all"],
      targetGroups: ["all"]
    });
    setIsAnnouncementDialogOpen(true);
  };

  const handleOpenEditDialog = (announcement: Announcement) => {
    const isEveryone = announcement.targetRoles.includes("all") &&
      announcement.targetDepartments.includes("all") &&
      announcement.targetGroups.includes("all");

    setEditingAnnouncementId(announcement.id);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content || "",
      isEveryone,
      targetRoles: announcement.targetRoles || ["all"],
      targetDepartments: announcement.targetDepartments || ["all"],
      targetPrograms: announcement.targetPrograms || ["all"],
      targetGroups: announcement.targetGroups || ["all"],
    });
    setIsAnnouncementDialogOpen(true);
  };

  const handleSaveAnnouncement = () => {
    if (!announcementForm.title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }

    if (editingAnnouncementId) {
      setAnnouncements(announcements.map(a =>
        a.id === editingAnnouncementId
          ? { ...a, ...announcementForm }
          : a
      ));
      toast({ title: "Announcement updated successfully" });
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        ...announcementForm,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      toast({ title: "Announcement created successfully" });
    }

    setAnnouncementForm({ title: "", content: "", isEveryone: true, targetRoles: ["all"], targetDepartments: ["all"], targetPrograms: ["all"], targetGroups: ["all"] });
    setEditingAnnouncementId(null);
    setIsAnnouncementDialogOpen(false);
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (isSuperAdmin) return true;

    const roleMatch = a.targetRoles.includes("all") || a.targetRoles.includes(user.role);
    const deptMatch = a.targetDepartments.includes("all") || (user.department && a.targetDepartments.includes(user.department));
    const programMatch = a.targetPrograms?.includes("all") || (user.program && a.targetPrograms?.includes(user.program));
    const groupMatch = a.targetGroups?.includes("all") || (user.group && a.targetGroups?.includes(user.group));

    return roleMatch && deptMatch && programMatch && groupMatch;
  });

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast({ title: "Announcement deleted successfully" });
  };

  const handleViewDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailDialogOpen(true);
  };

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        <div className="bg-white dark:bg-card border border-[#243F76]/10 dark:border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="flex-1 space-y-1 z-10">
            <h2 className="text-2xl font-semibold text-[#1A2E56] dark:text-white" data-testid="text-welcome">
              Welcome back, {cleanName}!
            </h2>
            <div className="flex items-center gap-4 text-sm text-[#243F76]/70 dark:text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 ml-[5px] sm:ml-0" />
                <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="hidden sm:block w-px h-3 bg-[#243F76]/20 dark:bg-border" />
              <div className="flex items-center gap-1.5">
                <primaryStat.icon className="h-4 w-4 ml-[5px] sm:ml-0" />
                <span><span className="font-semibold">{primaryStat.value}</span> {primaryStat.title}</span>
              </div>
            </div>
          </div>

          <div className="z-10">
            <Link href={ctaLink}>
              <Button className="bg-[#106bc6] hover:bg-[#0e5a9e] text-white gap-2 shadow-md h-9 md:h-11 px-5 md:px-8 text-sm md:text-base">
                {ctaLabel}
              </Button>
            </Link>
          </div>

          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-[#243F76]/5 dark:bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              {...stat}
              testId={`stat-card-${index}`}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {(isAdmin || isStaff) && (
            <Card className="bg-white dark:bg-zinc-900 border-[#243F76]/10 dark:border-white/10 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 bg-muted/20 border-b border-[#243F76]/5 dark:border-white/5">
                <CardTitle className="text-xs font-bold text-[#1A2E56] dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#106bc6]" />
                  Recent Activity
                </CardTitle>
                <Link href="/activity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[#106bc6] border-[#106bc6]/20 bg-[#106bc6]/10 hover:bg-[#106bc6] hover:text-white font-bold text-[10px] transition-all"
                    data-testid="button-view-all-activity"
                  >
                    VIEW ALL
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-3 border-b border-dashed last:border-0 last:pb-0"
                        data-testid={`activity-item-${activity.id}`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#106bc6]/10 text-[#106bc6] flex-shrink-0">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A2E56] dark:text-gray-300">{activity.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={cn("bg-white dark:bg-zinc-900 border-[#243F76]/10 dark:border-white/10 shadow-sm overflow-hidden", !(isAdmin || isStaff) ? "lg:col-span-2" : "")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 bg-muted/20 border-b border-[#243F76]/5 dark:border-white/5">
              <CardTitle className="text-xs font-bold text-[#1A2E56] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[#106bc6]" />
                Announcements
              </CardTitle>
              {isSuperAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenCreateDialog}
                  className="h-7 px-2 text-[10px] font-bold border-[#106bc6]/20 bg-[#106bc6]/10 text-[#106bc6] hover:bg-[#106bc6] hover:text-white transition-all gap-1"
                  data-testid="button-new-announcement"
                >
                  <Plus className="h-3 w-3" />
                  NEW
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start justify-between gap-4 pb-3 border-b border-dashed last:border-0 last:pb-0 group"
                    data-testid={`announcement-item-${announcement.id}`}
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer hover:text-[#106bc6] transition-colors"
                      onClick={() => handleViewDetails(announcement)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#1A2E56] dark:text-gray-300">{announcement.title}</p>
                        {isSuperAdmin && announcement.targetRoles.includes("all") && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 font-bold bg-[#106bc6]/10 text-[#106bc6] border-none">PUBLIC</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {announcement.date}
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/30"
                          onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(announcement); }}
                          data-testid={`button-edit-announcement-${announcement.id}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive bg-destructive/10 hover:bg-destructive hover:text-white"
                          onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(announcement.id); }}
                          data-testid={`button-delete-announcement-${announcement.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
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
        )}

        {isStaff && (
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
        )}

        {!isAdmin && !isStaff && (
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
        )}
      </div>

      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnnouncementId ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
              <TabsTrigger value="content" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
                Content
              </TabsTrigger>
              <TabsTrigger value="targeting" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
                Targeting
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 pt-4 mt-0">
              <div className="grid gap-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="Announcement title"
                  data-testid="input-announcement-title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="announcement-content">Content</Label>
                <Textarea
                  id="announcement-content"
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  placeholder="Announcement details..."
                  rows={4}
                  data-testid="input-announcement-content"
                />
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4 pt-4 mt-0">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
                {/* Global Everyone Toggle */}
                <div
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                    announcementForm.isEveryone
                      ? "bg-[#106bc6]/5 border-[#106bc6]/30 shadow-sm dark:bg-[#106bc6]/10 dark:border-[#106bc6]/40"
                      : "bg-muted/30 border-border dark:bg-zinc-800/50 dark:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      announcementForm.isEveryone ? "bg-[#106bc6] text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A2E56] dark:text-white leading-tight">Public Audience</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Visibile to everyone across all departments</p>
                    </div>
                  </div>
                  <Checkbox
                    id="is-everyone"
                    checked={announcementForm.isEveryone}
                    onCheckedChange={(checked) => {
                      setAnnouncementForm({
                        ...announcementForm,
                        isEveryone: !!checked,
                        targetRoles: checked ? ["all"] : [],
                        targetDepartments: checked ? ["all"] : [],
                        targetPrograms: checked ? ["all"] : [],
                        targetGroups: checked ? ["all"] : [],
                      });
                    }}
                    className="h-5 w-5 data-[state=checked]:bg-[#106bc6] data-[state=checked]:border-[#106bc6]"
                  />
                </div>

                {!announcementForm.isEveryone && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Specific Targeting</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Roles Targeting */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden dark:bg-zinc-950 dark:border-white/10">
                      <div className="flex flex-row items-center justify-between p-3 px-4 bg-muted/30 border-b dark:bg-zinc-900/50 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#106bc6]" />
                          <Label className="font-bold text-[#1A2E56] dark:text-white">Target Roles</Label>
                        </div>
                      </div>
                      <div className="p-4 pt-3">
                        <div className="grid grid-cols-2 gap-3">
                          {availableRoles.map((role) => {
                            const isSelected = announcementForm.targetRoles.includes(role.id);
                            return (
                              <div
                                key={role.id}
                                className={cn(
                                  "flex items-center space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer",
                                  isSelected
                                    ? "bg-[#106bc6]/5 border-[#106bc6]/20 dark:bg-[#106bc6]/10 dark:border-[#106bc6]/40"
                                    : "hover:bg-muted/50 border-transparent dark:hover:bg-zinc-800/50"
                                )}
                                onClick={() => {
                                  let updated;
                                  if (role.id === "all") {
                                    updated = isSelected ? [] : ["all"];
                                  } else {
                                    if (announcementForm.targetRoles.includes("all")) {
                                      updated = [role.id];
                                    } else {
                                      updated = isSelected
                                        ? announcementForm.targetRoles.filter(r => r !== role.id)
                                        : [...announcementForm.targetRoles, role.id];
                                    }
                                  }
                                  setAnnouncementForm({
                                    ...announcementForm,
                                    targetRoles: updated
                                  });
                                }}
                              >
                                {isSelected ? (
                                  <div className="h-4 w-4 rounded-sm bg-[#106bc6] flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="h-4 w-4 rounded-sm border border-muted-foreground/30" />
                                )}
                                <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer font-medium">{role.label}</Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Departments Targeting */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden dark:bg-zinc-950 dark:border-white/10">
                      <div className="flex flex-row items-center justify-between p-3 px-4 bg-muted/30 border-b dark:bg-zinc-900/50 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-[#106bc6]" />
                          <Label className="font-bold text-[#1A2E56] dark:text-white">Departments</Label>
                        </div>
                      </div>
                      <div className="p-4 pt-3">
                        <div className="space-y-3">
                          {availableDepartments.slice(1).map((dept) => {
                            const isDeptSelected = announcementForm.targetDepartments.includes(dept.id);
                            return (
                              <div key={dept.id} className="space-y-2">
                                <div
                                  className={cn(
                                    "flex items-center space-x-2.5 p-2.5 rounded-lg border transition-all cursor-pointer",
                                    isDeptSelected
                                      ? "bg-[#106bc6]/5 border-[#106bc6]/20 dark:bg-[#106bc6]/10 dark:border-[#106bc6]/40"
                                      : "hover:bg-muted/50 border-transparent dark:hover:bg-zinc-800/50"
                                  )}
                                  onClick={() => {
                                    const updatedDepts = isDeptSelected
                                      ? announcementForm.targetDepartments.filter(d => d !== dept.id)
                                      : [...announcementForm.targetDepartments, dept.id];

                                    const deptProgs = departmentPrograms[dept.id] || [];
                                    let updatedProgs = [...announcementForm.targetPrograms];

                                    // If unselecting dept, unselect its programs? Or keep them? 
                                    // Usually "Dept" is a broad bucket. If I unselect Dept, I probably want to unselect programs.
                                    if (!isDeptSelected) {
                                      // Auto-select all programs when department is selected
                                      updatedProgs = Array.from(new Set([...updatedProgs, ...deptProgs]));
                                    } else {
                                      // Unselect all programs when department is unselected
                                      updatedProgs = updatedProgs.filter(p => !deptProgs.includes(p));
                                    }

                                    setAnnouncementForm({
                                      ...announcementForm,
                                      targetDepartments: updatedDepts,
                                      targetPrograms: updatedProgs
                                    });
                                  }}
                                >
                                  {isDeptSelected ? (
                                    <div className="h-4 w-4 rounded-sm bg-[#106bc6] flex items-center justify-center">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  ) : (
                                    <div className="h-4 w-4 rounded-sm border border-muted-foreground/30" />
                                  )}
                                  <Label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer font-bold">{dept.label}</Label>
                                </div>

                                {(() => {
                                  const deptProgs = departmentPrograms[dept.id] || [];
                                  const hasProgramsSelected = deptProgs.some(pId => announcementForm.targetPrograms.includes(pId));
                                  return (isDeptSelected || hasProgramsSelected) ? (
                                    <div className="ml-4 pl-4 border-l-2 border-[#106bc6]/20 grid grid-cols-1 gap-1.5 py-1 animate-in fade-in slide-in-from-left-2">
                                      {availablePrograms.filter(p => p.dept === dept.id).map((prog) => {
                                        const isProgSelected = announcementForm.targetPrograms.includes(prog.id);
                                        return (
                                          <div
                                            key={prog.id}
                                            className={cn(
                                              "flex items-center space-x-2 p-1.5 rounded-md cursor-pointer",
                                              isProgSelected ? "text-[#106bc6] font-medium" : "text-muted-foreground hover:bg-muted/40"
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const updatedProgs = isProgSelected
                                                ? announcementForm.targetPrograms.filter(p => p !== prog.id)
                                                : [...announcementForm.targetPrograms, prog.id];

                                              // Synchronize department checkbox based on programs
                                              const deptProgs = departmentPrograms[dept.id] || [];
                                              const allDeptProgsSelected = deptProgs.every(pId => updatedProgs.includes(pId));

                                              let updatedDepts = [...announcementForm.targetDepartments];
                                              if (allDeptProgsSelected) {
                                                if (!updatedDepts.includes(dept.id)) {
                                                  updatedDepts.push(dept.id);
                                                }
                                              } else {
                                                updatedDepts = updatedDepts.filter(d => d !== dept.id);
                                              }

                                              setAnnouncementForm({
                                                ...announcementForm,
                                                targetDepartments: updatedDepts,
                                                targetPrograms: updatedProgs
                                              });
                                            }}
                                          >
                                            <Checkbox
                                              id={`prog-${prog.id}`}
                                              checked={isProgSelected}
                                              onCheckedChange={() => { }} // Handled by div onClick
                                              className="h-3.5 w-3.5 data-[state=checked]:bg-[#106bc6] data-[state=checked]:border-[#106bc6]"
                                            />
                                            <Label htmlFor={`prog-${prog.id}`} className="text-xs cursor-pointer">{prog.label}</Label>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null;;
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Groups Targeting */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden dark:bg-zinc-950 dark:border-white/10">
                      <div className="flex flex-row items-center justify-between p-3 px-4 bg-muted/30 border-b dark:bg-zinc-900/50 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#106bc6]" />
                          <Label className="font-bold text-[#1A2E56] dark:text-white">Groups / Sections</Label>
                        </div>
                      </div>
                      <div className="p-4 pt-3">
                        <div className="grid grid-cols-2 gap-3">
                          {availableGroups.slice(1).map((grp) => {
                            const isGroupSelected = announcementForm.targetGroups.includes(grp.id);
                            return (
                              <div
                                key={grp.id}
                                className={cn(
                                  "flex items-center space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer",
                                  isGroupSelected ? "bg-[#106bc6]/5 border-[#106bc6]/20" : "hover:bg-muted/50 border-transparent"
                                )}
                                onClick={() => {
                                  const updated = isGroupSelected
                                    ? announcementForm.targetGroups.filter(g => g !== grp.id)
                                    : [...announcementForm.targetGroups, grp.id];
                                  setAnnouncementForm({
                                    ...announcementForm,
                                    targetGroups: updated
                                  });
                                }}
                              >
                                {isGroupSelected ? (
                                  <div className="h-4 w-4 rounded-sm bg-[#106bc6] flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="h-4 w-4 rounded-sm border border-muted-foreground/30" />
                                )}
                                <Label htmlFor={`grp-${grp.id}`} className="text-sm cursor-pointer font-medium">{grp.label}</Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAnnouncement} data-testid="button-save-announcement" className="bg-primary shadow-sm">
              {editingAnnouncementId ? "Update" : "Create"} Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {selectedAnnouncement?.date}
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {selectedAnnouncement?.content || "No additional details provided."}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout >
  );
}

export default DashboardPage;
