import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CourseSearchBarProps {
    search: string;
    setSearch: (value: string) => void;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    canManageCourses: boolean;
    onAddCourse: () => void;
}

export function CourseSearchBar({
    search,
    setSearch,
    showFilters,
    setShowFilters,
    canManageCourses,
    onAddCourse
}: CourseSearchBarProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-11 bg-white dark:bg-zinc-950 border-[#243F76]/10 dark:border-white/10 shadow-sm"
                    data-testid="input-search-courses"
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                    variant={showFilters ? "secondary" : "outline"}
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-11 w-11 shrink-0 ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'border-[#243F76]/10 dark:border-white/10'}`}
                    title="Filter Options"
                    data-testid="button-toggle-filters"
                >
                    <Filter className="h-5 w-5" />
                </Button>
                {canManageCourses && (
                    <Button onClick={onAddCourse} className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all" data-testid="button-add-course">
                        <Plus className="h-4 w-4" />
                        Add Course
                    </Button>
                )}
            </div>
        </div>
    );
}
