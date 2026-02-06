import { useState } from "react";
import { Search, Download, Check, X, Calendar, Filter, Plus } from "lucide-react";
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

// Mock Data
interface AttendanceRecord {
    id: string;
    User_Id: string;
    personName: string;
    course?: string;
    department?: string;
    date: string;
    status: "present" | "absent" | "late";
}

const mockStudentAttendance: AttendanceRecord[] = [
    { id: "1", User_Id: "STU2024001", personName: "Emily Parker", course: "CS101", date: "2025-12-15", status: "present" },
    { id: "2", User_Id: "STU2024002", personName: "James Wilson", course: "MBA501", date: "2025-12-15", status: "present" },
    { id: "3", User_Id: "STU2023015", personName: "Robert Lee", course: "ME301", date: "2025-12-15", status: "absent" },
    { id: "4", User_Id: "STU2024001", personName: "Emily Parker", course: "CS201", date: "2025-12-15", status: "late" },
    { id: "5", User_Id: "STU2024003", personName: "Sarah Brown", course: "CS101", date: "2025-12-15", status: "present" },
    { id: "6", User_Id: "STU2024004", personName: "Michael Davis", course: "CS101", date: "2025-12-15", status: "present" },
];

const mockStaffAttendance: AttendanceRecord[] = [
    { id: "s1", User_Id: "FAC001", personName: "Prof. Michael Chen", department: "Computer Science", date: "2025-12-15", status: "present" },
    { id: "s2", User_Id: "FAC002", personName: "Dr. Lisa Wang", department: "Computer Science", date: "2025-12-15", status: "present" },
    { id: "s3", User_Id: "FAC003", personName: "Prof. James Wilson", department: "Business", date: "2025-12-15", status: "late" },
    { id: "s4", User_Id: "FAC004", personName: "Dr. Robert Lee", department: "Mechanical Engineering", date: "2025-12-15", status: "present" },
];

// Mock Lists for marking
const mockStudentList = [
    { User_Id: "STU2024001", name: "Emily Parker", course: "CS101" },
    { User_Id: "STU2024002", name: "James Wilson", course: "MBA501" },
    { User_Id: "STU2024003", name: "Sarah Brown", course: "CS101" },
    { User_Id: "STU2024004", name: "Michael Davis", course: "CS101" },
    { User_Id: "STU2023015", name: "Robert Lee", course: "ME301" },
];

const mockStaffList = [
    { User_Id: "FAC001", name: "Prof. Michael Chen", department: "Computer Science" },
    { User_Id: "FAC002", name: "Dr. Lisa Wang", department: "Computer Science" },
    { User_Id: "FAC003", name: "Prof. James Wilson", department: "Business" },
    { User_Id: "FAC004", name: "Dr. Robert Lee", department: "Mechanical Engineering" },
];

const courses = ["CS101", "CS201", "MBA501", "ME301"];
const departments = ["Computer Science", "Business", "Mechanical Engineering", "Administration", "IT Support"];

export function AdminAttendanceView() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [studentRecords, setStudentRecords] = useState(mockStudentAttendance);
    const [staffRecords, setStaffRecords] = useState(mockStaffAttendance);
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [isEditing, setIsEditing] = useState(false);
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

    const canEditStudents = isStaff;
    const canEditStaff = isSuperAdmin || isAdmin;

    // Filter Logic
    const filteredStudentRecords = studentRecords.filter((r) => {
        const matchesSearch = r.personName.toLowerCase().includes(search.toLowerCase()) || r.User_Id.toLowerCase().includes(search.toLowerCase());
        const matchesCourse = courseFilter === "all" || r.course === courseFilter;
        const matchesDate = !dateFilter || r.date === dateFilter;

        // Staff constraint
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

    const handleSaveMarkedAttendance = () => {
        if (markingType === "student") {
            const newRecords: AttendanceRecord[] = Object.entries(studentAttendanceMap).map(([userId, status]) => {
                const student = mockStudentList.find(s => s.User_Id === userId);
                return {
                    id: `${userId}-${attendanceDate}-${Date.now()}`,
                    User_Id: userId,
                    personName: student?.name || "Unknown",
                    course: selectedCourse,
                    date: attendanceDate,
                    status,
                };
            });

            setStudentRecords(prev => [...prev, ...newRecords]);
            toast({ title: `Attendance marked for ${newRecords.length} students` });
        } else if (markingType === "staff") {
            const newRecords: AttendanceRecord[] = Object.entries(staffAttendanceMap).map(([userId, status]) => {
                const staff = mockStaffList.find(s => s.User_Id === userId);
                return {
                    id: `${userId}-${attendanceDate}-${Date.now()}`,
                    User_Id: userId,
                    personName: staff?.name || "Unknown",
                    department: staff?.department,
                    date: attendanceDate,
                    status,
                };
            });

            setStaffRecords(prev => [...prev, ...newRecords]);
            toast({ title: `Staff attendance marked for ${newRecords.length} members` });
        }

        setIsInMarkingMode(false);
        setStudentAttendanceMap({});
        setStaffAttendanceMap({});
        setSelectedCourse("");
        setSelectedDepartment("");
        setMarkingType(null);
    };

    const markAllAs = (status: "present" | "absent" | "late") => {
        if (markingType === "student") {
            const allStudents = mockStudentList.filter(s => s.course === selectedCourse);
            const newMap: Record<string, "present" | "absent" | "late"> = {};
            allStudents.forEach(student => newMap[student.User_Id] = status);
            setStudentAttendanceMap(newMap);
        } else if (markingType === "staff") {
            const allStaff = mockStaffList.filter(s => s.department === selectedDepartment);
            const newMap: Record<string, "present" | "absent" | "late"> = {};
            allStaff.forEach(staff => newMap[staff.User_Id] = status);
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
            ? mockStudentList.filter(s => s.course === selectedCourse)
            : mockStaffList.filter(s => s.department === selectedDepartment);

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
                                {listToDisplay.map((person, index) => {
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
                                })}
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
                                {isStaff && activeTab === "students" && (
                                    <Dialog open={isMarkingAttendance} onOpenChange={setIsMarkingAttendance}>
                                        <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Mark New Attendance</Button></DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Select Course & Date</DialogTitle></DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Course</Label>
                                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                                        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                                        <SelectContent>{(isStaff ? staffAssignedCourses : courses).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Date</Label>
                                                    <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsMarkingAttendance(false)}>Cancel</Button>
                                                <Button onClick={handleMarkAttendance}>Start Marking</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {/* Staff Marking Dialog */}
                                {isAdmin && activeTab === "staff" && (
                                    <Dialog open={isMarkingStaffAttendance} onOpenChange={setIsMarkingStaffAttendance}>
                                        <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Mark Staff Attendance</Button></DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Select Department & Date</DialogTitle></DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label>Department</Label>
                                                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                                        <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Date</Label>
                                                    <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsMarkingStaffAttendance(false)}>Cancel</Button>
                                                <Button onClick={handleMarkStaffAttendance}>Start Marking</Button>
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
                                {isEditing && <TableHead>Action</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentRecords.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-mono">{r.User_Id}</TableCell>
                                    <TableCell>{r.personName}</TableCell>
                                    <TableCell>{r.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={r.status === "present" ? "default" : r.status === "absent" ? "destructive" : "secondary"}>
                                            {r.status}
                                        </Badge>
                                    </TableCell>
                                    {isEditing && (
                                        <TableCell><Button size="sm" variant="outline">Edit</Button></TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
