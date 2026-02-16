import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

import { CourseSearchBar } from "@/components/features/courses/CourseSearchBar";
import { CourseFilters } from "@/components/features/courses/CourseFilters";
import { CourseStatsCard } from "@/components/features/courses/CourseStatsCard";
import { CourseListTable } from "@/components/features/courses/CourseListTable";
import { CourseDialog } from "@/components/features/courses/CourseDialog";
import { CourseDetailSheet } from "@/components/features/courses/CourseDetailSheet";
import { Course, CourseFormData, departmentPrograms } from "@/types/courses";


export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
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

  const canManageCourses = isSuperAdmin || isAdmin;

  const userDepartment = user?.department;

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
    setSelectedCourse(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = (formData: CourseFormData, syllabusFileName: string, resources: { name: string; url: string; type: 'file' | 'link' }[]) => {
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

  const handleDelete = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Course deleted", variant: "destructive" });
  };

  const openCourseDetails = (course: Course) => {
    setSelectedCourseForSheet(course);
    setIsSheetOpen(true);
  };

  const getCourseStats = (courseId: string) => {
    return {
      totalStudents: 45,
      avgAttendance: "88%",
      upcomingAssignments: 2,
      lastClassDate: "2024-03-20",
    };
  };

  const stats = selectedCourseForSheet ? getCourseStats(selectedCourseForSheet.id) : null;

  return (
    <MainLayout title="Courses">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <CourseSearchBar
            search={search}
            setSearch={setSearch}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            canManageCourses={canManageCourses}
            onAddCourse={openCreateDialog}
          />

          <CourseFilters
            showFilters={showFilters}
            isAdmin={isAdmin}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            programFilter={programFilter}
            setProgramFilter={setProgramFilter}
            availableDepartments={availableDepartments}
            filteredPrograms={filteredPrograms}
          />
        </div>

        <CourseStatsCard
          isStaff={isStaff}
          isAdmin={isAdmin}
          courses={courses}
          filteredCourses={filteredCourses}
          staffAssignedCourses={staffAssignedCourses}
        />

        {isStaff && (
          <div className="text-sm text-muted-foreground">
            As staff, you can upload documents (syllabus) but cannot create, edit, or delete courses.
          </div>
        )}

        <CourseListTable
          filteredCourses={filteredCourses}
          canManageCourses={canManageCourses}
          onCourseClick={openCourseDetails}
          onEditCourse={openEditDialog}
          onDeleteCourse={handleDelete}
        />
      </div>

      <CourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={isEditing}
        selectedCourse={selectedCourse}
        programs={programs}
        instructors={instructors}
        onSave={handleSave}
        programFilter={programFilter}
      />

      <CourseDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        course={selectedCourseForSheet}
        stats={stats}
      />
    </MainLayout>
  );
}
