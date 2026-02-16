
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
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
import { cn } from "@/lib/utils";
import {
    Receipt,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Zap,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FeeLedgerTable } from "./FeeLedgerTable";

// Mock data for student fees
const feeStats = {
    totalDue: 0,
    totalPaid: 0,
    netBalance: 0,
    nextDueDate: "-",
};

const scholarships: any[] = [];

const receipts: any[] = [];

const transactions: any[] = [];

export function StudentFeesView() {
    const { toast } = useToast();
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(feeStats.netBalance.toString());

    const handleMockPayment = () => {
        toast({
            title: "Redirecting to Payment Gateway",
            description: "Connecting to secure payment server...",
        });

        setTimeout(() => {
            toast({
                title: "Payment Successful",
                description: `Transaction of Rs. ${paymentAmount} has been processed.`,
            });
            setIsPayModalOpen(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold tracking-tight text-red-500">Total Due</CardTitle>
                        <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Wallet className="h-4.5 w-4.5 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-3xl font-semibold tracking-tight">Rs. {feeStats.totalDue.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                            <div className="h-1 w-1 rounded-full bg-red-500" />
                            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Pending Clearance</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold tracking-tight text-emerald-600">Total Paid</CardTitle>
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <ArrowUpRight className="h-4.5 w-4.5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-3xl font-semibold tracking-tight">Rs. {feeStats.totalPaid.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Verified Payments</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold tracking-tight text-blue-600">Current Balance</CardTitle>
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-200/20">
                            <Receipt className="h-4.5 w-4.5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 sm:pt-0">
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-xl sm:text-3xl font-semibold tracking-tight text-blue-600">Rs. {feeStats.netBalance.toLocaleString()}</div>
                                <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                                    <p className="text-[10px] sm:text-xs font-medium text-slate-500">Academic Standing</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 shadow-lg shadow-blue-500/20 animate-pulse hover:animate-none transition-all"
                                onClick={() => setIsPayModalOpen(true)}
                            >
                                <Zap className="mr-2 h-3.5 w-3.5 fill-current" />
                                Pay Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="balance" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-muted p-1 border border-slate-200 dark:border-border inline-flex w-full md:w-auto">
                    <TabsTrigger value="balance" className="px-10 data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Balance</TabsTrigger>
                    <TabsTrigger value="statement" className="px-10 data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Statement</TabsTrigger>
                    <TabsTrigger value="receipts" className="px-10 data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Receipts</TabsTrigger>
                </TabsList>

                <TabsContent value="balance" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold tracking-tight">Credit Notes & Scholarships</h3>
                            <Badge variant="outline" className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">2 Active Credits</Badge>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {scholarships.map((s) => (
                                <Card key={s.id} className="relative group overflow-hidden border-slate-200 dark:border-border hover:border-emerald-500/50 transition-all duration-300 bg-white/50 dark:bg-muted/30 backdrop-blur-sm">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ArrowDownLeft className="h-20 w-20 text-emerald-500" />
                                    </div>
                                    <CardContent className="pt-6 pb-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{s.date}</p>
                                                <p className="text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">Ref: {s.fiscalYear}/{s.id.split('-')[1]}</p>
                                            </div>
                                            <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-none px-3 font-semibold uppercase tracking-wider text-[10px]">
                                                {s.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-semibold text-slate-800 dark:text-foreground">{s.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Applied automatically to your financial statement.</p>
                                        </div>
                                        <div className="mt-8 flex justify-between items-end border-t border-slate-100 dark:border-border pt-6">
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 dark:text-muted-foreground uppercase tracking-widest pl-0.5 mb-1">Total Credit</p>
                                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Rs. {s.amount.toLocaleString()}</p>
                                            </div>
                                            <Button variant="ghost" className="text-primary font-semibold text-xs hover:bg-slate-100 dark:hover:bg-muted h-9 transition-colors">
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="statement" className="animate-in fade-in-50 duration-500">
                    <Card className="border-slate-200 dark:border-border overflow-hidden shadow-sm">
                        <CardHeader className="bg-slate-50/50 dark:bg-muted/50 border-b border-slate-200 dark:border-border pt-6">
                            <CardTitle className="text-base font-semibold">Academic Fee Ledger</CardTitle>
                            <CardDescription>Complete audit trail of all academic financial transactions.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <FeeLedgerTable transactions={transactions} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="receipts" className="space-y-4">
                    <Card className="border-border shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-semibold py-4 pl-6 text-xs uppercase tracking-wider">Receipt Date</TableHead>
                                        <TableHead className="font-semibold py-4 text-xs uppercase tracking-wider">Receipt No</TableHead>
                                        <TableHead className="font-semibold py-4 text-xs uppercase tracking-wider">Fiscal Year</TableHead>
                                        <TableHead className="text-right font-semibold py-4 text-xs uppercase tracking-wider">Total Amount</TableHead>
                                        <TableHead className="text-right font-semibold py-4 text-xs uppercase tracking-wider">Tax Amount</TableHead>
                                        <TableHead className="text-right font-semibold py-4 pr-6 text-xs uppercase tracking-wider">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receipts.map((r) => (
                                        <TableRow key={r.id} className="border-border hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-muted-foreground text-xs pl-6">{r.date}</TableCell>
                                            <TableCell className="font-semibold">{r.id}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{r.fiscalYear}</TableCell>
                                            <TableCell className="text-right font-semibold">Rs. {r.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-muted-foreground text-xs">Rs. {r.tax}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="secondary" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 px-4 shadow-sm text-xs font-semibold">
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Payment Modal */}
            <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <CreditCard className="h-6 w-6 text-primary" />
                            Online Fee Payment
                        </DialogTitle>
                        <DialogDescription>
                            Securely pay your college fees using Khalti, eSewa, or Direct Bank Transfer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="pay-amount" className="font-semibold">Enter Amount to Pay</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rs.</span>
                                <Input
                                    id="pay-amount"
                                    type="number"
                                    className="pl-10 h-12 text-lg font-black text-primary"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Your current outstanding balance is Rs. {feeStats.netBalance.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Select Payment Method</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button variant="outline" className="h-20 flex flex-col gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 group transition-all">
                                    <div className="h-8 w-12 bg-purple-600 rounded flex items-center justify-center text-[10px] text-white font-bold group-hover:scale-110 transition-transform">Khalti</div>
                                    <span className="text-[10px] font-semibold">Khalti</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 border-border/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 group transition-all">
                                    <div className="h-8 w-12 bg-emerald-500 rounded flex items-center justify-center text-[10px] text-white font-bold group-hover:scale-110 transition-transform">eSewa</div>
                                    <span className="text-[10px] font-semibold">eSewa</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 border-border/50 hover:border-blue-500/50 hover:bg-blue-500/5 group transition-all">
                                    <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-bold group-hover:scale-110 transition-transform">Bank</div>
                                    <span className="text-[10px] font-semibold">Direct</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
                        <Button className="bg-primary px-8 h-11 font-bold shadow-lg shadow-primary/25" onClick={handleMockPayment}>
                            Proceed to Pay Rs. {parseFloat(paymentAmount || "0").toLocaleString()}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
