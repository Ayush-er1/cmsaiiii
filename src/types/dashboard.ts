export interface Announcement {
    id: number;
    title: string;
    date: string;
    content?: string;
    targetRoles: string[];
    targetDepartments: string[];
    targetPrograms: string[];
    targetGroups: string[];
    isEveryone?: boolean;
}

export interface AnnouncementFormState {
    title: string;
    content: string;
    isEveryone: boolean;
    targetRoles: string[];
    targetDepartments: string[];
    targetPrograms: string[];
    targetGroups: string[];
}
