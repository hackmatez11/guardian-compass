import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, UserCircle } from 'lucide-react';

interface Profile {
    user_id: string;
    full_name: string;
    email: string;
}

interface UserRole {
    user_id: string;
    role: string;
}

function useAllUsers() {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const [{ data: profiles }, { data: roles }] = await Promise.all([
                supabase.from('profiles').select('*').order('full_name'),
                supabase.from('user_roles').select('*'),
            ]);
            return (profiles ?? []).map((p: Profile) => ({
                ...p,
                role: (roles ?? []).find((r: UserRole) => r.user_id === p.user_id)?.role ?? 'unknown',
            }));
        },
    });
}

const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    counselor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    student: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export default function AdminUsers() {
    const { data: users, isLoading } = useAllUsers();

    const admins = users?.filter(u => u.role === 'admin').length ?? 0;
    const counselors = users?.filter(u => u.role === 'counselor').length ?? 0;
    const students = users?.filter(u => u.role === 'student').length ?? 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all users in the system</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{admins}</p>
                            <p className="text-sm text-muted-foreground">Administrators</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <UserCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{counselors}</p>
                            <p className="text-sm text-muted-foreground">Counselors</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{students}</p>
                            <p className="text-sm text-muted-foreground">Students</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display">All Users ({users?.length ?? 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {users?.map((user) => (
                                    <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                                    {user.full_name?.[0]?.toUpperCase() ?? '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{user.full_name || 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColors[user.role] ?? 'bg-muted text-muted-foreground'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                ))}
                                {users?.length === 0 && (
                                    <p className="text-center py-8 text-sm text-muted-foreground">No users found.</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
