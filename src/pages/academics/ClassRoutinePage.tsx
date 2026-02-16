import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

import { ClassSessionDialog } from "@/components/features/academics/ClassSessionDialog";
import { DailySchedule } from "@/components/features/academics/DailySchedule";
import { RoutineFilters } from "@/components/features/academics/RoutineFilters";
import { DaysNavigation } from "@/components/features/academics/DaysNavigation";
import { ClassSession, Course } from "@/types/academics";

export function ClassRoutinePage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const isAdmin = user?.role === "admin" || user?.role === "super_admin";
    const isStudent = user?.role === "student";

    // Map student's currentClass to program name
    const getStudentProgram = (currentClass: string | undefined): string => {
        if (!currentClass) return "all";
        if (currentClass.includes("BCS")) return "Bachelor of Computer Science";
        if (currentClass.includes("BIT")) return "Bachelor of Information Technology";
        if (currentClass.includes("MBA")) return "Master of Business Administration";
        if (currentClass.includes("BME")) return "Bachelor of Mechanical Engineering";
        if (currentClass.includes("BCE")) return "Bachelor of Civil Engineering";
        if (currentClass.includes("BEE")) return "Bachelor of Electronics Engineering";
        if (currentClass.includes("MCA")) return "Master of Computer Applications";
        return "all";
    };

    // Auto-select program for students
    const studentProgram = isStudent ? getStudentProgram(user?.currentClass) : "all";

    const [selectedDay, setSelectedDay] = useState("Sunday");
    const [selectedProgram, setSelectedProgram] = useState(studentProgram);
    const [showFilters, setShowFilters] = useState(false);
    const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [sessionsRes, coursesRes] = await Promise.all([
                    api.get<ClassSession[]>('/class-sessions').catch(() => ({ data: [] })),
                    api.get<Course[]>('/courses').catch(() => ({ data: [] }))
                ]);

                if (Array.isArray(sessionsRes.data)) {
                    setClassSessions(sessionsRes.data);
                }
                if (Array.isArray(coursesRes.data)) {
                    setCourses(coursesRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ title: "Failed to load class schedule", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [toast]);

    // Get unique programs from class sessions and courses
    const programs = Array.from(new Set([
        ...classSessions.map(s => s.program),
        ...courses.map(c => c.program)
    ])).filter(Boolean).sort();

    // Filter sessions for the selected day, program, and check if they're currently active
    const getSessionsForDay = (day: string) => {
        const today = new Date().toISOString().split('T')[0];
        return classSessions
            .filter(session =>
                session.daysOfWeek.includes(day) &&
                session.startDate <= today &&
                session.endDate >= today &&
                (selectedProgram === "all" || session.program === selectedProgram)
            )
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const handleEditSession = (session: ClassSession) => {
        setEditingSessionId(session.id);
        setIsDialogOpen(true);
    };

    const handleSaveSession = async (sessionData: Partial<ClassSession>) => {
        if (!sessionData.startTime || !sessionData.endTime || !sessionData.courseName ||
            !sessionData.startDate || !sessionData.endDate || !sessionData.daysOfWeek?.length || !sessionData.program) {
            toast({ title: "Please fill in all required fields including program, days and dates", variant: "destructive" });
            return;
        }

        try {
            if (editingSessionId) {
                // Update existing session
                const updatedData = {
                    ...sessionData,
                    courseCode: sessionData.courseCode || "N/A",
                    room: sessionData.room || "TBD",
                    lecturer: sessionData.lecturer || "TBD",
                };

                const response = await api.put<ClassSession>(`/class-sessions/${editingSessionId}`, updatedData);
                const updatedSession = response.data;

                setClassSessions(prev => prev.map(s => s.id === editingSessionId ? updatedSession : s));
                toast({ title: "Class schedule updated successfully" });
            } else {
                // Create new session
                const newSessionData = {
                    ...sessionData,
                    courseCode: sessionData.courseCode || "N/A",
                    room: sessionData.room || "TBD",
                    lecturer: sessionData.lecturer || "TBD",
                };

                const response = await api.post<ClassSession>('/class-sessions', newSessionData);
                const session = response.data;

                setClassSessions(prev => [...prev, session]);
                toast({ title: "Class schedule created successfully" });
            }

            setEditingSessionId(null);
            // Dialog close is handled by the Dialog component calling onOpenChange(false)
        } catch (error) {
            console.error("Failed to save session:", error);
            toast({ title: "Failed to save class session", variant: "destructive" });
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to remove this class?")) return;
        try {
            await api.delete(`/class-sessions/${sessionId}`);
            setClassSessions(prev => prev.filter(s => s.id !== sessionId));
            toast({ title: "Class removed" });
        } catch (error) {
            console.error("Failed to delete sesson:", error);
            toast({ title: "Failed to remove class", variant: "destructive" });
        }
    };

    const editingSession = editingSessionId
        ? classSessions.find(s => s.id === editingSessionId) || null
        : null;

    return (
        <MainLayout title="Class Routine">
            <div className="space-y-6">
                <div className="flex flex-col gap-6">
                    {/* Welcome Header */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-xl font-semibold">Welcome to MetaHorizon Life 👋</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        {isAdmin && (
                            <Button className="gap-2" onClick={() => { setEditingSessionId(null); setIsDialogOpen(true); }}>
                                <Plus className="h-4 w-4" />
                                Add Class
                            </Button>
                        )}
                    </div>

                    <RoutineFilters
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        selectedProgram={selectedProgram}
                        setSelectedProgram={setSelectedProgram}
                        programs={programs}
                    />

                    <DaysNavigation
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                    />

                    <DailySchedule
                        selectedDay={selectedDay}
                        sessions={getSessionsForDay(selectedDay)}
                        isAdmin={isAdmin}
                        onEdit={handleEditSession}
                        onDelete={handleDeleteSession}
                    />
                </div>
            </div>

            <ClassSessionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveSession}
                editingSession={editingSession}
                programs={programs}
                courses={courses}
            />
        </MainLayout>
    );
}
