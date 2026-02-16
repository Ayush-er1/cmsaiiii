import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface RoutineFiltersProps {
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    selectedProgram: string;
    setSelectedProgram: (program: string) => void;
    programs: string[];
}

export function RoutineFilters({
    showFilters,
    setShowFilters,
    selectedProgram,
    setSelectedProgram,
    programs
}: RoutineFiltersProps) {
    return (
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
    );
}
