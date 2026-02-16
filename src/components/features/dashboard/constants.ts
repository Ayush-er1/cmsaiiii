export const availableRoles = [
    { id: "all", label: "All Roles" },
    { id: "student", label: "Students" },
    { id: "staff", label: "Staff Member" },
    { id: "teacher", label: "Teachers" },
    { id: "admin", label: "Department Admins" },
];

export const availableDepartments = [
    { id: "all", label: "All Departments" },
    { id: "Computer Science", label: "Computer Science" },
    { id: "Business Administration", label: "Business Administration" },
    { id: "Mechanical Engineering", label: "Mechanical Engineering" },
    { id: "Physics", label: "Physics" },
];

export const availablePrograms = [
    { id: "Bachelor of Computer Science", label: "Bachelor of Computer Science", dept: "Computer Science" },
    { id: "Bachelor of Information Technology", label: "Bachelor of Information Technology", dept: "Computer Science" },
    { id: "Master of Business Administration", label: "Master of Business Administration", dept: "Business Administration" },
    { id: "Bachelor of Mechanical Engineering", label: "Bachelor of Mechanical Engineering", dept: "Mechanical Engineering" },
    { id: "Doctor of Philosophy in Physics", label: "Doctor of Philosophy in Physics", dept: "Physics" },
];

export const departmentPrograms: Record<string, string[]> = {
    "Computer Science": ["Bachelor of Computer Science", "Bachelor of Information Technology"],
    "Business Administration": ["Master of Business Administration"],
    "Mechanical Engineering": ["Bachelor of Mechanical Engineering"],
    "Physics": ["Doctor of Philosophy in Physics"]
};

export const availableGroups = [
    { id: "all", label: "All Groups" },
    { id: "Section A", label: "Section A" },
    { id: "Section B", label: "Section B" },
    { id: "Morning Batch", label: "Morning Batch" },
    { id: "Evening Batch", label: "Evening Batch" },
];
