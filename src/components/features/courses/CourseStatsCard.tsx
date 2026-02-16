import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Course } from "@/types/courses";

interface CourseStatsCardProps {
    isStaff: boolean;
    isAdmin: boolean;
    courses: Course[];
    filteredCourses: Course[];
    staffAssignedCourses: string[];
}

export function CourseStatsCard({
    isStaff,
    isAdmin,
    courses,
    filteredCourses,
    staffAssignedCourses,
}: CourseStatsCardProps) {
    return (
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
    );
}
