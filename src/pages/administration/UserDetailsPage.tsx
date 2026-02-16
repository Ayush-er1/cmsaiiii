import { useRef, ChangeEvent, useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { ArrowLeft, Edit, Trash2, Camera, Mail, Phone, MapPin, Calendar, FileText, Download, X, Upload, Loader2 } from "lucide-react";
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

// Define structure based on available API data + potential extended data
interface UserDetail {
    id: string;
    username: string;
    primaryEmail: string;
    createdAt?: string;
    // Optional fields that might be supported later or mapped
    role?: string;
    department?: string;
    status?: string;
    phone?: string;
    User_Id?: string;
    avatarUrl?: string;
    subRoles?: string[];
    // Student specific
    universityId?: string;
    dateOfBirth?: string;
    gender?: string;
    currentClass?: string;
    semester?: string;
    guardianName?: string;
    guardianContact?: string;
    guardianRelationship?: string;
    enrollmentDate?: string;
    documents?: any[];
}

export function UserDetailsPage() {
    const { user: currentUser } = useAuth();
    const [, params] = useRoute("/users/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userId = params?.id;
    const isSelf = currentUser?.id === userId;
    const canEdit = currentUser?.role === "super_admin" || currentUser?.role === "admin";
    const documentInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                // Try fetching specific user. If backend doesn't support /users/:id, we might need a workaround,
                // but standard REST pattern implies this.
                // If the list endpoint returns sparse data, this detail endpoint usually returns full data.
                const response = await api.get<UserDetail>(`/users/${userId}`);
                setUser(response.data);
            } catch (err: any) {
                console.error("Failed to fetch user details:", err);

                // Fallback: If individual fetch fails (maybe strict CORS or not impl), 
                // try finding in list? No, that's inefficient. 
                // Assume 404 means not found.
                setError(err.message || "Failed to fetch user details");
                toast({
                    title: "Error",
                    description: "Could not load user details.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, toast]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleDelete = async () => {
        if (!user) return;
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await api.delete(`/users/${user.id}`);
                toast({ title: "User deleted successfully" });
                setLocation("/users");
            } catch (err: any) {
                console.error("Failed to delete user:", err);
                toast({
                    title: "Delete failed",
                    description: err.message || "Could not delete user",
                    variant: "destructive"
                });
            }
        }
    };

    const handleEdit = () => {
        if (user) {
            setLocation(`/users/${user.id}/edit`);
        }
    };

    const triggerDocumentInput = () => {
        documentInputRef.current?.click();
    };

    const handleDocumentUpload = (e: ChangeEvent<HTMLInputElement>) => {
        // Placeholder for future implementation
        toast({ title: "Document upload not supported by backend yet.", variant: "default" });
    };

    const deleteDocument = (docId: string) => {
        // Placeholder
        toast({ title: "Document deletion not supported by backend yet.", variant: "default" });
    };

    if (loading) {
        return (
            <MainLayout title="User Details">
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </MainLayout>
        );
    }

    if (error || !user) {
        return (
            <MainLayout title="User Details">
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <p className="text-muted-foreground">{error || "User not found"}</p>
                    <Button onClick={() => setLocation("/users")}>Back to Users</Button>
                </div>
            </MainLayout>
        );
    }

    // Default values for missing fields since API is sparse
    const displayRole = user.role || "member";
    const displayDepartment = user.department || "N/A";

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
                                    {getInitials(user.username || "User")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center space-y-1">
                                <h2 className="text-2xl font-bold">{user.username}</h2>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    <Badge className={roleColors[displayRole] || "bg-slate-500"}>
                                        {(roleLabels[displayRole] || displayRole)}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{user.primaryEmail}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{displayDepartment}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Badge variant={user.status === "active" ? "secondary" : "outline"} className="ml-auto w-full justify-center">
                                        {user.status === "active" ? "Active Account" : "Unknown Status"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">User ID</p>
                                        <p className="text-base font-mono">{user.id}</p>
                                    </div>
                                    {user.User_Id && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Internal ID</p>
                                            <p className="text-base">{user.User_Id}</p>
                                        </div>
                                    )}
                                </div>

                                {displayRole === "student" && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {user.universityId && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">University ID</p>
                                                    <p className="text-base">{user.universityId}</p>
                                                </div>
                                            )}
                                            {/* Render other student fields only if they exist */}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documents Section - Kept as placeholder but connected to nothing real yet */}
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
                                    <Button variant="outline" size="sm" onClick={triggerDocumentInput} className="gap-2" disabled={true}>
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
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-md bg-muted/10">
                                            No documents available
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
