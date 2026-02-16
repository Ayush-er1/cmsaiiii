import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CourseFiltersProps {
    showFilters: boolean;
    isAdmin: boolean;
    departmentFilter: string;
    setDepartmentFilter: (value: string) => void;
    programFilter: string;
    setProgramFilter: (value: string) => void;
    availableDepartments: string[];
    filteredPrograms: string[];
}

export function CourseFilters({
    showFilters,
    isAdmin,
    departmentFilter,
    setDepartmentFilter,
    programFilter,
    setProgramFilter,
    availableDepartments,
    filteredPrograms
}: CourseFiltersProps) {
    if (!showFilters) return null;

    return (
        <>
            <Card className="bg-muted/30 border-[#243F76]/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {!isAdmin && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Department</Label>
                                <Select
                                    value={departmentFilter}
                                    onValueChange={(v) => {
                                        setDepartmentFilter(v);
                                        setProgramFilter("all");
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-zinc-950 border-[#243F76]/10 h-10" data-testid="select-department-filter">
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {availableDepartments.map((d) => (
                                            <SelectItem key={d} value={d}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Program</Label>
                            <Select value={programFilter} onValueChange={setProgramFilter}>
                                <SelectTrigger className="bg-white dark:bg-zinc-950 border-[#243F76]/10 h-10" data-testid="select-program-filter">
                                    <SelectValue placeholder="Filter by program" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {filteredPrograms.map((p) => (
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

            {(departmentFilter !== "all" || programFilter !== "all") && (
                <div className="flex flex-wrap gap-2 px-1">
                    {departmentFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-muted" onClick={() => setDepartmentFilter("all")}>
                            Dept: {departmentFilter}
                            <X className="h-3 w-3" />
                        </Badge>
                    )}
                    {programFilter !== "all" && (
                        <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-muted" onClick={() => setProgramFilter("all")}>
                            Program: {programFilter}
                            <X className="h-3 w-3" />
                        </Badge>
                    )}
                </div>
            )}
        </>
    );
}
