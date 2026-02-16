import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ClassSession, Course, DAYS } from "@/types/academics";

interface ClassSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (session: Partial<ClassSession>) => void;
    editingSession: ClassSession | null;
    programs: string[];
    courses: Course[];
}

const defaultSession: Partial<ClassSession> = {
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
};

export function ClassSessionDialog({
    open,
    onOpenChange,
    onSave,
    editingSession,
    programs,
    courses
}: ClassSessionDialogProps) {
    const [session, setSession] = useState<Partial<ClassSession>>(defaultSession);

    useEffect(() => {
        if (editingSession) {
            setSession(editingSession);
        } else {
            setSession(defaultSession);
        }
    }, [editingSession, open]);

    const handleSave = () => {
        onSave(session);
        onOpenChange(false);
    };

    const toggleDaySelection = (day: string) => {
        setSession(prev => {
            const currentDays = prev.daysOfWeek || [];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            return { ...prev, daysOfWeek: newDays };
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingSession ? "Edit Class Schedule" : "Schedule New Class"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="program">Academic Program</Label>
                        <Select
                            value={session.program}
                            onValueChange={(v) => setSession({ ...session, program: v })}
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
                                value={session.courseCode}
                                onValueChange={(code) => {
                                    const course = courses.find(c => c.code === code);
                                    if (course) {
                                        setSession({
                                            ...session,
                                            courseCode: course.code,
                                            courseName: course.name,
                                            lecturer: course.lecturer,
                                        });
                                    } else {
                                        setSession({ ...session, courseCode: code });
                                    }
                                }}
                            >
                                <SelectTrigger id="courseCode">
                                    <SelectValue placeholder="Select course code" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses
                                        .filter(c => !session.program || c.program === session.program)
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
                                value={session.courseName}
                                onValueChange={(name) => {
                                    const course = courses.find(c => c.name === name);
                                    if (course) {
                                        setSession({
                                            ...session,
                                            courseCode: course.code,
                                            courseName: course.name,
                                            lecturer: course.lecturer,
                                        });
                                    } else {
                                        setSession({ ...session, courseName: name });
                                    }
                                }}
                            >
                                <SelectTrigger id="courseName">
                                    <SelectValue placeholder="Select course name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses
                                        .filter(c => !session.program || c.program === session.program)
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
                                value={session.startTime}
                                onChange={(e) => setSession({ ...session, startTime: e.target.value })}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={session.endTime}
                                onChange={(e) => setSession({ ...session, endTime: e.target.value })}
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
                                value={session.room}
                                onChange={(e) => setSession({ ...session, room: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lecturer">Lecturer</Label>
                            <Input
                                id="lecturer"
                                value={session.lecturer}
                                onChange={(e) => setSession({ ...session, lecturer: e.target.value })}
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
                                value={session.startDate}
                                onChange={(e) => setSession({ ...session, startDate: e.target.value })}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={session.endDate}
                                onChange={(e) => setSession({ ...session, endDate: e.target.value })}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Days of Week</Label>
                        <div className="grid grid-cols-4 gap-3">
                            {DAYS.map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`day-${day}`}
                                        checked={session.daysOfWeek?.includes(day)}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>{editingSession ? "Update Class" : "Schedule Class"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
