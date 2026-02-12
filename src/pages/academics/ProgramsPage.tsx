import { useState } from "react";
import { Plus, Search, Edit, Trash2, BookOpen, ChevronRight, Filter, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

// todo: remove mock functionality
interface Program {
  id: string;
  name: string;
  level: string;
  duration: string;
  disciplines: string[];
  description: string;
  status: "active" | "inactive";
  department: string;
}

const mockPrograms: Program[] = [];


const levelColors = {
  Undergraduate: "bg-primary text-primary-foreground",
  Graduate: "bg-primary text-primary-foreground",
  Doctoral: "bg-primary text-primary-foreground",
};

const availableDepartments = [
  "Computer Science",
  "Business Administration",
  "Mechanical Engineering",
  "Physics",
];

export function ProgramsPage() {
  const [programs, setPrograms] = useState(mockPrograms);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [deptFilter, setDeptFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const userRole = user?.role || "student";
  const canManage = userRole === "super_admin" || userRole === "admin";

  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const userDepartment = user?.department;

  const [formData, setFormData] = useState({
    level: "",
    degreeType: "",
    name: "",
    duration: "",
    description: "",
    department: "",
  });

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProgramForSheet, setSelectedProgramForSheet] = useState<Program | null>(null);

  const degreeOptions: Record<string, string[]> = {
    Undergraduate: ["Bachelor Degree", "Associate Degree"],
    Graduate: ["Master's Degree", "Doctoral Degree"],
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.level.toLowerCase().includes(search.toLowerCase());

    // Admin can only see programs from their department
    const matchesDepartmentMatch = isSuperAdmin || (isAdmin && p.department === userDepartment);
    const matchesDept = deptFilter === "all" || p.department === deptFilter;
    const matchesLevel = levelFilter === "all" || p.level === levelFilter;

    return matchesSearch && matchesDepartmentMatch && matchesDept && matchesLevel;
  }).sort((a, b) => a.department.localeCompare(b.department));

  const openCreateDialog = () => {
    setFormData({
      level: "",
      degreeType: "",
      name: "",
      duration: "",
      description: "",
      department: isAdmin ? (userDepartment || "") : ""
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (program: Program) => {
    setFormData({
      level: program.level,
      degreeType: "", // Will need to extract from name or store separately
      name: program.name,
      duration: program.duration,
      description: program.description,
      department: program.department,
    });
    setSelectedProgram(program);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.department) {
      toast({ title: "Please select a department", variant: "destructive" });
      return;
    }

    if (isEditing && selectedProgram) {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === selectedProgram.id
            ? {
              ...p,
              ...formData,
              disciplines: p.disciplines, // Preserve existing disciplines
              department: formData.department,
            }
            : p
        )
      );
      toast({ title: "Program updated successfully" });
    } else {
      const newProgram: Program = {
        id: Date.now().toString(),
        ...formData,
        disciplines: [],
        status: "active",
        department: formData.department,
      };
      setPrograms((prev) => [...prev, newProgram]);
      toast({ title: "Program created successfully" });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Program deleted", variant: "destructive" });
  };

  const openProgramDetails = (program: Program) => {
    setSelectedProgramForSheet(program);
    setIsSheetOpen(true);
  };

  return (
    <MainLayout title="Academic Programs">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-white dark:bg-zinc-950 border-[#243F76]/10 dark:border-white/10 shadow-sm"
                data-testid="input-search-programs"
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

              {canManage && (
                <Button onClick={openCreateDialog} className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all" data-testid="button-add-program">
                  <Plus className="h-4 w-4" />
                  Add Program
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <Card className="bg-muted/30 border-[#243F76]/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {!isAdmin && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Department</Label>
                      <Select value={deptFilter} onValueChange={setDeptFilter}>
                        <SelectTrigger className="bg-white dark:bg-zinc-950 border-[#243F76]/10 h-10" data-testid="select-dept-filter">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {availableDepartments.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Academic Level</Label>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="bg-white dark:bg-zinc-950 border-[#243F76]/10 h-10" data-testid="select-level-filter">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                        <SelectItem value="Doctoral">Doctoral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(deptFilter !== "all" || levelFilter !== "all") && (
            <div className="flex flex-wrap gap-2 px-1">
              {deptFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-muted" onClick={() => setDeptFilter("all")}>
                  Dept: {deptFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {levelFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-muted" onClick={() => setLevelFilter("all")}>
                  Level: {levelFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredPrograms.length}</p>
                <p className="text-sm text-muted-foreground">{isAdmin ? "My Department Programs" : "Total Programs"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {Object.entries(
            filteredPrograms.reduce((acc, program) => {
              const dept = program.department || "Other";
              if (!acc[dept]) acc[dept] = [];
              acc[dept].push(program);
              return acc;
            }, {} as Record<string, Program[]>)
          )
            .sort(([deptA], [deptB]) => deptA.localeCompare(deptB))
            .map(([department, deptPrograms]) => (
              <Card key={department} className="bg-white/50 dark:bg-card/50 border-[#243F76]/10 dark:border-white/10 shadow-sm overflow-hidden rounded-2xl">
                <div className="px-6 py-4 bg-muted/20 border-b border-[#243F76]/5 dark:border-white/5">
                  <h3 className="text-sm font-bold text-[#1A2E56] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#106bc6]" />
                    {department}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {deptPrograms.map((program) => (
                      <Card key={program.id} className="bg-white dark:bg-zinc-950 border-[#243F76]/5 dark:border-white/5 hover:border-[#106bc6]/20 transition-all shadow-none group" data-testid={`card-program-${program.id}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-[#1A2E56] dark:text-gray-200">{program.name}</h4>
                                    {program.status === "inactive" && (
                                      <Badge variant="outline" className="text-[10px] h-4">Inactive</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`${levelColors[program.level as keyof typeof levelColors]} px-1.5 py-0 text-[10px] font-medium`}
                                    >
                                      {program.level}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">• {program.duration}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:flex-1">
                              {program.disciplines.slice(0, 3).map((d) => (
                                <Badge key={d} variant="secondary" className="text-[10px]">
                                  {d}
                                </Badge>
                              ))}
                              {program.disciplines.length > 3 && (
                                <Badge variant="outline" className="text-[10px]">
                                  +{program.disciplines.length - 3} more
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {canManage && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => openEditDialog(program)}
                                    data-testid={`button-edit-program-${program.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleDelete(program.id)}
                                    data-testid={`button-delete-program-${program.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openProgramDetails(program)}
                                data-testid={`button-view-program-${program.id}`}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {filteredPrograms.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No programs found. Try adjusting your search or create a new program.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Program" : "Create New Program"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(v) => setFormData({ ...formData, department: v })}
                disabled={isAdmin && !!userDepartment}
              >
                <SelectTrigger data-testid="select-program-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="level">Academic Level</Label>
              <Select
                value={formData.level}
                onValueChange={(v) => setFormData({ ...formData, level: v, degreeType: "" })}
              >
                <SelectTrigger data-testid="select-program-level">
                  <SelectValue placeholder="Select academic level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Graduate">Graduate/Postgraduate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.level && (
              <div className="grid gap-2">
                <Label htmlFor="degreeType">Degree Type</Label>
                <Select
                  value={formData.degreeType}
                  onValueChange={(v) => setFormData({ ...formData, degreeType: v })}
                >
                  <SelectTrigger data-testid="select-degree-type">
                    <SelectValue placeholder="Select degree type" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeOptions[formData.level]?.map((degree) => (
                      <SelectItem key={degree} value={degree}>
                        {degree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bachelor of Computer Science"
                data-testid="input-program-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(v) => setFormData({ ...formData, duration: v })}
              >
                <SelectTrigger data-testid="select-program-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 year">1 Year</SelectItem>
                  <SelectItem value="2 years">2 Years</SelectItem>
                  <SelectItem value="3 years">3 Years</SelectItem>
                  <SelectItem value="4 years">4 Years</SelectItem>
                  <SelectItem value="5 years">5 Years</SelectItem>
                  <SelectItem value="6 years">6 Years</SelectItem>
                  <SelectItem value="2 semesters">2 Semesters</SelectItem>
                  <SelectItem value="4 semesters">4 Semesters</SelectItem>
                  <SelectItem value="6 semesters">6 Semesters</SelectItem>
                  <SelectItem value="8 semesters">8 Semesters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Program Details</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Program description and details..."
                rows={3}
                data-testid="input-program-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-program">
              {isEditing ? "Save Changes" : "Create Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Program Details</SheetTitle>
            <SheetDescription>
              Comprehensive information about this academic program.
            </SheetDescription>
          </SheetHeader>
          {selectedProgramForSheet && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedProgramForSheet.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{selectedProgramForSheet.level}</Badge>
                    <span>•</span>
                    <span>{selectedProgramForSheet.duration}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Program Information</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium text-[#106bc6]">{selectedProgramForSheet.department}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{selectedProgramForSheet.level}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{selectedProgramForSheet.duration}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={selectedProgramForSheet.status === "active" ? "secondary" : "outline"} className="capitalize">
                      {selectedProgramForSheet.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Disciplines & Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProgramForSheet.disciplines.length > 0 ? (
                    selectedProgramForSheet.disciplines.map((d) => (
                      <Badge key={d} variant="secondary">
                        {d}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No specific disciplines listed.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {selectedProgramForSheet.description || "No description available for this program."}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
