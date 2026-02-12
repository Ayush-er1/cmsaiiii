import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const mockGrades: {
  course: string;
  code: string;
  semester: string;
  grade: string;
  score: number;
  credits: number;
}[] = [];

const gradeColors: Record<string, string> = {
  "A+": "bg-primary text-primary-foreground",
  "A": "bg-primary text-primary-foreground",
  "A-": "bg-primary text-primary-foreground",
  "B+": "bg-primary text-primary-foreground",
  "B": "bg-primary text-primary-foreground",
  "B-": "bg-primary text-primary-foreground",
};

export function StudentReportsPage() {

  return (
    <MainLayout title="My Reports">
      <div className="space-y-6">


        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Grades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Code</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="hidden md:table-cell w-28">Semester</TableHead>
                  <TableHead className="w-20 text-center">Score</TableHead>
                  <TableHead className="w-16 text-center">Grade</TableHead>
                  <TableHead className="w-20 text-center">Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGrades.map((g, i) => (
                  <TableRow key={i} data-testid={`row-grade-${i}`}>
                    <TableCell className="font-mono">{g.code}</TableCell>
                    <TableCell className="font-medium">{g.course}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {g.semester}
                    </TableCell>
                    <TableCell className="text-center">{g.score}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={gradeColors[g.grade] || "bg-muted"}>
                        {g.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{g.credits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
