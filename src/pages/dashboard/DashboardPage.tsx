import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Users, GraduationCap, BookOpen } from "lucide-react";

import { DashboardWelcomeBanner } from "@/components/features/dashboard/DashboardWelcomeBanner";
import { DashboardStats } from "@/components/features/dashboard/DashboardStats";
import { DashboardAnnouncements } from "@/components/features/dashboard/DashboardAnnouncements";
import { DashboardQuickActions } from "@/components/features/dashboard/DashboardQuickActions";
import { AnnouncementDialog } from "@/components/features/dashboard/AnnouncementDialog";
import { AnnouncementDetailDialog } from "@/components/features/dashboard/AnnouncementDetailDialog";
import { Announcement, AnnouncementFormState } from "@/types/dashboard";

// Initial stats with empty values
const initialStats = [
  { title: "Total Students", value: "0", icon: Users },
  { title: "Active Programs", value: "0", icon: GraduationCap },
  { title: "Courses", value: "0", icon: BookOpen },
  { title: "Total Users", value: "0", icon: Users },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dashboardStats, setDashboardStats] = useState(initialStats);

  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // We track the editing ID to know if we are creating or updating
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);

  // We keep the selected announcement for details view
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // For the edit dialog, we need to pass the full object if editing
  const editingAnnouncement = editingAnnouncementId
    ? announcements.find(a => a.id === editingAnnouncementId)
    : null;

  // Fetch dashboard stats
  useEffect(() => {
    if (user) {
      import("@/lib/api").then((module) => {
        const api = module.default;
        api.get("/dashboard")
          .then((response) => {
            const { studentCount, courseCount, programCount } = response.data;
            setDashboardStats((prev) =>
              prev.map((stat) => {
                if (stat.title === "Total Students") return { ...stat, value: String(studentCount) };
                if (stat.title === "Courses") return { ...stat, value: String(courseCount) };
                if (stat.title === "Active Programs") return { ...stat, value: String(programCount) };
                return stat;
              })
            );
          })
          .catch((error) => {
            console.error("Failed to fetch dashboard stats", error);
          });
      });
    }
  }, [user]);

  if (!user) return null;

  const isSuperAdmin = user.role === "super_admin";

  const handleOpenCreateDialog = () => {
    setEditingAnnouncementId(null);
    setIsAnnouncementDialogOpen(true);
  };

  const handleOpenEditDialog = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setIsAnnouncementDialogOpen(true);
  };

  const handleSaveAnnouncement = (formData: AnnouncementFormState) => {
    if (!formData.title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }

    if (editingAnnouncementId) {
      setAnnouncements(announcements.map(a =>
        a.id === editingAnnouncementId
          ? { ...a, ...formData, id: a.id, date: a.date } // Preserve id and date
          : a
      ));
      toast({ title: "Announcement updated successfully" });
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        ...formData,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      toast({ title: "Announcement created successfully" });
    }

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
        <DashboardWelcomeBanner user={user} />

        <DashboardStats stats={dashboardStats} />

        <div className="grid gap-6 grid-cols-1">
          <DashboardAnnouncements
            announcements={filteredAnnouncements}
            isSuperAdmin={isSuperAdmin}
            onNew={handleOpenCreateDialog}
            onEdit={handleOpenEditDialog}
            onDelete={handleDeleteAnnouncement}
            onView={handleViewDetails}
          />
        </div>

        <DashboardQuickActions user={user} />
      </div>

      <AnnouncementDialog
        open={isAnnouncementDialogOpen}
        onOpenChange={setIsAnnouncementDialogOpen}
        onSave={handleSaveAnnouncement}
        initialData={editingAnnouncement}
      />

      <AnnouncementDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        announcement={selectedAnnouncement}
      />
    </MainLayout>
  );
}

export default DashboardPage;
