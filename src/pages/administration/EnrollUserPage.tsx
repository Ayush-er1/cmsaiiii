import { useState, useRef, ChangeEvent } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useUser, type UserRecord } from "@/lib/user-context";
import { ArrowLeft, Camera, X, Upload, FileText, Eye, EyeOff, Check, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

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
    universityId: string;
    dateOfBirth: string;
    gender: string;
    currentClass: string;
    semester: string;
    guardianName: string;
    guardianContact: string;
    guardianRelationship: string;
}

export function EnrollUserPage() {
    const { user } = useAuth();
    const { addUser, updateUser, users } = useUser();
    const [location, setLocation] = useLocation();
    // Check if we are in edit mode
    const match = location.match(/\/users\/([^\/]+)\/edit/);
    const editingUserId = match ? match[1] : null;
    const { toast } = useToast();

    const isSuperAdmin = user?.role === "super_admin";
    const isAdmin = user?.role === "admin";

    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 State: Account Credentials
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Step 2 State: Profile & Details
    const [formData, setFormData] = useState({
        role: "student",
        subRoles: [] as string[],
        department: "",
        phone: "",
        status: "active" as "active" | "inactive",
    });

    const [studentFormData, setStudentFormData] = useState<StudentFormData>({
        universityId: "",
        dateOfBirth: "",
        gender: "",
        currentClass: "",
        semester: "",
        guardianName: "",
        guardianContact: "",
        guardianRelationship: "",
    });

    const [avatarUpload, setAvatarUpload] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
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

    // Load user data if editing
    import { useEffect as useEffectReact } from "react";
    useEffectReact(() => {
        if (editingUserId) {
            const userToEdit = users.find(u => u.id === editingUserId);
            if (userToEdit) {
                const [first, ...last] = userToEdit.name.split(" ");
                setFirstName(first || "");
                setLastName(last.join(" ") || "");
                setUserId(userToEdit.User_Id || "");
                setEmail(userToEdit.email);
                // Password usually not populated for security, left blank means unchanged

                setFormData({
                    role: userToEdit.role,
                    subRoles: userToEdit.subRoles || [],
                    department: userToEdit.department,
                    phone: userToEdit.phone || "",
                    status: userToEdit.status,
                });

                if (userToEdit.role === "student") {
                    setStudentFormData({
                        universityId: userToEdit.universityId || "",
                        dateOfBirth: userToEdit.dateOfBirth || "",
                        gender: userToEdit.gender || "",
                        currentClass: userToEdit.currentClass || "",
                        semester: userToEdit.semester || "",
                        guardianName: userToEdit.guardianName || "",
                        guardianContact: userToEdit.guardianContact || "",
                        guardianRelationship: userToEdit.guardianRelationship || "",
                    });
                }

                if (userToEdit.avatarUrl) {
                    setAvatarUpload(userToEdit.avatarUrl);
                }

                if (userToEdit.documents) {
                    setNewDocuments(userToEdit.documents);
                }
            }
        }
    }, [editingUserId, users]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleNextStep = () => {
        // Validate Step 1
        if (!firstName.trim()) {
            toast({ title: "First Name is required", variant: "destructive" });
            return;
        }
        if (!lastName.trim()) {
            toast({ title: "Last Name is required", variant: "destructive" });
            return;
        }
        if (!userId.trim()) {
            toast({ title: "User ID is required", variant: "destructive" });
            return;
        }
        if (!email.trim()) {
            toast({ title: "Email is required", variant: "destructive" });
            return;
        }
        if (!password.trim() || password.length < 6) {
            if (!editingUserId) {
                toast({ title: "Password must be at least 6 characters", variant: "destructive" });
                return;
            }
        }

        setCurrentStep(2);
    };

    const handleSave = () => {
        // Validate Step 2
        if (!formData.department && formData.role !== 'super_admin') {
            toast({ title: "Please select a Department", variant: "destructive" });
            return;
        }
        if (!formData.phone.trim()) {
            toast({ title: "Phone number is required", variant: "destructive" });
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

        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        const baseUser = {
            id: editingUserId || Date.now().toString(),
            name: fullName,
            email: email,
            role: formData.role,
            department: formData.department,
            phone: formData.phone,
            status: formData.status,
            User_Id: userId,
            // Only update password if non-empty in edit mode
            ...(editingUserId && password.trim() === "" ? {} : { password: password }),
        };

        const newUser: UserRecord = formData.role === "student"
            ? {
                ...baseUser,
                subRoles: formData.subRoles,
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
            : { ...baseUser, subRoles: formData.subRoles, avatarUrl: avatarUpload || undefined, documents: newDocuments };

        if (editingUserId) {
            // Keep existing password if not provided
            if (password.trim() === "") {
                const existingUser = users.find(u => u.id === editingUserId);
                if (existingUser) {
                    newUser.password = existingUser.password;
                }
            }
            updateUser(editingUserId, newUser);
            toast({ title: "User updated successfully" });
        } else {
            addUser(newUser);
            toast({ title: `${roleLabels[formData.role]} enrolled successfully` });
        }
        setLocation("/users");
    };

    return (
        <MainLayout title="Enroll New User">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setLocation("/users")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{editingUserId ? "Edit User" : "Enroll New User"}</h1>
                        <p className="text-muted-foreground">{editingUserId ? "Update user details." : "Complete the steps to add a new user."}</p>
                    </div>
                </div>

                {/* Wizard Steps Indicator */}
                <div className="flex items-center justify-between relative px-10">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted/50 -z-10" />

                    <div className="relative flex flex-col items-center gap-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${currentStep >= 1 ? 'border-primary bg-background text-primary' : 'border-muted-foreground bg-background text-muted-foreground'}`}>
                            <span className="font-bold">1</span>
                        </div>
                        <span className={`text-sm font-medium bg-background px-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Account Details</span>
                    </div>

                    <div className="relative flex flex-col items-center gap-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${currentStep >= 2 ? 'border-primary bg-background text-primary' : 'border-muted-foreground bg-background text-muted-foreground'}`}>
                            <span className="font-bold">2</span>
                        </div>
                        <span className={`text-sm font-medium bg-background px-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Role & Profile</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">

                    {/* Step 1: Account Credentials */}
                    {currentStep === 1 && (
                        <Card className="animate-in slide-in-from-right-4 duration-300">
                            <CardHeader>
                                <CardTitle>Step 1: Account Setup</CardTitle>
                                <CardDescription>Enter the user's primary login credentials and name.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="e.g. John"
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="e.g. Smith"
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="enroll-user-id">User ID (Username) <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="enroll-user-id"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            placeholder="e.g. COL2024001"
                                            autoComplete="username"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Unique identifier for system login.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="enroll-user-email">Email Address <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="enroll-user-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="e.g. john.smith@college.edu"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="enroll-user-password">
                                        Password {editingUserId ? "(Leave blank to keep current)" : <span className="text-destructive">*</span>}
                                    </Label>
                                    <div className="relative flex items-center max-w-md">
                                        <Input
                                            id="enroll-user-password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a strong password (min 6 chars)"
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
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6">
                                <Button onClick={handleNextStep} className="gap-2 min-w-[120px]">
                                    Next Step <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 2: Details & Role */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                                {/* Left Column: Photo & Role configuration */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardContent className="pt-6 flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                                    <AvatarImage src={avatarUpload || ""} />
                                                    <AvatarFallback className="text-4xl bg-muted">
                                                        {firstName ? getInitials(`${firstName} ${lastName}`) : <Camera className="h-10 w-10 text-muted-foreground/50" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute bottom-0 right-0 rounded-full shadow-md"
                                                    onClick={triggerFileInput}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </Button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-medium text-lg">{`${firstName} ${lastName}`}</h3>
                                                <p className="text-sm text-muted-foreground">{roleLabels[formData.role]}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Role Configuration</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="role">Primary Role</Label>
                                                <Select
                                                    value={formData.role}
                                                    onValueChange={(v) => setFormData({ ...formData, role: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="student">Student</SelectItem>
                                                        <SelectItem value="teacher">Teacher</SelectItem>
                                                        <SelectItem value="staff">Staff</SelectItem>
                                                        {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                                                        {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Additional Sub-Roles</Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {formData.subRoles?.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="secondary"
                                                            className="gap-1 pr-1"
                                                        >
                                                            {roleLabels[role] || role}
                                                            <button
                                                                type="button"
                                                                className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5"
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
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Add sub-role..." />
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
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column: Details Form */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>User Details</CardTitle>
                                            <CardDescription>Enter additional profile information.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                                                    <Select
                                                        value={isAdmin ? user?.department : formData.department}
                                                        onValueChange={(v) => setFormData({ ...formData, department: v })}
                                                        disabled={isAdmin}
                                                    >
                                                        <SelectTrigger>
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
                                                <div className="space-y-2">
                                                    <Label htmlFor="enroll-user-phone">Phone <span className="text-destructive">*</span></Label>
                                                    <Input
                                                        id="enroll-user-phone"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="e.g., +1 555-0100"
                                                        autoComplete="tel"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select
                                                        value={formData.status}
                                                        onValueChange={(v) => setFormData({ ...formData, status: v as "active" | "inactive" })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Student specific section */}
                                            {formData.role === "student" && (
                                                <>
                                                    <div>
                                                        <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Student Academic Details</h3>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="enroll-university-id">University ID</Label>
                                                                <Input
                                                                    id="enroll-university-id"
                                                                    value={studentFormData.universityId}
                                                                    onChange={(e) => setStudentFormData({ ...studentFormData, universityId: e.target.value })}
                                                                    placeholder="e.g., UNI2024001"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                                                <Input
                                                                    id="dateOfBirth"
                                                                    type="date"
                                                                    value={studentFormData.dateOfBirth}
                                                                    onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="gender">Gender</Label>
                                                                <Select
                                                                    value={studentFormData.gender}
                                                                    onValueChange={(v) => setStudentFormData({ ...studentFormData, gender: v })}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select gender" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="male">Male</SelectItem>
                                                                        <SelectItem value="female">Female</SelectItem>
                                                                        <SelectItem value="other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="currentClass">Class</Label>
                                                                <Select
                                                                    value={studentFormData.currentClass}
                                                                    onValueChange={(v) => setStudentFormData({ ...studentFormData, currentClass: v })}
                                                                >
                                                                    <SelectTrigger>
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
                                                            <div className="space-y-2">
                                                                <Label htmlFor="semester">Semester</Label>
                                                                <Select
                                                                    value={studentFormData.semester}
                                                                    onValueChange={(v) => setStudentFormData({ ...studentFormData, semester: v })}
                                                                >
                                                                    <SelectTrigger>
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
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Guardian Information</h3>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="guardianName">Guardian Name</Label>
                                                                <Input
                                                                    id="guardianName"
                                                                    value={studentFormData.guardianName}
                                                                    onChange={(e) => setStudentFormData({ ...studentFormData, guardianName: e.target.value })}
                                                                    placeholder="e.g., Robert Smith"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="guardianContact">Guardian Contact</Label>
                                                                <Input
                                                                    id="guardianContact"
                                                                    value={studentFormData.guardianContact}
                                                                    onChange={(e) => setStudentFormData({ ...studentFormData, guardianContact: e.target.value })}
                                                                    placeholder="e.g., +1 555-0100"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="guardianRelationship">Relationship</Label>
                                                                <Input
                                                                    id="guardianRelationship"
                                                                    value={studentFormData.guardianRelationship}
                                                                    onChange={(e) =>
                                                                        setStudentFormData({ ...studentFormData, guardianRelationship: e.target.value })
                                                                    }
                                                                    placeholder="e.g., Father"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Separator />
                                                </>
                                            )}

                                            {/* Documents Section */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Documents</h3>
                                                    <div className="flex items-center gap-2">
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
                                                </div>

                                                {newDocuments.length > 0 && (
                                                    <div className="space-y-2">
                                                        {newDocuments.map((doc) => (
                                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                                        <FileText className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium truncate">{doc.name}</p>
                                                                        <p className="text-xs text-muted-foreground">{doc.size} • {doc.type.split('/')[1]?.toUpperCase()}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-muted-foreground hover:text-destructive"
                                                                    onClick={() => removeNewDocument(doc.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between border-t p-6">
                                            <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                                                <ArrowLeft className="h-4 w-4" /> Back
                                            </Button>
                                            <Button onClick={handleSave} className="gap-2 min-w-[150px]">
                                                <Check className="h-4 w-4" /> {editingUserId ? "Update User" : "Create User"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
