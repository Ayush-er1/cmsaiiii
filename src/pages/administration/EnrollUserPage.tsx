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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useUser, type UserRecord } from "@/lib/user-context";
import { ArrowLeft, Camera, X, Upload, FileText, Eye, EyeOff } from "lucide-react";
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
    const { addUser } = useUser();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const isSuperAdmin = user?.role === "super_admin";
    const isAdmin = user?.role === "admin";

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

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
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
        if (!formData.password.trim()) {
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
            id: Date.now().toString(),
            ...formData,
            status: formData.status,
        };

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
                enrollmentDate: new Date().toISOString().split("T")[0],
                avatarUrl: avatarUpload || undefined,
            }
            : { ...baseUser, subRoles: formData.subRoles, User_Id: formData.User_Id, avatarUrl: avatarUpload || undefined, documents: newDocuments };

        addUser(newUser);
        toast({ title: `${roleLabels[formData.role]} enrolled successfully` });
        setLocation("/users");
    };

    return (
        <MainLayout title="Enroll New User">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setLocation("/users")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Enroll New User</h1>
                        <p className="text-muted-foreground">Add a new user to the system.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                    {/* Left Column: Photo & Role */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                        <AvatarImage src={avatarUpload || ""} />
                                        <AvatarFallback className="text-4xl bg-muted">
                                            {formData.name ? getInitials(formData.name) : <Camera className="h-10 w-10 text-muted-foreground/50" />}
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
                                    <h3 className="font-medium text-lg">{formData.name || "New User"}</h3>
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
                                <CardTitle>User Information</CardTitle>
                                <CardDescription>Enter the user's personal and academic details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Basic Info Section */}
                                <div>
                                    <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="enroll-user-fullname">Full Name</Label>
                                            <Input
                                                id="enroll-user-fullname"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., John Smith"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="enroll-user-email">Email</Label>
                                            <Input
                                                id="enroll-user-email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="e.g., john.smith@college.edu"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
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
                                            <Label htmlFor="enroll-user-phone">Phone</Label>
                                            <Input
                                                id="enroll-user-phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="e.g., +1 555-0100"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="enroll-user-id">User ID</Label>
                                            <Input
                                                id="enroll-user-id"
                                                value={formData.User_Id}
                                                onChange={(e) => setFormData({ ...formData, User_Id: e.target.value })}
                                                placeholder="e.g., COL2024001"
                                                autoComplete="off"
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

                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="enroll-user-password">
                                            Password <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative flex items-center">
                                            <Input
                                                id="enroll-user-password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="Set first-time password (min 6 chars)"
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
                                            User will login with their User ID and this password
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Student specific section */}
                                {formData.role === "student" && (
                                    <>
                                        <div>
                                            <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Student Details</h3>
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

                                    {newDocuments.length === 0 ? (
                                        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                                            No documents added yet
                                        </div>
                                    ) : (
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
                        </Card>

                        <div className="flex items-center justify-end gap-4">
                            <Button variant="outline" size="lg" onClick={() => setLocation("/users")}>
                                Cancel
                            </Button>
                            <Button size="lg" onClick={handleSave} className="min-w-[150px]">
                                Create User
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
