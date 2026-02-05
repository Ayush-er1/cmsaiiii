import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Clock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    description: string;

    type: "academic" | "holiday" | "event";
    color?: string;
}



const initialEvents: CalendarEvent[] = [
    {
        id: "1",
        title: "Semester Final Exams",
        date: new Date(2025, 11, 20), // Dec 20, 2025
        description: "Final examinations for Fall semester.",

        type: "academic",
    },
    {
        id: "2",
        title: "Winter Break Starts",
        date: new Date(2025, 11, 24),
        description: "College closed for winter holidays.",
        type: "holiday",
    },
    {
        id: "3",
        title: "Christmas Day",
        date: new Date(2025, 11, 25),
        description: "Christmas Day public holiday.",
        type: "holiday",
    },
    {
        id: "4",
        title: "New Year Celebration",
        date: new Date(2026, 0, 1),
        description: "Campus celebration event.",

        type: "event",
    },
    {
        id: "5",
        title: "Spring Semester Orientation",
        date: new Date(2026, 0, 5),
        description: "Orientation for new students.",

        type: "academic",
    },
    {
        id: "6",
        title: "Classes Begin",
        date: new Date(2026, 0, 6),
        description: "First day of Spring semester classes.",
        type: "academic",
    },
    {
        id: "7",
        title: "Martin Luther King Jr. Day",
        date: new Date(2026, 0, 19),
        description: "Public Holiday.",
        type: "holiday",
    },
    {
        id: "8",
        title: "Department Meeting",
        date: new Date(2026, 0, 12),
        description: "Monthly staff meeting.",

        type: "academic",
    },
    {
        id: "9",
        title: "Basketball Tournament",
        date: new Date(2026, 0, 25),
        description: "Inter-college basketball finals.",

        type: "event",
    },
    {
        id: "10",
        title: "Project Submission Deadline",
        date: new Date(2026, 0, 30),
        description: "Final submission for Capstone projects.",

        type: "academic",
    }
];

const eventTypeColors: Record<CalendarEvent["type"], string> = {
    academic: "bg-blue-100 text-blue-800",
    holiday: "bg-red-100 text-red-800",
    event: "bg-green-100 text-green-800",
};

const defaultTypeColors: Record<CalendarEvent["type"], string> = {
    academic: "#3b82f6", // blue-500
    holiday: "#ef4444", // red-500
    event: "#22c55e", // green-500
};

export function CalendarPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: "",
        description: "",

        type: "event",
        color: "#22c55e",

    });

    const isAdmin = user?.role === "super_admin";

    const handleAddEvent = () => {
        if (!newEvent.title || !date) {
            toast({ title: "Please enter a title and select a date", variant: "destructive" });
            return;
        }

        const event: CalendarEvent = {
            id: Date.now().toString(),
            title: newEvent.title,
            date: date,
            description: newEvent.description || "",

            type: (newEvent.type as CalendarEvent["type"]) || "event",
            color: defaultTypeColors[(newEvent.type as CalendarEvent["type"]) || "event"],
        };

        setEvents([...events, event]);
        setIsDialogOpen(false);
        setNewEvent({ title: "", description: "", type: "event", color: "#22c55e" });
        toast({ title: "Event added successfully" });
    };

    const selectedDateEvents = events.filter(
        (event) => date && event.date.toDateString() === date.toDateString()
    );

    const upcomingEvents = events
        .filter((event) => event.date >= new Date())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

    return (
        <MainLayout title="Academic Calendar" className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6 h-full">
                <div className="h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Calendar</CardTitle>
                            {isAdmin && (
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add Event
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Event</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="date">Date</Label>
                                                <div className="p-2 border rounded-md bg-muted/50 text-sm">
                                                    {date ? format(date, "PPP") : "No date selected"}
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="title">Event Title</Label>
                                                <Input
                                                    id="title"
                                                    value={newEvent.title}
                                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                    placeholder="e.g. Science Fair"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">Type</Label>
                                                <select
                                                    id="type"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={newEvent.type}
                                                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                                >
                                                    <option value="academic">Academic</option>
                                                    <option value="event">Event</option>
                                                    <option value="holiday">Holiday</option>
                                                </select>
                                            </div>


                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={newEvent.description}
                                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                    placeholder="Event details..."
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddEvent}>Add Event</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-start p-6">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow-sm p-4 w-full max-w-full"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                                    month: "space-y-4 w-full",
                                    caption: "flex justify-center pt-1 relative items-center w-full",
                                    caption_label: "text-sm font-medium",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full justify-between",
                                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                                    row: "flex w-full justify-between mt-2",
                                    cell: "h-10 w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-10 w-full p-0 font-normal aria-selected:opacity-100",
                                }}
                                modifiers={{}}
                                modifiersStyles={{}}
                                components={{
                                    DayContent: (props) => {
                                        const dayEvents = events.filter(e =>
                                            e.date.getDate() === props.date.getDate() &&
                                            e.date.getMonth() === props.date.getMonth() &&
                                            e.date.getFullYear() === props.date.getFullYear()
                                        );

                                        return (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <span className="text-sm">{props.date.getDate()}</span>
                                                {dayEvents.length > 0 && (
                                                    <div className="absolute bottom-1 flex gap-1 justify-center w-full">
                                                        {dayEvents.slice(0, 3).map((e, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-1.5 h-1.5 rounded-full"
                                                                style={{ backgroundColor: e.color || defaultTypeColors[e.type] }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                }}
                            />

                            <div className="flex flex-wrap gap-4 justify-center mt-6 pt-6 border-t w-full">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm text-muted-foreground">Academic</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm text-muted-foreground">Holiday</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-muted-foreground">Event</span>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{date ? format(date, "MMMM d, yyyy") : "Selected Date"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedDateEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDateEvents.map((event) => (
                                        <div key={event.id} className="border rounded-lg p-3 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold">{event.title}</h4>
                                                <Badge
                                                    variant="secondary"
                                                    className={eventTypeColors[event.type]}
                                                    style={{
                                                        backgroundColor: event.color ? `${event.color}20` : undefined,
                                                        color: event.color,
                                                        borderColor: event.color ? `${event.color}40` : undefined
                                                    }}
                                                >
                                                    {event.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{event.description}</p>


                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No events scheduled for this day.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="flex gap-3 items-start">
                                        <div className="flex flex-col items-center bg-muted/50 rounded-md p-2 min-w-[3.5rem] text-center">
                                            <span className="text-xs font-medium uppercase text-muted-foreground">{format(event.date, "MMM")}</span>
                                            <span className="text-lg font-semibold">{format(event.date, "d")}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none mb-1">{event.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {upcomingEvents.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">No upcoming events.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
