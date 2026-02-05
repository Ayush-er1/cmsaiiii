
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Transaction {
    date: string;
    particular: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    status: string;
    remarks: string;
}

interface FeeLedgerTableProps {
    transactions: Transaction[];
    showAction?: boolean;
}

export function FeeLedgerTable({ transactions, showAction = true }: FeeLedgerTableProps) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-muted/50">
                    <TableRow className="hover:bg-transparent border-slate-200 dark:border-border">
                        <TableHead className="font-semibold text-slate-900 dark:text-foreground py-4 pl-6 text-xs uppercase tracking-wider">Date</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-foreground py-4 text-xs uppercase tracking-wider">Particular</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-foreground py-4 text-xs uppercase tracking-wider">Description</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 dark:text-foreground py-4 text-xs uppercase tracking-wider">Debit</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 dark:text-foreground py-4 text-xs uppercase tracking-wider">Credit</TableHead>
                        <TableHead className="text-right font-semibold text-primary py-4 text-xs uppercase tracking-wider">Balance</TableHead>
                        <TableHead className="font-semibold text-slate-900 dark:text-foreground py-4 text-xs uppercase tracking-wider">Status</TableHead>
                        {showAction && <TableHead className="text-right font-semibold text-slate-900 dark:text-foreground py-4 pr-6 text-xs uppercase tracking-wider">Action</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((t, idx) => (
                        <TableRow key={idx} className="border-slate-100 dark:border-border hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors group">
                            <TableCell className="text-slate-500 dark:text-muted-foreground font-medium text-xs pl-6">{t.date}</TableCell>
                            <TableCell className="font-semibold text-slate-900 dark:text-foreground">{t.particular}</TableCell>
                            <TableCell className="text-slate-500 dark:text-muted-foreground text-xs">{t.description}</TableCell>
                            <TableCell className="text-right font-medium">Rs. {t.debit.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">{t.credit > 0 ? `Rs. ${t.credit.toLocaleString()}` : "-"}</TableCell>
                            <TableCell className="text-right font-black text-primary">
                                {t.balance === 0 ? "Rs. 0" : `Rs. ${t.balance.toLocaleString()}`}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[10px] font-semibold border-none",
                                    t.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                )}>
                                    {t.status}
                                </Badge>
                            </TableCell>
                            {showAction && (
                                <TableCell className="text-right pr-6">
                                    <Button variant="outline" size="sm" className="h-8 px-4 font-semibold border-slate-200 dark:border-border group-hover:bg-primary group-hover:text-white transition-all text-xs">
                                        View
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                    {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={showAction ? 8 : 7} className="h-24 text-center text-muted-foreground">No ledger entries found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
