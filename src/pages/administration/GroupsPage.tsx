import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Users,
    Plus,
    Search,
    Shield,
    Settings,
    UserPlus,
    LayoutGrid,
    X,
    UserCheck,
    Edit3,
    BookOpen,
    Trophy,
    ShieldCheck,
    Heart,
    Check,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { useToast } from "@/hooks/use-toast";

// Group Category Definitions
const GROUP_CATEGORIES = [
    {
        id: "Academic",
        label: "Academic",
        description: "Official batches, sections, or course-specific groups.",
        icon: BookOpen,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        id: "Committee",
        label: "Committee",
        description: "Formal administrative bodies like Student Council or Boards.",
        icon: ShieldCheck,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        id: "Club",
        label: "Club / Society",
        description: "Interest-based groups for tech, arts, or sports.",
        icon: Trophy,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        id: "Social",
        label: "Social / Support",
        description: "Volunteering, community service, or student support.",
        icon: Heart,
        color: "text-rose-500",
        bg: "bg-rose-500/10"
    }
];

// Define Group type based on initialGroups structure
interface Group {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    memberPositions: Record<string, string>;
    status: string;
    type: string;
    color: string;
}

// Mock Data for Groups
export const initialGroups: Group[] = [];

// Define User type based on mockUsersForGroups structure
interface User {
    id: string;
    name: string;
    role: string;
    dept: string;
}

// Mock Users for adding to groups
const mockUsersForGroups: User[] = [];

