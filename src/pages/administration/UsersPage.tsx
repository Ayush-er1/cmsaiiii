import { useState, useEffect } from "react";
import { UserPlus, Search, Edit, Trash2, Shield, Filter, X, Users, GraduationCap, ChevronDown } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { useUser, type UserRecord } from "@/lib/user-context";
import { Link, useLocation } from "wouter";



const departments = [
  "Administration",
  "Computer Science",
  "Business Administration",
  "Mechanical Engineering",
  "Physics",
  "Mathematics",
];

const classes = [
  "BCS Year 1",
  "BCS Year 2",
  "BCS Year 3",
  "BCS Year 4",
  "MBA Year 1",
  "MBA Year 2",
  "BME Year 1",
  "BME Year 2",
  "BME Year 3",
  "BME Year 4",
];

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];



const roleColors: Record<string, string> = {
  super_admin: "bg-destructive text-destructive-foreground",
  admin: "bg-primary text-primary-foreground",
  staff: "bg-secondary text-secondary-foreground",
  student: "bg-muted text-muted-foreground",
  teacher: "bg-amber-500 text-white",
  student_council_president: "bg-indigo-500 text-white",
  student_council_member: "bg-indigo-400 text-white",
  sports_committee_member: "bg-emerald-500 text-white",
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
  student: "Student",
  teacher: "Teacher",
  student_council_president: "Student Council President",
  student_council_member: "Student Council Member",
  sports_committee_member: "Sports Committee Member",
};

const mainRoleIds = ['admin', 'staff', 'student', 'teacher'];

interface StudentFormData {
  User_Id: string;
  universityId: string;
  dateOfBirth: string;
  gender: string;
  currentClass: string;
  semester: string;
  guardianName: string;
  guardianContact: string;
  guardianRelationship: string;
}

