import { useState, useRef, ChangeEvent, useEffect } from "react";
import { UserPlus, Search, Edit, Trash2, Shield, Mail, Phone, Calendar, MapPin, MoreHorizontal, Filter, X, Camera, Users, GraduationCap, Eye, EyeOff, Plus, ChevronDown, FileText, Upload, Download } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const userRole = user?.role || "super_admin";
  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";
  const staffAssignedCourses = user?.assignedCourses || [];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    subRoles: [] as string[],
    department: "",
    phone: "",
    status: "active" as "active" | "inactive",
    User_Id: "",
    password: "",
  });

  const [studentFormData, setStudentFormData] = useState<StudentFormData>({
    User_Id: "", // Legacy support, will sync
    universityId: "",
    dateOfBirth: "",
    gender: "",
    currentClass: "",
    semester: "",
    guardianName: "",
    guardianContact: "",
    guardianRelationship: "",
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [avatarUpload, setAvatarUpload] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newSubRole, setNewSubRole] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newDocuments, setNewDocuments] = useState<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
  }[]>([]);

  const newDocumentInputRef = useRef<HTMLInputElement>(null);

  const triggerNewDocumentInput = () => {
    newDocumentInputRef.current?.click();
  };

  const handleNewDocumentUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setNewDocuments(prev => [...prev, newDoc]);
      toast({ title: "Document added" });
    }
  };

  const removeNewDocument = (docId: string) => {
    setNewDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Image size should be less than 5MB", variant: "destructive" });
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarUpload(url);
      toast({ title: "Photo selected" });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const documentInputRef = useRef<HTMLInputElement>(null);

  const triggerDocumentInput = () => {
    documentInputRef.current?.click();
  };

  const handleDocumentUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedUser) {
      // Simulate upload
      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        uploadDate: new Date().toISOString().split('T')[0],
      };

      updateUser(selectedUser.id, {
        documents: [...(selectedUser.documents || []), newDoc]
      });

      // Update selected user immediately to reflect changes in UI
      setSelectedUser(prev => prev ? {
        ...prev,
        documents: [...(prev.documents || []), newDoc]
      } : null);

      toast({ title: "Document uploaded successfully" });
    }
  };

  const deleteDocument = (docId: string) => {
    if (selectedUser) {
      updateUser(selectedUser.id, {
        documents: selectedUser.documents?.filter(d => d.id !== docId)
      });

      setSelectedUser(prev => prev ? {
        ...prev,
        documents: prev.documents?.filter(d => d.id !== docId)
      } : null);

      toast({ title: "Document removed" });
    }
  };

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
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const handleEdit = (user: UserRecord) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      subRoles: user.subRoles || [],
      department: user.department,
      phone: user.phone || "",
      status: user.status,
      User_Id: user.User_Id || "",
      password: "", // Always start empty when editing
    });

    setStudentFormData({
      User_Id: user.User_Id || "",
      universityId: user.universityId || "",
      dateOfBirth: user.dateOfBirth || "",
      gender: user.gender || "",
      currentClass: user.currentClass || "",
      semester: user.semester || "",
      guardianName: user.guardianName || "",
      guardianContact: user.guardianContact || "",
      guardianRelationship: user.guardianRelationship || "",
    });
    setAvatarUpload(user.avatarUrl || null);
    setShowPassword(false);
    setIsDialogOpen(true);
    setIsSheetOpen(false); // Close sheet if open
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.department) {
      toast({ title: "Please fill in all basic information fields", variant: "destructive" });
      return;
    }

    // Validate ID field based on role
    if (!formData.User_Id.trim()) {
      const idLabel = formData.role === "super_admin" ? "Super Admin ID" :
        formData.role === "admin" ? "Admin ID" :
          formData.role === "staff" ? "Staff ID" : "Student ID";
      toast({ title: `Please fill in ${idLabel}`, variant: "destructive" });
      return;
    }

    // Validate password field (required for new users)
    if (!editingUserId && !formData.password.trim()) {
      toast({ title: "Please set a password for the new user", variant: "destructive" });
      return;
    }

    // Validate password length
    if (formData.password.trim() && formData.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (formData.role === "student") {
      if (
        !studentFormData.dateOfBirth ||
        !studentFormData.gender ||
        !studentFormData.currentClass ||
        !studentFormData.semester ||
        !studentFormData.guardianName.trim() ||
        !studentFormData.guardianContact.trim() ||
        !studentFormData.guardianRelationship.trim()
      ) {
        toast({ title: "Please fill in all student details", variant: "destructive" });
        return;
      }
    }

    const baseUser = {
      // If editing, keep ID, else create new
      id: editingUserId || Date.now().toString(),
      ...formData,
      status: formData.status, // Explicitly set status from form
    };

    // When editing, only include password if it was changed
    if (editingUserId && !formData.password.trim()) {
      // Keep existing password by removing the empty password from baseUser
      const { password, ...userWithoutPassword } = baseUser;
      const existingPassword = users.find(u => u.id === editingUserId)?.password;

      const newUser: UserRecord = formData.role === "student"
        ? {
          ...userWithoutPassword,
          password: existingPassword,
          User_Id: formData.User_Id,
          universityId: studentFormData.universityId || `UNI${Date.now().toString().slice(-7)}`,
          dateOfBirth: studentFormData.dateOfBirth,
          gender: studentFormData.gender as UserRecord["gender"],
          currentClass: studentFormData.currentClass,
          semester: studentFormData.semester,
          guardianName: studentFormData.guardianName,
          guardianContact: studentFormData.guardianContact,
          guardianRelationship: studentFormData.guardianRelationship,
          enrollmentDate: users.find(u => u.id === editingUserId)?.enrollmentDate || new Date().toISOString().split("T")[0],
          avatarUrl: avatarUpload || undefined,
        }
        : { ...userWithoutPassword, password: existingPassword, User_Id: formData.User_Id, avatarUrl: avatarUpload || undefined };

      updateUser(editingUserId, newUser);
      toast({ title: "User updated successfully" });
      setIsDialogOpen(false);
      return;
    }

    const newUser: UserRecord = formData.role === "student"
      ? {
        ...baseUser,
        subRoles: formData.subRoles,
        User_Id: formData.User_Id,
        universityId: studentFormData.universityId || `UNI${Date.now().toString().slice(-7)}`,
        dateOfBirth: studentFormData.dateOfBirth,
        gender: studentFormData.gender as UserRecord["gender"],
        currentClass: studentFormData.currentClass,
        semester: studentFormData.semester,
        guardianName: studentFormData.guardianName,
        guardianContact: studentFormData.guardianContact,
        guardianRelationship: studentFormData.guardianRelationship,
        enrollmentDate: editingUserId ? (users.find(u => u.id === editingUserId)?.enrollmentDate || new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
        avatarUrl: avatarUpload || undefined,
      }
      : { ...baseUser, subRoles: formData.subRoles, User_Id: formData.User_Id, avatarUrl: avatarUpload || undefined, documents: newDocuments };

    if (editingUserId) {
      updateUser(editingUserId, newUser);
      toast({ title: "User updated successfully" });
    } else {
      // Logic for new user handled in page, but if fallback here:
      // addUser(newUser);
      // toast({ title: `${roleLabels[formData.role]} enrolled successfully` });
    }

    setIsDialogOpen(false);
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
    <MainLayout title={isStaff ? "My Students" : "Identity Management"}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingUserId ? "Edit User" : "Enroll New User"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUpload || ""} />
                  <AvatarFallback className="text-2xl">
                    {formData.name ? getInitials(formData.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 rounded-full"
                  onClick={triggerFileInput}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger data-testid="select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Main Roles</div>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Additional Sub-Roles (Optional)</Label>
                <div className="flex flex-col gap-3 p-3 bg-muted/20 dark:bg-black rounded-lg border border-border/50 dark:border-white/10">
                  {/* Selected Sub-roles Display */}
                  <div className="flex flex-wrap gap-2 min-h-[28px]">
                    {(!formData.subRoles || formData.subRoles.length === 0) && (
                      <span className="text-sm text-muted-foreground italic self-center">No sub-roles assigned</span>
                    )}
                    {formData.subRoles?.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="gap-1 h-7 px-3 pr-1 bg-white dark:bg-zinc-800 border-input pl-2.5"
                      >
                        {roleLabels[role] || role}
                        <button
                          type="button"
                          className="h-4 w-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center p-0.5 ml-1"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              subRoles: formData.subRoles?.filter(r => r !== role) || []
                            });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Add Sub-role Actions */}
                  <div className="w-full">
                    {/* Predefined Dropdown */}
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !formData.subRoles?.includes(value)) {
                          setFormData({
                            ...formData,
                            subRoles: [...(formData.subRoles || []), value]
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 bg-white dark:bg-zinc-950 border-input/60 w-full">
                        <SelectValue placeholder="Select standard role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels)
                          .filter(([id]) => !mainRoleIds.includes(id) && id !== 'super_admin')
                          .map(([id, label]) => (
                            <SelectItem
                              key={id}
                              value={id}
                              disabled={formData.subRoles?.includes(id)}
                            >
                              {label}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>



                <Separator />
                <p className="text-sm font-medium text-muted-foreground">Basic Information</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="enroll-user-fullname">Full Name</Label>
                    <Input
                      id="enroll-user-fullname"
                      name="enroll-user-fullname"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., John Smith"
                      data-testid="input-user-name"
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="enroll-user-email">Email</Label>
                    <Input
                      id="enroll-user-email"
                      name="enroll-user-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g., john.smith@college.edu"
                      data-testid="input-user-email"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={isAdmin ? user?.department : formData.department}
                      onValueChange={(v) => setFormData({ ...formData, department: v })}
                      disabled={isAdmin}
                    >
                      <SelectTrigger data-testid="select-user-department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments
                          .filter((d) => formData.role === "super_admin" || d !== "Administration")
                          .map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="enroll-user-phone">Phone</Label>
                    <Input
                      id="enroll-user-phone"
                      name="enroll-user-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g., +1 555-0100"
                      data-testid="input-user-phone"
                      autoComplete="off"
                    />
                  </div>
                </div>



                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="enroll-user-id">User ID</Label>
                    <Input
                      id="enroll-user-id"
                      name="enroll-user-id"
                      value={formData.User_Id}
                      onChange={(e) => setFormData({ ...formData, User_Id: e.target.value })}
                      placeholder="e.g., COL2024001"
                      data-testid="input-user-id"
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as "active" | "inactive" })}
                    >
                      <SelectTrigger data-testid="select-user-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="enroll-user-password">
                    {editingUserId ? "Password (leave blank to keep current)" : "Password"}
                    {!editingUserId && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="enroll-user-password"
                      name="enroll-user-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUserId ? "Enter new password to change" : "Set first-time password (min 6 chars)"}
                      data-testid="input-user-password"
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {editingUserId
                      ? "Only fill this field if you want to reset the user's password"
                      : "User will login with their User ID and this password"}
                  </p>
                </div>

                {formData.role === "student" && (
                  <>
                    <Separator />
                    <p className="text-sm font-medium text-muted-foreground">Student Identification</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="enroll-university-id">University ID</Label>
                        <Input
                          id="enroll-university-id"
                          name="enroll-university-id"
                          value={studentFormData.universityId}
                          onChange={(e) => setStudentFormData({ ...studentFormData, universityId: e.target.value })}
                          placeholder="e.g., UNI2024001"
                          data-testid="input-university-id"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <Separator />
                    <p className="text-sm font-medium text-muted-foreground">Personal Details</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={studentFormData.dateOfBirth}
                          onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                          data-testid="input-dob"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={studentFormData.gender}
                          onValueChange={(v) => setStudentFormData({ ...studentFormData, gender: v })}
                        >
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    <p className="text-sm font-medium text-muted-foreground">Academic Details</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="currentClass">Class</Label>
                        <Select
                          value={studentFormData.currentClass}
                          onValueChange={(v) => setStudentFormData({ ...studentFormData, currentClass: v })}
                        >
                          <SelectTrigger data-testid="select-class">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Select
                          value={studentFormData.semester}
                          onValueChange={(v) => setStudentFormData({ ...studentFormData, semester: v })}
                        >
                          <SelectTrigger data-testid="select-semester">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {semesters.map((s) => (
                              <SelectItem key={s} value={s}>
                                Semester {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />
                    <p className="text-sm font-medium text-muted-foreground">Guardian Information</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="guardianName">Guardian Name</Label>
                        <Input
                          id="guardianName"
                          value={studentFormData.guardianName}
                          onChange={(e) => setStudentFormData({ ...studentFormData, guardianName: e.target.value })}
                          placeholder="e.g., Robert Smith"
                          data-testid="input-guardian-name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="guardianContact">Guardian Contact</Label>
                        <Input
                          id="guardianContact"
                          value={studentFormData.guardianContact}
                          onChange={(e) => setStudentFormData({ ...studentFormData, guardianContact: e.target.value })}
                          placeholder="e.g., +1 555-0100"
                          data-testid="input-guardian-contact"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="guardianRelationship">Relationship</Label>
                      <Input
                        id="guardianRelationship"
                        value={studentFormData.guardianRelationship}
                        onChange={(e) =>
                          setStudentFormData({ ...studentFormData, guardianRelationship: e.target.value })
                        }
                        placeholder="e.g., Father"
                        data-testid="input-guardian-relationship"
                      />
                    </div>
                  </>
                )}


                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <input
                    type="file"
                    ref={newDocumentInputRef}
                    className="hidden"
                    onChange={handleNewDocumentUpload}
                  />
                  <Button variant="outline" size="sm" onClick={triggerNewDocumentInput} className="gap-2">
                    <Upload className="h-3 w-3" />
                    Add Document
                  </Button>
                </div>

                {newDocuments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {newDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50 text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeNewDocument(doc.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-user">
              {editingUserId ? "Update User" : "Enroll User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold" data-testid="text-detail-name">{selectedUser.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge className={roleColors[selectedUser.role as keyof typeof roleColors] || "bg-muted text-muted-foreground"}>
                      {roleLabels[selectedUser.role] || selectedUser.role}
                    </Badge>
                    {selectedUser.subRoles?.map(roleId => (
                      <Badge key={roleId} variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
                        {roleLabels[roleId] || roleId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />
              <p className="text-sm font-medium">Contact Information</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{selectedUser.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedUser.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedUser.status === "active" ? "secondary" : "outline"}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-4">
                {!isStaff && (
                  <Button
                    className="w-full"
                    onClick={() => handleEdit(selectedUser)}
                    data-testid="button-edit-from-sheet"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit User Details
                  </Button>
                )}
              </div>


              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Documents</p>
                <input
                  type="file"
                  ref={documentInputRef}
                  className="hidden"
                  onChange={handleDocumentUpload}
                />
                <Button variant="outline" size="sm" onClick={triggerDocumentInput} className="gap-2">
                  <Upload className="h-3 w-3" />
                  Upload
                </Button>
              </div>

              <div className="space-y-3">
                {selectedUser.documents && selectedUser.documents.length > 0 ? (
                  selectedUser.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded bg-background flex items-center justify-center border shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size} • {doc.uploadDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-md">
                    No documents uploaded
                  </div>
                )}
              </div>

              {selectedUser.role === "student" && (
                <>
                  <Separator />
                  <p className="text-sm font-medium">Student Identification</p>
                  <div className="space-y-3">
                    {selectedUser.User_Id && (
                      <div>
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="font-mono">{selectedUser.User_Id}</p>
                      </div>
                    )}
                    {selectedUser.universityId && (
                      <div>
                        <p className="text-sm text-muted-foreground">University ID</p>
                        <p className="font-mono">{selectedUser.universityId}</p>
                      </div>
                    )}
                  </div>

                  <Separator />
                  <p className="text-sm font-medium">Personal Details</p>
                  <div className="space-y-3">
                    {selectedUser.dateOfBirth && (
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p>{new Date(selectedUser.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedUser.gender && (
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="capitalize">{selectedUser.gender}</p>
                      </div>
                    )}
                  </div>

                  <Separator />
                  <p className="text-sm font-medium">Academic Details</p>
                  <div className="space-y-3">
                    {selectedUser.currentClass && (
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <p>{selectedUser.currentClass}</p>
                      </div>
                    )}
                    {selectedUser.semester && (
                      <div>
                        <p className="text-sm text-muted-foreground">Semester</p>
                        <p>Semester {selectedUser.semester}</p>
                      </div>
                    )}
                    {selectedUser.enrollmentDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Enrollment Date</p>
                        <p>{new Date(selectedUser.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {selectedUser.guardianName && (
                    <>
                      <Separator />
                      <p className="text-sm font-medium">Guardian Information</p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Guardian Name</p>
                          <p>{selectedUser.guardianName}</p>
                        </div>
                        {selectedUser.guardianContact && (
                          <div>
                            <p className="text-sm text-muted-foreground">Guardian Contact</p>
                            <p>{selectedUser.guardianContact}</p>
                          </div>
                        )}
                        {selectedUser.guardianRelationship && (
                          <div>
                            <p className="text-sm text-muted-foreground">Relationship</p>
                            <p>{selectedUser.guardianRelationship}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}


            </div>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout >
  );
}