export function GroupsPage() {
    const { toast } = useToast();
    const [groups, setGroups] = useState(initialGroups);
    const [searchTerm, setSearchTerm] = useState("");

    // Add Member Dialog State
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<typeof initialGroups[0] | null>(null);
    const [memberSearch, setMemberSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Position Editing State
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [memberPosition, setMemberPosition] = useState("");

    // Group Metadata Editing State
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [editedGroupName, setEditedGroupName] = useState("");
    const [editedGroupDescription, setEditedGroupDescription] = useState("");
    const [editedGroupType, setEditedGroupType] = useState("");
    const [dialogMode, setDialogMode] = useState<'view' | 'settings'>('view');

    // Create Group State
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDescription, setNewGroupDescription] = useState("");
    const [newGroupType, setNewGroupType] = useState("Club");

    // Calculate unique members across all groups
    const uniqueMembers = new Set(groups.flatMap(g => g.memberIds));
    const totalMembers = uniqueMembers.size;

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = mockUsersForGroups.filter(u =>
        u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.dept.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const handleOpenAddMember = (group: typeof initialGroups[0]) => {
        setSelectedGroup(group);
        setSelectedUsers([]);
        setMemberSearch("");
        setIsAddMemberDialogOpen(true);
    };

    const handleOpenSettings = (group: typeof initialGroups[0], mode: 'view' | 'settings' = 'settings') => {
        setSelectedGroup(group);
        setDialogMode(mode);
        setIsEditingGroup(false);
        setEditedGroupName(group.name);
        setEditedGroupDescription(group.description);
        setEditedGroupType(group.type);
        setIsSettingsDialogOpen(true);
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAddMembers = () => {
        if (!selectedGroup || selectedUsers.length === 0) return;

        setGroups(prev => prev.map(g =>
            g.id === selectedGroup.id
                ? { ...g, memberIds: Array.from(new Set([...g.memberIds, ...selectedUsers])) }
                : g
        ));

        toast({
            title: "Members Added",
            description: `Successfully added members to ${selectedGroup.name}.`,
        });

        setIsAddMemberDialogOpen(false);
        // If settings dialog is open, update selected group in settings too
        if (selectedGroup) {
            setSelectedGroup(prev => prev ? { ...prev, memberIds: Array.from(new Set([...prev.memberIds, ...selectedUsers])) } : null);
        }
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;

        const colors = ["bg-blue-500", "bg-orange-500", "bg-emerald-500", "bg-purple-500", "bg-rose-500"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newGroup = {
            id: `GR-${String(groups.length + 1).padStart(3, '0')}`,
            name: newGroupName,
            description: newGroupDescription,
            memberIds: [],
            memberPositions: {},
            status: "Active",
            type: newGroupType,
            color: randomColor
        };

        setGroups(prev => [...prev, newGroup]);
        setNewGroupName("");
        setNewGroupDescription("");
        setIsCreateDialogOpen(false);

        toast({
            title: "Group Created",
            description: `${newGroupName} has been initialized successfully.`,
        });
    };

    const handleDeleteGroup = (groupId: string) => {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        setIsSettingsDialogOpen(false);
        toast({
            title: "Group Deleted",
            description: "The organization group has been removed.",
        });
    };

    const handleRemoveMember = (groupId: string, userId: string) => {
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, memberIds: g.memberIds.filter(id => id !== userId) }
                : g
        ));

        // Update selectedGroup for the settings dialog
        if (selectedGroup && selectedGroup.id === groupId) {
            setSelectedGroup(prev => prev ? { ...prev, memberIds: prev.memberIds.filter(id => id !== userId) } : null);
        }

        toast({
            title: "Member Removed",
            description: "User has been removed from the group.",
        });
    };

    const handleUpdatePosition = (groupId: string, userId: string, position: string) => {
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, memberPositions: { ...g.memberPositions, [userId]: position } }
                : g
        ));

        if (selectedGroup && selectedGroup.id === groupId) {
            setSelectedGroup(prev => prev ? { ...prev, memberPositions: { ...prev.memberPositions, [userId]: position } } : null);
        }

        setEditingMemberId(null);
        toast({
            title: "Position Updated",
            description: "Member's position has been updated.",
        });
    };

    const handleSaveGroupDetails = () => {
        if (!selectedGroup || !editedGroupName.trim()) return;

        setGroups(prev => prev.map(g =>
            g.id === selectedGroup.id
                ? { ...g, name: editedGroupName, description: editedGroupDescription, type: editedGroupType }
                : g
        ));

        setSelectedGroup(prev => prev ? { ...prev, name: editedGroupName, description: editedGroupDescription, type: editedGroupType } : null);
        setIsEditingGroup(false);

        toast({
            title: "Group Updated",
            description: "Organization details have been saved.",
        });
    };

    return (
        <MainLayout title="Groups & Organizations">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find a committee or club..."
                            className="pl-10 h-11 bg-white dark:bg-zinc-950 border-[#243F76]/10 dark:border-white/10 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 font-semibold shadow-md bg-[#106bc6] hover:bg-[#0e5a9e] text-white gap-2 shrink-0">
                                <Plus className="h-4 w-4" />
                                Create New Group
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>Create Organization Group</DialogTitle>
                                <DialogDescription>
                                    Define the group name and its purpose.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label className="text-[#1A2E56] dark:text-gray-200">Group Name</Label>
                                    <div className="relative">
                                        <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="e.g. Cultural Committee"
                                            className="pl-9"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#1A2E56] dark:text-gray-200">Description</Label>
                                    <Input
                                        placeholder="What is the primary goal of this group?"
                                        value={newGroupDescription}
                                        onChange={(e) => setNewGroupDescription(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[#1A2E56] dark:text-gray-200">Group Category</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                        {GROUP_CATEGORIES.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${newGroupType === cat.id
                                                    ? "border-primary bg-primary/5 shadow-sm dark:bg-primary/10"
                                                    : "border-transparent bg-muted/30 dark:bg-zinc-900/40"
                                                    }`}
                                                onClick={() => setNewGroupType(cat.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className={`p-1.5 rounded-md ${cat.bg}`}>
                                                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                                    </div>
                                                    <span className="text-sm font-bold">{cat.label}</span>
                                                    {newGroupType === cat.id && <Check className="h-3 w-3 ml-auto text-primary" />}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground leading-tight">
                                                    {cat.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateGroup} className="w-full sm:w-auto bg-[#106bc6] hover:bg-[#0e5a9e]">Initialize Group</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Group Stats */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <StatCard
                        title="Total Organizations"
                        value={groups.length}
                        icon={Shield}
                    />
                    <StatCard
                        title="Total Members"
                        value={totalMembers}
                        icon={Users}
                    />
                    <StatCard
                        title="Active Subgroups"
                        value={groups.filter(g => g.type === 'Club' || g.type === 'Academic').length}
                        icon={LayoutGrid}
                    />
                </div>

                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredGroups.map((group) => (
                            <Card
                                key={group.id}
                                className="group overflow-hidden border-border hover:border-[#106bc6]/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer dark:bg-zinc-950"
                                onClick={() => handleOpenSettings(group, 'view')}
                            >
                                <div className={`h-1.5 w-full ${group.color}`} />
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="font-semibold px-2.5 py-0.5 text-xs uppercase tracking-wide">
                                            {group.type}
                                        </Badge>
                                        <Badge variant="outline" className="border-muted bg-muted/20">
                                            {group.memberIds.length} Members
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#1A2E56] dark:text-white">{group.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                                        {group.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            className="flex-1 bg-[#106bc6] hover:bg-[#0e5a9e] text-white shadow-sm h-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenAddMember(group);
                                            }}
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add Members
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-10 w-10 p-0 border-input hover:bg-muted text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenSettings(group, 'settings');
                                            }}
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-xl [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-white/10 [&>button]:z-[60]">
                        <DialogHeader className="p-6 bg-[#1A2E56] text-white relative">
                            <div className="flex justify-between items-start pr-8 gap-4">
                                <div className="flex-1">
                                    {isEditingGroup ? (
                                        <div className="space-y-3">
                                            <Input
                                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold"
                                                value={editedGroupName}
                                                onChange={(e) => setEditedGroupName(e.target.value)}
                                                placeholder="Group Name"
                                            />
                                            <textarea
                                                className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm rounded-md p-2 min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-white/30"
                                                value={editedGroupDescription}
                                                onChange={(e) => setEditedGroupDescription(e.target.value)}
                                                placeholder="Group Description"
                                            />
                                            <div className="space-y-2">
                                                <Label className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Change Category</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {GROUP_CATEGORIES.map((cat) => (
                                                        <div
                                                            key={cat.id}
                                                            className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all text-xs ${editedGroupType === cat.id
                                                                ? "bg-white/20 border-white/40 font-bold"
                                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                                                }`}
                                                            onClick={() => setEditedGroupType(cat.id)}
                                                        >
                                                            <cat.icon className="h-3 w-3" />
                                                            <span>{cat.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 font-bold" onClick={handleSaveGroupDetails}>
                                                    Save Changes
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-8" onClick={() => setIsEditingGroup(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <DialogTitle className="text-2xl font-bold">{selectedGroup?.name}</DialogTitle>
                                                {dialogMode === 'settings' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-blue-200 hover:text-white hover:bg-white/10"
                                                        onClick={() => setIsEditingGroup(true)}
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                            <DialogDescription className="text-blue-100/70 mt-1">
                                                {selectedGroup?.description}
                                            </DialogDescription>
                                        </>
                                    )}
                                </div>
                                {!isEditingGroup && (
                                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 py-1 shrink-0">
                                        {selectedGroup?.type}
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-[#1A2E56] dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Members ({selectedGroup?.memberIds.length})
                                    </h3>
                                    {dialogMode === 'settings' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[#106bc6] hover:text-[#106bc6] hover:bg-[#106bc6]/10 h-8"
                                            onClick={() => {
                                                if (selectedGroup) handleOpenAddMember(selectedGroup);
                                            }}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Member
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    {selectedGroup?.memberIds.map(userId => {
                                        const user = mockUsersForGroups.find(u => u.id === userId);
                                        if (!user) return null;
                                        const position = selectedGroup.memberPositions[userId] || "";
                                        const isEditing = editingMemberId === userId;

                                        return (
                                            <div key={userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-muted-foreground/10 transition-colors">
                                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                    <div className="h-10 w-10 rounded-full bg-[#106bc6]/10 text-[#106bc6] flex items-center justify-center font-bold text-sm shrink-0">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold truncate">{user.name}</p>
                                                            {position && !isEditing && (
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-blue-500/30 text-blue-600 bg-blue-50 dark:bg-blue-500/10">
                                                                    {position}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground">{user.role} • {user.dept}</p>

                                                        {isEditing && (
                                                            <div className="mt-2 flex gap-2">
                                                                <Input
                                                                    placeholder="e.g. President"
                                                                    className="h-8 text-xs"
                                                                    value={memberPosition}
                                                                    onChange={(e) => setMemberPosition(e.target.value)}
                                                                    autoFocus
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700"
                                                                    onClick={() => handleUpdatePosition(selectedGroup.id, userId, memberPosition)}
                                                                >
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 px-2"
                                                                    onClick={() => setEditingMemberId(null)}
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    {dialogMode === 'settings' && !isEditing && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-[#106bc6] hover:bg-blue-50"
                                                            onClick={() => {
                                                                setEditingMemberId(userId);
                                                                setMemberPosition(position);
                                                            }}
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {dialogMode === 'settings' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveMember(selectedGroup.id, userId);
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {selectedGroup?.memberIds.length === 0 && (
                                        <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                            No members yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 bg-muted/20 border-t flex justify-between items-center sm:justify-between">
                            {dialogMode === 'settings' ? (
                                <Button
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => selectedGroup && handleDeleteGroup(selectedGroup.id)}
                                >
                                    Delete Group
                                </Button>
                            ) : (
                                <div />
                            )}
                            <Button onClick={() => setIsSettingsDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl border-none shadow-2xl [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-white/10 [&>button]:z-[60]">
                        <DialogHeader className="p-6 bg-[#1A2E56] text-white relative">
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Add Members to {selectedGroup?.name}
                            </DialogTitle>
                            <DialogDescription className="text-blue-100/70">
                                Search and select students or faculty to join this group.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or department..."
                                    className="pl-9 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-[#106bc6]"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                {filteredUsers.map((user) => {
                                    const isAlreadyMember = selectedGroup?.memberIds.includes(user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${selectedUsers.includes(user.id)
                                                ? "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20"
                                                : isAlreadyMember
                                                    ? "opacity-50 cursor-not-allowed bg-muted/20"
                                                    : "border-transparent hover:bg-muted/50"
                                                }`}
                                            onClick={() => !isAlreadyMember && toggleUserSelection(user.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${user.role === 'Student' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {user.name}
                                                        {isAlreadyMember && <span className="ml-2 text-[10px] text-muted-foreground font-normal">(Already a member)</span>}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{user.role}</span>
                                                        <span className="text-[10px] text-muted-foreground/60">•</span>
                                                        <span className="text-[10px] text-muted-foreground">{user.dept}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${selectedUsers.includes(user.id) || isAlreadyMember
                                                ? "bg-[#106bc6] border-[#106bc6]"
                                                : "border-muted-foreground/30"
                                                }`}>
                                                {(selectedUsers.includes(user.id) || isAlreadyMember) && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No users found matching "{memberSearch}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="p-4 bg-muted/20 border-t flex items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground flex-1">
                                <span className="font-bold text-[#1A2E56] dark:text-gray-200">{selectedUsers.length}</span> members selected
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)} className="h-9">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddMembers}
                                    disabled={selectedUsers.length === 0}
                                    className="bg-[#106bc6] hover:bg-[#0e5a9e] text-white px-6 h-9"
                                >
                                    Add Selected
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}

export default GroupsPage;