export function UsersPage() {
  const { user } = useAuth();
  const { users, updateUser, deleteUser } = useUser(); // Using Context
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedSubRoles, setSelectedSubRoles] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState("all");

  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const userRole = user?.role || "super_admin";
  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";
  const staffAssignedCourses = user?.assignedCourses || [];



  const [courseFilter, setCourseFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Reset course and class filters when admin or super_admin role is selected
  useEffect(() => {
    if (roleFilter === "admin" || roleFilter === "super_admin") {
      setCourseFilter("all");
      setClassFilter("all");
    }
  }, [roleFilter]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.User_Id && u.User_Id.toLowerCase().includes(search.toLowerCase())) ||
      (u.subRoles && u.subRoles.some(role =>
        (roleLabels[role] || role).toLowerCase().includes(search.toLowerCase())
      ));

    // Role filters
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSubRole = selectedSubRoles.length === 0 ||
      (u.subRoles && selectedSubRoles.some(role => u.subRoles?.includes(role)));

    // Department filter - Admin can only see their own department
    const matchesDept = isAdmin
      ? u.department === user?.department
      : (deptFilter === "all" || u.department === deptFilter);

    const matchesClass = classFilter === "all" || u.currentClass === classFilter;

    // Course filter logic
    const matchesCourse = courseFilter === "all" || (u.enrolledCourses && u.enrolledCourses.includes(courseFilter));

    // Faculty can only see students enrolled in their assigned courses
    if (isStaff) {
      if (u.role !== "student") return false; // Staff only sees students
      const studentEnrolledCourses = u.enrolledCourses || [];
      const hasCommonCourse = studentEnrolledCourses.some(course =>
        staffAssignedCourses.includes(course)
      );
      if (!hasCommonCourse) return false;
    }

    // Admin (Department Admin) restriction: Can only see users in their department
    if (isAdmin && u.department !== user?.department) {
      return false;
    }

    return matchesSearch && matchesRole && matchesSubRole && matchesDept && matchesClass && matchesCourse;
  });

  const uniqueCourses = Array.from(new Set(users.flatMap(u => u.enrolledCourses || [])));
  // Filter courses for staff to only show what they teach
  const availableCourses = isStaff ? staffAssignedCourses : uniqueCourses;

  const openCreateDialog = () => {
    setLocation("/users/enroll");
  };

  const openUserDetails = (user: UserRecord) => {
    setLocation(`/users/${user.id}`);
  };

  const handleEdit = (user: UserRecord) => {
    // Navigate to enroll page with edit functionality (placeholder for now)
    // or we can reuse the enroll page by passing an ID if supported.
    // For now, let's just go to details which has edit button, or ideally specific edit route.
    setLocation(`/users/${user.id}/edit`);
  };

  const handleDelete = (id: string) => {
    deleteUser(id);
    toast({ title: "User removed", variant: "destructive" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout title={isStaff ? "My Students" : "User Management"}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-search-query"
                name="user-search-query"
                placeholder={isStaff ? "Search students..." : "Search by name, email, or ID..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-white dark:bg-zinc-950 border-[#243F76]/10 dark:border-white/10 shadow-sm"
                data-testid="input-search-users"
                autoComplete="off"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 w-11 shrink-0 ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'border-[#243F76]/10 dark:border-white/10'}`}
                title="Filter Options"
                data-testid="button-toggle-filters"
              >
                <Filter className="h-5 w-5" />
              </Button>

              {!isStaff && (
                <Button onClick={openCreateDialog} className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all" data-testid="button-add-user">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Enroll User</span>
                  <span className="sm:hidden">Enroll</span>
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <Card className="bg-white dark:bg-zinc-950 border-[#243F76]/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {!isStaff && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Role</Label>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" data-testid="select-role-filter">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                          {(isSuperAdmin || isAdmin) && <SelectItem value="admin">Admin</SelectItem>}
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!isStaff && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Sub Roles</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10 justify-between font-normal"
                          >
                            <span className="truncate">
                              {selectedSubRoles.length === 0
                                ? "Select Sub Roles"
                                : `${selectedSubRoles.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                          {Object.entries(roleLabels)
                            .filter(([id]) => !mainRoleIds.includes(id) && id !== 'super_admin')
                            .map(([id, label]) => (
                              <DropdownMenuCheckboxItem
                                key={id}
                                checked={selectedSubRoles.includes(id)}
                                onCheckedChange={(checked) => {
                                  setSelectedSubRoles(prev =>
                                    checked
                                      ? [...prev, id]
                                      : prev.filter(r => r !== id)
                                  );
                                }}
                              >
                                {label}
                              </DropdownMenuCheckboxItem>
                            ))
                          }
                          {selectedSubRoles.length > 0 && (
                            <>
                              <Separator className="my-1" />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start font-normal text-xs text-destructive hover:text-destructive"
                                onClick={() => setSelectedSubRoles([])}
                              >
                                Clear Selection
                              </Button>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {!isStaff && !isAdmin && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Department</Label>
                      <Select value={deptFilter} onValueChange={setDeptFilter}>
                        <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" data-testid="select-dept-filter">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Course</Label>
                    <Select
                      value={roleFilter === "admin" || roleFilter === "super_admin" ? "all" : courseFilter}
                      onValueChange={setCourseFilter}
                      disabled={roleFilter === "admin" || roleFilter === "super_admin"}
                    >
                      <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" data-testid="select-course-filter">
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {availableCourses.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Class/Section</Label>
                    <Select
                      value={roleFilter === "admin" || roleFilter === "super_admin" ? "all" : classFilter}
                      onValueChange={setClassFilter}
                      disabled={roleFilter === "admin" || roleFilter === "super_admin"}
                    >
                      <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" data-testid="select-class-filter">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(roleFilter !== "all" || selectedSubRoles.length > 0 || deptFilter !== "all" || courseFilter !== "all" || classFilter !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {roleFilter !== "all" && !isStaff && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setRoleFilter("all")}
                >
                  Role: {roleLabels[roleFilter as keyof typeof roleLabels]}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedSubRoles.map(roleId => (
                <Badge
                  key={roleId}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setSelectedSubRoles(prev => prev.filter(r => r !== roleId))}
                >
                  Sub Role: {roleLabels[roleId as keyof typeof roleLabels] || roleId}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {deptFilter !== "all" && !isStaff && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setDeptFilter("all")}
                >
                  Dept: {deptFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {courseFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setCourseFilter("all")}
                >
                  Course: {courseFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {classFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setClassFilter("all")}
                >
                  Class: {classFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}
        </div>
        {/* Statistics Dashboard */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="hover:shadow-md transition-all duration-300 border-[#243F76]/5 dark:border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A2E56] dark:text-white">{users.length}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Members</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-300 border-[#243F76]/5 dark:border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A2E56] dark:text-white">
                  {users.filter(u => u.role === 'student').length}
                </p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Students</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-300 border-[#243F76]/5 dark:border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A2E56] dark:text-white">
                  {users.filter(u => u.role === 'staff' || u.role === 'admin' || u.role === 'super_admin').length}
                </p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Staff & Admins</p>
              </div>
            </CardContent>
          </Card>
        </div>


        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Department</TableHead>
                  <TableHead className="hidden xl:table-cell">ID</TableHead>
                  <TableHead className="w-20 text-center">Status</TableHead>
                  {!isStaff && <TableHead className="w-24 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => openUserDetails(user)}
                    data-testid={`row-user-${user.id}`}
                  >
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground md:hidden">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role] || "bg-muted text-muted-foreground"}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {user.department}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell font-mono text-sm text-muted-foreground">
                      {user.User_Id || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={user.status === "active" ? "secondary" : "outline"}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    {!isStaff && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            data-testid={`button-edit-user-${user.id}`}
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {isStaff
            ? users.filter(u => u.role === "student" && (u.enrolledCourses || []).some(c => staffAssignedCourses.includes(c))).length
            : users.length} users
        </div>
      </div >
    </MainLayout >
  );
}
