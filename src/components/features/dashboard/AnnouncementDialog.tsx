import { useEffect, useState } from "react";
import { Users, Building, Check, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Announcement, AnnouncementFormState } from "@/types/dashboard";
import { availableRoles, availableDepartments, availablePrograms, departmentPrograms, availableGroups } from "./constants";

interface AnnouncementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (announcement: AnnouncementFormState) => void;
    initialData?: Announcement | null;
}

const defaultFormState: AnnouncementFormState = {
    title: "",
    content: "",
    isEveryone: true,
    targetRoles: ["all"],
    targetDepartments: ["all"],
    targetPrograms: ["all"],
    targetGroups: ["all"],
};

export function AnnouncementDialog({ open, onOpenChange, onSave, initialData }: AnnouncementDialogProps) {
    const [formState, setFormState] = useState<AnnouncementFormState>(defaultFormState);

    useEffect(() => {
        if (initialData) {
            const isEveryone = initialData.targetRoles.includes("all") &&
                initialData.targetDepartments.includes("all") &&
                initialData.targetGroups.includes("all");

            setFormState({
                title: initialData.title,
                content: initialData.content || "",
                isEveryone,
                targetRoles: initialData.targetRoles || ["all"],
                targetDepartments: initialData.targetDepartments || ["all"],
                targetPrograms: initialData.targetPrograms || ["all"],
                targetGroups: initialData.targetGroups || ["all"],
            });
        } else {
            setFormState(defaultFormState);
        }
    }, [initialData, open]);

    const handleSave = () => {
        onSave(formState);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                        <TabsTrigger value="content" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
                            Content
                        </TabsTrigger>
                        <TabsTrigger value="targeting" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
                            Targeting
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-4 pt-4 mt-0">
                        <div className="grid gap-2">
                            <Label htmlFor="announcement-title">Title</Label>
                            <Input
                                id="announcement-title"
                                value={formState.title}
                                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                placeholder="Announcement title"
                                data-testid="input-announcement-title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="announcement-content">Content</Label>
                            <Textarea
                                id="announcement-content"
                                value={formState.content}
                                onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                                placeholder="Announcement details..."
                                rows={4}
                                data-testid="input-announcement-content"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="targeting" className="space-y-4 pt-4 mt-0">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
                            {/* Global Everyone Toggle */}
                            <div
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                                    formState.isEveryone
                                        ? "bg-[#106bc6]/5 border-[#106bc6]/30 shadow-sm dark:bg-[#106bc6]/10 dark:border-[#106bc6]/40"
                                        : "bg-muted/30 border-border dark:bg-zinc-800/50 dark:border-white/10"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        formState.isEveryone ? "bg-[#106bc6] text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1A2E56] dark:text-white leading-tight">Public Audience</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Visibile to everyone across all departments</p>
                                    </div>
                                </div>
                                <Checkbox
                                    id="is-everyone"
                                    checked={formState.isEveryone}
                                    onCheckedChange={(checked) => {
                                        setFormState({
                                            ...formState,
                                            isEveryone: !!checked,
                                            targetRoles: checked ? ["all"] : [],
                                            targetDepartments: checked ? ["all"] : [],
                                            targetPrograms: checked ? ["all"] : [],
                                            targetGroups: checked ? ["all"] : [],
                                        });
                                    }}
                                    className="h-5 w-5 data-[state=checked]:bg-[#106bc6] data-[state=checked]:border-[#106bc6]"
                                />
                            </div>

                            {!formState.isEveryone && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Specific Targeting</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>

                                    {/* Roles Targeting */}
                                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden dark:bg-zinc-950 dark:border-white/10">
                                        <div className="flex flex-row items-center justify-between p-3 px-4 bg-muted/30 border-b dark:bg-zinc-900/50 dark:border-white/10">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-[#106bc6]" />
                                                <Label className="font-bold text-[#1A2E56] dark:text-white">Target Roles</Label>
                                            </div>
                                        </div>
                                        <div className="p-4 pt-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                {availableRoles.map((role) => {
                                                    const isSelected = formState.targetRoles.includes(role.id);
                                                    return (
                                                        <div
                                                            key={role.id}
                                                            className={cn(
                                                                "flex items-center space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer",
                                                                isSelected
                                                                    ? "bg-[#106bc6]/5 border-[#106bc6]/20 dark:bg-[#106bc6]/10 dark:border-[#106bc6]/40"
                                                                    : "hover:bg-muted/50 border-transparent dark:hover:bg-zinc-800/50"
                                                            )}
                                                            onClick={() => {
                                                                let updated;
                                                                if (role.id === "all") {
                                                                    updated = isSelected ? [] : ["all"];
                                                                } else {
                                                                    if (formState.targetRoles.includes("all")) {
                                                                        updated = [role.id];
                                                                    } else {
                                                                        updated = isSelected
                                                                            ? formState.targetRoles.filter(r => r !== role.id)
                                                                            : [...formState.targetRoles, role.id];
                                                                    }
                                                                }
                                                                setFormState({
                                                                    ...formState,
                                                                    targetRoles: updated
                                                                });
                                                            }}
                                                        >
                                                            {isSelected ? (
                                                                <div className="h-4 w-4 rounded-sm bg-[#106bc6] flex items-center justify-center">
                                                                    <Check className="h-3 w-3 text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-sm border border-muted-foreground/30" />
                                                            )}
                                                            <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer font-medium">{role.label}</Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Departments Targeting */}
                                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden dark:bg-zinc-950 dark:border-white/10">
                                        <div className="flex flex-row items-center justify-between p-3 px-4 bg-muted/30 border-b dark:bg-zinc-900/50 dark:border-white/10">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-[#106bc6]" />
                                                <Label className="font-bold text-[#1A2E56] dark:text-white">Departments</Label>
                                            </div>
                                        </div>
                                        <div className="p-4 pt-3">
                                            <div className="space-y-3">
                                                {availableDepartments.slice(1).map((dept) => {
                                                    const isDeptSelected = formState.targetDepartments.includes(dept.id);
                                                    return (
                                                        <div key={dept.id} className="space-y-2">
                                                            <div
                                                                className={cn(
                                                                    "flex items-center space-x-2.5 p-2.5 rounded-lg border transition-all cursor-pointer",
                                                                    isDeptSelected
                                                                        ? "bg-[#106bc6]/5 border-[#106bc6]/20 dark:bg-[#106bc6]/10 dark:border-[#106bc6]/40"
                                                                        : "hover:bg-muted/50 border-transparent dark:hover:bg-zinc-800/50"
                                                                )}
                                                                onClick={() => {
                                                                    const updatedDepts = isDeptSelected
                                                                        ? formState.targetDepartments.filter(d => d !== dept.id)
                                                                        : [...formState.targetDepartments, dept.id];

                                                                    const deptProgs = departmentPrograms[dept.id] || [];
                                                                    let updatedProgs = [...formState.targetPrograms];

                                                                    if (!isDeptSelected) {
                                                                        updatedProgs = Array.from(new Set([...updatedProgs, ...deptProgs]));
                                                                    } else {
                                                                        updatedProgs = updatedProgs.filter(p => !deptProgs.includes(p));
                                                                    }

                                                                    setFormState({
                                                                        ...formState,
                                                                        targetDepartments: updatedDepts,
                                                                        targetPrograms: updatedProgs
                                                                    });
                                                                }}
                                                            >
                                                                {isDeptSelected ? (
                                                                    <div className="h-4 w-4 rounded-sm bg-[#106bc6] flex items-center justify-center">
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-4 w-4 rounded-sm border border-muted-foreground/30" />
                                                                )}
                                                                <Label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer font-bold">{dept.label}</Label>
                                                            </div>

                                                            {(() => {
                                                                const deptProgs = departmentPrograms[dept.id] || [];
                                                                const hasProgramsSelected = deptProgs.some(pId => formState.targetPrograms.includes(pId));
                                                                return (isDeptSelected || hasProgramsSelected) ? (
                                                                    <div className="ml-4 pl-4 border-l-2 border-[#106bc6]/20 grid grid-cols-1 gap-1.5 py-1 animate-in fade-in slide-in-from-left-2">
                                                                        {availablePrograms.filter(p => p.dept === dept.id).map((prog) => {
                                                                            const isProgSelected = formState.targetPrograms.includes(prog.id);
                                                                            return (
                                                                                <div
                                                                                    key={prog.id}
                                                                                    className={cn(
                                                                                        "flex items-center space-x-2 p-1.5 rounded-md cursor-pointer",
                                                                                        isProgSelected ? "text-[#106bc6] font-medium" : "text-muted-foreground hover:bg-muted/40"
                                                                                    )}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        const updatedProgs = isProgSelected
                                                                                            ? formState.targetPrograms.filter(p => p !== prog.id)
                                                                                            : [...formState.targetPrograms, prog.id];

                                                                                        const deptProgs = departmentPrograms[dept.id] || [];
                                                                                        const allDeptProgsSelected = deptProgs.every(pId => updatedProgs.includes(pId));

                                                                                        let updatedDepts = [...formState.targetDepartments];
                                                                                        if (allDeptProgsSelected) {
                                                                                            if (!updatedDepts.includes(dept.id)) {
                                                                                                updatedDepts.push(dept.id);
                                                                                            }
                                                                                        } else {
                                                                                            updatedDepts = updatedDepts.filter(d => d !== dept.id);
                                                                                        }

                                                                                        setFormState({
                                                                                            ...formState,
                                                                                            targetDepartments: updatedDepts,
                                                                                            targetPrograms: updatedProgs
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <Checkbox
                                                                                        id={`prog-${prog.id}`}
                                                                                        checked={isProgSelected}
                                                                                        onCheckedChange={() => { }}
                                                                                        className="h-3.5 w-3.5 data-[state=checked]:bg-[#106bc6] data-[state=checked]:border-[#106bc6]"
                                                                                    />
                                                                                    <Label htmlFor={`prog-${prog.id}`} className="text-xs cursor-pointer">{prog.label}</Label>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : null;
                                                            })()}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Groups Targeting */}
                                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden dark:bg-zinc-950 dark:border-white/10">
                                        <div className="flex flex-row items-center justify-between p-3 px-4 bg-muted/30 border-b dark:bg-zinc-900/50 dark:border-white/10">
                                            <div className="flex items-center gap-2">
                                                <Layers className="h-4 w-4 text-[#106bc6]" />
                                                <Label className="font-bold text-[#1A2E56] dark:text-white">Groups / Sections</Label>
                                            </div>
                                        </div>
                                        <div className="p-4 pt-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                {availableGroups.slice(1).map((grp) => {
                                                    const isGroupSelected = formState.targetGroups.includes(grp.id);
                                                    return (
                                                        <div
                                                            key={grp.id}
                                                            className={cn(
                                                                "flex items-center space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer",
                                                                isGroupSelected ? "bg-[#106bc6]/5 border-[#106bc6]/20" : "hover:bg-muted/50 border-transparent"
                                                            )}
                                                            onClick={() => {
                                                                const updated = isGroupSelected
                                                                    ? formState.targetGroups.filter(g => g !== grp.id)
                                                                    : [...formState.targetGroups, grp.id];
                                                                setFormState({
                                                                    ...formState,
                                                                    targetGroups: updated
                                                                });
                                                            }}
                                                        >
                                                            {isGroupSelected ? (
                                                                <div className="h-4 w-4 rounded-sm bg-[#106bc6] flex items-center justify-center">
                                                                    <Check className="h-3 w-3 text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-sm border border-muted-foreground/30" />
                                                            )}
                                                            <Label htmlFor={`grp-${grp.id}`} className="text-sm cursor-pointer font-medium">{grp.label}</Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} data-testid="button-save-announcement" className="bg-primary shadow-sm">
                        {initialData ? "Update" : "Create"} Announcement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
