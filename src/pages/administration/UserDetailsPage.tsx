import { useRef, ChangeEvent } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { useUser, type UserRecord } from "@/lib/user-context";
import { ArrowLeft, Edit, Trash2, Camera, Mail, Phone, MapPin, Calendar, FileText, Download, X, Upload } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";

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

export function UserDetailsPage() {
    const { user: currentUser } = useAuth();
    const { getUser, updateUser, deleteUser } = useUser();
    const [, params] = useRoute("/users/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const userId = params?.id;
    const user = userId ? getUser(userId) : undefined;

    const isSelf = currentUser?.id === userId;
    const canEdit = currentUser?.role === "super_admin" || currentUser?.role === "admin";
    const documentInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        return (
            <MainLayout title="User Details">
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <p className="text-muted-foreground">User not found</p>
                    <Button onClick={() => setLocation("/users")}>Back to Users</Button>
                </div>
            </MainLayout>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            deleteUser(user.id);
            toast({ title: "User deleted successfully" });
            setLocation("/users");
        }
    };

    const handleEdit = () => {

        setLocation(`/users/${user.id}/edit`);
    };

    const triggerDocumentInput = () => {
        documentInputRef.current?.click();
    };

    const handleDocumentUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newDoc = {
                id: Date.now().toString(),
                name: file.name,
                type: file.type,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                uploadDate: new Date().toISOString().split('T')[0],
            };

            updateUser(user.id, {
                documents: [...(user.documents || []), newDoc]
            });
            toast({ title: "Document uploaded successfully" });
        }
    };

    const deleteDocument = (docId: string) => {
        updateUser(user.id, {
            documents: user.documents?.filter(d => d.id !== docId)
        });
        toast({ title: "Document removed" });
    };

    return (
        <MainLayout title="User Details">
            <div className="max-w-4xl mx-auto space-y-6 pb-10">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setLocation("/users")} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Users
                    </Button>
                    {canEdit && !isSelf && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                                <Edit className="h-4 w-4" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center gap-4">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="text-4xl bg-muted">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center space-y-1">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    <Badge className={roleColors[user.role]}>
                                        {roleLabels[user.role] || user.role}
                                    </Badge>
                                    {user.subRoles?.map(roleId => (
                                        <Badge key={roleId} variant="outline" className="border-primary/20 bg-primary/5">
                                            {roleLabels[roleId] || roleId}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.department}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Badge variant={user.status === "active" ? "secondary" : "outline"} className="ml-auto w-full justify-center">
                                        {user.status === "active" ? "Active Account" : "Inactive Account"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Tabs/Grid */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                {user.User_Id && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">User ID</p>
                                            <p className="text-base">{user.User_Id}</p>
                                        </div>
                                    </div>
                                )}

                                {user.role === "student" && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {user.universityId && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">University ID</p>
                                                    <p className="text-base">{user.universityId}</p>
                                                </div>
                                            )}
                                            {user.dateOfBirth && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                                    <p className="text-base">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {user.gender && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                                    <p className="text-base capitalize">{user.gender}</p>
                                                </div>
                                            )}
                                            {user.currentClass && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Class</p>
                                                    <p className="text-base">{user.currentClass}</p>
                                                </div>
                                            )}
                                            {user.semester && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Semester</p>
                                                    <p className="text-base">Semester {user.semester}</p>
                                                </div>
                                            )}
                                            {user.enrollmentDate && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Enrollment Date</p>
                                                    <p className="text-base">{new Date(user.enrollmentDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>

                                        {(user.guardianName || user.guardianContact) && (
                                            <>
                                                <Separator />
                                                <h3 className="font-semibold">Guardian Information</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    {user.guardianName && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Guardian Name</p>
                                                            <p className="text-base">{user.guardianName}</p>
                                                        </div>
                                                    )}
                                                    {user.guardianContact && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Guardian Contact</p>
                                                            <p className="text-base">{user.guardianContact}</p>
                                                        </div>
                                                    )}
                                                    {user.guardianRelationship && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                                                            <p className="text-base">{user.guardianRelationship}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Documents</CardTitle>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={documentInputRef}
                                        className="hidden"
                                        onChange={handleDocumentUpload}
                                    />
                                    <Button variant="outline" size="sm" onClick={triggerDocumentInput} className="gap-2">
                                        <Upload className="h-3 w-3" /> Upload
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {user.documents && user.documents.length > 0 ? (
                                        user.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="h-10 w-10 rounded bg-background flex items-center justify-center border shrink-0">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.size} • {doc.uploadDate}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => deleteDocument(doc.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-md bg-muted/10">
                                            No documents uploaded yet
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
