import { cn } from "@/lib/utils";
import { DAYS } from "@/types/academics";

interface DaysNavigationProps {
    selectedDay: string;
    setSelectedDay: (day: string) => void;
}

export function DaysNavigation({ selectedDay, setSelectedDay }: DaysNavigationProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
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
    );
}
