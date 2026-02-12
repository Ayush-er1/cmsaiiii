import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { UserProvider } from "@/lib/user-context";
import { LoginPage } from "@/pages/auth/LoginPage";
import { CallbackPage } from "@/pages/auth/CallbackPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProgramsPage } from "@/pages/academics/ProgramsPage";
import { DepartmentsPage } from "@/pages/academics/DepartmentsPage";
import { CoursesPage } from "@/pages/academics/CoursesPage";
import { UsersPage } from "@/pages/administration/UsersPage";
import { EnrollUserPage } from "@/pages/administration/EnrollUserPage";
import { UserDetailsPage } from "@/pages/administration/UserDetailsPage";
import { AttendancePage } from "@/pages/student-services/AttendancePage";
import { ResultsPage } from "@/pages/student-services/ResultsPage";
import { StudentReportsPage } from "@/pages/student-services/StudentReportsPage";

import { ClassRoutinePage } from "@/pages/academics/ClassRoutinePage";
import { ProfilePage } from "@/pages/user/ProfilePage";
import { ChangePasswordPage } from "@/pages/user/ChangePasswordPage";
import { FeesPage } from "@/pages/student-services/FeesPage";
// import { AdminFeesPage } from "@/pages/AdminFeesPage"; // Removed as it's unified
import { GroupsPage } from "@/pages/administration/GroupsPage";
import { RolesPermissionsPage } from "@/pages/administration/RolesPermissionsPage";
import { CalendarPage } from "@/pages/academics/CalendarPage";
import { ActivityPage } from "@/pages/dashboard/ActivityPage";
import NotFound from "@/pages/common/not-found";

function ProtectedRoute({
  component: Component,
  roles,
  permission
}: {
  component: React.ComponentType;
  roles?: string[];
  permission?: string;
}) {
  const { isAuthenticated, user, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Check permission if provided
  if (permission && !hasPermission(permission)) {
    return <Redirect to={permission === "dashboard_view" ? "/login" : "/dashboard"} />;
  }

  // Check roles if provided (and no permission was checked or already passed)
  if (roles && user && !roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  const protectedRoutes = [
    { path: "/dashboard", component: DashboardPage, permission: "dashboard_view" },
    { path: "/programs", component: ProgramsPage, permission: "programs_view" },
    { path: "/departments", component: DepartmentsPage, permission: "departments_manage" },
    { path: "/courses", component: CoursesPage, permission: "courses_view" },
    { path: "/users", component: UsersPage, permission: "users_view" },
    { path: "/users/enroll", component: EnrollUserPage, permission: "users_view" },
    { path: "/users/:id/edit", component: EnrollUserPage, permission: "users_view" },
    { path: "/users/:id", component: UserDetailsPage, permission: "users_view" },
    { path: "/attendance", component: AttendancePage, permission: "attendance_view" },
    { path: "/groups", component: GroupsPage, permission: "groups_manage" },
    { path: "/roles-permissions", component: RolesPermissionsPage, permission: "permissions_manage" },
    { path: "/results", component: ResultsPage, permission: "results_view" },
    { path: "/my-reports", component: StudentReportsPage, permission: "results_view" },
    { path: "/fees", component: FeesPage, permission: "fees_view" },
    { path: "/class-routine", component: ClassRoutinePage, permission: "routine_view" },
    { path: "/profile", component: ProfilePage, permission: "profile_view" },
    { path: "/change-password", component: ChangePasswordPage, permission: "password_change" },
    { path: "/calendar", component: CalendarPage, permission: "calendar_view" },
    { path: "/activity", component: ActivityPage, permission: "dashboard_view" },
  ];

  return (
    <Switch>
      <Route path="/login/oauth2/code/react-client" component={CallbackPage} />
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <LoginPage />}
      </Route>
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>

      {protectedRoutes.map((route) => (
        <Route key={route.path} path={route.path}>
          <ProtectedRoute component={route.component} permission={route.permission} />
        </Route>
      ))}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
