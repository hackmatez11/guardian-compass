import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SurveyData {
    motivation_score: number;
    stress_level: number;
    financial_pressure: number;
    social_support: number;
    academic_confidence: number;
}

const questions: { key: keyof SurveyData; label: string; low: string; high: string }[] = [
    { key: 'motivation_score', label: 'How motivated are you towards your studies?', low: 'Not at all', high: 'Very motivated' },
    { key: 'stress_level', label: 'How would you rate your current stress level?', low: 'No stress', high: 'Extremely stressed' },
    { key: 'financial_pressure', label: 'How much financial pressure do you currently face?', low: 'None', high: 'Severe' },
    { key: 'social_support', label: 'How much social / family support do you receive?', low: 'None', high: 'Strong support' },
    { key: 'academic_confidence', label: 'How confident are you in your academic abilities?', low: 'Not confident', high: 'Very confident' },
];

export default function StudentSurvey() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [values, setValues] = useState<SurveyData>({
        motivation_score: 5,
        stress_level: 5,
        financial_pressure: 3,
        social_support: 7,
        academic_confidence: 6,
    });

    const handleChange = (key: keyof SurveyData, val: number[]) => {
        setValues(v => ({ ...v, [key]: val[0] }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Save survey response to Supabase students table fields
            const { error } = await supabase
                .from('students')
                .update({
                    motivation_score: values.motivation_score,
                    stress_level: values.stress_level,
                })
                .eq('user_id', user?.id);

            if (error) throw error;

            setSubmitted(true);
            toast({ title: '✅ Survey submitted!', description: 'Your responses have been recorded and will be used in your risk assessment.' });
        } catch (err) {
            toast({ title: 'Submission failed', description: 'Could not save your survey. Try again.', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-success" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold">Survey Submitted!</h2>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            Thank you for completing the wellbeing survey. Your responses will be factored into your AI risk assessment.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>Retake Survey</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-2xl">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Wellbeing Survey</h1>
                    <p className="text-muted-foreground mt-1">Help us personalize your risk assessment by answering a few questions. Responses are private.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-accent" />
                            Self-Assessment Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {questions.map((q) => (
                            <div key={q.key} className="space-y-3">
                                <Label className="text-sm font-medium leading-relaxed">{q.label}</Label>
                                <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={[values[q.key]]}
                                    onValueChange={(v) => handleChange(q.key, v)}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1 – {q.low}</span>
                                    <span className="font-bold text-foreground text-sm">{values[q.key]}/10</span>
                                    <span>10 – {q.high}</span>
                                </div>
                            </div>
                        ))}

                        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-11 text-base gap-2">
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                            {submitting ? 'Submitting...' : 'Submit Survey'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
