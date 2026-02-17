import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Activity, FileText, LinkIcon as LinkIcon2, ExternalLink, Upload } from "lucide-react";
import { Course, CourseStats } from "@/types/courses";

interface CourseDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: Course | null;
    stats: CourseStats | null;
}

export function CourseDetailSheet({ open, onOpenChange, course, stats }: CourseDetailSheetProps) {
    if (!course || !stats) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Course Details</SheetTitle>
                    <SheetDescription>
                        Detailed information and statistics for the course.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{course.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{course.code}</span>
                                <span>•</span>
                                <span>{course.credits} Credits</span>
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
                                <span className="font-medium text-right">{course.program}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Instructor</span>
                                <span className="font-medium text-right">{course.instructor}</span>
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
                            {course.description || "No description available."}
                        </p>
                    </div>
                    {(course.syllabus || (course.resources && course.resources.length > 0)) && (
                        <div className="space-y-4 pt-2">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-[#106bc6]" />
                                Course Materials
                            </h4>
                            <div className="grid gap-3">
                                {/* Syllabus (Primary Resource) */}
                                {course.syllabus && (
                                    <div className="flex items-center justify-between p-3 border rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30 hover:border-[#106bc6]/40 transition-all group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 rounded-lg bg-[#106bc6] text-white shadow-sm">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-[#1A2E56] dark:text-gray-100 truncate">Course Syllabus</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{course.syllabus}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#106bc6]">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Additional Resources */}
                                {course.resources?.map((res, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-white dark:bg-zinc-900 border-[#243F76]/5 dark:border-white/5 hover:border-[#106bc6]/20 transition-all group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`p-2 rounded-lg ${res.type === 'file' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-green-500/10 text-green-600'}`}>
                                                {res.type === 'file' ? <FileText className="h-4 w-4" /> : <LinkIcon2 className="h-4 w-4" />}
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
            </SheetContent>
        </Sheet>
    );
}
