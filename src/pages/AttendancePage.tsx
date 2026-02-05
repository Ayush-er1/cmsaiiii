
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/auth-context";
import { AdminAttendanceView } from "./attendance/AdminAttendanceView";
import { StudentAttendanceView } from "./attendance/StudentAttendanceView";

export function AttendancePage() {
  const { user, hasPermission } = useAuth();

  // Determine which view to show
  // Admins and Staff with 'attendance_mark' (or similar) permission see the Admin View logic
  // But typically Staff see "Admin" view for marking, Students see "Student" view
  const showAdminView = user?.role === "super_admin" || user?.role === "admin" || user?.role === "staff";

  const title = showAdminView ? "Attendance Management" : "My Attendance";

  return (
    <MainLayout title={title}>
      {showAdminView ? <AdminAttendanceView /> : <StudentAttendanceView />}
    </MainLayout>
  );
}

export default AttendancePage;
