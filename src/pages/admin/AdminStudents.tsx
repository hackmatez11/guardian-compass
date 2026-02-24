import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useStudents, usePredictDropout } from '@/services/backendService';
import { Users, Search, Plus, Loader2, RefreshCw, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminStudents() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data, isLoading, isError } = useStudents(page, 15);
    const { mutate: predict, isPending: predicting, variables: predictingId } = usePredictDropout();

    const students = data?.data?.students ?? [];
    const total = data?.data?.total ?? 0;
    const totalPages = Math.ceil(total / 15);

    const filtered = search
        ? students.filter(s =>
            s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.student_id.toLowerCase().includes(search.toLowerCase()) ||
            s.department?.toLowerCase().includes(search.toLowerCase())
        )
        : students;

    const handleRunPrediction = (studentId: string) => {
        predict(studentId, {
            onSuccess: () => {
                toast({ title: 'Prediction complete', description: `Risk updated for student ${studentId}` });
                queryClient.invalidateQueries({ queryKey: ['students'] });
            },
            onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Students</h1>
                        <p className="text-muted-foreground mt-1">Manage all enrolled students and run AI risk assessments</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['students'] })} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Student
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="font-display flex items-center gap-2">
                                <Users className="h-5 w-5 text-accent" />
                                All Students ({total})
                            </CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name, ID, department..."
                                    className="pl-9 h-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isError && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                ⚠️ Backend offline — start the Flask server to see real student data.
                            </div>
                        )}
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg border overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Semester</th>
                                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">GPA</th>
                                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">AI Analysis</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filtered.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                                        No students found{search ? ` for "${search}"` : ''}.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filtered.map((student) => (
                                                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-medium text-foreground">{student.full_name}</p>
                                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline" className="font-mono text-xs">{student.student_id}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">{student.department || '—'}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">Sem {student.semester}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`font-semibold ${student.gpa && student.gpa < 2.5 ? 'text-destructive' : 'text-foreground'}`}>
                                                                {student.gpa?.toFixed(2) ?? '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="gap-1.5 h-8 text-xs"
                                                                disabled={predicting}
                                                                onClick={() => handleRunPrediction(student.student_id)}
                                                            >
                                                                {predicting && predictingId === student.student_id
                                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    : <BrainCircuit className="h-3.5 w-3.5" />
                                                                }
                                                                Analyze
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Page {page} of {totalPages} · {total} total students
                                        </p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
