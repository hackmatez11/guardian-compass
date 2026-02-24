import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskBadge } from '@/components/ui/risk-badge';
import { useHighRiskStudents, usePredictDropout } from '@/services/backendService';
import { AlertTriangle, BrainCircuit, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function CounselorAtRisk() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data, isLoading, isError } = useHighRiskStudents();
    const { mutate: predict, isPending: predicting, variables: predictingId } = usePredictDropout();

    const students = data?.data ?? [];

    const handleRerun = (studentId: string) => {
        predict(studentId, {
            onSuccess: () => {
                toast({ title: 'Prediction refreshed', description: `Updated risk for ${studentId}` });
                queryClient.invalidateQueries({ queryKey: ['high-risk-students'] });
            },
            onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">At-Risk Students</h1>
                        <p className="text-muted-foreground mt-1">Students identified as high-risk for dropout</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['high-risk-students'] })} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                </div>

                {isError && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">⚠️ Backend offline — start Flask to see live data.</p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-risk-high" />
                            High-Risk Students ({students.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                            </div>
                        ) : students.length === 0 ? (
                            <p className="text-center py-12 text-sm text-muted-foreground">No high-risk students found.</p>
                        ) : (
                            <div className="space-y-3">
                                {students.map((student) => {
                                    const pred = student.latest_prediction;
                                    const isRunning = predicting && predictingId === student.student_id;
                                    return (
                                        <div key={student.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-risk-high/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-risk-high/10 flex items-center justify-center font-semibold text-risk-high text-sm">
                                                    {student.full_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{student.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{student.department} · Semester {student.semester}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{student.student_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {pred && (
                                                    <>
                                                        <RiskBadge
                                                            level={pred.risk_level.toLowerCase() as 'low' | 'medium' | 'high'}
                                                            score={Math.round(pred.risk_score * 100)}
                                                            showScore
                                                            size="lg"
                                                        />
                                                        <Badge variant="outline" className="text-xs">
                                                            {(pred.confidence * 100).toFixed(0)}% confident
                                                        </Badge>
                                                    </>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={predicting} onClick={() => handleRerun(student.student_id)}>
                                                    {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contributing Factors breakdown */}
                {students.length > 0 && students[0].latest_prediction?.contributing_factors?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-display text-base">Top Risk Factors (Most Recent Student)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {students[0].latest_prediction!.contributing_factors.slice(0, 5).map((f, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-32 text-sm capitalize text-muted-foreground truncate">{f.factor.replace(/_/g, ' ')}</div>
                                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-risk-high rounded-full transition-all"
                                                style={{ width: `${Math.min(f.importance * 300, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground w-10 text-right">{(f.importance * 100).toFixed(0)}%</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
