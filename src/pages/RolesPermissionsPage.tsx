import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { PERMISSION_GROUPS, type PermissionGroup } from "@/lib/permissions";
import {
    Save,
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardCheck,
    FileBarChart,
    User,
    Settings,
    CreditCard,
    CalendarDays,
    ShieldAlert,
    Shield,
    X,
    ChevronRight,
    Lock,
    Eye,
    Plus,
    PlusCircle,
    Info,
    ArrowLeft,
    ChevronLeft
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, any> = {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardCheck,
    FileBarChart,
    User,
    Settings,
    CreditCard,
    CalendarDays,
};

const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: "Super Administrator",
    admin: "Administrator",
    staff: "Staff Member",
    student: "Student",
    teacher: "Teacher",
    student_council_president: "Student Council President",
    student_council_member: "Student Council Member",
    sports_committee_member: "Sports Committee Member",
};

// Permissions that are mandatory for specific roles
const MANDATORY_PERMISSIONS: Record<string, string[]> = {
    super_admin: PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.id)),
};

// Groups that are mandatory for specific roles
const MANDATORY_GROUPS: Record<string, string[]> = {
    super_admin: PERMISSION_GROUPS.map(g => g.id),
};

export function RolesPermissionsPage() {
    const { permissions, updatePermissions } = useAuth();
    const { toast } = useToast();

    // UI State
    const [viewMode, setViewMode] = useState<"list" | "manage">("list");
    const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
    const [localPermissions, setLocalPermissions] = useState(permissions);
    const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);

    // Dynamic Data State
    const [roleLabels, setRoleLabels] = useState<Record<string, string>>({
        ...ROLE_LABELS,
        student_council_president: "Student Council President"
    });
    const [mainRoleIds, setMainRoleIds] = useState<string[]>(['admin', 'staff', 'student', 'teacher']);
    const [dynamicPermissionGroups, setDynamicPermissionGroups] = useState(PERMISSION_GROUPS);

    // Form State
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleType, setNewRoleType] = useState<"main" | "sub">("sub");

    const handleOpenEdit = (role: UserRole) => {
        setSelectedRole(role);
        setLocalPermissions(permissions); // Reset to latest saved state when opening
        setViewMode("manage");
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const handleBackToList = () => {
        setViewMode("list");
    };

    const handleAddRole = () => {
        if (!newRoleName) return;

        // Auto-generate role ID from display name
        const roleId = newRoleName.toLowerCase().replace(/\s+/g, '_');

        // Sub-roles start with empty permissions that can be configured manually
        const initialPerms: string[] = [];

        setRoleLabels(prev => ({ ...prev, [roleId]: newRoleName }));
        setLocalPermissions(prev => ({ ...prev, [roleId]: initialPerms }));

        if (newRoleType === "main") {
            setMainRoleIds(prev => [...prev, roleId]);
        }

        setIsAddRoleDialogOpen(false);
        setNewRoleName("");
        setNewRoleType("sub");

        toast({
            title: "Role Created",
            description: `The new ${newRoleType} role "${newRoleName}" has been created. Configure its permissions in the management panel.`,
        });
    };



    const isMandatory = (role: string, permissionId: string) => {
        return MANDATORY_PERMISSIONS[role]?.includes(permissionId);
    };

    const isGroupMandatory = (role: string, groupId: string) => {
        return MANDATORY_GROUPS[role]?.includes(groupId);
    };

    const handleTogglePermission = (role: UserRole, permissionId: string) => {
        if (isMandatory(role, permissionId)) return;

        const rolePerms = localPermissions[role] || [];
        const newRolePerms = rolePerms.includes(permissionId)
            ? rolePerms.filter(id => id !== permissionId)
            : [...rolePerms, permissionId];

        setLocalPermissions({
            ...localPermissions,
            [role]: newRolePerms
        });
    };

    const handleToggleGroup = (role: UserRole, group: PermissionGroup, checked: boolean) => {
        if (isGroupMandatory(role, group.id)) return;

        const groupPermIds = group.permissions.map(p => p.id);
        const rolePerms = localPermissions[role] || [];

        let newRolePerms: string[];
        if (checked) {
            // Add all group permissions that aren't already there
            newRolePerms = Array.from(new Set([...rolePerms, ...groupPermIds]));
        } else {
            // Remove all group permissions, but keep mandatory ones
            newRolePerms = rolePerms.filter(id => !groupPermIds.includes(id) || isMandatory(role, id));
        }

        setLocalPermissions({
            ...localPermissions,
            [role]: newRolePerms
        });
    };

    const handleSave = () => {
        updatePermissions(localPermissions);
        setViewMode("list");
        toast({
            title: "Permissions Updated",
            description: `${roleLabels[selectedRole] || selectedRole} permissions have been saved successfully.`,
        });
    };

    const isGroupFullyChecked = (role: UserRole, group: PermissionGroup) => {
        const rolePerms = localPermissions[role] || [];
        return group.permissions.every(p => rolePerms.includes(p.id));
    };

    const isGroupPartiallyChecked = (role: UserRole, group: PermissionGroup) => {
        const rolePerms = localPermissions[role] || [];
        const checkedCount = group.permissions.filter(p => rolePerms.includes(p.id)).length;
        return checkedCount > 0 && checkedCount < group.permissions.length;
    };

    const formatPermissionLabel = (id: string) => {
        return id
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <MainLayout title={viewMode === "list" ? "Roles & Permissions" : `${roleLabels[selectedRole] || selectedRole} Permissions`}>
            <div className="space-y-6">
                {viewMode === "list" ? (
                    <div className="animate-in fade-in duration-500">
                        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-border shadow-sm dark:border-white/10">
                            <div>
                                <h2 className="text-2xl font-bold text-[#1A2E56] dark:text-white">Role Management</h2>
                                <p className="text-sm text-muted-foreground mt-1">Configure and extend system access levels.</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    className="gap-2 bg-[#106bc6] hover:bg-[#0e5a9e] text-white"
                                    onClick={() => setIsAddRoleDialogOpen(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Role
                                </Button>
                            </div>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-8 pb-10">
                            {/* Main Roles Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="h-4 w-1 bg-[#106bc6] rounded-full" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Access Levels</h3>
                                </div>
                                {(Object.keys(roleLabels) as UserRole[])
                                    .filter(role => mainRoleIds.includes(role))
                                    .map((role) => (
                                        <Card key={role} className="group hover:border-[#106bc6]/40 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden border-border/60">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-slate-50 dark:bg-muted/50 rounded-xl text-[#106bc6] border border-border/50 group-hover:bg-[#106bc6] group-hover:text-white group-hover:border-[#106bc6] transition-colors duration-200">
                                                            <Shield className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-[#1A2E56] dark:text-white">
                                                                {roleLabels[role] || role}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none text-[10px] font-bold p-0 px-2 h-5">
                                                                    {permissions[role]?.length || 0} ACTIVE PERMISSIONS
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground capitalize">
                                                                    System Role
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleOpenEdit(role)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-fit sm:w-auto gap-2 border-[#106bc6]/20 text-[#106bc6] hover:bg-[#106bc6]/5 hover:text-[#106bc6] font-bold text-xs md:text-sm dark:border-blue-800/20 dark:text-blue-400 dark:hover:bg-blue-400/5 dark:hover:text-blue-300"
                                                    >
                                                        Manage Permissions
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>

                            {/* Sub Roles Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="h-4 w-1 bg-amber-500 rounded-full" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sub-Roles & Special Positions</h3>
                                </div>
                                {(Object.keys(roleLabels) as UserRole[])
                                    .filter(role => !mainRoleIds.includes(role) && role !== 'super_admin')
                                    .map((role) => (
                                        <Card key={role} className="group hover:border-amber-500/40 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden border-border/60 bg-slate-50/30 dark:bg-zinc-950">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl text-amber-600 border border-amber-100 dark:border-amber-900/30 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-colors duration-200">
                                                            <User className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold text-[#1A2E56] dark:text-white">
                                                                {roleLabels[role] || role}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <Badge variant="secondary" className="bg-blue-50 text-[#106bc6] dark:bg-blue-500/10 dark:text-blue-400 border-none text-[10px] font-bold p-0 px-2 h-5">
                                                                    {localPermissions[role]?.length || 0} ACTIVE PERMISSIONS
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                                    Custom Position
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleOpenEdit(role)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-fit sm:w-auto gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-bold text-xs md:text-sm dark:border-amber-900/50 dark:text-amber-500 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                                                    >
                                                        Manage Permissions
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
                        {/* Navigation Sub-header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-border shadow-sm dark:border-white/10">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleBackToList}
                                    className="rounded-full hover:bg-slate-100 dark:hover:bg-muted"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lock className="h-4 w-4 text-[#106bc6]" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#106bc6]">System Access Control</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1A2E56] dark:text-white">
                                        {roleLabels[selectedRole] || selectedRole} Configuration
                                    </h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button
                                    variant="ghost"
                                    onClick={handleBackToList}
                                    className="flex-1 sm:flex-none"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 sm:flex-none bg-[#106bc6] hover:bg-[#0e5a9e] text-white px-8 gap-2 shadow-md shadow-blue-500/10"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                        {/* Summary Band */}
                        <div className="flex items-center gap-2 px-1">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Select the modules and specific privileges allowed for this role. Some mandatory permissions cannot be disabled.
                            </p>
                        </div>

                        {/* Permission Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dynamicPermissionGroups.map((group) => {
                                const Icon = ICON_MAP[group.icon] || LayoutDashboard;
                                const isFullyChecked = isGroupFullyChecked(selectedRole, group);
                                const isPartiallyChecked = isGroupPartiallyChecked(selectedRole, group);
                                const isGroupDisabled = isGroupMandatory(selectedRole, group.id);

                                return (
                                    <Card key={group.id} className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="px-4 py-2.5 bg-muted/50 flex items-center justify-between border-b border-border/60">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${isFullyChecked || isPartiallyChecked ? "bg-[#106bc6] text-white shadow-sm" : "bg-background text-muted-foreground border border-border/50"}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                </div>
                                                <label className={cn("text-sm font-bold", isGroupDisabled && "opacity-70")}>
                                                    {group.name}
                                                </label>
                                            </div>
                                            <Checkbox
                                                checked={isFullyChecked}
                                                disabled={isGroupDisabled}
                                                // @ts-ignore
                                                indeterminate={isPartiallyChecked}
                                                onCheckedChange={(checked) => handleToggleGroup(selectedRole, group, !!checked)}
                                                className="h-4 w-4 data-[state=checked]:bg-[#106bc6] data-[state=checked]:border-[#106bc6] rounded-md"
                                            />
                                        </div>

                                        <div className="p-2.5 space-y-0.5">
                                            {group.permissions.map((permission) => {
                                                const isDisabled = isMandatory(selectedRole, permission.id);
                                                const isChecked = localPermissions[selectedRole]?.includes(permission.id);

                                                return (
                                                    <div
                                                        key={permission.id}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 rounded-lg transition-all group/perm",
                                                            !isDisabled ? "hover:bg-muted/50 cursor-pointer" : "opacity-80 active:scale-[0.98]",
                                                            isChecked ? "bg-[#106bc6]/5" : ""
                                                        )}
                                                        onClick={!isDisabled ? () => handleTogglePermission(selectedRole, permission.id) : undefined}
                                                    >
                                                        <Checkbox
                                                            checked={isChecked}
                                                            disabled={isDisabled}
                                                            className={cn(
                                                                "h-4 w-4 border-2 transition-all",
                                                                isChecked
                                                                    ? "data-[state=checked]:bg-[#106bc6] data-[state=checked]:border-[#106bc6] rounded-md"
                                                                    : "border-[#106bc6]/30 rounded-md group-hover/perm:border-[#106bc6]/60"
                                                            )}
                                                        />
                                                        <div className="flex-1 flex items-center justify-between min-w-0">
                                                            <span className={cn(
                                                                "text-xs font-medium transition-colors",
                                                                isDisabled ? "text-muted-foreground/60" : "",
                                                                isChecked && "text-[#106bc6] dark:text-blue-400 font-bold"
                                                            )}>
                                                                {formatPermissionLabel(permission.id)}
                                                            </span>
                                                            {isDisabled && <ShieldAlert className="h-3.5 w-3.5 text-amber-500/50" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Page Footer Actions */}

                    </div>
                )}

                <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Add a new system role or position with independent permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="role-type">Role Category</Label>
                                <Select onValueChange={(v: "main" | "sub") => setNewRoleType(v)} value={newRoleType}>
                                    <SelectTrigger id="role-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main">Main Role (Primary Access)</SelectItem>
                                        <SelectItem value="sub">Sub Role (Special Position)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role-name">Display Name</Label>
                                <Input
                                    id="role-name"
                                    placeholder="e.g. Student Council Head"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddRoleDialogOpen(false)}>Cancel</Button>
                            <Button className="bg-[#106bc6] text-white" onClick={handleAddRole}>Create Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}

export default RolesPermissionsPage;
