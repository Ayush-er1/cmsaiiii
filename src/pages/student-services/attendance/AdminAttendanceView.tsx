import { useState, useEffect } from "react";
import { Search, Download, Check, X, Calendar, Filter, Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface AttendanceRecord {
    id: string;
    User_Id: string;
    personName: string;
    course?: string;
    department?: string;
    date: string;
    status: "present" | "absent" | "late";
}

export function AdminAttendanceView() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
    const [staffRecords, setStaffRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Selection lists for marking
    const [studentList, setStudentList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [courses, setCourses] = useState<string[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);

    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState("students");
    const [showFilters, setShowFilters] = useState(false);

    // Marking Logic State
    const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
    const [isMarkingStaffAttendance, setIsMarkingStaffAttendance] = useState(false);
    const [isInMarkingMode, setIsInMarkingMode] = useState(false);
    const [markingType, setMarkingType] = useState<"student" | "staff" | null>(null);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, "present" | "absent" | "late">>({});
    const [staffAttendanceMap, setStaffAttendanceMap] = useState<Record<string, "present" | "absent" | "late">>({});

    const userRole = user?.role || "super_admin";
    const isSuperAdmin = userRole === "super_admin";
    const isAdmin = userRole === "admin";
    const isStaff = userRole === "staff" || userRole === "teacher";
    const staffAssignedCourses = user?.assignedCourses || [];

    // Fetch data (Placeholder for real API)
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                // Real API calls would go here
                // const response = await api.get("/attendance");
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch attendance:", err);
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [activeTab]);

    // Filter Logic
    const filteredStudentRecords = studentRecords.filter((r) => {
        const matchesSearch = r.personName.toLowerCase().includes(search.toLowerCase()) || r.User_Id.toLowerCase().includes(search.toLowerCase());
        const matchesCourse = courseFilter === "all" || r.course === courseFilter;
        const matchesDate = !dateFilter || r.date === dateFilter;

        if (isStaff && !staffAssignedCourses.includes(r.course || "")) return false;

        return matchesSearch && matchesCourse && matchesDate;
    });

    const filteredStaffRecords = staffRecords.filter((r) => {
        const matchesSearch = r.personName.toLowerCase().includes(search.toLowerCase()) || r.User_Id.toLowerCase().includes(search.toLowerCase());
        const matchesDepartment = departmentFilter === "all" || r.department === departmentFilter;
        const matchesDate = !dateFilter || r.date === dateFilter;
        return matchesSearch && matchesDepartment && matchesDate;
    });

    const currentRecords = activeTab === "students" ? filteredStudentRecords : filteredStaffRecords;
    const presentCount = currentRecords.filter((r) => r.status === "present").length;
    const absentCount = currentRecords.filter((r) => r.status === "absent").length;
    const lateCount = currentRecords.filter((r) => r.status === "late").length;

    const handleMarkAttendance = () => {
        if (!selectedCourse || !attendanceDate) {
            toast({ title: "Please select course and date", variant: "destructive" });
            return;
        }
        setIsMarkingAttendance(false);
        setMarkingType("student");
        setIsInMarkingMode(true);
    };

    const handleMarkStaffAttendance = () => {
        if (!selectedDepartment || !attendanceDate) {
            toast({ title: "Please select department and date", variant: "destructive" });
            return;
        }
        setIsMarkingStaffAttendance(false);
        setMarkingType("staff");
        setIsInMarkingMode(true);
    };

    const handleSaveMarkedAttendance = async () => {
        try {
            // Implementation for saving to API would go here
            toast({ title: "Attendance saved successfully" });
            setIsInMarkingMode(false);
            setStudentAttendanceMap({});
            setStaffAttendanceMap({});
            setMarkingType(null);
        } catch (err) {
            toast({ title: "Failed to save attendance", variant: "destructive" });
        }
    };

    const markAllAs = (status: "present" | "absent" | "late") => {
        if (markingType === "student") {
            const list = studentList.filter(s => s.course === selectedCourse);
            const newMap: Record<string, "present" | "absent" | "late"> = {};
            list.forEach(student => newMap[student.User_Id] = status);
            setStudentAttendanceMap(newMap);
        } else if (markingType === "staff") {
            const list = staffList.filter(s => s.department === selectedDepartment);
            const newMap: Record<string, "present" | "absent" | "late"> = {};
            list.forEach(staff => newMap[staff.User_Id] = status);
            setStaffAttendanceMap(newMap);
        }
    };

    const toggleStatus = (userId: string, status: "present" | "absent" | "late") => {
        if (markingType === "student") {
            setStudentAttendanceMap(prev => ({ ...prev, [userId]: status }));
        } else {
            setStaffAttendanceMap(prev => ({ ...prev, [userId]: status }));
        }
    };

    if (isInMarkingMode) {
        const listToDisplay = markingType === "student"
            ? studentList.filter(s => s.course === selectedCourse)
            : staffList.filter(s => s.department === selectedDepartment);

        const attendanceMap = markingType === "student" ? studentAttendanceMap : staffAttendanceMap;
        const markedCount = Object.keys(attendanceMap).length;

        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Mark Attendance</h2>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span><strong>{markingType === "student" ? "Course:" : "Department:"}</strong> {markingType === "student" ? selectedCourse : selectedDepartment}</span>
                                    <span><strong>Date:</strong> {new Date(attendanceDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setIsInMarkingMode(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Quick Actions:</span>
                            <Button size="sm" onClick={() => markAllAs("present")} className="gap-2"><Check className="h-4 w-4" /> Mark All Present</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">No.</TableHead>
                                    <TableHead className="w-32">User ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-80">Mark Attendance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listToDisplay.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No members found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listToDisplay.map((person, index) => {
                                        const currentStatus = attendanceMap[person.User_Id];
                                        return (
                                            <TableRow key={person.User_Id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-mono text-sm">{person.User_Id}</TableCell>
                                                <TableCell>{person.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant={currentStatus === "present" ? "default" : "outline"} onClick={() => toggleStatus(person.User_Id, "present")} className="flex-1">Present</Button>
                                                        <Button size="sm" variant={currentStatus === "absent" ? "destructive" : "outline"} onClick={() => toggleStatus(person.User_Id, "absent")} className="flex-1">Absent</Button>
                                                        <Button size="sm" variant={currentStatus === "late" ? "secondary" : "outline"} onClick={() => toggleStatus(person.User_Id, "late")} className="flex-1">Late</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsInMarkingMode(false)}>Cancel</Button>
                    <Button onClick={handleSaveMarkedAttendance} disabled={markedCount === 0} size="lg">Save Attendance</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {(isSuperAdmin || isAdmin) && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="students">Student Attendance</TabsTrigger>
                        <TabsTrigger value="staff">Staff/Faculty Attendance</TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{activeTab === "students" ? "Student Attendance Records" : "Staff Attendance Records"}</h3>
                            <div className="flex gap-2">
                                {/* Student Marking Dialog */}
                                {(isStaff || isAdmin || isSuperAdmin) && activeTab === "students" && (
                                    <Dialog open={isMarkingAttendance} onOpenChange={setIsMarkingAttendance}>
                                        <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Mark New Attendance</Button></DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Select Course & Date</DialogTitle></DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Course</Label>
                                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                                        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                                        <SelectContent>
                                                            {courses.length === 0 ? (
                                                                <SelectItem value="none" disabled>No courses available</SelectItem>
                                                            ) : (
                                                                (isStaff ? staffAssignedCourses : courses).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Date</Label>
                                                    <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsMarkingAttendance(false)}>Cancel</Button>
                                                <Button onClick={handleMarkAttendance} disabled={courses.length === 0}>Start Marking</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {/* Staff Marking Dialog */}
                                {(isAdmin || isSuperAdmin) && activeTab === "staff" && (
                                    <Dialog open={isMarkingStaffAttendance} onOpenChange={setIsMarkingStaffAttendance}>
                                        <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Mark Staff Attendance</Button></DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Select Department & Date</DialogTitle></DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Department</Label>
                                                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                                        <SelectContent>
                                                            {departments.length === 0 ? (
                                                                <SelectItem value="none" disabled>No departments available</SelectItem>
                                                            ) : (
                                                                departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Date</Label>
                                                    <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsMarkingStaffAttendance(false)}>Cancel</Button>
                                                <Button onClick={handleMarkStaffAttendance} disabled={departments.length === 0}>Start Marking</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
                            </div>
                            <Button variant={showFilters ? "secondary" : "outline"} size="icon" onClick={() => setShowFilters(!showFilters)}><Filter className="h-5 w-5" /></Button>
                        </div>

                        {showFilters && (
                            <Card className="bg-muted/30">
                                <CardContent className="p-4 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeTab === "students" ? (
                                        <div className="space-y-1.5">
                                            <Label>Course</Label>
                                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Courses</SelectItem>
                                                    {(isStaff ? staffAssignedCourses : courses).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label>Department</Label>
                                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Departments</SelectItem>
                                                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <Label>Date</Label>
                                        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/20 text-chart-4"><Check className="h-6 w-6" /></div>
                        <div><p className="text-xl font-bold">{presentCount}</p><p className="text-sm text-muted-foreground">Present</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive"><X className="h-6 w-6" /></div>
                        <div><p className="text-xl font-bold">{absentCount}</p><p className="text-sm text-muted-foreground">Absent</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/20 text-chart-2"><Calendar className="h-6 w-6" /></div>
                        <div><p className="text-xl font-bold">{lateCount}</p><p className="text-sm text-muted-foreground">Late</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Loading records...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No attendance records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentRecords.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono">{r.User_Id}</TableCell>
                                        <TableCell>{r.personName}</TableCell>
                                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={r.status === "present" ? "default" : r.status === "absent" ? "destructive" : "secondary"}>
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
