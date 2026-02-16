import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileText,
  User,
  BookOpen,
  ClipboardList,
  Building2,
  CalendarDays,
  CreditCard,
  Shield,
  Lock,
  UserCheck,
  Award,
  Clock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  permissionId: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    permissionId: "dashboard_view",
  },
  {
    title: "Academic Programs",
    url: "/programs",
    icon: GraduationCap,
    permissionId: "programs_view",
  },
  {
    title: "Departments",
    url: "/departments",
    icon: Building2,
    permissionId: "departments_manage",
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    permissionId: "courses_view",
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    permissionId: "users_view",
  },
  {
    title: "Groups & Orgs",
    url: "/groups",
    icon: Shield,
    permissionId: "groups_manage",
  },
  {
    title: "Access Control",
    url: "/roles-permissions",
    icon: Lock,
    permissionId: "permissions_manage",
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: UserCheck,
    permissionId: "attendance_view",
  },
  {
    title: "Results",
    url: "/results",
    icon: Award,
    permissionId: "results_view",
  },
  {
    title: "Class Routine",
    url: "/class-routine",
    icon: Clock,
    permissionId: "routine_view",
  },
  {
    title: "Fees",
    url: "/fees",
    icon: CreditCard,
    permissionId: "fees_view",
  },
  {
    title: "Academic Calendar",
    url: "/calendar",
    icon: CalendarDays,
    permissionId: "calendar_view",
  },
];

// Role constants moved to @/lib/constants

export function AppSidebar() {
  const [location] = useLocation();
  const { user, hasPermission } = useAuth();
  const { isMobile } = useSidebar();

  if (!user) return null;

  const filteredItems = navItems.filter((item) =>
    hasPermission(item.permissionId)
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className={cn("top-[72px] h-[calc(100svh-72px)]", isMobile && "top-0 h-svh")}>
      <SidebarHeader className={cn("p-4 border-b border-sidebar-border", !isMobile && "hidden")}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground ml-[5px]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight" data-testid="text-app-name">MetaHorizon</span>
            <span className="text-xs text-muted-foreground leading-tight">College Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.url.slice(1)}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


    </Sidebar>
  );
}
