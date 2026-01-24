import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SemesterRiskData {
  semester: string;
  low: number;
  medium: number;
  high: number;
}

interface SemesterRiskChartProps {
  data?: SemesterRiskData[];
}

const defaultData: SemesterRiskData[] = [
  { semester: 'Sem 1', low: 120, medium: 30, high: 10 },
  { semester: 'Sem 2', low: 110, medium: 35, high: 15 },
  { semester: 'Sem 3', low: 100, medium: 40, high: 20 },
  { semester: 'Sem 4', low: 95, medium: 45, high: 25 },
  { semester: 'Sem 5', low: 90, medium: 42, high: 28 },
  { semester: 'Sem 6', low: 85, medium: 50, high: 30 },
  { semester: 'Sem 7', low: 88, medium: 48, high: 28 },
  { semester: 'Sem 8', low: 92, medium: 45, high: 25 },
];

export function SemesterRiskChart({ data = defaultData }: SemesterRiskChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="semester" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Bar 
          dataKey="low" 
          name="Low Risk" 
          stackId="a" 
          fill="hsl(142, 71%, 45%)" 
          radius={[0, 0, 0, 0]}
        />
        <Bar 
          dataKey="medium" 
          name="Medium Risk" 
          stackId="a" 
          fill="hsl(45, 93%, 47%)" 
        />
        <Bar 
          dataKey="high" 
          name="High Risk" 
          stackId="a" 
          fill="hsl(0, 84%, 60%)" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}