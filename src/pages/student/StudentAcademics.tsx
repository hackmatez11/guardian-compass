import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents, useStudentAcademicData } from '@/services/backendService';
import { TrendChart } from '@/components/charts/TrendChart';
import { BookOpen, GraduationCap, Calendar, Award } from 'lucide-react';

export default function StudentAcademics() {
    const { user } = useAuth();
    const [studentId, setStudentId] = useState('');

    const { data: studentsData } = useStudents(1, 100);
    useEffect(() => {
        if (studentsData?.data?.students && user) {
            const match = studentsData.data.students.find(s => s.email === user.email);
            if (match) setStudentId(match.student_id);
        }
    }, [studentsData, user]);

    const { data: academicData, isLoading } = useStudentAcademicData(studentId);
    const student = academicData?.data?.student;
    const records = academicData?.data?.academic_records ?? [];
    const attendance = academicData?.data?.attendance_records ?? [];

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Academic Data</h1>
                    <p className="text-muted-foreground mt-1">Your academic performance records</p>
                </div>

                {/* Key Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                    ) : (
                        <>
                            <div className="p-4 bg-muted/50 rounded-xl border flex items-center gap-4">
                                <div className="p-2 bg-accent/10 rounded-lg"><GraduationCap className="h-5 w-5 text-accent" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{student?.gpa?.toFixed(2) ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">Overall GPA</p>
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="h-5 w-5 text-primary" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{attendanceRate ? `${attendanceRate}%` : '—'}</p>
                                    <p className="text-xs text-muted-foreground">Attendance Rate</p>
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border flex items-center gap-4">
                                <div className="p-2 bg-success/10 rounded-lg"><Award className="h-5 w-5 text-success" /></div>
                                <div>
                                    <p className="text-2xl font-bold">Sem {student?.semester ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">Current Semester</p>
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border flex items-center gap-4">
                                <div className="p-2 bg-info/10 rounded-lg"><BookOpen className="h-5 w-5 text-info" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{student?.credits_enrolled ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">Credits Enrolled</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Academic Records per semester */}
                <Card>
                    <CardHeader><CardTitle className="font-display">Semester Record</CardTitle></CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
                        ) : records.length === 0 ? (
                            <p className="text-center py-8 text-sm text-muted-foreground">No academic records found. Records will appear once added by the admin.</p>
                        ) : (
                            <div className="space-y-3">
                                {records.map((rec, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">Semester {rec.semester}</p>
                                            {rec.grade && <p className="text-xs text-muted-foreground">Grade: {rec.grade}</p>}
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            {rec.assignments_completed != null && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Assignments</p>
                                                    <p className="text-sm font-medium">{rec.assignments_completed}/{rec.total_assignments}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs text-muted-foreground">GPA</p>
                                                <p className={`text-lg font-bold ${rec.gpa < 2.5 ? 'text-destructive' : rec.gpa >= 3.5 ? 'text-success' : 'text-foreground'}`}>
                                                    {rec.gpa?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="font-display">Performance Trend</CardTitle></CardHeader>
                    <CardContent><TrendChart /></CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
