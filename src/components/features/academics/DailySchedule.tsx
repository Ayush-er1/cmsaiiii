import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, User } from "lucide-react";
import { ClassSession } from "@/types/academics";

interface DailyScheduleProps {
    selectedDay: string;
    sessions: ClassSession[];
    isAdmin: boolean;
    onEdit: (session: ClassSession) => void;
    onDelete: (id: string) => void;
}

export function DailySchedule({ selectedDay, sessions, isAdmin, onEdit, onDelete }: DailyScheduleProps) {
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

    return (
        <Card className="p-6 bg-card border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 mb-4 px-4 text-sm font-medium text-muted-foreground">
                <div className="hidden md:block">Time</div>
                <div className="hidden md:block">Courses</div>
            </div>

            <div className="space-y-2">
                {sessions.length > 0 ? (
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
                                                onClick={() => onEdit(session)}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                                                onClick={() => onDelete(session.id)}
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
                )}
            </div>
        </Card>
    );
}
