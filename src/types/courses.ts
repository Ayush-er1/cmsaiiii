export interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    program: string;
    instructor: string;
    syllabus?: string;
    description: string;
    department?: string;
    resources?: { name: string; url: string; type: 'file' | 'link' }[];
}

export interface CourseFormData {
    code: string;
    name: string;
    credits: string;
    program: string;
    instructor: string;
    description: string;
    syllabus: string;
}

export interface CourseStats {
    totalStudents: number;
    avgAttendance: string;
    upcomingAssignments: number;
    lastClassDate: string;
}

export const departmentPrograms: Record<string, string[]> = {
    "Computer Science": ["Bachelor of Computer Science", "Bachelor of Information Technology", "Master of Computer Applications"],
    "Business Administration": ["Master of Business Administration"],
    "Mechanical Engineering": ["Bachelor of Mechanical Engineering", "Bachelor of Civil Engineering", "Bachelor of Electronics Engineering"],
    "Physics": ["Doctor of Philosophy in Physics"],
};
