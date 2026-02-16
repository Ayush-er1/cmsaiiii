import { Plus, ClipboardCheck, Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Announcement } from "@/types/dashboard";

interface DashboardAnnouncementsProps {
    announcements: Announcement[];
    isSuperAdmin: boolean;
    onNew: () => void;
    onEdit: (announcement: Announcement) => void;
    onDelete: (id: number) => void;
    onView: (announcement: Announcement) => void;
}

export function DashboardAnnouncements({
    announcements,
    isSuperAdmin,
    onNew,
    onEdit,
    onDelete,
    onView
}: DashboardAnnouncementsProps) {
    return (
        <Card className={cn("bg-white dark:bg-zinc-900 border-[#243F76]/10 dark:border-white/10 shadow-sm overflow-hidden", "w-full")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 bg-muted/20 border-b border-[#243F76]/5 dark:border-white/5">
                <CardTitle className="text-xs font-bold text-[#1A2E56] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-[#106bc6]" />
                    Announcements
                </CardTitle>
                {isSuperAdmin && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNew}
                        className="h-7 px-2 text-[10px] font-bold border-[#106bc6]/20 bg-[#106bc6]/10 text-[#106bc6] hover:bg-[#106bc6] hover:text-white transition-all gap-1"
                        data-testid="button-new-announcement"
                    >
                        <Plus className="h-3 w-3" />
                        NEW
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="flex items-start justify-between gap-4 pb-3 border-b border-dashed last:border-0 last:pb-0 group"
                            data-testid={`announcement-item-${announcement.id}`}
                        >
                            <div
                                className="flex-1 min-w-0 cursor-pointer hover:text-[#106bc6] transition-colors"
                                onClick={() => onView(announcement)}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-[#1A2E56] dark:text-gray-300">{announcement.title}</p>
                                    {isSuperAdmin && announcement.targetRoles.includes("all") && (
                                        <Badge variant="outline" className="text-[9px] py-0 px-1 font-bold bg-[#106bc6]/10 text-[#106bc6] border-none">PUBLIC</Badge>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {announcement.date}
                                </p>
                            </div>
                            {isSuperAdmin && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/30"
                                        onClick={(e) => { e.stopPropagation(); onEdit(announcement); }}
                                        data-testid={`button-edit-announcement-${announcement.id}`}
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive bg-destructive/10 hover:bg-destructive hover:text-white"
                                        onClick={(e) => { e.stopPropagation(); onDelete(announcement.id); }}
                                        data-testid={`button-delete-announcement-${announcement.id}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
