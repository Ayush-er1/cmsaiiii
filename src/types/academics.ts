export interface ClassSession {
    id: string;
    startTime: string;
    endTime: string;
    courseCode: string;
    courseName: string;
    room: string;
    lecturer: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    daysOfWeek: string[]; // e.g., ["Today", "Monday"]
    program: string;
}

export interface Course {
    id: string;
    code: string;
    name: string;
    lecturer: string;
    program: string;
}

export const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
