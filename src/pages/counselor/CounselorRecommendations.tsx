import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus, RefreshCw, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface Session {
    id: string;
    student_id: string;
    counselor_id: string;
    session_type: string;
    status: string;
    notes?: string;
    scheduled_at?: string;
    created_at: string;
}

function useSessions() {
    return useQuery({
        queryKey: ['counseling-sessions'],
        queryFn: () => api.get<{ success: boolean; data: Session[]; total: number }>('/counseling/sessions?page_size=50'),
        retry: 1,
    });
}

const sessionTypeColors: Record<string, string> = {
    academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    career: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    crisis: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusColors: Record<string, string> = {
    scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export default function CounselorSessions() {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useSessions();

    const sessions: Session[] = Array.isArray(data?.data) ? data.data : [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Counseling Sessions</h1>
                        <p className="text-muted-foreground mt-1">Manage and track all counseling sessions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['counseling-sessions'] })} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> New Session
                        </Button>
                    </div>
                </div>

                {isError && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">⚠️ Backend offline — start Flask to see live session data.</p>
                    </div>
                )}

                {/* Quick stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    {(['scheduled', 'in_progress', 'completed', 'cancelled'] as const).map(status => {
                        const count = sessions.filter(s => s.status === status).length;
                        return (
                            <div key={status} className="p-4 bg-muted/50 rounded-xl border text-center">
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-sm text-muted-foreground capitalize">{status.replace('_', ' ')}</p>
                            </div>
                        );
                    })}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-accent" />
                            All Sessions ({sessions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No sessions found. Create your first session.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-background rounded-lg border">
                                                <Calendar className="h-4 w-4 text-accent" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Student: <span className="font-mono">{session.student_id}</span></p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    {session.scheduled_at
                                                        ? new Date(session.scheduled_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                                                        : new Date(session.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${sessionTypeColors[session.session_type] ?? 'bg-muted text-muted-foreground'}`}>
                                                {session.session_type}
                                            </span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[session.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                {session.status.replace('_', ' ')}
                                            </span>
                                        </div>
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
