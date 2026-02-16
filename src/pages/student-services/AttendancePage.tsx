
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/auth-context";
import { AdminAttendanceView } from "./attendance/AdminAttendanceView";
import { StudentAttendanceView } from "./attendance/StudentAttendanceView";

export function AttendancePage() {
  const { user, hasPermission } = useAuth();


  const showAdminView = user?.role === "super_admin" || user?.role === "admin" || user?.role === "staff";

  const title = showAdminView ? "Attendance Management" : "My Attendance";

  return (
    <MainLayout title={title}>
      {showAdminView ? <AdminAttendanceView /> : <StudentAttendanceView />}
    </MainLayout>
  );
}

export default AttendancePage;
