export interface Program {
    id: string;
    name: string;
    level: string;
    duration: string;
    disciplines: string[];
    description: string;
    status: "active" | "inactive";
    department: string;
}
