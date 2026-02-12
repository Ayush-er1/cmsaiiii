import { useState } from "react";
import { Plus, Search, Edit, Trash2, Upload, FileText, X, BookOpen, Users, Activity, Link as LinkIcon, ExternalLink, Filter } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

// todo: remove mock functionality
interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  program: string;
  instructor: string;
  syllabus?: string;
  description: string;
  department?: string; // Added to link courses to departments via programs
  resources?: { name: string; url: string; type: 'file' | 'link' }[];
}

const mockCourses: Course[] = [];

export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(mockCourses);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourseForSheet, setSelectedCourseForSheet] = useState<Course | null>(null);

  const userRole = user?.role || "student";
  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff" || userRole === "teacher";

  // Staff and students cannot create/edit/delete courses, only admin can
  const canManageCourses = isSuperAdmin || isAdmin;

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: "3",
    program: "",
    instructor: "",
    description: "",
    syllabus: "",
  });
  const [resources, setResources] = useState<{ name: string; url: string; type: 'file' | 'link' }[]>([]);
  const [syllabusFileName, setSyllabusFileName] = useState("");

  const userDepartment = user?.department;

  // For filtering: get list of programs that belong to admin's department
  const departmentPrograms: Record<string, string[]> = {
    "Computer Science": ["Bachelor of Computer Science", "Bachelor of Information Technology", "Master of Computer Applications"],
    "Business Administration": ["Master of Business Administration"],
    "Mechanical Engineering": ["Bachelor of Mechanical Engineering", "Bachelor of Civil Engineering", "Bachelor of Electronics Engineering"],
    "Physics": ["Doctor of Philosophy in Physics"],
  };

  // Filter programs based on admin's department
  const allPrograms = Array.from(new Set(courses.map((c) => c.program)));
  const programs = isAdmin && userDepartment
    ? allPrograms.filter(p => (departmentPrograms[userDepartment] || []).includes(p))
    : allPrograms;
  const instructors = Array.from(new Set(courses.map((c) => c.instructor)));

  const availableDepartments = Object.keys(departmentPrograms);
  const filteredPrograms = departmentFilter === "all"
    ? programs
    : programs.filter(p => (departmentPrograms[departmentFilter] || []).includes(p));

  const staffAssignedCourses = user?.assignedCourses || [];

  const allowedPrograms = isAdmin && userDepartment
    ? (departmentPrograms[userDepartment] || [])
    : [];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = programFilter === "all" || c.program === programFilter;

    let courseDept = "Other";
    for (const [d, progs] of Object.entries(departmentPrograms)) {
      if (progs.includes(c.program)) {
        courseDept = d;
        break;
      }
    }
    const matchesDept = departmentFilter === "all" || courseDept === departmentFilter;

    if (isStaff) {
      return matchesSearch && matchesProgram && matchesDept && staffAssignedCourses.includes(c.code);
    }

    if (isAdmin) {
      const belongsToDepartment = allowedPrograms.includes(c.program);
      return matchesSearch && matchesProgram && matchesDept && belongsToDepartment;
    }

    return matchesSearch && matchesProgram && matchesDept;
  });

  const openCreateDialog = () => {
    setFormData({
      code: "",
      name: "",
      credits: "3",
      program: programFilter !== "all" ? programFilter : "",
      instructor: "",
      description: "",
      syllabus: "",
    });
    setResources([]);
    setSyllabusFileName("");
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setFormData({
      code: course.code,
      name: course.name,
      credits: course.credits.toString(),
      program: course.program,
      instructor: course.instructor,
      description: course.description,
      syllabus: course.syllabus || "",
    });
    setResources(course.resources || []);
    setSyllabusFileName(course.syllabus || "");
    setSelectedCourse(course);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (isEditing && selectedCourse) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === selectedCourse.id
            ? { ...c, ...formData, credits: parseInt(formData.credits), syllabus: syllabusFileName || undefined, resources }
            : c
        )
      );
      toast({ title: "Course updated successfully" });
    } else {
      const newCourse: Course = {
        id: Date.now().toString(),
        ...formData,
        credits: parseInt(formData.credits),
        syllabus: syllabusFileName || undefined,
        resources
      };
      setCourses((prev) => [...prev, newCourse]);
      toast({ title: "Course created successfully" });
    }
    setIsDialogOpen(false);
  };

  const addResource = (type: 'file' | 'link') => {
    setResources([...resources, { name: "", url: "", type }]);
  };

  const updateResource = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...resources];
    updated[index] = { ...updated[index], [field]: value };
    setResources(updated);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSyllabusFileName(file.name);
      toast({ title: `File "${file.name}" selected` });
    }
  };

  const removeSyllabus = () => {
    setSyllabusFileName("");
    setFormData({ ...formData, syllabus: "" });
  };

  const getCourseStats = (courseId: string) => {
    // TODO: Fetch real stats from API
    return {
      totalStudents: 0,
      avgAttendance: "0%",
      upcomingAssignments: 0,
      lastClassDate: "-",
    };
  };

  const handleUploadSyllabus = (courseId: string) => {
    // TODO: Implement real file upload
    toast({ title: "Syllabus upload not implemented yet", variant: "destructive" });
  };

  const handleDelete = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Course deleted", variant: "destructive" });
  };

  const openCourseDetails = (course: Course) => {
    setSelectedCourseForSheet(course);
    setIsSheetOpen(true);
  };


  const stats = selectedCourseForSheet ? getCourseStats(selectedCourseForSheet.id) : null;

  return (
    <MainLayout title="Courses">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-white dark:bg-zinc-950 border-[#243F76]/10 dark:border-white/10 shadow-sm"
                data-testid="input-search-courses"
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
              {canManageCourses && (
                <Button onClick={openCreateDialog} className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all" data-testid="button-add-course">
                  <Plus className="h-4 w-4" />
                  Add Course
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <Card className="bg-muted/30 border-[#243F76]/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!isAdmin && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Department</Label>
                      <Select
                        value={departmentFilter}
                        onValueChange={(v) => {
                          setDepartmentFilter(v);
                          setProgramFilter("all");
                        }}
                      >
                        <SelectTrigger className="bg-white dark:bg-zinc-950 border-[#243F76]/10 h-10" data-testid="select-department-filter">
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
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Program</Label>
                    <Select value={programFilter} onValueChange={setProgramFilter}>
                      <SelectTrigger className="bg-white dark:bg-zinc-950 border-[#243F76]/10 h-10" data-testid="select-program-filter">
                        <SelectValue placeholder="Filter by program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {filteredPrograms.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(departmentFilter !== "all" || programFilter !== "all") && (
            <div className="flex flex-wrap gap-2 px-1">
              {departmentFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-muted" onClick={() => setDepartmentFilter("all")}>
                  Dept: {departmentFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {programFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-muted" onClick={() => setProgramFilter("all")}>
                  Program: {programFilter}
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isStaff
                    ? courses.filter(c => staffAssignedCourses.includes(c.code)).length
                    : isAdmin
                      ? filteredCourses.length
                      : courses.length}
                </p>
                <p className="text-sm text-muted-foreground">{isStaff ? "My Courses" : isAdmin ? "My Department Courses" : "Total Courses"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role indicator for staff */}
        {isStaff && (
          <div className="text-sm text-muted-foreground">
            As staff, you can upload documents (syllabus) but cannot create, edit, or delete courses.
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(
            filteredCourses.reduce((acc, course) => {
              let dept = "Other";
              for (const [d, progs] of Object.entries(departmentPrograms)) {
                if (progs.includes(course.program)) {
                  dept = d;
                  break;
                }
              }
              if (!acc[dept]) acc[dept] = {};
              if (!acc[dept][course.program]) acc[dept][course.program] = [];
              acc[dept][course.program].push(course);
              return acc;
            }, {} as Record<string, Record<string, Course[]>>))
            .sort(([deptA], [deptB]) => deptA.localeCompare(deptB))
            .map(([department, programsInDept]) => (
              <Card key={department} className="bg-white/50 dark:bg-card/50 border-[#243F76]/10 dark:border-white/10 shadow-sm overflow-hidden rounded-2xl">
                <div className="px-6 py-4 bg-muted/20 border-b border-[#243F76]/5 dark:border-white/5">
                  <h3 className="text-sm font-bold text-[#1A2E56] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#106bc6]" />
                    {department}
                  </h3>
                </div>
                <CardContent className="p-6 space-y-8">
                  {Object.entries(programsInDept)
                    .sort(([progA], [progB]) => progA.localeCompare(progB))
                    .map(([programName, coursesInProg]) => (
                      <div key={programName} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <div className="h-2 w-2 rounded-full bg-[#106bc6]" />
                          <h4 className="text-sm font-semibold text-[#1A2E56] dark:text-gray-200">{programName}</h4>
                          <Badge variant="outline" className="ml-auto text-[10px] font-normal opacity-70">
                            {coursesInProg.length} Courses
                          </Badge>
                        </div>

                        <div className="rounded-xl border border-[#243F76]/5 dark:border-white/5 overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                          <Table>
                            <TableHeader className="bg-muted/30">
                              <TableRow className="hover:bg-transparent border-b-[#243F76]/5">
                                <TableHead className="h-9 text-[10px] py-0 w-24">Code</TableHead>
                                <TableHead className="h-9 text-[10px] py-0">Course Name</TableHead>
                                <TableHead className="h-9 text-[10px] py-0 hidden lg:table-cell">Instructor</TableHead>
                                <TableHead className="h-9 text-[10px] py-0 w-20 text-center">Credits</TableHead>
                                <TableHead className="h-9 text-[10px] py-0 w-24 text-center">Resources</TableHead>
                                {canManageCourses && <TableHead className="h-9 text-[10px] py-0 w-24 text-right">Actions</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {coursesInProg.map((course) => (
                                <TableRow
                                  key={course.id}
                                  data-testid={`row-course-${course.id}`}
                                  className="cursor-pointer hover:bg-muted/40 transition-colors border-b-[#243F76]/5 last:border-0"
                                  onClick={() => openCourseDetails(course)}
                                >
                                  <TableCell className="font-mono text-xs py-2.5">{course.code}</TableCell>
                                  <TableCell className="py-2.5">
                                    <p className="text-sm font-medium text-[#1A2E56] dark:text-gray-300">{course.name}</p>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground py-2.5">
                                    {course.instructor}
                                  </TableCell>
                                  <TableCell className="text-center text-sm py-2.5 font-medium">{course.credits}</TableCell>
                                  <TableCell className="text-center py-2.5">
                                    <div className="flex justify-center">
                                      {((course.syllabus ? 1 : 0) + (course.resources?.length || 0)) > 0 ? (
                                        <Badge
                                          variant="secondary"
                                          className="gap-1 h-6 px-1.5 bg-[#106bc6]/5 text-[#106bc6] border-[#106bc6]/10 font-bold text-[10px]"
                                        >
                                          <FileText className="h-3 w-3" />
                                          {(course.syllabus ? 1 : 0) + (course.resources?.length || 0)}
                                        </Badge>
                                      ) : (
                                        <div className="text-muted-foreground/30 italic text-[10px]">None</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  {canManageCourses && (
                                    <TableCell className="text-right py-2.5">
                                      <div className="flex justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditDialog(course);
                                          }}
                                          data-testid={`button-edit-course-${course.id}`}
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(course.id);
                                          }}
                                          data-testid={`button-delete-course-${course.id}`}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
        </div>

        {filteredCourses.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No courses found. Try adjusting your filters{canManageCourses ? " or add a new course" : ""}.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Course" : "Create New Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={formData.program}
                onValueChange={(v) => setFormData({ ...formData, program: v })}
              >
                <SelectTrigger data-testid="select-course-program">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., CS101"
                  data-testid="input-course-code"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="credits">Credits</Label>
                <Select
                  value={formData.credits}
                  onValueChange={(v) => setFormData({ ...formData, credits: v })}
                >
                  <SelectTrigger data-testid="select-course-credits">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} Credits
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Introduction to Programming"
                data-testid="input-course-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select
                value={formData.instructor}
                onValueChange={(v) => setFormData({ ...formData, instructor: v })}
              >
                <SelectTrigger data-testid="select-course-instructor">
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
                data-testid="input-course-description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="syllabus">Syllabus (PDF)</Label>
              <div className="flex items-center gap-2">
                {syllabusFileName ? (
                  <div className="flex items-center gap-2 flex-1 p-2 border rounded-md bg-muted/50">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{syllabusFileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeSyllabus}
                      data-testid="button-remove-syllabus"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <label
                      htmlFor="syllabus-upload"
                      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md cursor-pointer hover-elevate transition-colors"
                    >
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload syllabus PDF</span>
                    </label>
                    <input
                      id="syllabus-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      data-testid="input-syllabus-upload"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Additional Resources</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addResource('file')} className="h-7 text-[10px] gap-1">
                    <Plus className="h-3 w-3" /> Add File
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addResource('link')} className="h-7 text-[10px] gap-1">
                    <Plus className="h-3 w-3" /> Add Link
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {resources.map((res, index) => (
                  <div key={index} className="flex gap-2 items-start bg-muted/30 p-3 rounded-lg border border-dashed border-[#243F76]/10">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={res.type === 'file' ? "Resource Name (e.g., Assignment 1)" : "Link Title (e.g., References)"}
                        value={res.name}
                        onChange={(e) => updateResource(index, 'name', e.target.value)}
                        className="h-8 text-sm"
                      />
                      {res.type === 'file' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Filename (click to upload)"
                            value={res.url}
                            readOnly
                            className="h-8 text-sm bg-muted/20 flex-1"
                          />
                          <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-[10px] h-8 px-2 rounded flex items-center justify-center transition-colors">
                            <Upload className="h-3 w-3 mr-1" />
                            UPLOAD
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) updateResource(index, 'url', file.name);
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        <Input
                          placeholder="URL (https://...)"
                          value={res.url}
                          onChange={(e) => updateResource(index, 'url', e.target.value)}
                          className="h-8 text-sm"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeResource(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {resources.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-2 border border-dashed rounded-lg">
                    Add extra materials like reference books, assignment files or useful links.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-course">
              {isEditing ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Course Details</SheetTitle>
            <SheetDescription>
              Detailed information and statistics for the course.
            </SheetDescription>
          </SheetHeader>
          {selectedCourseForSheet && stats && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCourseForSheet.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{selectedCourseForSheet.code}</span>
                    <span>•</span>
                    <span>{selectedCourseForSheet.credits} Credits</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="h-4 w-4" />
                      <span>Students</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Activity className="h-4 w-4" />
                      <span>Avg. Attendance</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.avgAttendance}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Course Information</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Program</span>
                    <span className="font-medium text-right">{selectedCourseForSheet.program}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Instructor</span>
                    <span className="font-medium text-right">{selectedCourseForSheet.instructor}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Last Class</span>
                    <span className="font-medium text-right">{stats.lastClassDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedCourseForSheet.description || "No description available."}
                </p>
              </div>
              {(selectedCourseForSheet.syllabus || (selectedCourseForSheet.resources && selectedCourseForSheet.resources.length > 0)) && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#106bc6]" />
                    Course Materials
                  </h4>
                  <div className="grid gap-3">
                    {/* Syllabus (Primary Resource) */}
                    {selectedCourseForSheet.syllabus && (
                      <div className="flex items-center justify-between p-3 border rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30 hover:border-[#106bc6]/40 transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 rounded-lg bg-[#106bc6] text-white shadow-sm">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-[#1A2E56] dark:text-gray-100 truncate">Course Syllabus</p>
                            <p className="text-[10px] text-muted-foreground truncate">{selectedCourseForSheet.syllabus}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#106bc6]">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Additional Resources */}
                    {selectedCourseForSheet.resources?.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-white dark:bg-zinc-900 border-[#243F76]/5 dark:border-white/5 hover:border-[#106bc6]/20 transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`p-2 rounded-lg ${res.type === 'file' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-green-500/10 text-green-600'}`}>
                            {res.type === 'file' ? <FileText className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-[#1A2E56] dark:text-gray-200 truncate">{res.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{res.url}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          {res.type === 'link' ? <ExternalLink className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
