
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Download,
    Plus,
    Wallet,
    ArrowUpRight,
    Users,
    TrendingUp,
    Filter,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FeeLedgerTable } from "./FeeLedgerTable";
import { cn } from "@/lib/utils";

// Mock data for Admin Fees Panel
const adminFeeStats = {
    totalCollection: 0,
    outstandingBalance: 0,
    totalScholarships: 0,
    studentsWithDue: 0,
    todayCollection: 0,
};

const recentPayments: any[] = [];

const pendingFees: any[] = [];

const scholarshipsAdmin: any[] = [];

const ledgerMockData: any[] = [];

export function AdminFeesView() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [isCollectionOpen, setIsCollectionOpen] = useState(false);
    const [isScholarshipOpen, setIsScholarshipOpen] = useState(false);

    // Form states for collection
    const [collectionData, setCollectionData] = useState({
        studentId: "",
        amount: "",
        method: "Cash",
        date: new Date().toISOString().split('T')[0],
        remarks: ""
    });

    // Form states for scholarship
    const [scholarshipData, setScholarshipData] = useState({
        studentId: "",
        type: "Merit Based",
        amount: "",
        status: "Active"
    });

    const handleViewLedger = (student: any) => {
        setSelectedStudent(student);
        setIsLedgerOpen(true);
    };

    const handleCollectFee = () => {
        if (!collectionData.studentId || !collectionData.amount) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "Success",
            description: `Payment of Rs. ${collectionData.amount} recorded successfully.`
        });
        setIsCollectionOpen(false);
        setCollectionData({
            studentId: "",
            amount: "",
            method: "Cash",
            date: new Date().toISOString().split('T')[0],
            remarks: ""
        });
    };

    const handleSaveScholarship = () => {
        if (!scholarshipData.studentId || !scholarshipData.amount) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "Success",
            description: "Scholarship details updated successfully."
        });
        setIsScholarshipOpen(false);
        setScholarshipData({
            studentId: "",
            type: "Merit Based",
            amount: "",
            status: "Active"
        });
    };

    const filteredPayments = recentPayments.filter(p =>
        p.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.roll.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPending = pendingFees.filter(p =>
        p.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.roll.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredScholarships = scholarshipsAdmin.filter(s =>
        s.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-border shadow-sm font-semibold" onClick={() => toast({ title: "Report Exported", description: "The fee summary report has been downloaded." })}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                    <Button className="font-semibold bg-primary shadow-sm text-primary-foreground" onClick={() => setIsCollectionOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Fee Collection
                    </Button>
                </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">Total Collection</CardTitle>
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-black tracking-tight">Rs. {adminFeeStats.totalCollection.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                            <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-none px-2 py-0 text-[9px] sm:text-[10px] font-semibold">+12.5%</Badge>
                            <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground font-semibold uppercase tracking-wider">vs Last Month</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">Collection Today</CardTitle>
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-black tracking-tight">Rs. {adminFeeStats.todayCollection.toLocaleString()}</div>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2 font-semibold uppercase tracking-wider">Across all channels</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">Outstanding Due</CardTitle>
                        <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <ArrowUpRight className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-black tracking-tight text-orange-600 dark:text-orange-400">Rs. {adminFeeStats.outstandingBalance.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-2 text-orange-600/70 dark:text-orange-400/70">
                            <Users className="h-3 w-3" />
                            <p className="text-[10px] sm:text-xs font-semibold">{adminFeeStats.studentsWithDue} Students Pending</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">Scholarships Dist.</CardTitle>
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight">Rs. {adminFeeStats.totalScholarships.toLocaleString()}</div>
                        <p className="text-xs font-medium text-muted-foreground mt-2 font-semibold uppercase tracking-wider">Financial Aid Pool</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Tabs defaultValue="transactions" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <TabsList className="bg-muted p-1 border border-border inline-flex w-fit">
                            <TabsTrigger value="transactions" className="px-8 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold text-xs md:text-sm">Transactions</TabsTrigger>
                            <TabsTrigger value="defaulters" className="px-8 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold text-xs md:text-sm">Due Payments</TabsTrigger>
                            <TabsTrigger value="scholarships" className="px-8 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold text-xs md:text-sm">Scholarships</TabsTrigger>
                        </TabsList>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Quick search..."
                                className="pl-10 border-border shadow-sm h-9 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value="transactions" className="animate-in fade-in-50 duration-500 mt-0">
                        <Card className="border-border overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-semibold py-4 pl-6">RECEIPT NO</TableHead>
                                        <TableHead className="font-semibold py-4">STUDENT NAME</TableHead>
                                        <TableHead className="font-semibold py-4">ROLL NO</TableHead>
                                        <TableHead className="font-semibold py-4 text-right">AMOUNT</TableHead>
                                        <TableHead className="font-semibold py-4">METHOD</TableHead>
                                        <TableHead className="font-semibold py-4">DATE</TableHead>
                                        <TableHead className="font-semibold py-4 text-right pr-6">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayments.map((p) => (
                                        <TableRow key={p.id} className="border-border hover:bg-muted/30 transition-colors group">
                                            <TableCell className="font-semibold text-primary pl-6">{p.id}</TableCell>
                                            <TableCell className="font-semibold">{p.student}</TableCell>
                                            <TableCell className="text-muted-foreground font-medium text-xs">{p.roll}</TableCell>
                                            <TableCell className="text-right font-black">Rs. {p.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-muted/50 border-border font-semibold px-2 py-0 text-[10px]">
                                                    {p.method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs font-medium">{p.date}</TableCell>
                                            <TableCell className="text-right pr-6 space-x-2">
                                                <Button variant="ghost" size="sm" className="h-8 group-hover:bg-muted font-semibold text-xs" onClick={() => handleViewLedger(p)}>
                                                    Ledger
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 group-hover:bg-muted">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredPayments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="defaulters" className="animate-in fade-in-50 duration-500 mt-0">
                        <Card className="border-border overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-semibold py-4 pl-6">STUDENT</TableHead>
                                        <TableHead className="font-semibold py-4">PROGRAM</TableHead>
                                        <TableHead className="text-right font-semibold py-4">PENDING AMOUNT</TableHead>
                                        <TableHead className="font-semibold py-4 text-center">LAST NOTICE</TableHead>
                                        <TableHead className="text-right font-semibold py-4 pr-6">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPending.map((df, idx) => (
                                        <TableRow key={idx} className="border-border hover:bg-muted/30 transition-colors group">
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{df.student}</span>
                                                    <span className="text-[10px] font-semibold text-muted-foreground">{df.roll}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-semibold">{df.program}</span>
                                                    <span className="text-muted-foreground">{df.semester}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-black text-red-600 dark:text-red-400">Rs. {df.dueAmount.toLocaleString()}</TableCell>
                                            <TableCell className="text-center font-medium text-xs text-muted-foreground">{df.lastNotice}</TableCell>
                                            <TableCell className="text-right pr-6 space-x-2">
                                                <Button variant="outline" size="sm" className="h-8 border-border text-xs font-semibold hover:bg-muted" onClick={() => handleViewLedger(df)}>
                                                    View Ledger
                                                </Button>
                                                <Button size="sm" className="h-8 bg-foreground hover:bg-foreground/90 text-background text-xs font-semibold px-4">
                                                    Send Notice
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredPending.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No pending payments found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="scholarships" className="animate-in fade-in-50 duration-500 mt-0">
                        <Card className="border-border overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-semibold py-4 pl-6">STUDENT</TableHead>
                                        <TableHead className="font-semibold py-4">PROGRAM</TableHead>
                                        <TableHead className="font-semibold py-4">TYPE</TableHead>
                                        <TableHead className="text-right font-semibold py-4">AMOUNT</TableHead>
                                        <TableHead className="font-semibold py-4 text-center">STATUS</TableHead>
                                        <TableHead className="text-right font-semibold py-4 pr-6">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredScholarships.map((s, idx) => (
                                        <TableRow key={idx} className="border-border hover:bg-muted/30 transition-colors group">
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{s.student}</span>
                                                    <span className="text-[10px] font-semibold text-muted-foreground">{s.roll}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">{s.program}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-none text-[10px] px-2 py-0">
                                                    {s.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">Rs. {s.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={cn(
                                                    "text-[10px] px-2 py-0 font-semibold",
                                                    s.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                                )}>
                                                    {s.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" className="h-8 group-hover:bg-muted font-semibold text-xs" onClick={() => {
                                                    setScholarshipData({
                                                        studentId: s.roll,
                                                        type: s.type,
                                                        amount: s.amount.toString(),
                                                        status: s.status
                                                    });
                                                    setIsScholarshipOpen(true);
                                                }}>
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredScholarships.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No scholarships found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={isLedgerOpen} onOpenChange={setIsLedgerOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                            <span>Fee Ledger: {selectedStudent?.student}</span>
                            <Badge variant="outline" className="font-medium text-xs">{selectedStudent?.roll}</Badge>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <FeeLedgerTable transactions={ledgerMockData} showAction={false} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Fee Collection Dialog */}
            <Dialog open={isCollectionOpen} onOpenChange={setIsCollectionOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">New Fee Collection</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="student-select">Select Student</Label>
                            <Select
                                value={collectionData.studentId}
                                onValueChange={(v) => setCollectionData({ ...collectionData, studentId: v })}
                            >
                                <SelectTrigger id="student-select">
                                    <SelectValue placeholder="Search or select student" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2081-001">Aayush Sharma (2081-001)</SelectItem>
                                    <SelectItem value="2081-042">Bipul Subedi (2081-042)</SelectItem>
                                    <SelectItem value="2081-112">Sita Kumari (2081-112)</SelectItem>
                                    <SelectItem value="2081-022">Kiran Kc (2081-022)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount (Rs.)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={collectionData.amount}
                                    onChange={(e) => setCollectionData({ ...collectionData, amount: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="method">Payment Method</Label>
                                <Select
                                    value={collectionData.method}
                                    onValueChange={(v) => setCollectionData({ ...collectionData, method: v })}
                                >
                                    <SelectTrigger id="method">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="eSewa">eSewa</SelectItem>
                                        <SelectItem value="Khalti">Khalti</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Collection Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={collectionData.date}
                                onChange={(e) => setCollectionData({ ...collectionData, date: e.target.value })}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Input
                                id="remarks"
                                placeholder="Additional details..."
                                value={collectionData.remarks}
                                onChange={(e) => setCollectionData({ ...collectionData, remarks: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsCollectionOpen(false)}>Cancel</Button>
                        <Button className="bg-primary px-8" onClick={handleCollectFee}>Record Payment</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Scholarship Management Dialog */}
            <Dialog open={isScholarshipOpen} onOpenChange={setIsScholarshipOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Manage Scholarship</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="s-student">Student Roll No</Label>
                            <Input
                                id="s-student"
                                value={scholarshipData.studentId}
                                readOnly
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="s-type">Scholarship Type</Label>
                                <Select
                                    value={scholarshipData.type}
                                    onValueChange={(v) => setScholarshipData({ ...scholarshipData, type: v })}
                                >
                                    <SelectTrigger id="s-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Merit Based">Merit Based</SelectItem>
                                        <SelectItem value="Need Based">Need Based</SelectItem>
                                        <SelectItem value="Sports Quota">Sports Quota</SelectItem>
                                        <SelectItem value="Government Grant">Government Grant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="s-status">Status</Label>
                                <Select
                                    value={scholarshipData.status}
                                    onValueChange={(v) => setScholarshipData({ ...scholarshipData, status: v })}
                                >
                                    <SelectTrigger id="s-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="s-amount">Scholarship Amount (Rs.)</Label>
                            <Input
                                id="s-amount"
                                type="number"
                                value={scholarshipData.amount}
                                onChange={(e) => setScholarshipData({ ...scholarshipData, amount: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsScholarshipOpen(false)}>Cancel</Button>
                        <Button className="bg-primary px-8" onClick={handleSaveScholarship}>Update Details</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
