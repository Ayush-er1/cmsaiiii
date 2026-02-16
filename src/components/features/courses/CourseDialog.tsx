import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Upload, FileText } from "lucide-react";
import { Course, CourseFormData } from "@/types/courses";
import { useToast } from "@/hooks/use-toast";

interface CourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    selectedCourse: Course | null;
    programs: string[];
    instructors: string[];
    onSave: (formData: CourseFormData, syllabusFileName: string, resources: { name: string; url: string; type: 'file' | 'link' }[]) => void;
    programFilter: string;
}

export function CourseDialog({
    open,
    onOpenChange,
    isEditing,
    selectedCourse,
    programs,
    instructors,
    onSave,
    programFilter
}: CourseDialogProps) {
    const { toast } = useToast();

    const [formData, setFormData] = useState<CourseFormData>({
        code: selectedCourse?.code || "",
        name: selectedCourse?.name || "",
        credits: selectedCourse?.credits.toString() || "3",
        program: selectedCourse?.program || (programFilter !== "all" ? programFilter : ""),
        instructor: selectedCourse?.instructor || "",
        description: selectedCourse?.description || "",
        syllabus: selectedCourse?.syllabus || "",
    });

    const [resources, setResources] = useState<{ name: string; url: string; type: 'file' | 'link' }[]>(
        selectedCourse?.resources || []
    );

    const [syllabusFileName, setSyllabusFileName] = useState(selectedCourse?.syllabus || "");

    // Reset form when dialog opens/closes or course changes
    useState(() => {
        if (open) {
            setFormData({
                code: selectedCourse?.code || "",
                name: selectedCourse?.name || "",
                credits: selectedCourse?.credits.toString() || "3",
                program: selectedCourse?.program || (programFilter !== "all" ? programFilter : ""),
                instructor: selectedCourse?.instructor || "",
                description: selectedCourse?.description || "",
                syllabus: selectedCourse?.syllabus || "",
            });
            setResources(selectedCourse?.resources || []);
            setSyllabusFileName(selectedCourse?.syllabus || "");
        }
    });

    const addResource = (type: 'file' | 'link') => {
        setResources([...resources, { name: "", url: "", type }]);
    };

    const updateResource = (index: number, field: 'name' | 'url', value: string) => {
        const updated = [...resources];
        updated[index] = { ...updated[index], [field]: value };
        setResources(updated);
    };

    const removeResource = (index: number) => {
        setResources(resources.filter((_, i) => i !== index));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSyllabusFileName(file.name);
            toast({ title: `File "${file.name}" selected` });
        }
    };

    const removeSyllabus = () => {
        setSyllabusFileName("");
        setFormData({ ...formData, syllabus: "" });
    };

    const handleSave = () => {
        onSave(formData, syllabusFileName, resources);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Course" : "Create New Course"}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="program">Program</Label>
                        <Select
                            value={formData.program}
                            onValueChange={(v) => setFormData({ ...formData, program: v })}
                        >
                            <SelectTrigger data-testid="select-course-program">
                                <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Course Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., CS101"
                                data-testid="input-course-code"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="credits">Credits</Label>
                            <Select
                                value={formData.credits}
                                onValueChange={(v) => setFormData({ ...formData, credits: v })}
                            >
                                <SelectTrigger data-testid="select-course-credits">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <SelectItem key={n} value={n.toString()}>
                                            {n} Credits
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Course Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Introduction to Programming"
                            data-testid="input-course-name"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="instructor">Instructor</Label>
                        <Select
                            value={formData.instructor}
                            onValueChange={(v) => setFormData({ ...formData, instructor: v })}
                        >
                            <SelectTrigger data-testid="select-course-instructor">
                                <SelectValue placeholder="Select instructor" />
                            </SelectTrigger>
                            <SelectContent>
                                {instructors.map((i) => (
                                    <SelectItem key={i} value={i}>
                                        {i}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Course description..."
                            rows={3}
                            data-testid="input-course-description"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="syllabus">Syllabus (PDF)</Label>
                        <div className="flex items-center gap-2">
                            {syllabusFileName ? (
                                <div className="flex items-center gap-2 flex-1 p-2 border rounded-md bg-muted/50">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm flex-1 truncate">{syllabusFileName}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeSyllabus}
                                        data-testid="button-remove-syllabus"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <label
                                        htmlFor="syllabus-upload"
                                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md cursor-pointer hover-elevate transition-colors"
                                    >
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Click to upload syllabus PDF</span>
                                    </label>
                                    <input
                                        id="syllabus-upload"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        data-testid="input-syllabus-upload"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Additional Resources</Label>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => addResource('file')} className="h-7 text-[10px] gap-1">
                                    <Plus className="h-3 w-3" /> Add File
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => addResource('link')} className="h-7 text-[10px] gap-1">
                                    <Plus className="h-3 w-3" /> Add Link
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {resources.map((res, index) => (
                                <div key={index} className="flex gap-2 items-start bg-muted/30 p-3 rounded-lg border border-dashed border-[#243F76]/10">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder={res.type === 'file' ? "Resource Name (e.g., Assignment 1)" : "Link Title (e.g., References)"}
                                            value={res.name}
                                            onChange={(e) => updateResource(index, 'name', e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        {res.type === 'file' ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Filename (click to upload)"
                                                    value={res.url}
                                                    readOnly
                                                    className="h-8 text-sm bg-muted/20 flex-1"
                                                />
                                                <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-[10px] h-8 px-2 rounded flex items-center justify-center transition-colors">
                                                    <Upload className="h-3 w-3 mr-1" />
                                                    UPLOAD
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) updateResource(index, 'url', file.name);
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <Input
                                                placeholder="URL (https://...)"
                                                value={res.url}
                                                onChange={(e) => updateResource(index, 'url', e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => removeResource(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {resources.length === 0 && (
                                <p className="text-[10px] text-muted-foreground text-center py-2 border border-dashed rounded-lg">
                                    Add extra materials like reference books, assignment files or useful links.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} data-testid="button-save-course">
                        {isEditing ? "Save Changes" : "Create Course"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
