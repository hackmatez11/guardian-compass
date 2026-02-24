import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/services/backendService';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Calendar, Clock, CheckCircle } from 'lucide-react';

interface Session {
    id: string;
    session_type: string;
    status: string;
    notes?: string;
    scheduled_at?: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/20',
    cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800/50',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20',
};

const statusIcons: Record<string, React.ReactNode> = {
    scheduled: <Clock className="h-4 w-4 text-yellow-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    in_progress: <Calendar className="h-4 w-4 text-blue-500" />,
};

export default function StudentCounseling() {
    const { user } = useAuth();
    const [studentId, setStudentId] = useState('');
    const { data: studentsData } = useStudents(1, 100);

    useEffect(() => {
        if (studentsData?.data?.students && user) {
            const match = studentsData.data.students.find(s => s.email === user.email);
            if (match) setStudentId(match.student_id);
        }
    }, [studentsData, user]);

    const { data, isLoading } = useQuery({
        queryKey: ['student-sessions', studentId],
        queryFn: () => api.get<{ success: boolean; data: Session[] }>(`/counseling/sessions/student/${studentId}`),
        enabled: !!studentId,
        retry: 1,
    });

    const sessions: Session[] = Array.isArray(data?.data) ? data.data : [];
    const completed = sessions.filter(s => s.status === 'completed').length;
    const scheduled = sessions.filter(s => s.status === 'scheduled').length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Counseling</h1>
                    <p className="text-muted-foreground mt-1">Your counseling sessions and history</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-muted/50 rounded-xl border text-center">
                        <p className="text-3xl font-bold">{sessions.length}</p>
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 text-center">
                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">{completed}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center">
                        <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{scheduled}</p>
                        <p className="text-sm text-muted-foreground">Upcoming</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-accent" />
                            Session History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No counseling sessions yet. Contact your counselor to schedule a session.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-start justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">{statusIcons[session.status] ?? <MessageSquare className="h-4 w-4 text-muted-foreground" />}</div>
                                            <div>
                                                <p className="font-medium text-sm capitalize">{session.session_type.replace(/_/g, ' ')} Session</p>
                                                {session.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{session.notes}</p>}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {session.scheduled_at
                                                        ? new Date(session.scheduled_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                                                        : new Date(session.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize whitespace-nowrap ${statusColors[session.status] ?? ''}`}>
                                            {session.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
