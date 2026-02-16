import { StatCard } from "@/components/common/StatCard";
import { Users, GraduationCap, BookOpen } from "lucide-react";

interface StatItem {
    title: string;
    value: string;
    icon: any; // Keep it flexible or use proper LucideIcon type
}

interface DashboardStatsProps {
    stats: StatItem[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <StatCard
                    key={stat.title}
                    {...stat}
                    testId={`stat-card-${index}`}
                />
            ))}
        </div>
    );
}
