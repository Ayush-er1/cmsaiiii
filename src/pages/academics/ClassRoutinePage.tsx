import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapPin, User, Plus, Trash2, Edit, Calendar, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface ClassSession {
    id: string;
    startTime: string;
    endTime: string;
    courseCode: string;
    courseName: string;
    room: string;
    lecturer: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    daysOfWeek: string[]; // e.g., ["Sunday", "Monday"]
    program: string; // Academic program
}

// Store all class sessions in a flat array with comprehensive demo data
const initialClassSessions: ClassSession[] = [];

// Course reference data for dropdowns
const availableCourses: { code: string; name: string; lecturer: string; program: string }[] = [];

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
    const [classSessions, setClassSessions] = useState<ClassSession[]>(initialClassSessions);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [newSession, setNewSession] = useState<Partial<ClassSession>>({
        startTime: "",
        endTime: "",
        courseCode: "",
        courseName: "",
        room: "",
        lecturer: "",
        startDate: "",
        endDate: "",
        daysOfWeek: [],
        program: "",
    });

    // Get unique programs from class sessions
    const programs = Array.from(new Set(classSessions.map(s => s.program)));

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
        setNewSession({
            startTime: session.startTime,
            endTime: session.endTime,
            courseCode: session.courseCode,
            courseName: session.courseName,
            room: session.room,
            lecturer: session.lecturer,
            startDate: session.startDate,
            endDate: session.endDate,
            daysOfWeek: session.daysOfWeek,
            program: session.program,
        });
        setIsDialogOpen(true);
    };

    const handleAddSession = () => {
        if (!newSession.startTime || !newSession.endTime || !newSession.courseName ||
            !newSession.startDate || !newSession.endDate || !newSession.daysOfWeek?.length || !newSession.program) {
            toast({ title: "Please fill in all required fields including program, days and dates", variant: "destructive" });
            return;
        }

        if (editingSessionId) {
            // Update existing session
            const updatedSession: ClassSession = {
                id: editingSessionId,
                startTime: newSession.startTime!,
                endTime: newSession.endTime!,
                courseCode: newSession.courseCode || "N/A",
                courseName: newSession.courseName!,
                room: newSession.room || "TBD",
                lecturer: newSession.lecturer || "TBD",
                startDate: newSession.startDate!,
                endDate: newSession.endDate!,
                daysOfWeek: newSession.daysOfWeek!,
                program: newSession.program!,
            };

            setClassSessions(prev => prev.map(s => s.id === editingSessionId ? updatedSession : s));
            toast({ title: "Class schedule updated successfully" });
        } else {
            // Create new session
            const session: ClassSession = {
                id: Date.now().toString(),
                startTime: newSession.startTime!,
                endTime: newSession.endTime!,
                courseCode: newSession.courseCode || "N/A",
                courseName: newSession.courseName!,
                room: newSession.room || "TBD",
                lecturer: newSession.lecturer || "TBD",
                startDate: newSession.startDate!,
                endDate: newSession.endDate!,
                daysOfWeek: newSession.daysOfWeek!,
                program: newSession.program!,
            };

            setClassSessions(prev => [...prev, session]);
            toast({ title: "Class schedule created successfully" });
        }

        setIsDialogOpen(false);
        setEditingSessionId(null);
        setNewSession({
            startTime: "",
            endTime: "",
            courseCode: "",
            courseName: "",
            room: "",
            lecturer: "",
            startDate: "",
            endDate: "",
            daysOfWeek: [],
            program: "",
        });
    };

    const handleDeleteSession = (sessionId: string) => {
        setClassSessions(prev => prev.filter(s => s.id !== sessionId));
        toast({ title: "Class removed" });
    };

    const toggleDaySelection = (day: string) => {
        setNewSession(prev => {
            const currentDays = prev.daysOfWeek || [];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            return { ...prev, daysOfWeek: newDays };
        });
    };

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
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Class
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingSessionId ? "Edit Class Schedule" : "Schedule New Class"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="program">Academic Program</Label>
                                            <Select
                                                value={newSession.program}
                                                onValueChange={(v) => setNewSession({ ...newSession, program: v })}
                                            >
                                                <SelectTrigger id="program">
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
                                                <Label htmlFor="courseCode">Course Code</Label>
                                                <Select
                                                    value={newSession.courseCode}
                                                    onValueChange={(code) => {
                                                        const course = availableCourses.find(c => c.code === code);
                                                        if (course) {
                                                            setNewSession({
                                                                ...newSession,
                                                                courseCode: course.code,
                                                                courseName: course.name,
                                                                lecturer: course.lecturer,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger id="courseCode">
                                                        <SelectValue placeholder="Select course code" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableCourses
                                                            .filter(c => !newSession.program || c.program === newSession.program)
                                                            .map((course) => (
                                                                <SelectItem key={course.code} value={course.code}>
                                                                    {course.code}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="courseName">Course Name</Label>
                                                <Select
                                                    value={newSession.courseName}
                                                    onValueChange={(name) => {
                                                        const course = availableCourses.find(c => c.name === name);
                                                        if (course) {
                                                            setNewSession({
                                                                ...newSession,
                                                                courseCode: course.code,
                                                                courseName: course.name,
                                                                lecturer: course.lecturer,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger id="courseName">
                                                        <SelectValue placeholder="Select course name" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableCourses
                                                            .filter(c => !newSession.program || c.program === newSession.program)
                                                            .map((course) => (
                                                                <SelectItem key={course.name} value={course.name}>
                                                                    {course.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="startTime">Start Time</Label>
                                                <Input
                                                    id="startTime"
                                                    type="time"
                                                    value={newSession.startTime}
                                                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="endTime">End Time</Label>
                                                <Input
                                                    id="endTime"
                                                    type="time"
                                                    value={newSession.endTime}
                                                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="room">Room</Label>
                                                <Input
                                                    id="room"
                                                    placeholder="e.g. 301"
                                                    value={newSession.room}
                                                    onChange={(e) => setNewSession({ ...newSession, room: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="lecturer">Lecturer</Label>
                                                <Input
                                                    id="lecturer"
                                                    value={newSession.lecturer}
                                                    onChange={(e) => setNewSession({ ...newSession, lecturer: e.target.value })}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="startDate">Start Date</Label>
                                                <Input
                                                    id="startDate"
                                                    type="date"
                                                    value={newSession.startDate}
                                                    onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="endDate">End Date</Label>
                                                <Input
                                                    id="endDate"
                                                    type="date"
                                                    value={newSession.endDate}
                                                    onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Days of Week</Label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {days.map((day) => (
                                                    <div key={day} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`day-${day}`}
                                                            checked={newSession.daysOfWeek?.includes(day)}
                                                            onCheckedChange={() => toggleDaySelection(day)}
                                                        />
                                                        <Label
                                                            htmlFor={`day-${day}`}
                                                            className="text-sm font-normal cursor-pointer"
                                                        >
                                                            {day.slice(0, 3)}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingSessionId(null); }}>Cancel</Button>
                                        <Button onClick={handleAddSession}>{editingSessionId ? "Update Class" : "Schedule Class"}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 w-full p-3 bg-[#E3F2FD]/40 dark:bg-zinc-900/40 rounded-xl border border-[#243F76]/10 dark:border-white/10 flex items-center justify-between">
                                <span className="text-sm font-medium text-[#243F76] dark:text-white/80">View Class Schedule</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={showFilters ? "secondary" : "outline"}
                                        size="icon"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`h-9 w-9 shrink-0 ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'border-[#243F76]/10 dark:border-white/10'}`}
                                        title="Filter Options"
                                        data-testid="button-toggle-filters"
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {showFilters && (
                            <Card className="bg-muted/30 border-[#243F76]/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Academic Program</Label>
                                            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" id="program-filter">
                                                    <SelectValue placeholder="All Programs" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Programs</SelectItem>
                                                    {programs.map((p) => (
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

                        {selectedProgram !== "all" && (
                            <div className="flex flex-wrap gap-2 px-1">
                                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedProgram("all")}>
                                    Program: {selectedProgram}
                                    <X className="h-3 w-3" />
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Days Navigation */}
                    <div className="flex flex-wrap gap-2">
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-colors border",
                                    selectedDay === day
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted text-muted-foreground border-border"
                                )}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Schedule Content */}
                    <Card className="p-6 bg-card border shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 mb-4 px-4 text-sm font-medium text-muted-foreground">
                            <div className="hidden md:block">Time</div>
                            <div className="hidden md:block">Courses</div>
                        </div>

                        <div className="space-y-2">
                            {(() => {
                                const sessions = getSessionsForDay(selectedDay);
                                const formatTime = (time: string) => {
                                    // Convert 24h to 12h format if needed
                                    if (!time.includes('AM') && !time.includes('PM')) {
                                        const [hours, minutes] = time.split(':');
                                        const h = parseInt(hours);
                                        const suffix = h >= 12 ? 'PM' : 'AM';
                                        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                                        return `${displayHour.toString().padStart(2, '0')}:${minutes} ${suffix}`;
                                    }
                                    return time;
                                };

                                return sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <div key={session.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3 group">
                                            {/* Time Column */}
                                            <div className="flex flex-row md:flex-col gap-2 md:gap-0 text-sm font-medium text-muted-foreground md:pt-2">
                                                <span>{formatTime(session.startTime)}</span>
                                                <span className="hidden md:inline text-xs opacity-70">{formatTime(session.endTime)}</span>
                                                <span className="md:hidden">- {formatTime(session.endTime)}</span>
                                            </div>

                                            {/* Course Card */}
                                            <Card className="bg-card hover:bg-accent/5 transition-colors border-border/50">
                                                <CardContent className="p-3 relative">
                                                    {isAdmin && (
                                                        <div className="absolute top-1.5 right-1.5 flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7"
                                                                onClick={() => handleEditSession(session)}
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                                                                onClick={() => handleDeleteSession(session.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <div className="pr-14">
                                                        <h3 className="font-semibold text-base leading-tight mb-1.5">
                                                            {session.courseName}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                            <span className="font-mono text-xs font-semibold">{session.courseCode}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                <span>{session.room}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="h-3.5 w-3.5" />
                                                                <span>{session.lecturer}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No classes scheduled for {selectedDay}
                                    </div>
                                );
                            })()}
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
