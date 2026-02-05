
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/auth-context";
import { AdminFeesView } from "./fees/AdminFeesView";
import { StudentFeesView } from "./fees/StudentFeesView";

export function FeesPage() {
    const { user, hasPermission } = useAuth();

    // Determine which view to show
    // Admins and Staff with 'fees_manage' permission see the Admin View
    const showAdminView = hasPermission("fees_manage");
    const title = showAdminView ? "Fees Management" : "Fees Overview";

    return (
        <MainLayout title={title}>
            {showAdminView ? <AdminFeesView /> : <StudentFeesView />}
        </MainLayout>
    );
}

export default FeesPage;
