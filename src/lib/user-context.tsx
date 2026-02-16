import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    subRoles?: string[];
    department: string;
    status: "active" | "inactive";
    phone?: string;
    User_Id?: string;

    password?: string; // First-time password set during enrollment
    universityId?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    currentClass?: string;
    semester?: string;
    guardianName?: string;
    guardianContact?: string;
    guardianRelationship?: string;
    enrollmentDate?: string;

    enrolledCourses?: string[]; // Course codes student is enrolled in
    avatarUrl?: string;
    documents?: {
        id: string;
        name: string;
        type: string;
        size: string;
        uploadDate: string;
    }[];
}

const mockUsers: UserRecord[] = [];

interface UserContextType {
    users: UserRecord[];
    addUser: (user: UserRecord) => void;
    updateUser: (id: string, updates: Partial<UserRecord>) => void;
    deleteUser: (id: string) => void;
    getUser: (id: string) => UserRecord | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<UserRecord[]>(() => {
        try {
            const stored = localStorage.getItem("app_users");
            return stored ? JSON.parse(stored) : mockUsers;
        } catch (e) {
            console.error("Failed to load users from localStorage", e);
            return mockUsers;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("app_users", JSON.stringify(users));
        } catch (e) {
            console.error("Failed to save users to localStorage", e);
        }
    }, [users]);

    const addUser = (user: UserRecord) => {
        setUsers((prev) => [...prev, user]);
    };

    const updateUser = (id: string, updates: Partial<UserRecord>) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    };

    const deleteUser = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    const getUser = (id: string) => {
        return users.find((u) => u.id === id);
    };

    return (
        <UserContext.Provider value={{ users, addUser, updateUser, deleteUser, getUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
