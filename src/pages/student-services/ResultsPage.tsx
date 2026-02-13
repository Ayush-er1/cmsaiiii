import { useState } from "react";
import { Search, Download, Edit, Save, X, Filter } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

interface ResultRecord {
  id: string;
  User_Id: string;
  studentName: string;
  course: string;
  courseCode: string;
  year: string;
  semester: string;
  grade: string;
  score: number;
  credits: number;
}

const mockResults: ResultRecord[] = [];

const gradeColors: Record<string, string> = {
  "A+": "bg-primary text-primary-foreground",
  "A": "bg-primary text-primary-foreground",
  "A-": "bg-primary text-primary-foreground",
  "B+": "bg-primary text-primary-foreground",
  "B": "bg-primary text-primary-foreground",
  "B-": "bg-primary text-primary-foreground",
  "C+": "bg-chart-1 text-white",
  "C": "bg-chart-1 text-white",
  "C-": "bg-chart-1 text-white",
  "D": "bg-destructive text-destructive-foreground",
  "F": "bg-destructive text-destructive-foreground",
};

const years = ["2025", "2024", "2023"];
const semesters = ["Fall", "Spring"];
const courses = ["CS101", "CS201", "MBA501", "ME301"];

export function ResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState(mockResults);
  const userRole = user?.role || "student";
  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff" || userRole === "teacher";
  const canEdit = isSuperAdmin || isAdmin || isStaff;
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ grade: "", score: "" });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.User_Id.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === "all" || r.courseCode === courseFilter;
    const matchesYear = yearFilter === "all" || r.year === yearFilter;
    const matchesSemester = semesterFilter === "all" || r.semester === semesterFilter;
    return matchesSearch && matchesCourse && matchesYear && matchesSemester;
  });

  const startEdit = (result: ResultRecord) => {
    setEditingId(result.id);
    setEditData({ grade: result.grade, score: result.score.toString() });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ grade: "", score: "" });
  };

  const saveEdit = (id: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, grade: editData.grade, score: parseInt(editData.score) }
          : r
      )
    );
    setEditingId(null);
    toast({ title: "Result updated successfully" });
  };

  const handleExport = () => {
    toast({ title: "Exporting results data..." });
    // todo: implement real export
  };

  return (
    <MainLayout title="Academic Results">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-white dark:bg-zinc-900 border-[#243F76]/10 dark:border-white/10 shadow-sm"
                data-testid="input-search-results"
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

              <Button variant="outline" onClick={handleExport} className="h-11 px-4 gap-2 border-[#243F76]/10 dark:border-white/10" data-testid="button-export-results">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card className="bg-muted/30 border-[#243F76]/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Course</Label>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                      <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" data-testid="select-course-filter">
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Academic Year</Label>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" data-testid="select-year-filter">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Semester</Label>
                    <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                      <SelectTrigger className="bg-white dark:bg-zinc-900 border-[#243F76]/10 h-10" data-testid="select-semester-filter">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {semesters.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(courseFilter !== "all" || yearFilter !== "all" || semesterFilter !== "all") && (
            <div className="flex flex-wrap gap-2 px-1">
              {courseFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setCourseFilter("all")}>
                  Course: {courseFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {yearFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setYearFilter("all")}>
                  Year: {yearFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {semesterFilter !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSemesterFilter("all")}>
                  Semester: {semesterFilter}
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Course</TableHead>
                  <TableHead className="w-20">Code</TableHead>
                  <TableHead className="hidden lg:table-cell w-28">Semester</TableHead>
                  <TableHead className="w-20 text-center">Score</TableHead>
                  <TableHead className="w-16 text-center">Grade</TableHead>
                  <TableHead className="w-20 text-center">Credits</TableHead>
                  <TableHead className="w-24 text-right">{canEdit && "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                    <TableCell className="font-mono text-sm">{result.User_Id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.studentName}</p>
                        <p className="text-sm text-muted-foreground md:hidden">
                          {result.course}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {result.course}
                    </TableCell>
                    <TableCell className="font-mono">{result.courseCode}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {result.semester} {result.year}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === result.id ? (
                        <Input
                          type="number"
                          value={editData.score}
                          onChange={(e) => setEditData({ ...editData, score: e.target.value })}
                          className="h-8 w-16 text-center"
                          min={0}
                          max={100}
                          data-testid={`input-score-${result.id}`}
                        />
                      ) : (
                        result.score
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === result.id ? (
                        <Select
                          value={editData.grade}
                          onValueChange={(v) => setEditData({ ...editData, grade: v })}
                        >
                          <SelectTrigger className="h-8 w-16" data-testid={`select-grade-${result.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map(
                              (g) => (
                                <SelectItem key={g} value={g}>
                                  {g}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={gradeColors[result.grade] || "bg-muted"}>
                          {result.grade}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{result.credits}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        {editingId === result.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => saveEdit(result.id)}
                              data-testid={`button-save-result-${result.id}`}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(result)}
                            data-testid={`button-edit-result-${result.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredResults.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No results found for the selected filters.
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
