import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Edit, Trash2, FileText } from "lucide-react";
import { Course, departmentPrograms } from "@/types/courses";

interface CourseListTableProps {
    filteredCourses: Course[];
    canManageCourses: boolean;
    onCourseClick: (course: Course) => void;
    onEditCourse: (course: Course) => void;
    onDeleteCourse: (id: string) => void;
}

export function CourseListTable({
    filteredCourses,
    canManageCourses,
    onCourseClick,
    onEditCourse,
    onDeleteCourse
}: CourseListTableProps) {
    if (filteredCourses.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No courses found. Try adjusting your filters{canManageCourses ? " or add a new course" : ""}.
                </CardContent>
            </Card>
        );
    }

    const groupedCourses = filteredCourses.reduce((acc, course) => {
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
    }, {} as Record<string, Record<string, Course[]>>);

    return (
        <div className="space-y-8">
            {Object.entries(groupedCourses)
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
                                                            onClick={() => onCourseClick(course)}
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
                                                                                onEditCourse(course);
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
                                                                                onDeleteCourse(course.id);
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
    );
}
