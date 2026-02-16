import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Announcement } from "@/types/dashboard";

interface AnnouncementDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    announcement: Announcement | null;
}

export function AnnouncementDetailDialog({ open, onOpenChange, announcement }: AnnouncementDetailDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{announcement?.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        {announcement?.date}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                        {announcement?.content || "No additional details provided."}
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
