import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Student {
    id: string;
    student_id: string;
    user_id?: string;
    full_name: string;
    email: string;
    department: string;
    semester: number;
    gpa?: number;
    attendance_rate?: number;
    motivation_score?: number;
    stress_level?: number;
    financial_aid?: string;
    parent_education_level?: string;
    credits_enrolled?: number;
}

export interface StudentListResponse {
    success: boolean;
    data: {
        students: Student[];
        total: number;
        page: number;
        per_page: number;
    };
}

export interface StudentAcademicResponse {
    success: boolean;
    data: {
        student: Student;
        academic_records: AcademicRecord[];
        attendance_records: AttendanceRecord[];
        behavioral_records: BehavioralRecord[];
        predictions: Prediction[];
    };
}

interface AcademicRecord {
    id: string;
    semester: number;
    gpa: number;
    grade?: string;
    assignments_completed?: number;
    total_assignments?: number;
}

interface AttendanceRecord {
    id: string;
    status: 'present' | 'absent' | 'late';
    date: string;
}

interface BehavioralRecord {
    id: string;
    incident_type: string;
    description?: string;
}

export interface Prediction {
    id?: string;
    student_id: string;
    risk_level: 'Low' | 'Medium' | 'High';
    risk_score: number;
    contributing_factors: ContributingFactor[];
    confidence: number;
    model_type?: string;
    created_at?: string;
}

interface ContributingFactor {
    factor: string;
    value: number;
    importance: number;
    contribution: number;
}

export interface PredictionStatsResponse {
    success: boolean;
    data: {
        total_predictions: number;
        high_risk_count: number;
        medium_risk_count: number;
        low_risk_count: number;
        average_risk_score: number;
    };
}

// --- Hooks ---

export function useStudents(page = 1, perPage = 20) {
    return useQuery<StudentListResponse>({
        queryKey: ['students', page, perPage],
        queryFn: () => api.get<StudentListResponse>(`/students?page=${page}&per_page=${perPage}`),
        retry: 1,
    });
}

export function useStudentAcademicData(studentId: string) {
    return useQuery<StudentAcademicResponse>({
        queryKey: ['student-academic', studentId],
        queryFn: () => api.get<StudentAcademicResponse>(`/students/${studentId}/academic`),
        enabled: !!studentId,
        retry: 1,
    });
}

export function usePredictionStats() {
    return useQuery<PredictionStatsResponse>({
        queryKey: ['prediction-stats'],
        queryFn: () => api.get<PredictionStatsResponse>('/predictions/statistics'),
        retry: 1,
    });
}

export function useHighRiskStudents() {
    return useQuery<{ success: boolean; data: (Student & { latest_prediction: Prediction })[] }>({
        queryKey: ['high-risk-students'],
        queryFn: () => api.get('/predictions/high-risk'),
        retry: 1,
    });
}

export function usePredictDropout() {
    return useMutation({
        mutationFn: (studentId: string) =>
            api.post<{ success: boolean; data: Prediction }>(`/predictions/predict/${studentId}`, {}),
    });
}

export function useStudentPredictions(studentId: string) {
    return useQuery<{ success: boolean; data: { predictions: Prediction[] } }>({
        queryKey: ['student-predictions', studentId],
        queryFn: () => api.get(`/predictions/student/${studentId}`),
        enabled: !!studentId,
        retry: 1,
    });
}
