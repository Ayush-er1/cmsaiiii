import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, BookOpen, GraduationCap, Search, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";

interface Department {
    id: string;
    name: string;
    code: string;
    programIds: string[];
    createdAt: string;
}

interface Program {
    id: string;
    name: string;
    code: string;
}

// Mock data
const mockPrograms: Program[] = [];

const mockDepartments: Department[] = [];


export function DepartmentsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Admin-only access control
    const isAdmin = user?.role === "super_admin";

    const [departments, setDepartments] = useState<Department[]>(mockDepartments);
    const [programs] = useState<Program[]>(mockPrograms);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        programIds: [] as string[],
    });

    if (!isAdmin) {
        return (
            <MainLayout title="Access Denied">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground">
                            You don't have permission to access this page. Only administrators can manage departments.
                        </p>
                    </CardContent>
                </Card>
            </MainLayout>
        );
    }

    const resetForm = () => {
        setFormData({ name: "", code: "", programIds: [] });
        setEditingDepartment(null);
    };

    const handleEdit = (department: Department) => {
        setEditingDepartment(department);
        setFormData({
            name: department.name,
            code: department.code,
            programIds: department.programIds,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setDepartments(prev => prev.filter(d => d.id !== id));
        toast({ title: "Department deleted successfully" });
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.code) {
            toast({ title: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        if (editingDepartment) {
            // Update existing
            setDepartments(prev =>
                prev.map(d =>
                    d.id === editingDepartment.id
                        ? { ...d, name: formData.name, code: formData.code, programIds: formData.programIds }
                        : d
                )
            );
            toast({ title: "Department updated successfully" });
        } else {
            // Create new
            const newDepartment: Department = {
                id: Date.now().toString(),
                name: formData.name,
                code: formData.code,
                programIds: formData.programIds,
                createdAt: new Date().toISOString().split('T')[0],
            };
            setDepartments(prev => [...prev, newDepartment]);
            toast({ title: "Department created successfully" });
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const toggleProgram = (programId: string) => {
        setFormData(prev => ({
            ...prev,
            programIds: prev.programIds.includes(programId)
                ? prev.programIds.filter(id => id !== programId)
                : [...prev.programIds, programId],
        }));
    };

    const getProgramsByIds = (programIds: string[]) => {
        return programs.filter(p => programIds.includes(p.id));
    };

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout title="Departments">
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search departments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-11 bg-white dark:bg-zinc-900 border-[#243F76]/10 dark:border-white/10 shadow-sm"
                                data-testid="input-search-departments"
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
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all" size="lg" onClick={resetForm}>
                                        <Plus className="h-4 w-4" />
                                        Add Department
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl text-[#1A2E56] dark:text-white">
                                            {editingDepartment ? "Edit Department" : "Add New Department"}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-[#1A2E56] dark:text-gray-200">Department Name *</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="e.g., Computer Science"
                                                        className="pl-9 h-11"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="code" className="text-[#1A2E56] dark:text-gray-200">Department Code *</Label>
                                                <Input
                                                    id="code"
                                                    value={formData.code}
                                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                    placeholder="e.g., CS"
                                                    className="h-11 font-mono uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[#1A2E56] dark:text-gray-200">Assign Programs</Label>
                                            <div className="border rounded-lg p-2 max-h-64 overflow-y-auto bg-muted/20">
                                                <div className="grid grid-cols-1 gap-1">
                                                    {programs.map((program) => (
                                                        <div
                                                            key={program.id}
                                                            className={`flex items-center space-x-3 p-3 rounded-md transition-colors cursor-pointer border border-transparent ${formData.programIds.includes(program.id) ? "bg-white dark:bg-card border-border shadow-sm" : "hover:bg-muted/50"}`}
                                                            onClick={() => toggleProgram(program.id)}
                                                        >
                                                            <Checkbox
                                                                id={`program-${program.id}`}
                                                                checked={formData.programIds.includes(program.id)}
                                                                onCheckedChange={() => toggleProgram(program.id)}
                                                            />
                                                            <div className="flex-1 flex items-center justify-between">
                                                                <Label
                                                                    htmlFor={`program-${program.id}`}
                                                                    className="text-sm font-medium cursor-pointer"
                                                                >
                                                                    {program.name}
                                                                </Label>
                                                                <Badge variant="outline" className="text-xs bg-muted/50">
                                                                    {program.code}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsDialogOpen(false);
                                                resetForm();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSubmit} className="bg-[#106bc6] hover:bg-[#0e5a9e]">
                                            {editingDepartment ? "Update Department" : "Add Department"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {showFilters && (
                        <Card className="bg-muted/30 border-[#243F76]/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
                            <CardContent className="p-4 text-sm text-muted-foreground text-center">
                                No additional filters available for departments.
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Statistics */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <Card className="shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#106bc6]/10 text-[#106bc6]">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[#1A2E56] dark:text-white">{departments.length}</p>
                                <p className="text-sm text-muted-foreground font-medium">Total Departments</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {/* Departments Table */}
                    <Card className="border-border shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className="w-24 pl-4">Code</TableHead>
                                        <TableHead>Department Name</TableHead>
                                        <TableHead>Assigned Programs</TableHead>
                                        <TableHead className="w-32">Created</TableHead>
                                        <TableHead className="w-24 text-right pr-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDepartments.length > 0 ? (
                                        filteredDepartments.map((department) => (
                                            <TableRow key={department.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono font-medium pl-4">{department.code}</TableCell>
                                                <TableCell className="font-medium text-[#1A2E56] dark:text-white">{department.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {getProgramsByIds(department.programIds).map((program) => (
                                                            <Badge key={program.id} variant="secondary" className="font-normal border-secondary-foreground/10 text-xs">
                                                                {program.code}
                                                            </Badge>
                                                        ))}
                                                        {department.programIds.length === 0 && (
                                                            <span className="text-sm text-muted-foreground italic">No programs assigned</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(department.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right pr-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(department)}
                                                            className="h-8 w-8 hover:text-[#106bc6]"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(department.id)}
                                                            className="h-8 w-8 text-destructive/70 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                    <Building2 className="h-8 w-8 opacity-20" />
                                                    <p>No departments found matching your search.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}

export default DepartmentsPage;
